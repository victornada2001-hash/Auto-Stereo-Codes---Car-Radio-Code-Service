import type { Metadata } from "next";
import RequestClient from "./RequestClient";

export const metadata: Metadata = {
  title: "Solicitar código | Auto Stereo Codes",
  description: "Completa tu solicitud de código de radio y continúa al pago seguro.",
};

export default function RequestPage(){
  return <RequestClient/>;
}
