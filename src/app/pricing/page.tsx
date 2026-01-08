import { Header } from "@/components/layout/header"
import { PricingSection } from "@/components/sections/pricing-section"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main>
        <PricingSection />
      </main>
    </div>
  )
}
