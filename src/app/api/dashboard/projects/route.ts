import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
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
        creator: {
          select: {
            name: true,
            email: true
          }
        },
        members: true,
        tasks: {
          select: {
            id: true,
            status: true,
            deadline: true,
          }
        }
      }
    })

    // Добавляем расчет просроченных задач
    const projectsWithOverdue = projects.map(project => {
      const overdueTasks = project.tasks.filter(task => {
        const hasDeadline = !!task.deadline
        const isOverdue = task.deadline ? new Date(task.deadline) < new Date() : false
        const isNotDone = task.status !== 'DONE'
        const result = hasDeadline && isOverdue && isNotDone

        if (task.deadline) {
          console.log(`Task ${task.id}: deadline=${task.deadline}, status=${task.status}, hasDeadline=${hasDeadline}, isOverdue=${isOverdue}, isNotDone=${isNotDone}, result=${result}`)
        }

        return result
      }).length


      return {
        ...project,
        _count: {
          ...project._count,
          members: project.members.length,
          tasks: project.tasks.length,
          overdueTasks
        }
      }
    })

    return NextResponse.json(projectsWithOverdue)
  } catch (error) {
    console.error("Error fetching dashboard projects:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
