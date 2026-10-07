export type Raffle = {
  id: string;
  slug?: string | null;
  title: string;
  description?: string | null;
  prize?: string | null;
  ticket_price: number;
  total_tickets: number;
  status: string;
  edition?: string | null;
  cover_image_url?: string | null;
  draw_date?: string | null;
  winner_ticket?: number | null;
  winner_name?: string | null;
  winner_draw_reference?: string | null;
};

export type SiteSettings = {
  whatsapp_number?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  winner_method?: string | null;
};

export function formatDate(value?: string | null) {
  if (!value) return "Fecha por anunciar";
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "long" }).format(new Date(value));
}

export function normalizeWhatsApp(value?: string | null) {
  return value?.replace(/\D/g, "") || "";
}

export function SiteHeader({ whatsapp = "" }: { whatsapp?: string }) {
  return (
    <>
      <div className="bg-[#f6c900] px-4 py-2 text-center text-[11px] font-black uppercase tracking-[.18em] text-black">
        Sorteos entre amigos · Participa en línea
      </div>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08090b]/95 text-white backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
          <a href="/" className="group flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-[#f6c900] bg-black text-xl font-black text-[#f6c900] shadow-[0_0_0_4px_rgba(246,201,0,.08)]">J</span>
            <span>
              <span className="block text-lg font-black uppercase leading-none tracking-[.08em]">Sorteos</span>
              <span className="block text-sm font-black uppercase tracking-[.28em] text-[#f6c900]">Junior</span>
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm font-extrabold uppercase tracking-wide md:flex">
            <a className="hover:text-[#f6c900]" href="/">Inicio</a>
            <a className="hover:text-[#f6c900]" href="/sorteos">Sorteos</a>
            <a className="hover:text-[#f6c900]" href="/verificador">Verificador</a>
            <a className="hover:text-[#f6c900]" href="/resultados">Ganadores</a>
            <a className="hover:text-[#f6c900]" href="/como-participar">Cómo participar</a>
          </nav>
          {whatsapp ? (
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="rounded-full bg-[#25d366] px-4 py-2.5 text-sm font-black text-black shadow-lg">
              WhatsApp
            </a>
          ) : (
            <a href="/sorteos" className="rounded-full bg-[#f6c900] px-4 py-2.5 text-sm font-black text-black">Participar</a>
          )}
        </div>
        <nav className="flex gap-2 overflow-x-auto border-t border-white/10 px-4 py-3 text-xs font-black uppercase md:hidden">
          <a className="shrink-0 rounded-full bg-white/10 px-3 py-2" href="/">Inicio</a>
          <a className="shrink-0 rounded-full bg-white/10 px-3 py-2" href="/sorteos">Sorteos</a>
          <a className="shrink-0 rounded-full bg-white/10 px-3 py-2" href="/verificador">Verificador</a>
          <a className="shrink-0 rounded-full bg-white/10 px-3 py-2" href="/resultados">Ganadores</a>
          <a className="shrink-0 rounded-full bg-white/10 px-3 py-2" href="/como-participar">Cómo participar</a>
        </nav>
      </header>
    </>
  );
}

export function SiteFooter({ settings }: { settings?: SiteSettings }) {
  const whatsapp = normalizeWhatsApp(settings?.whatsapp_number);
  return (
    <footer className="border-t border-white/10 bg-[#08090b] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-3 lg:px-8">
        <div>
          <div className="text-2xl font-black uppercase">Sorteos <span className="text-[#f6c900]">Junior</span></div>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/60">Plataforma digital para participar, verificar boletos y consultar resultados de nuestros sorteos.</p>
        </div>
        <div>
          <div className="text-xs font-black uppercase tracking-[.2em] text-[#f6c900]">Secciones</div>
          <div className="mt-4 grid gap-2 text-sm font-bold text-white/80">
            <a href="/sorteos">Sorteos disponibles</a>
            <a href="/verificador">Verificar boleto</a>
            <a href="/resultados">Ganadores</a>
            <a href="/terminos">Términos y condiciones</a>
          </div>
        </div>
        <div>
          <div className="text-xs font-black uppercase tracking-[.2em] text-[#f6c900]">Contacto</div>
          <div className="mt-4 flex flex-wrap gap-3">
            {whatsapp && <a className="rounded-full bg-[#25d366] px-4 py-2 text-sm font-black text-black" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>}
            {settings?.facebook_url && <a className="rounded-full border border-white/20 px-4 py-2 text-sm font-black" href={settings.facebook_url} target="_blank" rel="noreferrer">Facebook</a>}
            {settings?.instagram_url && <a className="rounded-full border border-white/20 px-4 py-2 text-sm font-black" href={settings.instagram_url} target="_blank" rel="noreferrer">Instagram</a>}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs font-bold uppercase tracking-[.12em] text-white/40">© {new Date().getFullYear()} Sorteos Junior</div>
    </footer>
  );
}

export function RaffleCard({ raffle }: { raffle: Raffle }) {
  const isActive = raffle.status === "active";
  return (
    <article className="group overflow-hidden rounded-[1.6rem] border border-black/10 bg-white shadow-[0_18px_50px_rgba(0,0,0,.10)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,.16)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#111]">
        {raffle.cover_image_url ? (
          <img src={raffle.cover_image_url} alt={raffle.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_30%,#3b3d42,#101114_65%)] text-7xl">🏆</div>
        )}
        <div className={`absolute left-4 top-4 rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide ${isActive ? "bg-[#f6c900] text-black" : "bg-white text-black"}`}>
          {isActive ? "Disponible" : raffle.status === "completed" ? "Finalizado" : "Pausado"}
        </div>
        {raffle.edition && <div className="absolute bottom-4 right-4 rounded-full bg-black/80 px-3 py-2 text-xs font-black uppercase text-white">Edición {raffle.edition}</div>}
      </div>
      <div className="p-5 sm:p-6">
        <div className="text-xs font-black uppercase tracking-[.16em] text-[#9b7900]">{formatDate(raffle.draw_date)}</div>
        <h3 className="mt-2 text-2xl font-black uppercase leading-tight sm:text-3xl">{raffle.title}</h3>
        <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-slate-600">{raffle.description || raffle.prize || "Selecciona tus números y participa."}</p>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <Fact label="Boleto" value={`$${Number(raffle.ticket_price).toFixed(2)}`} />
          <Fact label="Emisión" value={Number(raffle.total_tickets).toLocaleString("es-MX")} />
          <Fact label="Premio" value={raffle.prize || "Ver detalle"} small />
        </div>
        <a href={`/rifa/${raffle.id}`} className={`mt-5 flex w-full items-center justify-center rounded-xl px-5 py-4 text-sm font-black uppercase tracking-wide ${isActive ? "bg-[#f6c900] text-black" : "bg-[#111] text-white"}`}>
          {isActive ? "Elegir números" : "Ver sorteo"} →
        </a>
      </div>
    </article>
  );
}

function Fact({ label, value, small = false }: { label: string; value: string; small?: boolean }) {
  return <div className="rounded-xl bg-[#f4f2ec] px-2 py-3"><div className="text-[10px] font-black uppercase tracking-[.12em] text-slate-500">{label}</div><div className={`mt-1 font-black ${small ? "line-clamp-1 text-xs" : "text-sm"}`}>{value}</div></div>;
}

export function PublicLoading() {
  return <div className="mx-auto max-w-7xl px-5 py-20 text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-[#f6c900]"/><div className="mt-4 font-black uppercase tracking-wide text-slate-500">Cargando sorteos…</div></div>;
}
