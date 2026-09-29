# Taber 25 anos · Você faz parte dessa história

Sistema de coleta, moderação e projeção de relatos para os 25 anos do Tabernáculo de Davi.

| Rota | Para quem | O que faz |
|---|---|---|
| `/25anos` (ou `/`) | público, via QR Code | escolha da experiência |
| `/gratidao` `/milagre` `/transformacao` | público | formulário (foto opcional) |
| `/obrigado` | público | confirmação |
| `/tv` | técnico do LED | projeção contínua dos relatos aprovados |
| `/admin` | equipe | visão geral |
| `/admin/relatos` | equipe | lista, filtros, aprovação, edição, prévia do LED |
| `/admin/configuracoes` | equipe | tempos, ordem, categorias, fotos, nomes, QR Code |

Stack: Next.js 15 (App Router) · Tailwind · Supabase (Postgres + Auth + Storage) · deploy na Vercel.

---

## 1. Criar o banco (Supabase) — 10 minutos

1. Crie um projeto em https://supabase.com (região São Paulo).
2. Em **SQL Editor**, cole e rode `supabase/migrations/001_estrutura.sql`.
   Isso cria as tabelas `relatos`, `configuracoes`, `admins`, as regras de segurança (RLS) e o bucket privado `relatos` para as fotos.
3. (Opcional) Rode `supabase/seed_demo.sql` para ter relatos de demonstração.
   Para apagar depois: `delete from public.relatos where demo = true;`
4. Crie o primeiro administrador:
   - **Authentication > Users > Add user**: e-mail e senha, marque "Auto confirm".
   - No SQL Editor: `insert into public.admins (email, nome) values ('seuemail@taber.com.br', 'Jean');`
   Só e-mails nessa tabela entram no painel. Para dar acesso a alguém, repita os dois passos.
5. Em **Authentication > Providers**, desative "Allow new users to sign up" (ninguém se cadastra sozinho).

## 2. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha (Supabase > Project Settings > API):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...      # só servidor, nunca exponha
NEXT_PUBLIC_SITE_URL=https://seudominio   # usado no QR Code
NEXT_PUBLIC_ADOBE_FONTS_KIT=      # opcional, ver public/fonts/LEIA-ME.txt
```

## 3. Rodar localmente

```bash
npm install
npm run dev
# http://localhost:3000/25anos · /tv · /admin
```

## 4. Publicar (Vercel)

1. Suba a pasta para um repositório no GitHub.
2. Em https://vercel.com, **Add New > Project**, importe o repositório.
3. Cole as mesmas variáveis de ambiente e clique em **Deploy**.
4. Em **Settings > Domains**, aponte um subdomínio (ex.: `25anos.taber.com.br`) e atualize `NEXT_PUBLIC_SITE_URL`.

O QR Code final aponta para `https://seudominio/25anos`. Baixe em alta resolução (SVG para gráfica, PNG 2000px) em **Painel > Telão**.

---

## Operação no culto

**Técnico do LED:** abrir `/tv` no navegador (Chrome ou Edge) → pressionar **F** ou dar duplo clique para tela cheia → enviar a saída para o processador do LED. Não precisa instalar nada.

- A tela funciona em qualquer resolução. O desenho é feito em 2688×1008 (2,67:1) e escala proporcionalmente, com faixas pretas nas sobras, sem esticar.
- **Shift+T**: modo técnico (resolução, proporção, escala, conexão, relatos carregados, botão de tela cheia). `/tv?tecnico=1` abre direto nele.
- **Shift+G**: mostra a área segura e as colunas da composição.
- A tela pede ao sistema para não apagar o monitor (Wake Lock) e esconde o cursor.
- Se a internet cair, continua exibindo o que já carregou e volta a sincronizar sozinha.

**Equipe de moderação:** nada aparece no telão sem aprovação manual. Para ir ao LED, o relato precisa estar **aprovado + com autorização da pessoa + "Exibir no telão" ligado + categoria ativa**. Aprovações entram no ciclo em até 10 segundos; relatos arquivados saem no próximo relato.

---

**Limite de upload na Vercel.** O corpo da requisição tem limite de ~4,5 MB; por isso a foto é comprimida no celular (normalmente fica entre 300 KB e 1,5 MB).

---
