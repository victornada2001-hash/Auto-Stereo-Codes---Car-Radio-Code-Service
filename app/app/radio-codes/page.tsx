import type { Metadata } from "next";
import RadioCodesDirectory from "./RadioCodesDirectory";

export const metadata: Metadata = {
  title: "Todas las marcas y códigos de estéreo | Auto Stereo Codes",
  description: "Guías por marca y fabricante para localizar el número de serie de radios y estéreos de automóvil.",
};

export default function RadioCodesPage() {
  return <RadioCodesDirectory />;
}
