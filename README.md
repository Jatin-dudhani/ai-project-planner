# AI Project Planner

Turn rough app ideas into structured, editable project briefs using AI.

Describe an app idea, and it generates a full brief — summary, target users, features, tech stack, routes, data model, build phases, risks, and a ready-to-use prompt for AI coding tools.

## How it works

1. Enter your app idea on the home page
2. AI generates a structured project brief
3. Edit any section inline
4. View a visual data model graph
5. Copy the starter prompt for Cursor, Claude, or any AI coding tool

Everything is stored in your browser — no accounts, no backend.

## Tech stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui**
- **AI SDK** + **OpenRouter**
- **React Flow** + **Dagre**
- **Zod** for schema validation

## Getting started

```bash
git clone <repo-url>
cd ai-project-planner
cp .env.example .env.local
```

Add your OpenRouter API key to `.env.local`:

```
OPENROUTER_API_KEY=sk-or-v1-...
```

Then:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `OPENROUTER_API_KEY` | Yes | API key from [openrouter.ai/keys](https://openrouter.ai/keys) |

## Project structure

```
├── app/
│   ├── api/generate/     # AI generation endpoint
│   ├── brief/            # Editable project brief page
│   ├── prompt/           # Data model viz + starter prompt
│   ├── page.tsx          # Home / idea input
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles + theme
├── components/
│   ├── ui/               # shadcn/ui primitives
│   ├── site-header.tsx
│   ├── site-footer.tsx
│   ├── theme-toggle.tsx
│   ├── step-indicator.tsx
│   └── editable-section.tsx
├── lib/
│   ├── store.ts          # localStorage persistence
│   ├── types.ts          # TypeScript types
│   ├── utils.ts
│   └── zod-schema.ts     # Zod schemas
└── public/
```
