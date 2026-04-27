import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { Client as MinioClient } from "minio"

import {
  COA_PUBLIC_BASE,
  MINIO_ACCESS_KEY,
  MINIO_COA_BUCKET,
  MINIO_ENDPOINT,
  MINIO_SECRET_KEY,
} from "../../../../../lib/constants"
import {
  applyBatchPatch,
  buildCoaObjectKey,
  buildCoaPublicUrl,
  CoaPanelPatchInput,
  filenameForKind,
  filesFieldForKind,
  isCoaFileKind,
  resolveCoaSku,
} from "./helpers"

type ProductWithMetadata = {
  id: string
  handle?: string | null
  metadata?: Record<string, unknown> | null
}

function parseEndpoint(raw: string): {
  endPoint: string
  port: number
  useSSL: boolean
} {
  let endPoint = raw
  let useSSL = true
  let port = 443
  if (endPoint.startsWith("https://")) {
    endPoint = endPoint.slice("https://".length)
    useSSL = true
    port = 443
  } else if (endPoint.startsWith("http://")) {
    endPoint = endPoint.slice("http://".length)
    useSSL = false
    port = 80
  }
  endPoint = endPoint.replace(/\/$/, "")
  const portMatch = endPoint.match(/:(\d+)$/)
  if (portMatch) {
    port = parseInt(portMatch[1], 10)
    endPoint = endPoint.replace(/:(\d+)$/, "")
  }
  return { endPoint, port, useSSL }
}

async function ensureBucket(client: MinioClient, bucket: string): Promise<void> {
  const exists = await client.bucketExists(bucket).catch(() => false)
  if (exists) return
  await client.makeBucket(bucket)
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
  await client.setBucketPolicy(bucket, JSON.stringify(policy)).catch(() => {
    /* swallow — policy may already be set or restricted by ops */
  })
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

  const { endPoint, port, useSSL } = parseEndpoint(MINIO_ENDPOINT)
  const client = new MinioClient({
    endPoint,
    port,
    useSSL,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
  })

  try {
    await ensureBucket(client, MINIO_COA_BUCKET)
    await client.putObject(
      MINIO_COA_BUCKET,
      key,
      file.buffer,
      file.size,
      {
        "Content-Type": file.mimetype || "application/pdf",
        "x-amz-meta-original-filename": file.originalname,
        "x-amz-acl": "public-read",
      }
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

export const PATCH = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const productId = req.params.id
  const body = (req.body || {}) as CoaPanelPatchInput
  if (!body.batch_id || typeof body.batch_id !== "string") {
    res.status(400).json({ message: "batch_id is required" })
    return
  }

  const product = await loadProduct(req, productId)
  if (!product) {
    res.status(404).json({ message: `Product ${productId} not found` })
    return
  }

  const nextPanel = applyBatchPatch(product.metadata?.coa_panel, body)
  const nextMetadata = {
    ...(product.metadata || {}),
    coa_panel: nextPanel,
  }

  const productModuleService = req.scope.resolve(Modules.PRODUCT)
  await productModuleService.updateProducts(productId, {
    metadata: nextMetadata,
  })

  res.json({ coa_panel: nextPanel })
}
