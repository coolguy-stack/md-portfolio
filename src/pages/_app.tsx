// src/pages/_app.tsx
import type { AppProps } from "next/app";
import "@/styles/globals.css";
import Header from "@/components/Header";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Load the cursor only on the client
const Cursor = dynamic(() => import("@/components/ui/Cursor"), { ssr: false });

// Detect fine pointer (mouse/trackpad) so we don't show a fake cursor on touch
function useFinePointer() {
  const [isFine, setIsFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setIsFine(mq.matches);
    update();
    // Safari <16.4 lacks addEventListener on MediaQueryList; guard it
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return isFine;
}

export default function App({ Component, pageProps }: AppProps) {
  const isFine = useFinePointer();

  return (
    <>
      {/* Mount custom cursor only on desktops/laptops */}
      {isFine && <Cursor />}

      {/* Fixed header on top */}
      <Header />

      {/* Offset main content by header height (h-14) */}
      <div className="pt-14 min-h-screen bg-black text-white">
        <Component {...pageProps} />
      </div>
    </>
  );
}
