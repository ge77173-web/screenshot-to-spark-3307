# ReparaZap - MVP

##  A Dor Escolhida e a Oportunidade de Negócio
No dia a dia de assistências técnicas e manutenção de eletrônicos, o técnico perde muito tempo respondendo a mesma pergunta no WhatsApp: "Meu aparelho já está pronto?". O acompanhamento de ordens de serviço (OS) em papel ou planilhas desorganizadas atrasa o trabalho e gera ansiedade no cliente. O ReparaZap nasce para organizar a bancada e automatizar o aviso ao cliente com um clique.

##  Tamanho do Mercado e Business Model Canvas
* **TAM (Total Addressable Market):** Dezenas de milhares de pequenas e médias assistências técnicas (eletrônica, informática, celulares) no Brasil.
* **SAM (Serviceable Available Market):** Assistências técnicas focadas em reparos de hardware na região Sul que já utilizam o WhatsApp como canal principal de atendimento.
* **SOM (Serviceable Obtainable Market):** Assistências de São Leopoldo e região metropolitana que podem ser abordadas diretamente nas primeiras semanas de validação.

### Business Model Canvas (Resumo)
* **Proposta de Valor:** Dashboard simples para gestão de OS com disparo automatizado de status via link do WhatsApp.
* **Segmento de Clientes:** Pequenas assistências técnicas e técnicos autônomos.
* **Canais:** Venda direta (WhatsApp/Local) e indicação.
* **Receita:** Assinatura mensal SaaS (ex: R$ 39,90/mês).

##  A Tese do MVP e o que ficou manual
**Tese:** Técnicos sentem que perdem tempo no atendimento e estão dispostos a usar (e futuramente pagar por) uma ferramenta simples que organize as OS e crie mensagens automáticas de status.

**O que ficou manual de propósito:**
1. A integração com o WhatsApp não usa a API oficial (que é cara e complexa). O sistema gera um link dinâmico (`wa.me`) e o próprio técnico clica para enviar pelo seu WhatsApp Web.
2. A cobrança da assinatura e o fechamento da venda com novos leads capturados na Landing Page são feitos manualmente pelo fundador, via Pix.

##  Prompts Utilizados (ChatGPT + Lovable)

**O Mega Prompt:**
> [# Visão Geral do Projeto
Crie um MVP de uma plataforma SaaS chamada "ReparaZap", focada em gestão de ordens de serviço (OS) e comunicação automatizada com clientes via WhatsApp para assistências técnicas. O sistema usará o back-end nativo do Lovable Cloud para armazenamento de dados simples, sem necessidade de banco de dados externo complexo neste momento.

# Cores e Estilo (UI/UX)
- Design moderno, limpo e profissional focado em conversão e usabilidade.
- **Cor principal:** Azul escuro corporativo (Tech/Confiança - ex: Tailwind `blue-700`).
- **Cor secundária:** Verde WhatsApp para os botões de ação de mensagem (`emerald-500` ou `green-500`).
- **Fundo:** Cinza muito claro (`slate-50`) com cards em branco.
- Use a biblioteca Shadcn UI para os componentes e Lucide React para ícones.

# Estrutura da Aplicação (Páginas)

## 1. Landing Page (Página Inicial de Vendas)
- **Hero Section:** Título forte ("Pare de perder tempo respondendo 'já tá pronto?' no WhatsApp"). Subtítulo explicando que o sistema organiza consertos e avisa o cliente com um clique.
- **Como Funciona:** 3 passos simples (1. Cadastre o aparelho; 2. Atualize o status; 3. O cliente recebe o aviso no WhatsApp).
- **Formulário de Interesse (Lead):** Um formulário simples com Nome, Telefone e E-mail para o técnico "Solicitar Acesso" ou "Montar o próprio plano".
- **Call to Action (CTA):** Botão que leva direto para o contato comercial no WhatsApp do fundador para fechar a venda manual.

## 2. Painel de Administração (O Produto - Dashboard)
Esta é a área logada (ou simulada como logada) onde o técnico gerencia o seu dia a dia.
- **Métricas Rápidas:** Cards no topo mostrando "Total de OS", "Aparelhos na Bancada", "Prontos para Entrega".
- **Tabela de Ordens de Serviço (OS):** Colunas para:
  - Nome do Cliente
  - Telefone do Cliente
  - Aparelho/Equipamento (ex: Placa Mãe, Notebook)
  - Defeito Relatado
  - Status (Dropdown com opções: "Na Fila", "Em Análise na Bancada", "Aguardando Peça", "Pronto / Pode Retirar").
- **Botões de Ação na Tabela:**
  - Botão "Editar" para alterar as informações.
  - Botão "Avisar no WhatsApp" (Verde com ícone). 

# Regras de Negócio e Fluxos
- O formulário da Landing Page deve salvar o lead no back-end do Lovable Cloud e mostrar uma mensagem de sucesso ("Recebemos seu pedido, vamos chamar no WhatsApp!").
- O botão "Avisar no WhatsApp" na tabela do Dashboard não precisa de API complexa. Ele deve gerar um link dinâmico utilizando a URL padrão do WhatsApp Web/Mobile no formato:
  `https://wa.me/55[NUMERO_DO_CLIENTE]?text=[MENSAGEM_CODIFICADA]`
- A mensagem deve mudar dinamicamente com base no status selecionado. Exemplo: "Olá [NOME], passando para avisar que o seu [APARELHO] está com o status: [STATUS]."]

##  Aplicação Publicada
Acesse o MVP rodando ao vivo aqui: [(https://screenshot-to-spark-3307.lovable.app)]
