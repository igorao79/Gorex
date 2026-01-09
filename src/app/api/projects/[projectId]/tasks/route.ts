import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    const tasks = await prisma.task.findMany({
      where: {
        projectId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}

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
    const body = await request.json()
    const { title, description, assigneeId, deadline, priority } = body

    console.log('Create task request:', { title, description, assigneeId, deadline, priority })

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Название задачи обязательно" },
        { status: 400 }
      )
    }

    // Проверяем, что дедлайн не может быть в прошлом
    if (deadline) {
      const deadlineDate = new Date(deadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Устанавливаем начало дня

      console.log('Deadline validation:', {
        deadline,
        deadlineDate,
        today,
        isPast: deadlineDate < today
      })

      if (deadlineDate < today) {
        return NextResponse.json(
          { error: "Дедлайн не может быть в прошлом" },
          { status: 400 }
        )
      }
    }

    // Проверяем, что пользователь является админом проекта
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: session.user.id,
        role: "admin",
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: "Только администратор проекта может создавать задачи" },
        { status: 403 }
      )
    }

    // Если указан assigneeId, проверяем что он тоже участник проекта
    if (assigneeId && assigneeId !== null && assigneeId !== '') {
      console.log('Validating assignee:', assigneeId)
      const assigneeMembership = await prisma.projectMember.findFirst({
        where: {
          projectId,
          userId: assigneeId,
        },
      })

      if (!assigneeMembership) {
        return NextResponse.json(
          { error: "Исполнитель должен быть участником проекта" },
          { status: 400 }
        )
      }
    }

    // Проверяем валидность приоритета
    const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"]
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: "Неверный приоритет" },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || "MEDIUM",
        deadline: deadline ? new Date(deadline) : null,
        projectId,
        creatorId: session.user.id,
        assigneeId: assigneeId || null,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
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

    // Создаем уведомление, если задача назначена на пользователя
    if (assigneeId && assigneeId !== session.user.id) {
      await prisma.notification.create({
        data: {
          message: `Вас назначили на задачу "${task.title}" в проекте "${task.project.name}"`,
          type: 'task_assigned',
          userId: assigneeId,
          taskId: task.id,
        },
      })
    }

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
