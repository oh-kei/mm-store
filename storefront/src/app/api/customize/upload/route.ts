import { NextRequest, NextResponse } from "next/server"
import * as Minio from "minio"

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || ""
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || ""
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || ""
const MINIO_BUCKET = process.env.MINIO_BUCKET || "mariners-market-assets"
const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || ""

function getMinioClient() {
  // Parse the endpoint URL
  const url = new URL(MINIO_ENDPOINT.startsWith("http") ? MINIO_ENDPOINT : `https://${MINIO_ENDPOINT}`)
  const useSSL = url.protocol === "https:"
  const port = url.port ? parseInt(url.port) : (useSSL ? 443 : 80)

  return new Minio.Client({
    endPoint: url.hostname,
    port,
    useSSL,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
    pathStyle: true,
  })
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const key = `custom-studio/uploads/${Date.now()}-${file.name}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const client = getMinioClient()
    await client.putObject(MINIO_BUCKET, key, buffer, buffer.length, {
      "Content-Type": file.type,
    })

    // Build the public URL
    const publicUrl = MINIO_PUBLIC_URL
      ? `${MINIO_PUBLIC_URL}/${MINIO_BUCKET}/${key}`
      : `${MINIO_ENDPOINT}/${MINIO_BUCKET}/${key}`

    return NextResponse.json({ publicUrl, key })
  } catch (err: any) {
    console.error("Minio Upload Error:", err)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
