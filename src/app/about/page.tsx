import { Header } from "@/components/layout/header"
import { AboutSection } from "@/components/sections/about-section"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main>
        <AboutSection />
      </main>
    </div>
  )
}
