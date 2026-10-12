import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VIVA GYM · Socios y reservas",
  description:
    "Reserva tu bici de spinning, lleva el registro de tus asistencias y entrenamientos, y sigue tu progreso en VIVA GYM.",
};

export const viewport: Viewport = {
  themeColor: "#040a18",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
