import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
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

    // Проверяем, что пользователь является создателем проекта (только создатель может удалить проект)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        creatorId: true,
        name: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Проект не найден" },
        { status: 404 }
      )
    }

    if (project.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "У вас нет прав для удаления этого проекта" },
        { status: 403 }
      )
    }

    // Удаляем проект (каскадное удаление задач и участников произойдет автоматически благодаря onDelete: Cascade)
    await prisma.project.delete({
      where: { id: projectId },
    })

    return NextResponse.json({
      message: `Проект "${project.name}" успешно удален`
    })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
