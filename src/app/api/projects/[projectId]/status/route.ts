import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ProjectStatus } from "@/generated/prisma/enums"
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    console.log("=== STATUS UPDATE API CALLED ===")
    const session = await getServerSession(authOptions)
    console.log("Session:", session ? "exists" : "null")

    if (!session?.user?.id) {
      console.log("No user ID in session")
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const { projectId } = await params
    console.log("Project ID:", projectId)
    const body = await request.json()
    console.log("Request body:", body)
    const { status } = body
    console.log("Requested status:", status, "Type:", typeof status)

    const validStatuses = ["ACTIVE", "COMPLETED", "ARCHIVED"]
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Неверный статус проекта" },
        { status: 400 }
      )
    }

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

    // Обновляем статус проекта
    console.log("Updating project with data:", { status })
    try {
      const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: { status: status as ProjectStatus },
      include: {
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: true,
            tasks: true,
          },
        },
      },
      })
      console.log("Project updated successfully:", updatedProject.id, updatedProject.status)

      return NextResponse.json(updatedProject)
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        { error: "Ошибка базы данных" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error updating project status:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
