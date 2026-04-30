import type { RequestHandler } from "express"

declare module "multer" {
  interface MulterFile {
    fieldname: string
    originalname: string
    mimetype: string
    size: number
    buffer: Buffer
  }

  type StorageEngine = unknown

  interface MulterInstance {
    single(field: string): RequestHandler
    array(field: string, maxCount?: number): RequestHandler
  }

  interface MulterOptions {
    storage?: StorageEngine
    limits?: { fileSize?: number; files?: number }
  }

  interface MulterFactory {
    (options?: MulterOptions): MulterInstance
    memoryStorage(): StorageEngine
  }

  const multer: MulterFactory
  export = multer
}

declare global {
  namespace Express {
    interface Request {
      file?: import("multer").MulterFile
      files?:
        | import("multer").MulterFile[]
        | { [fieldname: string]: import("multer").MulterFile[] }
    }
  }
}
