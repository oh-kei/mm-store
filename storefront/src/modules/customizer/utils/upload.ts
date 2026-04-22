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
  console.log("Customizer Upload: Received signed URL", { uploadUrl, publicUrl, key })

  if (!uploadUrl) {
    throw new Error("Received empty upload URL from server")
  }

  // 2. Upload directly to S3
  console.log(`Customizer Upload: Starting PUT request to ${new URL(uploadUrl).origin}...`)
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  })

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text()
    console.error("S3 Upload Failed:", uploadResponse.status, errorText)
    throw new Error(`S3 Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`)
  }

  return { publicUrl, key }
}
