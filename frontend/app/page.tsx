import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import HowItWorks from "@/components/landing/HowItWorks";
import Cliff from "@/components/landing/Cliff";
import Guardrail from "@/components/landing/Guardrail";
import Scenarios from "@/components/landing/Scenarios";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export default function Landing() {
  return (
    <main className="min-h-screen">
      <Nav />
      <Hero />
      <Stats />
      <HowItWorks />
      <Cliff />
      <Guardrail />
      <Scenarios />
      <FAQ />
      <Footer />
    </main>
  );
}
