export const STATUSES = [
  "Na Fila",
  "Em Análise na Bancada",
  "Aguardando Peça",
  "Pronto / Pode Retirar",
] as const;
export type OrderStatus = (typeof STATUSES)[number];

/** Keeps digits only and ensures the Brazilian 55 prefix. */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  return `55${digits}`;
}

export function buildStatusMessage(name: string, device: string, status: string): string {
  return `Olá ${name}, passando para avisar que o seu ${device} está com o status: ${status}.`;
}

export function buildWhatsAppLink(o: { name: string; phone: string; device: string; status: string }) {
  return `https://wa.me/${normalizePhone(o.phone)}?text=${encodeURIComponent(
    buildStatusMessage(o.name, o.device, o.status),
  )}`;
}

// TODO: replace with the founder's real WhatsApp number
export const FOUNDER_WHATSAPP = "5500000000000";
