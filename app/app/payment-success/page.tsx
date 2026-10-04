"use client";

import { useEffect, useState } from "react";

export default function PaymentSuccessPage() {
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setReference(params.get("reference") || "");
    setError(params.get("error") || "");
  }, []);

  const paid = Boolean(reference);
  const saveProblem = error === "save";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-white">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-8 text-center shadow-2xl md:p-12">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl ${paid ? "bg-green-500/15" : "bg-amber-500/15"}`}>
          {paid ? "✓" : "!"}
        </div>

        <h1 className="mt-6 text-3xl font-black md:text-4xl">
          {paid ? "Payment received / Pago recibido" : "Payment not confirmed / Pago no confirmado"}
        </h1>

        {paid && (
          <>
            <p className="mt-5 text-slate-300">
              PayPal confirmed your payment and your request was created successfully. / PayPal confirmó tu pago y tu solicitud se creó correctamente.
            </p>
            <div className="mt-6 rounded-2xl border border-blue-400/30 bg-blue-500/10 p-5">
              <div className="text-sm uppercase tracking-widest text-blue-300">Reference / Folio</div>
              <div className="mt-2 break-all text-2xl font-black text-white">{reference}</div>
            </div>
          </>
        )}

        {!paid && saveProblem && (
          <p className="mt-5 text-amber-200">
            PayPal may have completed your payment, but we could not finish creating the request. Please contact us so we can verify the transaction. / PayPal pudo haber completado tu pago, pero no pudimos terminar de crear la solicitud. Contáctanos para verificar la transacción.
          </p>
        )}

        {!paid && !saveProblem && (
          <p className="mt-5 text-amber-200">
            We could not confirm a completed PayPal payment, so no reference was generated. / No pudimos confirmar un pago completado en PayPal, por lo que no se generó ningún folio.
          </p>
        )}

        <a href="/" className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-500">
          Return home / Volver al inicio
        </a>
      </div>
    </main>
  );
}
