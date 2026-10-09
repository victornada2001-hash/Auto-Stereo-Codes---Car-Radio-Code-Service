import { JuniorClassicHeader } from "./junior-classic-header";

export type Raffle = {
  id: string;
  slug?: string | null;
  title: string;
  description?: string | null;
  prize?: string | null;
  prize_description?: string | null;
  conditions_text?: string | null;
  price_details?: string | null;
  ticket_price: number;
  total_tickets: number;
  status: string;
  edition?: string | null;
  cover_image_url?: string | null;
  image_urls?: string[];
  draw_date?: string | null;
  discounts?: Array<{ min_qty:number; percent:number }>;
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
    <footer className="border-t-4 border-[#d4af37] bg-[#081b33] text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
        <div>
          <div className="text-2xl font-black uppercase">Sorteos <span className="text-[#f2c94c]">Junior</span></div>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">Consulta sorteos, selecciona boletos, sube comprobantes y revisa resultados desde el mismo sitio.</p>
        </div>
        <div>
          <div className="text-xs font-black uppercase tracking-[.2em] text-[#f2c94c]">Secciones</div>
          <div className="mt-4 grid gap-2 text-sm font-bold text-white/85">
            <a href="/sorteos">Boletos disponibles</a>
            <a href="/preguntas-frecuentes">Preguntas frecuentes</a>
            <a href="/metodos-de-pago">Métodos de pago</a>
            <a href="/resultados">Ganadores</a>
          </div>
        </div>
        <div>
          <div className="text-xs font-black uppercase tracking-[.2em] text-[#f2c94c]">Contacto</div>
          <div className="mt-4 text-2xl font-black">664 811 8609</div>
          <div className="mt-4 flex flex-wrap gap-3">
            <a className="rounded-lg border border-[#d4af37]/55 bg-white/5 px-4 py-2 text-sm font-black text-white" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>
            {settings?.facebook_url && <a className="rounded-lg border border-white/25 px-4 py-2 text-sm font-black" href={settings.facebook_url} target="_blank" rel="noreferrer">Facebook</a>}
            {settings?.instagram_url && <a className="rounded-lg border border-white/25 px-4 py-2 text-sm font-black" href={settings.instagram_url} target="_blank" rel="noreferrer">Instagram</a>}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 bg-[#051324] px-5 py-5 text-center text-xs font-bold uppercase tracking-[.12em] text-white/50">© {new Date().getFullYear()} Sorteos Junior</div>
    </footer>
  );
}

export function RaffleCard({ raffle }: { raffle: Raffle }) {
  const isActive = raffle.status === "active";
  return (
    <article className="group overflow-hidden rounded-2xl border border-[#081b33]/10 bg-white shadow-[0_16px_40px_rgba(8,27,51,.09)] transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(8,27,51,.14)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#081b33]">
        {raffle.cover_image_url ? (
          <img src={raffle.cover_image_url} alt={raffle.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_30%,#173f6c,#081b33_70%)] text-7xl">🎟️</div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#081b33]/85 to-transparent" />
        <div className={`absolute left-4 top-4 rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide ${isActive ? "bg-[#f2c94c] text-[#081b33]" : "bg-white text-[#081b33]"}`}>
          {isActive ? "Disponible" : raffle.status === "completed" ? "Finalizado" : "Pausado"}
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="text-xs font-black uppercase tracking-[.16em] text-[#9a7a12]">{formatDate(raffle.draw_date)}</div>
        <h3 className="mt-2 text-2xl font-black uppercase leading-tight text-[#081b33]">{raffle.title}</h3>
        <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-slate-600">{raffle.description || raffle.prize || "Consulta los detalles del sorteo."}</p>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <Fact label="Boleto" value={`$${Number(raffle.ticket_price).toFixed(2)}`} />
          <Fact label="Emisión" value={Number(raffle.total_tickets).toLocaleString("es-MX")} />
          <Fact label="Premio" value={raffle.prize || "Ver detalle"} small gold />
        </div>
        <a href={`/rifa/${raffle.id}`} className={`mt-5 flex w-full items-center justify-center rounded-xl px-5 py-4 text-sm font-black uppercase tracking-wide text-white ${isActive ? "bg-gradient-to-r from-[#e5483f] to-[#ff8a00]" : "bg-[#081b33]"}`}>
          {isActive ? "Elegir números" : "Ver sorteo"} →
        </a>
      </div>
    </article>
  );
}

function Fact({ label, value, small = false, gold = false }: { label: string; value: string; small?: boolean; gold?: boolean }) {
  return <div className="rounded-xl border border-[#081b33]/8 bg-[#f7f9fc] px-2 py-3"><div className="text-[10px] font-black uppercase tracking-[.12em] text-slate-500">{label}</div><div className={`mt-1 font-black ${gold ? "text-[#9a7a12]" : "text-[#081b33]"} ${small ? "line-clamp-1 text-xs" : "text-sm"}`}>{value}</div></div>;
}

export function PublicLoading() {
  return <div className="mx-auto max-w-7xl px-5 py-20 text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#081b33]/10 border-t-[#d4af37]"/><div className="mt-4 font-black uppercase tracking-wide text-slate-500">Cargando sorteos…</div></div>;
}
