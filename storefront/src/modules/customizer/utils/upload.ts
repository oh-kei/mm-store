export async function uploadToS3(file: File): Promise<{ publicUrl: string; key: string }> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("/api/customize/upload", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error || "Failed to upload file")
  }

  const { publicUrl, key } = await response.json()

  if (!publicUrl) {
    throw new Error("Upload succeeded but no public URL returned")
  }

  return { publicUrl, key }
}
