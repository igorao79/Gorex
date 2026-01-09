import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const { projectId } = await params
    const { email, role = "member" } = await request.json()

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

    // Получаем текущий тариф пользователя
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tarif: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      )
    }

    // Определяем лимиты участников по тарифам
    const memberLimits = {
      free: 5,
      prof: 25,
      corp: Infinity // бесконечно для корпоративного тарифа
    }

    const currentLimit = memberLimits[user.tarif as keyof typeof memberLimits] || 5

    // Считаем текущих участников проекта
    const currentMemberCount = await prisma.projectMember.count({
      where: { projectId }
    })

    // Проверяем лимит
    if (currentMemberCount >= currentLimit) {
      return NextResponse.json(
        {
          error: `Превышен лимит участников для вашего тарифа. Максимум: ${currentLimit} участников. ${
            user.tarif === 'free'
              ? 'Обновитесь до Pro для большего количества участников.'
              : 'Свяжитесь с поддержкой для увеличения лимита.'
          }`
        },
        { status: 400 }
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
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Создаем уведомление о добавлении на проект
    await prisma.notification.create({
      data: {
        message: `Вас добавили в проект "${newMember.project.name}"`,
        type: 'project_invitation',
        userId: userToInvite.id,
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
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const { projectId } = await params

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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const { projectId } = await params
    const url = new URL(_request.url)
    const memberId = url.searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json(
        { error: "ID участника обязателен" },
        { status: 400 }
      )
    }

    // Проверяем, что текущий пользователь является админом проекта
    const currentUserMembership = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: session.user.id,
        role: "admin",
      },
    })

    if (!currentUserMembership) {
      return NextResponse.json(
        { error: "Недостаточно прав для удаления участников" },
        { status: 403 }
      )
    }

    // Нельзя удалить админа проекта
    const memberToDelete = await prisma.projectMember.findUnique({
      where: { id: memberId },
      include: { user: true },
    })

    if (!memberToDelete) {
      return NextResponse.json(
        { error: "Участник не найден" },
        { status: 404 }
      )
    }

    if (memberToDelete.role === "admin") {
      return NextResponse.json(
        { error: "Нельзя удалить админа проекта" },
        { status: 400 }
      )
    }

    // Удаляем участника
    await prisma.projectMember.delete({
      where: { id: memberId },
    })

    return NextResponse.json({
      message: `Участник ${memberToDelete.user.email} успешно удален из проекта`,
    })
  } catch (error) {
    console.error("Error removing member:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
