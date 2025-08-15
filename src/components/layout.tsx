import "./globals.css";
import { ReactNode } from "react";

// Persist theme across reload using localStorage (no next-themes)
const themeInit = `
(function() {
  try {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldDark = saved ? saved === 'dark' : prefersDark;
    if (shouldDark) document.documentElement.classList.add('dark');
  } catch {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="bg-white text-zinc-900 dark:bg-zinc-950 dark:text-white antialiased">
        <main className="min-h-screen flex flex-col gap-6">{children}</main>
      </body>
    </html>
  );
}
