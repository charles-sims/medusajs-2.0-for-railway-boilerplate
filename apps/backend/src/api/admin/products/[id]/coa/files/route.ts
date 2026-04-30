import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
} from "@aws-sdk/client-s3"

import {
  COA_PUBLIC_BASE,
  MINIO_ACCESS_KEY,
  MINIO_COA_BUCKET,
  MINIO_ENDPOINT,
  MINIO_SECRET_KEY,
} from "../../../../../../lib/constants"
import {
  buildCoaObjectKey,
  buildCoaPublicUrl,
  filenameForKind,
  filesFieldForKind,
  isCoaFileKind,
  resolveCoaSku,
} from "../helpers"

type ProductWithMetadata = {
  id: string
  handle?: string | null
  metadata?: Record<string, unknown> | null
}

function buildEndpointUrl(raw: string): string {
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw.replace(/\/$/, "")
  }
  return `https://${raw}`.replace(/\/$/, "")
}

function createS3Client(): S3Client {
  const endpoint = buildEndpointUrl(MINIO_ENDPOINT!)
  return new S3Client({
    endpoint,
    region: "us-east-1",
    credentials: {
      accessKeyId: MINIO_ACCESS_KEY!,
      secretAccessKey: MINIO_SECRET_KEY!,
    },
    forcePathStyle: true,
  })
}

async function ensureBucket(client: S3Client, bucket: string): Promise<void> {
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }))
    return
  } catch {
    // Bucket doesn't exist, create it
  }
  await client.send(new CreateBucketCommand({ Bucket: bucket }))
  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicRead",
        Effect: "Allow",
        Principal: "*",
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucket}/*`],
      },
    ],
  }
  try {
    await client.send(
      new PutBucketPolicyCommand({
        Bucket: bucket,
        Policy: JSON.stringify(policy),
      })
    )
  } catch {
    /* swallow — policy may already be set or restricted by ops */
  }
}

async function loadProduct(
  req: MedusaRequest,
  productId: string
): Promise<ProductWithMetadata | null> {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "metadata"],
    filters: { id: productId },
  })
  return (data?.[0] as ProductWithMetadata | undefined) ?? null
}

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const productId = req.params.id
  const file = req.file
  if (!file) {
    res.status(400).json({
      message:
        "No file provided. POST /admin/products/:id/coa/files expects multipart field 'file'.",
    })
    return
  }
  const body = (req.body || {}) as { batch_id?: string; file_kind?: string }
  if (!body.batch_id) {
    res.status(400).json({ message: "batch_id is required" })
    return
  }
  if (!isCoaFileKind(body.file_kind)) {
    res.status(400).json({
      message:
        "file_kind must be one of: standard_coa, extended_coa, chromatogram",
    })
    return
  }
  if (!MINIO_ENDPOINT || !MINIO_ACCESS_KEY || !MINIO_SECRET_KEY) {
    res.status(503).json({
      message:
        "MinIO is not configured. Set MINIO_ENDPOINT/MINIO_ACCESS_KEY/MINIO_SECRET_KEY.",
    })
    return
  }

  const product = await loadProduct(req, productId)
  if (!product) {
    res.status(404).json({ message: `Product ${productId} not found` })
    return
  }

  const sku = resolveCoaSku(product)
  const filename = filenameForKind(body.file_kind)
  const key = buildCoaObjectKey(sku, body.batch_id, filename)

  const client = createS3Client()

  try {
    await ensureBucket(client, MINIO_COA_BUCKET)
    await client.send(
      new PutObjectCommand({
        Bucket: MINIO_COA_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentLength: file.size,
        ContentType: file.mimetype || "application/pdf",
        ACL: "public-read",
        Metadata: {
          "original-filename": file.originalname,
        },
      })
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "MinIO upload failed"
    res.status(502).json({ message: `Failed to upload to MinIO: ${message}` })
    return
  }

  const url = buildCoaPublicUrl(COA_PUBLIC_BASE, key)
  res.status(201).json({
    url,
    key,
    batch_id: body.batch_id,
    file_kind: body.file_kind,
    files_field: filesFieldForKind(body.file_kind),
  })
}
