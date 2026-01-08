"use client"

import { useState, useEffect } from "react"
import { FeaturesSection } from "./features-section"
import { PricingSection } from "./pricing-section"
import { AboutSection } from "./about-section"

type Section = "features" | "pricing" | "about" | null

export function SectionRouter() {
  const [activeSection, setActiveSection] = useState<Section>(null)

  useEffect(() => {
    const handleSectionChange = (event: CustomEvent<Section>) => {
      setActiveSection(event.detail)
    }

    window.addEventListener('navigate-to-section', handleSectionChange as EventListener)
    return () => window.removeEventListener('navigate-to-section', handleSectionChange as EventListener)
  }, [])

  if (!activeSection) {
    return null
  }

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      {activeSection === "features" && <FeaturesSection />}
      {activeSection === "pricing" && <PricingSection />}
      {activeSection === "about" && <AboutSection />}
    </div>
  )
}
