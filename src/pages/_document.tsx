import { Html, Head, Main, NextScript } from "next/document";

const forceDark = `
(function () {
  try {
    // Force dark class before paint
    document.documentElement.classList.add('dark');

    // Persist for future loads
    localStorage.setItem('theme', 'dark');

    // Ensure UA widgets use dark palette
    var meta = document.querySelector('meta[name="color-scheme"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name','color-scheme');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'dark');
  } catch {}
})();
`;

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        {/* Ask dark-mode extensions (e.g., Dark Reader) not to modify colors */}
        <meta name="darkreader-lock" />
        <meta name="color-scheme" content="dark" />
        <script dangerouslySetInnerHTML={{ __html: forceDark }} />
      </Head>
      <body className="bg-black text-white antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
