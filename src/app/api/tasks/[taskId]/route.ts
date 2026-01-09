import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const { taskId } = await params
    const { title, description, status, priority, assigneeId, deadline } = await _request.json()

    // Находим задачу и проверяем доступ
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            members: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json(
        { error: "Задача не найдена" },
        { status: 404 }
      )
    }

    // Проверяем, что пользователь является участником проекта
    if (!task.project.members.length) {
      return NextResponse.json(
        { error: "Доступ запрещен" },
        { status: 403 }
      )
    }

    // Если указан assigneeId, проверяем что он участник проекта
    if (assigneeId) {
      const assigneeMembership = await prisma.projectMember.findFirst({
        where: {
          projectId: task.projectId,
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

    // Проверяем валидность статуса и приоритета
    const validStatuses = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"]
    const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"]

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Неверный статус" },
        { status: 400 }
      )
    }

    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: "Неверный приоритет" },
        { status: 400 }
      )
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
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

    // Создаем уведомление, если исполнитель изменился
    if (assigneeId !== undefined && assigneeId !== task.assigneeId && assigneeId && assigneeId !== session.user.id) {
      await prisma.notification.create({
        data: {
          message: `Вас назначили на задачу "${updatedTask.title}" в проекте "${updatedTask.project.name}"`,
          type: 'task_assigned',
          userId: assigneeId,
          taskId: updatedTask.id,
        },
      })
    }

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const { taskId } = await params

    // Находим задачу и проверяем доступ
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            members: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json(
        { error: "Задача не найдена" },
        { status: 404 }
      )
    }

    // Проверяем, что пользователь является участником проекта
    if (!task.project.members.length) {
      return NextResponse.json(
        { error: "Доступ запрещен" },
        { status: 403 }
      )
    }

    await prisma.task.delete({
      where: { id: taskId },
    })

    return NextResponse.json({ message: "Задача удалена" })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
