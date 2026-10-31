CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  phone text NOT NULL CHECK (char_length(phone) BETWEEN 8 AND 20),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a lead" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.service_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  client_name text NOT NULL,
  client_phone text NOT NULL,
  device text NOT NULL,
  defect text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Na Fila' CHECK (status IN ('Na Fila','Em Análise na Bancada','Aguardando Peça','Pronto / Pode Retirar')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_orders TO authenticated;
GRANT ALL ON public.service_orders TO service_role;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own orders select" ON public.service_orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own orders insert" ON public.service_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own orders update" ON public.service_orders FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own orders delete" ON public.service_orders FOR DELETE TO authenticated USING (auth.uid() = user_id);