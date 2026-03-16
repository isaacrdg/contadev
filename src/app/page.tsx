import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import Jornada from "@/components/sections/Jornada";
import Calculator from "@/components/sections/Calculator";
import Technology from "@/components/sections/Technology";
import Team from "@/components/sections/Team";
import Testimonials from "@/components/sections/Testimonials";
import Pricing from "@/components/sections/Pricing";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import FloatingButton from "@/components/FloatingButton";

export default function Home() {
  return (
    <>
      <Navbar />
      <FloatingButton />
      <main>
        <Hero />
        <Jornada />
        <Calculator />
        <Technology />
        <Team />
        <Testimonials />
        <Pricing />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
