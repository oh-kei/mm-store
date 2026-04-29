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

    const filename = file.name
    const contentType = file.type
    const key = `custom-studio/uploads/${Date.now()}-${filename}`
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
