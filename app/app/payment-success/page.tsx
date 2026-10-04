"use client";

import { useEffect, useState } from "react";

export default function PaymentSuccessPage() {
  const [reference, setReference] = useState("");
  const [state, setState] = useState<"checking" | "paid" | "processing" | "error">("checking");

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) {
      setState("error");
      return;
    }

    let cancelled = false;
    let attempts = 0;

    async function checkStatus() {
      attempts += 1;
      try {
        const response = await fetch(`/api/payment-status?session_id=${encodeURIComponent(sessionId)}`, {
          cache: "no-store",
        });
        const result = await response.json();

        if (cancelled) return;

        if (response.ok && result.status === "paid" && result.reference) {
          setReference(result.reference);
          setState("paid");
          return;
        }

        if (attempts < 12) {
          window.setTimeout(checkStatus, 1500);
        } else {
          setState("processing");
        }
      } catch {
        if (!cancelled && attempts < 12) {
          window.setTimeout(checkStatus, 1500);
        } else if (!cancelled) {
          setState("error");
        }
      }
    }

    checkStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-white">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-8 text-center shadow-2xl md:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 text-3xl">✓</div>
        <h1 className="mt-6 text-3xl font-black md:text-4xl">Payment received / Pago recibido</h1>

        {state === "checking" && (
          <p className="mt-5 text-slate-300">Confirming your payment and generating your reference… / Confirmando tu pago y generando tu folio…</p>
        )}

        {state === "paid" && (
          <>
            <p className="mt-5 text-slate-300">Your paid request has been created successfully. / Tu solicitud pagada se creó correctamente.</p>
            <div className="mt-6 rounded-2xl border border-blue-400/30 bg-blue-500/10 p-5">
              <div className="text-sm uppercase tracking-widest text-blue-300">Reference / Folio</div>
              <div className="mt-2 break-all text-2xl font-black text-white">{reference}</div>
            </div>
          </>
        )}

        {state === "processing" && (
          <p className="mt-5 text-slate-300">Your payment was received and is still being confirmed. Keep this page open or check again shortly. / Tu pago fue recibido y aún se está confirmando.</p>
        )}

        {state === "error" && (
          <p className="mt-5 text-amber-200">We could not confirm the payment status from this page. / No pudimos confirmar el estado del pago desde esta página.</p>
        )}

        <a href="/" className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-500">
          Return home / Volver al inicio
        </a>
      </div>
    </main>
  );
}
