import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email обязателен" }, { status: 400 })
    }

    // Проверяем, существует ли пользователь с таким email
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    if (!user) {
      return NextResponse.json({
        exists: false,
        message: "Пользователь с таким email не найден"
      })
    }

    return NextResponse.json({
      exists: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    })
  } catch (error) {
    console.error("Error checking email:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
