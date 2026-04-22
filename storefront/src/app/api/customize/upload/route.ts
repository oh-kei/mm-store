import { NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3 = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT || process.env.MINIO_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.MINIO_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.MINIO_SECRET_KEY || "",
  },
  forcePathStyle: true, // Needed for many S3-compatible providers like Minio/DigitalOcean
})

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType } = await req.json()

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Missing filename or contentType" }, { status: 400 })
    }

    const key = `custom-studio/uploads/${Date.now()}-${filename}`
    const bucket = process.env.S3_BUCKET || process.env.MINIO_BUCKET || "mariners-market-assets"

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    })

    // Generate a signed URL for client-side upload
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 })

    // Construct the public URL
    const endpoint = process.env.S3_ENDPOINT || process.env.MINIO_ENDPOINT || ""
    const publicUrl = process.env.S3_PUBLIC_URL 
      ? `${process.env.S3_PUBLIC_URL}/${key}`
      : `${endpoint}/${bucket}/${key}`

    return NextResponse.json({ 
      uploadUrl: signedUrl,
      publicUrl,
      key
    })
  } catch (err: any) {
    console.error("S3 GetSignedUrl Error:", err)
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 })
  }
}
