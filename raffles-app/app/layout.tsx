import type { Metadata } from "next";
import "./globals.css";
import ExperienceEffects from "./components/experience-effects";
import AdminReceiptViewer from "./components/admin-receipt-viewer";

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
      <body>
        {children}
        <ExperienceEffects />
        <AdminReceiptViewer />
      </body>
    </html>
  );
}
