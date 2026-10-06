import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rifas Entre Amigos",
  description: "Plataforma de rifas con selección de boletos, reservas y verificación de pagos.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
