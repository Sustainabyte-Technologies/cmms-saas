import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { TrustSection } from "@/components/landing/trust-section";
import { DashboardShowcaseSection } from "@/components/landing/dashboard-showcase-section";
import { AiShowcaseSection } from "@/components/landing/ai-showcase-section";
import { RoiCalculatorSection } from "@/components/landing/roi-calculator-section";
import { ComparisonSection } from "@/components/landing/comparison-section";
import { SolutionsRolesSection } from "@/components/landing/solutions-roles-section";
import { IndustriesGridSection } from "@/components/landing/industries-grid-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export const metadata = {
  title: "FixByte | AI-Powered Enterprise CMMS & Asset Reliability Platform",
  description:
    "Manage Assets, Preventive Maintenance, Work Orders, Spare Parts, Reliability Engineering, AMC, Vendors, and AI Predictions from one unified intelligent platform.",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50 selection:bg-[#54EC46] selection:text-slate-950 font-sans">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <TrustSection />
        <DashboardShowcaseSection />
        <AiShowcaseSection />
        <RoiCalculatorSection />
        <ComparisonSection />
        <SolutionsRolesSection />
        <IndustriesGridSection />
        <PricingSection />
        <TestimonialsSection />
      </main>
      <LandingFooter />
    </div>
  );
}
