import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Services from "@/components/Services";
import AiAutomation from "@/components/AiAutomation";
import WhyKyro from "@/components/WhyKyro";
import Process from "@/components/Process";
import CTA from "@/components/CTA";

export default function Home() {
  return (
    <div className="overflow-x-hidden bg-black">
      <main id="main-content">
        <Hero />
        <Marquee />
        <Services />
        <AiAutomation />
        <WhyKyro />
        <Process />
        <CTA />
      </main>
    </div>
  );
}
