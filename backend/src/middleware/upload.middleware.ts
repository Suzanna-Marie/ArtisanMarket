import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import streamifier from 'streamifier'
import { Request, Response, NextFunction } from 'express'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Stockage en mémoire — on uploade vers Cloudinary manuellement
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Seules les images sont acceptées.'))
  },
})

const uploadVersCloudinary = (buffer: Buffer, folder = 'artisanmarket'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto:good' }] },
      (err, result) => {
        if (err || !result) return reject(err)
        resolve(result.secure_url)
      }
    )
    streamifier.createReadStream(buffer).pipe(stream)
  })
}

// Middleware qui upload tous les fichiers multer vers Cloudinary et injecte les URLs
export const envoyerVersCloudinary = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (req.file) {
      const url = await uploadVersCloudinary(req.file.buffer)
      ;(req.file as Express.Multer.File & { path: string }).path = url
    }
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        const url = await uploadVersCloudinary(file.buffer)
        ;(file as Express.Multer.File & { path: string }).path = url
      }
    }
    // Cas upload.fields() — req.files est un objet { fieldname: File[] }
    if (req.files && !Array.isArray(req.files)) {
      const filesObj = req.files as Record<string, Express.Multer.File[]>
      for (const field of Object.keys(filesObj)) {
        for (const file of filesObj[field]) {
          const url = await uploadVersCloudinary(file.buffer, `artisanmarket/${field}`)
          ;(file as Express.Multer.File & { path: string }).path = url
        }
      }
    }
    next()
  } catch (err) {
    next(err)
  }
}
