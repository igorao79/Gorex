import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const { email, role = "member" } = await request.json()
    const { projectId } = params

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email обязателен" },
        { status: 400 }
      )
    }

    // Проверяем, что пользователь является участником проекта
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: session.user.id,
        role: "admin", // Только админы могут приглашать
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: "У вас нет прав для приглашения участников" },
        { status: 403 }
      )
    }

    // Находим пользователя по email
    const userToInvite = await prisma.user.findUnique({
      where: { email },
    })

    if (!userToInvite) {
      return NextResponse.json(
        { error: "Пользователь с таким email не найден" },
        { status: 404 }
      )
    }

    // Проверяем, не является ли пользователь уже участником
    const existingMembership = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: userToInvite.id,
      },
    })

    if (existingMembership) {
      return NextResponse.json(
        { error: "Пользователь уже является участником проекта" },
        { status: 400 }
      )
    }

    // Добавляем пользователя в проект
    const newMember = await prisma.projectMember.create({
      data: {
        projectId,
        userId: userToInvite.id,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(newMember, { status: 201 })
  } catch (error) {
    console.error("Error inviting member:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const { projectId } = params

    // Проверяем, что пользователь является участником проекта
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: session.user.id,
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: "Доступ запрещен" },
        { status: 403 }
      )
    }

    const members = await prisma.projectMember.findMany({
      where: {
        projectId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
