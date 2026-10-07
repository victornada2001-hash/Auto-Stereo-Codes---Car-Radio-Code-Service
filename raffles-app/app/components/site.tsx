import { JuniorClassicHeader } from "./junior-classic-header";

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
  return <JuniorClassicHeader whatsapp={whatsapp || "6648118609"} />;
}

export function SiteFooter({ settings }: { settings?: SiteSettings }) {
  const whatsapp = normalizeWhatsApp(settings?.whatsapp_number) || "6648118609";
  return (
    <footer className="border-t-4 border-[#0875b9] bg-[#202020] text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-3">
        <div>
          <div className="text-2xl font-black uppercase">Sorteos Junior</div>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">Consulta sorteos, selecciona boletos, sube comprobantes y revisa resultados desde el mismo sitio.</p>
        </div>
        <div>
          <div className="text-xs font-black uppercase tracking-[.2em] text-[#58b8f2]">Secciones</div>
          <div className="mt-4 grid gap-2 text-sm font-bold text-white/85">
            <a href="/sorteos">Boletos disponibles</a>
            <a href="/preguntas-frecuentes">Preguntas frecuentes</a>
            <a href="/metodos-de-pago">Métodos de pago</a>
            <a href="/resultados">Ganadores</a>
          </div>
        </div>
        <div>
          <div className="text-xs font-black uppercase tracking-[.2em] text-[#58b8f2]">Contacto</div>
          <div className="mt-4 text-lg font-black">664 811 8609</div>
          <div className="mt-4 flex flex-wrap gap-3">
            <a className="rounded-md bg-[#25d366] px-4 py-2 text-sm font-black text-black" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>
            {settings?.facebook_url && <a className="rounded-md border border-white/30 px-4 py-2 text-sm font-black" href={settings.facebook_url} target="_blank" rel="noreferrer">Facebook</a>}
            {settings?.instagram_url && <a className="rounded-md border border-white/30 px-4 py-2 text-sm font-black" href={settings.instagram_url} target="_blank" rel="noreferrer">Instagram</a>}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 bg-[#171717] px-5 py-5 text-center text-xs font-bold uppercase tracking-[.12em] text-white/55">© {new Date().getFullYear()} Sorteos Junior</div>
    </footer>
  );
}

export function RaffleCard({ raffle }: { raffle: Raffle }) {
  const isActive = raffle.status === "active";
  return (
    <article className="group overflow-hidden rounded-xl border border-black/15 bg-white shadow-lg transition hover:-translate-y-1">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#111]">
        {raffle.cover_image_url ? (
          <img src={raffle.cover_image_url} alt={raffle.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_30%,#3b3d42,#101114_65%)] text-7xl">🎟️</div>
        )}
        <div className={`absolute left-4 top-4 rounded-md px-4 py-2 text-xs font-black uppercase tracking-wide ${isActive ? "bg-[#d43e37] text-white" : "bg-white text-black"}`}>
          {isActive ? "Disponible" : raffle.status === "completed" ? "Finalizado" : "Pausado"}
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="text-xs font-black uppercase tracking-[.16em] text-[#0875b9]">{formatDate(raffle.draw_date)}</div>
        <h3 className="mt-2 text-2xl font-black uppercase leading-tight">{raffle.title}</h3>
        <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-slate-600">{raffle.description || raffle.prize || "Consulta los detalles del sorteo."}</p>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <Fact label="Boleto" value={`$${Number(raffle.ticket_price).toFixed(2)}`} />
          <Fact label="Emisión" value={Number(raffle.total_tickets).toLocaleString("es-MX")} />
          <Fact label="Premio" value={raffle.prize || "Ver detalle"} small />
        </div>
        <a href={`/rifa/${raffle.id}`} className={`mt-5 flex w-full items-center justify-center rounded-md px-5 py-4 text-sm font-black uppercase tracking-wide ${isActive ? "bg-[#d43e37] text-white" : "bg-[#111] text-white"}`}>
          {isActive ? "Elegir números" : "Ver sorteo"} →
        </a>
      </div>
    </article>
  );
}

function Fact({ label, value, small = false }: { label: string; value: string; small?: boolean }) {
  return <div className="rounded-md bg-[#f1f1f1] px-2 py-3"><div className="text-[10px] font-black uppercase tracking-[.12em] text-slate-500">{label}</div><div className={`mt-1 font-black ${small ? "line-clamp-1 text-xs" : "text-sm"}`}>{value}</div></div>;
}

export function PublicLoading() {
  return <div className="mx-auto max-w-7xl px-5 py-20 text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-[#0875b9]"/><div className="mt-4 font-black uppercase tracking-wide text-slate-500">Cargando sorteos…</div></div>;
}
