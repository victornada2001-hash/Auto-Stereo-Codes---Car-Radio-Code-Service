"use client";

import { useEffect, useState } from "react";

export function JuniorClassicHeader({ whatsapp: _whatsapp = "6648118609" }: { whatsapp?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  return (
    <>
      <div className="h-2 bg-[#d4af37]" />
      <header className="relative z-50 border-b border-[#d4af37]/40 bg-[#081b33] text-white shadow-[0_8px_28px_rgba(8,27,51,.28)]">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 lg:px-8">
          <a href="/" className="mr-auto flex items-center gap-3 py-3 md:py-4" aria-label="Sorteos Junior">
            <img
              src="/sorteos-junior-logo.webp"
              alt="Logo Sorteos Junior"
              className="h-16 w-16 shrink-0 rounded-full border-[3px] border-[#d4af37] bg-white object-cover shadow-[0_0_0_4px_rgba(212,175,55,.12)] md:h-20 md:w-20"
            />
            <div>
              <div className="text-lg font-black uppercase tracking-[.12em] md:text-xl">Sorteos Junior</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[.18em] text-[#f2c94c]">Boletos · Pagos · Resultados</div>
            </div>
          </a>

          <button
            type="button"
            onClick={() => setOpen(value => !value)}
            aria-label="Abrir menú"
            aria-expanded={open}
            className="grid h-12 w-12 place-items-center rounded-xl border border-[#d4af37]/70 bg-white/5 transition hover:bg-white/10"
          >
            <span className="sr-only">Menú</span>
            <span className="flex w-6 flex-col gap-1.5">
              <i className="h-0.5 w-full rounded bg-white" />
              <i className="h-0.5 w-full rounded bg-white" />
              <i className="h-0.5 w-full rounded bg-white" />
            </span>
          </button>
        </div>

        {open && (
          <div className="absolute right-4 top-[calc(100%-4px)] w-[min(92vw,330px)] overflow-hidden rounded-2xl border border-[#d4af37]/45 bg-[#081b33] p-2 shadow-2xl lg:right-8">
            <MenuLink href="/" onClick={() => setOpen(false)}>Inicio</MenuLink>
            <MenuLink href="/sorteos" onClick={() => setOpen(false)}>Sorteos activos</MenuLink>
            <MenuLink href="/verificador" onClick={() => setOpen(false)}>Verificador</MenuLink>
            <MenuLink href="/preguntas-frecuentes" onClick={() => setOpen(false)}>Preguntas</MenuLink>
            <MenuLink href="/contacto" onClick={() => setOpen(false)}>Contacto</MenuLink>
            <MenuLink href="/metodos-de-pago" onClick={() => setOpen(false)}>Métodos de pago</MenuLink>
          </div>
        )}
      </header>
    </>
  );
}

function MenuLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-black uppercase tracking-wide text-white/90 transition hover:bg-white/10 hover:text-[#f2c94c]"
    >
      <span>{children}</span><span className="text-[#d4af37]">→</span>
    </a>
  );
}
