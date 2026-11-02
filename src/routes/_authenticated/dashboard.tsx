import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2, ClipboardList, LogOut, MessageCircle, Pencil, Plus, Wrench } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STATUSES, buildWhatsAppLink } from "@/lib/whatsapp";

type Order = Tables<"service_orders">;

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel — ReparaZap" },
      { name: "description", content: "Gerencie suas ordens de serviço e avise clientes no WhatsApp." },
      { property: "og:title", content: "Painel — ReparaZap" },
      { property: "og:description", content: "Gerencie suas ordens de serviço." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [editing, setEditing] = useState<Partial<Order> | null>(null);
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const { data: isAdmin = false } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      const { data } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      return !!data;
    },
  });
  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("service_orders").update({ status }).eq("id", id);
    if (error) { toast.error("Erro ao atualizar status"); return; }
    qc.invalidateQueries({ queryKey: ["orders"] });
  }

  const ready = orders.filter((o) => o.status === "Pronto / Pode Retirar").length;
  const metrics = [
    { label: "Total de OS", value: orders.length, icon: ClipboardList },
    { label: "Aparelhos na Bancada", value: orders.length - ready, icon: Wrench },
    { label: "Prontos para Entrega", value: ready, icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-primary"><Wrench className="h-5 w-5" /> ReparaZap</Link>
          <Button variant="ghost" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}>
            <LogOut /> Sair
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8">
        <div className="grid gap-4 md:grid-cols-3">
          {metrics.map((m) => (
            <Card key={m.label}><CardContent className="flex items-center justify-between p-6">
              <div><p className="text-sm text-muted-foreground">{m.label}</p><p className="mt-1 text-3xl font-bold">{m.value}</p></div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-primary"><m.icon className="h-5 w-5" /></div>
            </CardContent></Card>
          ))}
        </div>

        <Tabs defaultValue="os">
          <TabsList>
            <TabsTrigger value="os">Ordens de Serviço</TabsTrigger>
            {isAdmin && <TabsTrigger value="leads">Leads</TabsTrigger>}
          </TabsList>
          <TabsContent value="os">
        <Card><CardContent className="p-0">
          <div className="flex items-center justify-between gap-3 p-4 sm:p-6">
            <h2 className="min-w-0 truncate text-lg font-semibold sm:text-xl">Ordens de Serviço</h2>
            <Button className="shrink-0" onClick={() => setEditing({ status: "Na Fila" })}><Plus /> Nova OS</Button>
          </div>
          <div className="space-y-3 px-4 pb-4 md:hidden">
            {orders.length === 0 && <p className="py-8 text-center text-muted-foreground">Nenhuma OS ainda. Toque em “Nova OS”.</p>}
            {orders.map((o) => (
              <div key={o.id} className="space-y-3 rounded-lg border p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{o.client_name}</p>
                  <p className="text-sm text-muted-foreground">{o.client_phone} · {o.device}</p>
                  {o.defect && <p className="mt-1 text-sm">{o.defect}</p>}
                </div>
                <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditing(o)}><Pencil /> Editar</Button>
                  <Button asChild variant="whatsapp" size="sm">
                    <a href={buildWhatsAppLink({ name: o.client_name, phone: o.client_phone, device: o.device, status: o.status })} target="_blank" rel="noreferrer">
                      <MessageCircle /> WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Cliente</TableHead><TableHead>Telefone</TableHead><TableHead>Aparelho</TableHead>
              <TableHead>Defeito</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {orders.length === 0 && (
                <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Nenhuma OS ainda. Clique em “Nova OS”.</TableCell></TableRow>
              )}
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.client_name}</TableCell>
                  <TableCell>{o.client_phone}</TableCell>
                  <TableCell>{o.device}</TableCell>
                  <TableCell className="max-w-56 truncate">{o.defect}</TableCell>
                  <TableCell>
                    <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                      <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="space-x-2 whitespace-nowrap text-right">
                    <Button variant="outline" size="sm" onClick={() => setEditing(o)}><Pencil /> Editar</Button>
                    <Button asChild variant="whatsapp" size="sm">
                      <a href={buildWhatsAppLink({ name: o.client_name, phone: o.client_phone, device: o.device, status: o.status })} target="_blank" rel="noreferrer">
                        <MessageCircle /> Avisar no WhatsApp
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent></Card>
          </TabsContent>
          {isAdmin && (
            <TabsContent value="leads">
              <Card><CardContent className="p-0">
                <div className="p-6"><h2 className="text-xl font-semibold">Leads</h2></div>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Nome</TableHead><TableHead>Telefone</TableHead><TableHead>E-mail</TableHead><TableHead>Data</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {leads.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="py-10 text-center text-muted-foreground">Nenhum lead ainda.</TableCell></TableRow>
                    )}
                    {leads.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-medium">{l.name}</TableCell>
                        <TableCell>{l.phone}</TableCell>
                        <TableCell>{l.email}</TableCell>
                        <TableCell>{new Date(l.created_at).toLocaleString("pt-BR")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent></Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
      {editing && <OrderDialog order={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function OrderDialog({ order, onClose }: { order: Partial<Order>; onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState({
    client_name: order.client_name ?? "", client_phone: order.client_phone ?? "",
    device: order.device ?? "", defect: order.defect ?? "", status: order.status ?? "Na Fila",
  });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.client_name.trim() || !f.client_phone.trim() || !f.device.trim()) { toast.error("Preencha cliente, telefone e aparelho."); return; }
    const { error } = order.id
      ? await supabase.from("service_orders").update(f).eq("id", order.id)
      : await supabase.from("service_orders").insert(f);
    if (error) { toast.error("Erro ao salvar"); return; }
    qc.invalidateQueries({ queryKey: ["orders"] });
    onClose();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{order.id ? "Editar OS" : "Nova OS"}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2"><Label>Nome do cliente</Label><Input maxLength={100} value={f.client_name} onChange={(e) => setF({ ...f, client_name: e.target.value })} /></div>
          <div className="space-y-2"><Label>Telefone (com DDD)</Label><Input maxLength={20} value={f.client_phone} onChange={(e) => setF({ ...f, client_phone: e.target.value })} /></div>
          <div className="space-y-2"><Label>Aparelho / Equipamento</Label><Input maxLength={100} value={f.device} onChange={(e) => setF({ ...f, device: e.target.value })} /></div>
          <div className="space-y-2"><Label>Defeito relatado</Label><Textarea maxLength={500} value={f.defect} onChange={(e) => setF({ ...f, defect: e.target.value })} /></div>
          <div className="space-y-2"><Label>Status</Label>
            <Select value={f.status} onValueChange={(v) => setF({ ...f, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">Salvar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
