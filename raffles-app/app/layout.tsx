import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sorteos Junior",
    template: "%s | Sorteos Junior",
  },
  description: "Sorteos Junior: participa en sorteos, selecciona tus números, verifica tus boletos y consulta ganadores.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
