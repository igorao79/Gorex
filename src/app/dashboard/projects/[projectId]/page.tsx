import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Header } from "@/components/layout/header"
import { KanbanBoard } from "@/components/kanban/kanban-board"

interface ProjectPageProps {
  params: {
    projectId: string
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/")
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
    redirect("/dashboard")
  }

  // Получаем проект с задачами
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      creator: {
        select: {
          name: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      tasks: {
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
      },
    },
  })

  if (!project) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted overflow-x-hidden">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-heading text-foreground mb-2">
                {project.name}
              </h1>
              <p className="text-muted-foreground">
                {project.description || "Описание проекта отсутствует"}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Участников: {project.members.length}
            </div>
          </div>
        </div>

        <KanbanBoard
          projectId={projectId}
          tasks={project.tasks}
          members={project.members}
          userRole={membership.role}
          userId={session.user.id}
        />
      </main>
    </div>
  )
}
