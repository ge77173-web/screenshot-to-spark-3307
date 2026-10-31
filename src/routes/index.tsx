import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, ClipboardList, MessageCircle, RefreshCw, Smartphone, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FOUNDER_WHATSAPP } from "@/lib/whatsapp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ReparaZap — Ordens de serviço e avisos no WhatsApp" },
      { name: "description", content: "Organize os consertos da sua assistência técnica e avise o cliente no WhatsApp com um clique." },
      { property: "og:title", content: "ReparaZap — Ordens de serviço e avisos no WhatsApp" },
      { property: "og:description", content: "Pare de responder 'já tá pronto?'. Avise o cliente com um clique." },
    ],
  }),
  component: Landing,
});

const leadSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome").max(100),
  phone: z.string().trim().min(8, "Telefone inválido").max(20),
  email: z.string().trim().email("E-mail inválido").max(255),
});

const founderLink = `https://wa.me/${FOUNDER_WHATSAPP}?text=${encodeURIComponent("Olá! Quero conhecer o ReparaZap.")}`;

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-hero text-hero-foreground">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="flex items-center gap-2 text-lg font-bold"><Wrench className="h-5 w-5" /> ReparaZap</span>
          <Button asChild variant="secondary" size="sm"><Link to="/dashboard">Acessar painel</Link></Button>
        </nav>
        <section className="mx-auto max-w-6xl px-6 pb-24 pt-14 md:pt-20">
          <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
            Pare de perder tempo respondendo “já tá pronto?” no WhatsApp
          </h1>
          <p className="mt-6 max-w-2xl text-lg opacity-80">
            O ReparaZap organiza os consertos da sua assistência e avisa o cliente sobre cada etapa com um único clique.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="whatsapp">
              <a href={founderLink} target="_blank" rel="noreferrer"><MessageCircle /> Falar com o fundador</a>
            </Button>
            <Button asChild size="lg" variant="secondary"><a href="#acesso">Solicitar acesso</a></Button>
          </div>
        </section>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold">Como funciona</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { icon: Smartphone, t: "Cadastre o aparelho", d: "Cliente, telefone, equipamento e defeito em segundos." },
            { icon: RefreshCw, t: "Atualize o status", d: "Na fila, na bancada, aguardando peça ou pronto." },
            { icon: MessageCircle, t: "Cliente avisado", d: "Mensagem pronta no WhatsApp do cliente, com um clique." },
          ].map((s, i) => (
            <Card key={s.t}>
              <CardContent className="p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-primary"><s.icon className="h-5 w-5" /></div>
                <p className="mt-4 text-sm font-semibold text-primary">Passo {i + 1}</p>
                <h3 className="mt-1 text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-muted-foreground">{s.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="acesso" className="mx-auto grid max-w-6xl gap-10 px-6 pb-24 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold">Monte o seu plano</h2>
          <p className="mt-4 text-muted-foreground">Deixe seus dados e a gente chama você no WhatsApp para liberar o acesso.</p>
          <ul className="mt-6 space-y-3">
            {["Ordens de serviço organizadas", "Avisos prontos no WhatsApp", "Sem instalação"].map((x) => (
              <li key={x} className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-primary" /> {x}</li>
            ))}
          </ul>
        </div>
        <LeadForm />
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">© {new Date().getFullYear()} ReparaZap</footer>
    </div>
  );
}

function LeadForm() {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = leadSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setLoading(true);
    const { error } = await supabase.from("leads").insert(parsed.data);
    setLoading(false);
    if (error) return setErrors({ form: "Não foi possível enviar. Tente novamente." });
    setDone(true);
  }

  if (done)
    return (
      <Card><CardContent className="flex flex-col items-center p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-whatsapp" />
        <p className="mt-4 text-xl font-semibold">Recebemos seu pedido, vamos chamar no WhatsApp!</p>
      </CardContent></Card>
    );

  return (
    <Card><CardContent className="p-6">
      <form onSubmit={submit} className="space-y-4">
        {(["name", "phone", "email"] as const).map((f) => (
          <div key={f} className="space-y-2">
            <Label htmlFor={f}>{{ name: "Nome", phone: "Telefone (WhatsApp)", email: "E-mail" }[f]}</Label>
            <Input id={f} type={f === "email" ? "email" : "text"} value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
            {errors[f] && <p className="text-sm text-destructive">{errors[f]}</p>}
          </div>
        ))}
        {errors.form && <p className="text-sm text-destructive">{errors.form}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>Solicitar acesso</Button>
      </form>
    </CardContent></Card>
  );
}
