"use client"

import LandingNavbar from "../components/landing/LandingNavbar"
import LandingHero from "../components/landing/LandingHero"
import LandingFeatures from "../components/landing/LandingFeatures"
import LandingMethodology from "../components/landing/LandingMethodology"
import LandingTestimonials from "../components/landing/LandingTestimonials"
import LandingPricing from "../components/landing/LandingPricing"
import LandingFooter from "../components/landing/LandingFooter"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

export default function LandingPage() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <main className="min-h-screen bg-[#030814] text-white selection:bg-indigo-500/30">
      <LandingNavbar />
      
      <AnimatePresence mode="wait">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.5 }}
        >
          <LandingHero />
          
          <div id="features">
            <LandingFeatures />
          </div>
          
          <div id="methodology">
            <LandingMethodology />
          </div>
          
          <div id="testimonials">
            <LandingTestimonials />
          </div>
          
          <div id="pricing">
            <LandingPricing />
          </div>
          
          <LandingFooter />
        </motion.div>
      </AnimatePresence>
    </main>
  )
}
