"use client";

import { useEffect, useState } from "react";

type Viewer = {
  url: string;
  mimeType: string;
  filename: string;
  folio: string;
};

function clean(value?: string | null) {
  return String(value || "").trim();
}

function findRequestCard(node: HTMLElement) {
  let current: HTMLElement | null = node;
  for (let depth = 0; depth < 10 && current; depth += 1) {
    const first = current.firstElementChild;
    if (first instanceof HTMLButtonElement && clean(first.textContent).toLowerCase().includes("solicitud")) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

function extractFolio(card: HTMLElement) {
  const header = card.firstElementChild;
  const text = clean(header?.textContent);
  const match = text.match(/\b[A-Z]{1,10}-[A-Z0-9-]{4,}\b/i);
  return match?.[0] || "";
}

function filenameFromHeader(value: string | null) {
  if (!value) return "comprobante";
  const utf = value.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (utf) {
    try { return decodeURIComponent(utf); } catch { return utf; }
  }
  return value.match(/filename="([^"]+)"/i)?.[1] || "comprobante";
}

export default function AdminReceiptViewer() {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!window.location.pathname.startsWith("/admin")) return;

    let disposed = false;

    const openReceipt = async (folio: string) => {
      const adminKey = sessionStorage.getItem("raffles-admin-key") || "";
      if (!adminKey) {
        setError("Vuelve a iniciar sesión en el panel para ver el comprobante.");
        return;
      }

      setError("");
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/receipts?folio=${encodeURIComponent(folio)}`, {
          headers: { "x-admin-key": adminKey },
          cache: "no-store",
        });

        if (!response.ok) {
          let message = "No se pudo abrir el comprobante.";
          try {
            const data = await response.json();
            message = data?.error || message;
          } catch {}
          throw new Error(message);
        }

        const blob = await response.blob();
        if (disposed) return;
        const url = URL.createObjectURL(blob);
        setViewer({
          url,
          mimeType: blob.type || response.headers.get("content-type") || "application/octet-stream",
          filename: filenameFromHeader(response.headers.get("content-disposition")),
          folio,
        });
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo abrir el comprobante.");
      } finally {
        if (!disposed) setLoading(false);
      }
    };

    const decorate = () => {
      const labels = Array.from(document.querySelectorAll<HTMLElement>("div"))
        .filter(element => clean(element.textContent).toLowerCase() === "comprobante");

      for (const label of labels) {
        const block = label.parentElement;
        if (!block || block.querySelector("[data-admin-receipt-viewer]")) continue;
        if (clean(block.textContent).toLowerCase().includes("no recibido")) continue;

        const card = findRequestCard(block);
        if (!card) continue;
        const folio = extractFolio(card);
        if (!folio) continue;

        const button = document.createElement("button");
        button.type = "button";
        button.dataset.adminReceiptViewer = "true";
        button.textContent = "👁 Ver comprobante";
        button.className = "mt-3 rounded-xl border-2 border-black bg-white px-4 py-2 text-sm font-black shadow-[2px_2px_0_#111] transition hover:-translate-y-0.5 hover:bg-amber-100";
        button.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          void openReceipt(folio);
        });
        block.appendChild(button);
      }
    };

    decorate();
    const observer = new MutationObserver(decorate);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!viewer) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      URL.revokeObjectURL(viewer.url);
    };
  }, [viewer]);

  if (!viewer && !loading && !error) return null;

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Visor de comprobante">
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border-2 border-black bg-[#f7f2e8] shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b-2 border-black bg-amber-400 px-5 py-4">
          <div>
            <div className="text-xs font-black uppercase tracking-[.18em]">Comprobante de pago</div>
            <div className="mt-1 font-black">{viewer ? `${viewer.folio} · ${viewer.filename}` : "Abriendo archivo…"}</div>
          </div>
          <button
            type="button"
            onClick={() => { setViewer(null); setError(""); setLoading(false); }}
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-black bg-white text-xl font-black"
            aria-label="Cerrar comprobante"
          >×</button>
        </div>

        <div className="min-h-[260px] flex-1 overflow-auto bg-[#1a1a1a] p-4 sm:p-6">
          {loading && <div className="grid min-h-[55vh] place-items-center text-center text-white"><div><div className="text-5xl">🧾</div><div className="mt-4 text-xl font-black">Abriendo comprobante…</div></div></div>}
          {error && !loading && <div className="grid min-h-[40vh] place-items-center"><div className="max-w-lg rounded-2xl bg-white p-6 text-center"><div className="text-4xl">⚠️</div><div className="mt-3 text-xl font-black">No se pudo mostrar</div><p className="mt-2 text-sm text-slate-600">{error}</p></div></div>}
          {viewer && !loading && viewer.mimeType.startsWith("image/") && (
            <img src={viewer.url} alt={`Comprobante ${viewer.folio}`} className="mx-auto max-h-[75vh] max-w-full rounded-xl bg-white object-contain" />
          )}
          {viewer && !loading && viewer.mimeType === "application/pdf" && (
            <iframe src={viewer.url} title={`Comprobante ${viewer.folio}`} className="h-[75vh] w-full rounded-xl bg-white" />
          )}
          {viewer && !loading && !viewer.mimeType.startsWith("image/") && viewer.mimeType !== "application/pdf" && (
            <div className="grid min-h-[40vh] place-items-center"><a href={viewer.url} download={viewer.filename} className="rounded-xl bg-amber-400 px-5 py-3 font-black text-black">Descargar comprobante</a></div>
          )}
        </div>
      </div>
    </div>
  );
}
