export function JuniorClassicHeader({ whatsapp = "6648118609" }: { whatsapp?: string }) {
  const phone = (whatsapp || "6648118609").replace(/\D/g, "");
  return (
    <>
      <div className="h-8 bg-[#0875b9]" />
      <header className="relative z-50 border-b-[5px] border-[#0875b9] bg-[#202020] text-white shadow-md">
        <div className="mx-auto flex max-w-[1366px] items-center px-4 lg:px-8">
          <a href="/" className="relative z-10 -my-7 mr-8 hidden shrink-0 md:block" aria-label="Sorteos Junior">
            <div className="grid h-40 w-40 place-items-center rounded-full border-[7px] border-white bg-[#0875b9] shadow-xl">
              <div className="grid h-[126px] w-[126px] place-items-center rounded-full border-[5px] border-[#f3cd00] bg-[#0b5e9a] text-center">
                <div>
                  <div className="text-[13px] font-black uppercase tracking-[.16em] text-white">Sorteos</div>
                  <div className="-mt-1 text-5xl font-black italic leading-none text-[#f3cd00]">SJ</div>
                  <div className="mt-1 text-[12px] font-black uppercase tracking-[.18em] text-white">Junior</div>
                </div>
              </div>
            </div>
          </a>

          <a href="/" className="mr-auto flex items-center gap-3 py-4 md:hidden">
            <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-[#f3cd00] bg-[#0875b9] text-xl font-black text-white">SJ</div>
            <div className="font-black uppercase tracking-[.14em]">Sorteos Junior</div>
          </a>

          <nav className="ml-auto hidden items-stretch md:flex">
            <Nav href="/">Inicio</Nav>
            <Nav href="/preguntas-frecuentes">Preguntas Frecuentes</Nav>
            <Nav href="/contacto">Contacto</Nav>
            <Nav href="/metodos-de-pago">Métodos de Pago</Nav>
            <Nav href="/sorteos" last>Comprar Boletos</Nav>
          </nav>

          {phone && (
            <a className="ml-3 hidden rounded-md bg-[#25d366] px-3 py-2 text-xs font-black text-black xl:block" href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer">WhatsApp</a>
          )}
        </div>

        <nav className="flex gap-2 overflow-x-auto border-t border-white/10 px-3 py-3 text-xs font-black md:hidden">
          <a className="shrink-0 rounded-md bg-white/10 px-3 py-2" href="/">Inicio</a>
          <a className="shrink-0 rounded-md bg-white/10 px-3 py-2" href="/preguntas-frecuentes">Preguntas frecuentes</a>
          <a className="shrink-0 rounded-md bg-white/10 px-3 py-2" href="/contacto">Contacto</a>
          <a className="shrink-0 rounded-md bg-white/10 px-3 py-2" href="/metodos-de-pago">Métodos de pago</a>
          <a className="shrink-0 rounded-md bg-[#d33c35] px-3 py-2" href="/sorteos">Comprar boletos</a>
        </nav>
      </header>
    </>
  );
}

function Nav({ href, children, last = false }: { href: string; children: React.ReactNode; last?: boolean }) {
  return <a href={href} className={`flex min-h-[84px] items-center border-l border-white/70 px-8 text-[17px] font-black transition hover:bg-black/20 ${last ? "border-r" : ""}`}>{children}</a>;
}
