# Magic Gift Studio – Next.js + Prisma Template

Branded with your palette:
- Pink: #F5A8B8
- Gold: #FFDFA4
- Background: #FFF9FB

## Quick Start
1. Install deps
```bash
npm i
```
2. Configure database
- Copy `.env.example` to `.env` and set `DATABASE_URL` (Postgres / Supabase).

3. Init DB
```bash
npx prisma migrate dev --name init
npm run seed
```

4. Run dev
```bash
npm run dev
```

5. Deploy
- Push to GitHub, import into Vercel, set `DATABASE_URL` env, deploy.
- Point `magicgiftstudio.com` to Vercel (Domains tab).

## Update Products
- Use Prisma Studio:
```bash
npx prisma studio
```
- Or edit via your DB console. Store price as `amountCents` in `Price` table.
- Images live in `/public/products/` (or use a CDN URL).

## Security
- Strict security headers + CSP in `middleware.ts`.
- No secrets shipped to the browser; DB only read on server.

## Files
See folder structure for `app/`, `components/`, `lib/`, `prisma/`, `public/`.

Enjoy! ✨
