import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Circularia",
  description: "Herramienta de diagnostico para evaluar circularidad en proyectos de moda e indumentaria.",
  openGraph: {
    title: "Circularia",
    description: "Herramienta de diagnostico para evaluar circularidad en proyectos de moda e indumentaria.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
