import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const vollkorn = localFont({
  src: [
    { path: "./fonts/vollkorn/Vollkorn-Regular.ttf",  weight: "400", style: "normal" },
    { path: "./fonts/vollkorn/Vollkorn-Italic.ttf",   weight: "400", style: "italic" },
    { path: "./fonts/vollkorn/Vollkorn-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/vollkorn/Vollkorn-Bold.ttf",     weight: "700", style: "normal" },
  ],
  variable: "--font-vollkorn",
  display: "swap",
});

const archivo = localFont({
  src: [
    { path: "./fonts/archivo/ArchivoNarrow-Regular.ttf",  weight: "400", style: "normal" },
    { path: "./fonts/archivo/ArchivoNarrow-Medium.ttf",   weight: "500", style: "normal" },
    { path: "./fonts/archivo/ArchivoNarrow-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/archivo/ArchivoNarrow-Bold.ttf",     weight: "700", style: "normal" },
  ],
  variable: "--font-archivo",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Oütlas — Share gear. Buy less. Ride more.",
  description:
    "We connect riders to low carbon methods, in the protection of natural habitats, harnessing the power of the outdoor community.",
};

// Blocking script that applies the stored theme before paint. Lives inline
// so it runs synchronously and prevents a flash of the wrong mode.
const THEME_BOOTSTRAP = `
try {
  var m = localStorage.getItem('outlas:theme');
  if (m === 'light' || m === 'dark') document.documentElement.setAttribute('data-theme', m);
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body
        className={`${vollkorn.variable} ${archivo.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
