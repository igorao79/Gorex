import { Header } from "@/components/layout/header"
import { FeaturesSection } from "@/components/sections/features-section"

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main>
        <FeaturesSection />
      </main>
    </div>
  )
}
