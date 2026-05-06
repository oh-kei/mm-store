export async function uploadToS3(file: File): Promise<{ publicUrl: string; key: string }> {
  // Read file into memory to prevent ERR_UPLOAD_FILE_CHANGED
  // This happens in some browsers if the file on disk is modified or moved during upload
  const arrayBuffer = await file.arrayBuffer()
  const blob = new Blob([arrayBuffer], { type: file.type })

  const formData = new FormData()
  formData.append("file", blob, file.name)

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
