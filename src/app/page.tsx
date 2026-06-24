"use client";

import React from "react";
import NavHeader from "@/components/landing/NavHeader";
import HeroSection from "@/components/landing/HeroSection";
import TrustedBySection from "@/components/landing/TrustedBySection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import StatsSection from "@/components/landing/StatsSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import IntegrationsSection from "@/components/landing/IntegrationsSection";
import FaqSection from "@/components/landing/FaqSection";
import CtaSection from "@/components/landing/CtaSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-950 dark:bg-[#030712] dark:text-white">
      <NavHeader />
      <HeroSection />
      <TrustedBySection />
      <FeaturesSection />
      <StatsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <IntegrationsSection />
      <FaqSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
