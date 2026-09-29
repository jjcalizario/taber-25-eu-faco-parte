import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taber 25 anos · Você faz parte dessa história",
  description: "Conte como o Tabernáculo de Davi faz parte da sua história.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#A6546A",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const kit = process.env.NEXT_PUBLIC_ADOBE_FONTS_KIT;
  return (
    <html lang="pt-BR">
      <head>
        {kit ? <link rel="stylesheet" href={`https://use.typekit.net/${kit}.css`} /> : null}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800;900&display=swap"
        />
      </head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
