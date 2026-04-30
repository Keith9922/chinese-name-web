import SiteHeader from "@/components/shared/SiteHeader";
import SiteFooter from "@/components/shared/SiteFooter";
import InkBackdrop from "@/components/shared/InkBackdrop";
import HeroInk from "@/components/landing/HeroInk";
import NameShowcase from "@/components/landing/NameShowcase";
import RitualSection from "@/components/landing/RitualSection";
import StorySection from "@/components/landing/StorySection";
import PricingTeaser from "@/components/landing/PricingTeaser";
import FinalCTA from "@/components/landing/FinalCTA";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#fbf6ee] text-stone-900">
      <InkBackdrop intensity="rich" />
      <SiteHeader variant="landing" />
      <main className="relative">
        <HeroInk />
        <NameShowcase />
        <RitualSection />
        <StorySection />
        <PricingTeaser />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}
