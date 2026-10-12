export type HondaAcuraBrand = "honda" | "acura";

export type HondaAcuraLookupInput = {
  brand: HondaAcuraBrand;
  serial: string;
  vin: string;
  postalCode: string;
  year?: number | null;
  model?: string;
  email?: string;
  phone?: string;
};

export type HondaAcuraLookupResult = {
  status: "found" | "manual" | "needs_input";
  code?: string;
  source?: string;
  sourceUrl?: string;
  reason: string;
  missing?: string[];
};

function normalize(value: unknown, maxLength = 255) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function officialSourceFor(brand: HondaAcuraBrand) {
  return brand === "honda"
    ? "https://mygarage.honda.com/s/radio-nav-code?brand=Honda"
    : "https://mygarage.honda.com/s/radio-nav-code?brand=Acura";
}

export function canonicalHondaAcuraBrand(value: unknown): HondaAcuraBrand | "" {
  const brand = normalize(value, 100).toLowerCase();
  if (brand === "honda") return "honda";
  if (brand === "acura") return "acura";
  return "";
}

export async function lookupHondaAcura(input: HondaAcuraLookupInput): Promise<HondaAcuraLookupResult> {
  const sourceUrl = officialSourceFor(input.brand);
  const missing: string[] = [];
  if (!input.serial) missing.push("serial");
  if (!input.phone && !input.email) missing.push("contact");

  if (missing.length) {
    return {
      status: "needs_input",
      source: "Honda/Acura official radio code service",
      sourceUrl,
      missing,
      reason: "Se requiere la serie del radio y al menos un medio de contacto. El VIN es opcional en nuestra solicitud.",
    };
  }

  const endpoint = process.env.HONDA_ACURA_LOOKUP_URL?.trim();
  const token = process.env.HONDA_ACURA_LOOKUP_TOKEN?.trim();
  if (!endpoint) {
    return {
      status: "manual",
      source: "Honda/Acura",
      sourceUrl,
      reason: "El conector autorizado de Honda/Acura todavía no está configurado; requiere revisión manual en la fuente oficial.",
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(input),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      return {
        status: "manual",
        source: "Honda/Acura",
        sourceUrl,
        reason: `El conector Honda/Acura respondió con error ${response.status}; requiere revisión manual.`,
      };
    }

    const data = await response.json();
    const code = normalize(data?.code, 100);
    if (!code) {
      return {
        status: data?.status === "needs_input" ? "needs_input" : "manual",
        source: normalize(data?.source, 120) || "Honda/Acura",
        sourceUrl: normalize(data?.sourceUrl, 500) || sourceUrl,
        reason: normalize(data?.reason, 400) || "La fuente no devolvió un código; requiere revisión manual.",
        missing: Array.isArray(data?.missing) ? data.missing.map((x: unknown) => normalize(x, 50)).filter(Boolean) : undefined,
      };
    }

    return {
      status: "found",
      code,
      source: normalize(data?.source, 120) || "Honda/Acura",
      sourceUrl: normalize(data?.sourceUrl, 500) || sourceUrl,
      reason: "Código recibido desde la fuente conectada.",
    };
  } catch {
    return {
      status: "manual",
      source: "Honda/Acura",
      sourceUrl,
      reason: "No se pudo conectar con el servicio Honda/Acura; requiere revisión manual.",
    };
  }
}
