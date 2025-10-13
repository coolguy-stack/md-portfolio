import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/experience/Experience";
import Divider from "@/components/ui/Divider";
import Hobbies from "@/components/Hobbies";
import Projects from "@/components/projects/Projects";
import SudokuPage from "@/components/sudoku/Sudoku";
import Footer from "@/components/Footer";
import SpotifyNowCard from "@/components/SpotifyNowCard";

export default function Home() {
  return (
    <>
      <Hero />

      <Divider inset className="my-16" thickness={2} />

      <About />

      <SpotifyNowCard />

      <Divider inset className="my-16" thickness={2} />

      <Experience />

      <Divider inset className="my-16" thickness={2} />

      <Hobbies />

      <Divider inset className="my-16" thickness={2} />

      <Projects />

      <Divider inset className="my-16" thickness={2} />

      <SudokuPage />

      <Footer />

      {/* Example with a label:
      <Divider inset label="More" className="my-16" /> */}
    </>
  );
}
