import { describe, expect, it } from "vitest";
import { buildWhatsAppLink, normalizePhone } from "@/lib/whatsapp";

describe("whatsapp link", () => {
  it("prefixes 55 to the client number", () => {
    expect(normalizePhone("(11) 98888-7777")).toBe("5511988887777");
  });
  it("does not double the 55 prefix", () => {
    expect(normalizePhone("5511988887777")).toBe("5511988887777");
  });
  it("builds the wa.me link with the status message", () => {
    const url = buildWhatsAppLink({ name: "Ana", phone: "11988887777", device: "Notebook", status: "Aguardando Peça" });
    expect(url.startsWith("https://wa.me/5511988887777?text=")).toBe(true);
    expect(decodeURIComponent(url.split("text=")[1] ?? "")).toBe(
      "Olá Ana, passando para avisar que o seu Notebook está com o status: Aguardando Peça.",
    );
  });
});

import { buildLeadWhatsAppLink } from "@/lib/whatsapp";
import { test as t2, expect as e2 } from "vitest";
t2("lead link uses sales message and clean phone", () => {
  const url = buildLeadWhatsAppLink({ name: "Ana", phone: "(11) 98888-7777" });
  e2(url.startsWith("https://wa.me/5511988887777?text=")).toBe(true);
  e2(decodeURIComponent(url.split("text=")[1] ?? "")).toBe("Olá Ana, vi que você se interessou pelo ReparaZap! Vamos configurar a sua conta?");
});
