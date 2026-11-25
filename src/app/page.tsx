import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroProductStage } from '@/components/landing/HeroProductStage';
import { CapabilitiesBento } from '@/components/landing/CapabilitiesBento';
import { ProofSection } from '@/components/landing/ProofSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { DemoRequestSection } from '@/components/landing/DemoRequestSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFC] text-slate-950 antialiased">
      <LandingNavbar />
      <main>
        <HeroProductStage />
        <CapabilitiesBento />
        <ProofSection />
        <PricingSection />
        <DemoRequestSection />
      </main>
      <LandingFooter />
    </div>
  );
}
