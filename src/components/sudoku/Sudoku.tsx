import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import dynamic from "next/dynamic";

// Lazy-load the game so it doesn't affect LCP
const SudokuGame = dynamic(() => import("@/components/sudoku/SudokuGame"), { ssr: false });

export default function SudokuPage() {
  return (
    <Section id="sudoku" className="py-20">
      <SectionHeading id="sudoku-heading">Sudoku</SectionHeading>
      <p className="mt-3 mb-8 text-center max-w-2xl mx-auto text-white/75">
        A fun game I made for my visitors 😊. Daily seed by default. Switch difficulty, take notes, ask for a hint, and track your time.
      </p>
      <SudokuGame />
    </Section>
  );
}
