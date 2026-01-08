import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ProjectGrid } from "@/components/dashboard/project-grid"
import { headers } from "next/headers"

export default async function Dashboard() {
  console.log("Dashboard: Checking session...")
  const session = await getServerSession(authOptions)
  console.log("Dashboard: Session result:", session)

  if (!session?.user) {
    console.log("Dashboard: No session, redirecting to signin")
    redirect("/auth/signin")
  }

  console.log("Dashboard: Session found for user:", session.user.email)

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={session.user} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Добро пожаловать, {session.user.name}!
          </h1>
          <p className="text-slate-600">
            Управляйте своими проектами и задачами
          </p>
        </div>

        <ProjectGrid userId={session.user.id} />
      </main>
    </div>
  )
}
