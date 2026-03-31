import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import LogosStrip from "@/components/sections/LogosStrip";
import Jornada from "@/components/sections/Jornada";
import FeatureStrip from "@/components/sections/FeatureStrip";
import Calculator from "@/components/sections/Calculator";
import Technology from "@/components/sections/Technology";
import Team from "@/components/sections/Team";
import Testimonials from "@/components/sections/Testimonials";
import ConsultoriaCTA from "@/components/sections/ConsultoriaCTA";
import ConsultoriaCTA_V1 from "@/components/sections/ConsultoriaCTA_V1";
import ConsultoriaCTA_V2 from "@/components/sections/ConsultoriaCTA_V2";
import ConsultoriaCTA_V4 from "@/components/sections/ConsultoriaCTA_V4";
import ConsultoriaCTA_V5 from "@/components/sections/ConsultoriaCTA_V5";
import ConsultoriaCTA_V6 from "@/components/sections/ConsultoriaCTA_V6";
import ConsultoriaCTA_V7 from "@/components/sections/ConsultoriaCTA_V7";
import ConsultoriaCTA_V8 from "@/components/sections/ConsultoriaCTA_V8";
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
        <ConsultoriaCTA_V2 />
        <ConsultoriaCTA_V1 />
        <ConsultoriaCTA />
        <ConsultoriaCTA_V4 />
        <ConsultoriaCTA_V5 />
        <ConsultoriaCTA_V6 />
        <ConsultoriaCTA_V7 />
        <ConsultoriaCTA_V8 />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
