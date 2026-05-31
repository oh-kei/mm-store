import { NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

// Initialize S3 client for Minio
const s3 = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT || process.env.MINIO_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.MINIO_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.MINIO_SECRET_KEY || "",
  },
  forcePathStyle: true,
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // 1. Validation: File Size (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Max 10MB allowed." }, { status: 400 })
    }

    const filename = file.name
    const isAiFile = filename.toLowerCase().endsWith(".ai")

    // 2. Validation: Content Type
    const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"]
    if (!ALLOWED_TYPES.includes(file.type) && !isAiFile) {
      return NextResponse.json({ error: "Invalid file type. Only PNG, JPG, WEBP, SVG, and AI files are allowed." }, { status: 400 })
    }

    const contentType = isAiFile ? "application/postscript" : file.type
    const key = `custom-studio/uploads/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-_]/g, '_')}` // Sanitize filename
    const bucket = process.env.S3_BUCKET || process.env.MINIO_BUCKET || "medusa-media"
    
    // Convert file to buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload directly from the server to Minio
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })

    await s3.send(command)

    // Construct the public URL
    const endpoint = process.env.S3_ENDPOINT || process.env.MINIO_ENDPOINT || ""
    const publicUrl = process.env.S3_PUBLIC_URL 
      ? `${process.env.S3_PUBLIC_URL}/${key}`
      : `${endpoint}/${bucket}/${key}`

    return NextResponse.json({ 
      publicUrl,
      key
    })
  } catch (err: any) {
    console.error("Server-side Upload Error Details:", {
      message: err.message,
      stack: err.stack,
      endpoint: process.env.S3_ENDPOINT || process.env.MINIO_ENDPOINT,
      bucket: process.env.S3_BUCKET || process.env.MINIO_BUCKET || "medusa-media"
    })
    return NextResponse.json({ 
      error: "Failed to upload file", 
      details: err.message 
    }, { status: 500 })
  }
}
