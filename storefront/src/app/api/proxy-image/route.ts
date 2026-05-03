import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get("url")

  if (!url) {
    return new NextResponse("Missing URL", { status: 400 })
  }

  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const contentType = response.headers.get("content-type") || "image/png"

    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Image proxy failed:", error)
    return new NextResponse("Failed to fetch image", { status: 500 })
  }
}
