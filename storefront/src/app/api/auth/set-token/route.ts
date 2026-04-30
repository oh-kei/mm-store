import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "No token provided" }, { status: 400 })
    }

    const response = NextResponse.json({ success: true })

    // Set the same httpOnly cookie that the rest of the app reads via getAuthHeaders()
    response.cookies.set("_medusa_jwt", token, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })

    return response
  } catch (err) {
    console.error("[set-auth-token] Error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
