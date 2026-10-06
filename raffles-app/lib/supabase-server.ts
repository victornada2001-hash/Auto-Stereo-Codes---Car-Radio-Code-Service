const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function assertSupabaseConfig() {
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase no está configurado para la app de rifas.");
  }
  return { supabaseUrl, serviceKey };
}

export async function supabaseRest(path: string, init: RequestInit = {}) {
  const { supabaseUrl, serviceKey } = assertSupabaseConfig();
  const headers = new Headers(init.headers);
  headers.set("apikey", serviceKey);
  headers.set("Authorization", `Bearer ${serviceKey}`);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${supabaseUrl}${path}`, { ...init, headers, cache: "no-store" });
}

export async function parseSupabaseError(response: Response) {
  let message = `Supabase respondió ${response.status}`;
  try {
    const body = await response.json();
    message = body?.message || body?.error_description || body?.error || body?.hint || message;
  } catch {
    const text = await response.text().catch(() => "");
    if (text) message = text;
  }
  return message;
}
