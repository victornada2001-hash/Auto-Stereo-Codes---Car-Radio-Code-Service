import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import type { Language } from "@/app/languages";

export type CheckoutSessionPayload = {
  orderId: string;
  serial: string;
  phone: string;
  email: string;
  language: Language;
  prioritySms: boolean;
  amountUsd: string;
};

function getKey() {
  const secret = process.env.PAYPAL_SESSION_SECRET;
  if (!secret || secret.length < 24) {
    throw new Error("PAYPAL_SESSION_SECRET_NOT_CONFIGURED");
  }
  return createHash("sha256").update(secret).digest();
}

export function encryptCheckoutSession(payload: CheckoutSessionPayload) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptCheckoutSession(value: string): CheckoutSessionPayload {
  const [ivText, tagText, encryptedText] = value.split(".");
  if (!ivText || !tagText || !encryptedText) {
    throw new Error("INVALID_SESSION");
  }

  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivText, "base64url"));
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedText, "base64url")),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString("utf8")) as CheckoutSessionPayload;
}
