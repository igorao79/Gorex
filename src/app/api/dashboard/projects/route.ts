import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    console.log("=== DASHBOARD PROJECTS API ===")
    const session = await getServerSession(authOptions)
    console.log("Session user ID:", session?.user?.id)

    if (!session?.user?.id) {
      console.log("No session, returning 401")
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
            deadline: true,
          }
        }
      }
    })

    console.log("Found projects:", projects.length)
    projects.forEach((project: any, index: number) => {
      console.log(`Project ${index + 1}: ${project.name} (ID: ${project.id})`)
      console.log(`  Tasks count: ${project.tasks.length}`)
      project.tasks.forEach((task: any, taskIndex: number) => {
        console.log(`  Task ${taskIndex + 1}: ID=${task.id}, status="${task.status}"`)
      })
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching dashboard projects:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
