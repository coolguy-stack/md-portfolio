import { useState } from "react";
import { FiGithub, FiLinkedin, FiMail, FiFileText, FiMenu, FiX } from "react-icons/fi";

export default function Header() {
  const [open, setOpen] = useState(false);

  const nav = [
    { label: "Home", href: "#hero" },
    { label: "About", href: "#about" },
    { label: "Experience", href: "#experience" },
    { label: "Interests", href: "#hobbies" },
    { label: "Projects", href: "#projects" },
    { label: "Sudoku", href: "#sudoku" },
  ];

  const socials = [
    { label: "GitHub", href: "https://github.com/coolguy-stack", icon: <FiGithub /> },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/alifhossain86/", icon: <FiLinkedin /> },
    { label: "Email", href: "mailto:alifhossain86@gmail.com", icon: <FiMail /> },
    { label: "Resume", href: "/md-resume.pdf", icon: <FiFileText /> },
  ];

  // const refresh = () => {
  //   if (typeof window !== "undefined") window.location.reload();
  // };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-black border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
       {/* Brand — refreshes page */}
        <button
        onClick={() => typeof window !== "undefined" && window.location.reload()}
        aria-label="Refresh page"
        className="text-white font-bold tracking-widest text-lg md:text-xl leading-none cursor-pointer-none select-none"
        >
        MD
        </button>


        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-6">
          {nav.map((n) => (
            <a key={n.label} href={n.href} className="text-sm text-white/70 hover:text-white">
              {n.label}
            </a>
          ))}
        </nav>

        {/* Desktop socials */}
        <div className="hidden md:flex items-center gap-3">
          {socials.map((s) => {
            const external = s.href.startsWith("http");
            return (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                className="h-8 w-8 grid place-items-center rounded-md border border-white/25
                           text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                {s.icon}
              </a>
            );
          })}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="md:hidden grid place-items-center h-9 w-9 rounded-md border border-white/20 text-white/80"
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`md:hidden ${open ? "block" : "hidden"} border-t border-white/10`}>
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-3">
          {nav.map((n) => (
            <a
              key={n.label}
              href={n.href}
              onClick={() => setOpen(false)}
              className="py-2 text-white/80 hover:text-white"
            >
              {n.label}
            </a>
          ))}
          <div className="mt-2 flex items-center gap-3">
            {socials.map((s) => {
              const external = s.href.startsWith("http");
              return (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                  className="h-9 w-9 grid place-items-center rounded-md border border-white/25
                             text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {s.icon}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
