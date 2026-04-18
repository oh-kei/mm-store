export async function uploadToS3(file: File): Promise<{ publicUrl: string; key: string }> {
  // 1. Get signed URL from our API
  const response = await fetch("/api/customize/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to get upload URL")
  }

  const { uploadUrl, publicUrl, key } = await response.json()

  // 2. Upload directly to S3
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  })

  if (!uploadResponse.ok) {
    throw new Error("S3 Upload failed")
  }

  return { publicUrl, key }
}
