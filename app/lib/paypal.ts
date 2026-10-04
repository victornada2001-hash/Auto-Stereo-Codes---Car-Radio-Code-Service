const PAYPAL_SANDBOX_BASE = "https://api-m.sandbox.paypal.com";
const PAYPAL_LIVE_BASE = "https://api-m.paypal.com";

export function getPayPalBaseUrl() {
  return process.env.PAYPAL_MODE === "live" ? PAYPAL_LIVE_BASE : PAYPAL_SANDBOX_BASE;
}

export async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_NOT_CONFIGURED");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || !result.access_token) {
    throw new Error("PAYPAL_AUTH_FAILED");
  }

  return String(result.access_token);
}

export async function paypalRequest(path: string, init: RequestInit = {}) {
  const accessToken = await getPayPalAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  return fetch(`${getPayPalBaseUrl()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}
