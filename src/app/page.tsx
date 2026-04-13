import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import LogosStrip from "@/components/sections/LogosStrip";
import Jornada from "@/components/sections/Jornada";
import FeatureStrip from "@/components/sections/FeatureStrip";
import Calculator from "@/components/sections/Calculator";
import Technology from "@/components/sections/Technology";
import Team from "@/components/sections/Team";
import Testimonials from "@/components/sections/Testimonials";
import Pricing from "@/components/sections/Pricing";
import ConsultoriaCTA from "@/components/sections/ConsultoriaCTA";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import FloatingButton from "@/components/FloatingButton";
import GridLines from "@/components/GridLines";

export default function Home() {
  return (
    <div className="relative">
      <GridLines />
      <Navbar />
      <FloatingButton />
      <main>
        <Hero />
        <LogosStrip />
        <Jornada />
        <FeatureStrip />
        <Calculator />
        <Technology />
        <Team />
        <Testimonials />
        <Pricing />
        <FAQ />
        <ConsultoriaCTA />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
