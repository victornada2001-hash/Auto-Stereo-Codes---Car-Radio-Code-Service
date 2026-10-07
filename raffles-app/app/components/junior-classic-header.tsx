export function JuniorClassicHeader({ whatsapp: _whatsapp = "6648118609" }: { whatsapp?: string }) {
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

          <nav className="hidden items-center gap-1 lg:flex">
            <Nav href="/">Inicio</Nav>
            <Nav href="/sorteos">Sorteos activos</Nav>
            <Nav href="/verificador">Verificador</Nav>
            <Nav href="/preguntas-frecuentes">Preguntas</Nav>
            <Nav href="/contacto">Contacto</Nav>
            <Nav href="/metodos-de-pago">Métodos de pago</Nav>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <a href="/subir-pago" className="rounded-lg border-2 border-[#d4af37] bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wide text-[#081b33] transition hover:-translate-y-0.5">Sube tu pago</a>
            <a href="/comprar" className="rounded-lg bg-gradient-to-r from-[#e5483f] to-[#ff8a00] px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">Comprar boletos</a>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto border-t border-white/10 px-3 py-3 text-xs font-black uppercase lg:hidden">
          <a className="shrink-0 rounded-lg bg-white/10 px-3 py-2" href="/">Inicio</a>
          <a className="shrink-0 rounded-lg bg-white/10 px-3 py-2" href="/sorteos">Sorteos activos</a>
          <a className="shrink-0 rounded-lg bg-white/10 px-3 py-2" href="/verificador">Verificador</a>
          <a className="shrink-0 rounded-lg bg-white/10 px-3 py-2" href="/preguntas-frecuentes">Preguntas</a>
          <a className="shrink-0 rounded-lg border border-[#d4af37] bg-white px-3 py-2 text-[#081b33]" href="/subir-pago">Sube tu pago</a>
          <a className="shrink-0 rounded-lg bg-gradient-to-r from-[#e5483f] to-[#ff8a00] px-3 py-2" href="/comprar">Comprar boletos</a>
        </nav>
      </header>
    </>
  );
}

function Nav({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} className="rounded-lg px-4 py-3 text-sm font-black uppercase tracking-wide text-white/85 transition hover:bg-white/8 hover:text-[#f2c94c]">{children}</a>;
}
