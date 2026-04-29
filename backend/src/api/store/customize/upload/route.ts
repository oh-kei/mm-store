import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { IFileModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const fileModule: IFileModuleService = req.scope.resolve(Modules.FILE)
    
    // We expect a multipart form data with a 'file' field
    // In Medusa 2.0, we can use req.files if we have a middleware, 
    // but for a simple route we can use the raw body if it's not too large
    // However, it's better to use the file module's upload method.
    
    // For now, let's assume the storefront sends the file as a buffer in a JSON or similar, 
    // but a real multipart upload is better.
    
    // Actually, Medusa 2.0 has a helper for handling files in routes if configured.
    // Let's check if we can use req.files.
    
    const files = (req as any).files
    if (!files || files.length === 0) {
       return res.status(400).json({ error: "No file provided" })
    }

    const file = files[0]
    
    const result = await fileModule.createFiles({
      filename: file.originalname,
      mimeType: file.mimetype,
      content: file.buffer,
    })

    return res.json({ 
      publicUrl: result.url,
      key: result.key 
    })

  } catch (error: any) {
    console.error("Backend Upload Error:", error)
    return res.status(500).json({ error: error.message || "Failed to upload file" })
  }
}
