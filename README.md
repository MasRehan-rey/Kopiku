<div align="center">
  <h1>Kopikita</h1>
  <p>Multi-vendor e-commerce platform built with Next.js (App Router), Prisma, Neon Postgres, Clerk, and Tailwind CSS.</p>
</div>

---

## Features

- **Storefront**: browse products by category, add to cart, checkout.
- **Multi-vendor**: sellers can manage their products and orders.
- **Admin panel**: manage stores, products, and platform data.
- **Auth**: Clerk authentication.
- **Database**: Prisma + Neon Postgres.
- **Payments**: Stripe (optional; depends on env variables).
- **Media**: ImageKit integration (optional; depends on env variables).

---

## Tech Stack

- **Next.js**: 16.x (Turbopack in development)
- **React**: 19
- **Tailwind CSS**: v4
- **Prisma**: 6.x
- **Database**: Neon Postgres
- **Auth**: Clerk
- **Payments**: Stripe
- **Uploads/Images**: ImageKit

---

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create `.env.local` in the project root.

Required:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Optional (only if you use these features):

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `IMAGE_PUBLIC_KEY`
- `IMAGE_PRIVATE_KEY`
- `IMAGE_URL_ENDPOINT`
- `ADMIN_EMAIL` (comma-separated list)
- `NEXT_PUBLIC_CURRENCY_SYMBOL` (example: `Rp`)

### 3) Prisma

This project runs `prisma generate` automatically on install/build, but you can also run it manually:

```bash
npx prisma generate
```

If you have migrations in your setup, run:

```bash
npx prisma migrate dev
```

### 4) Run dev server

```bash
npm run dev
```

Open:

- `http://localhost:3000`

---

## Scripts

- **dev**: `npm run dev`
- **build**: `npm run build`
- **start**: `npm run start`
- **lint**: `npm run lint`

---

## Troubleshooting

### Prisma error P1001 (Can't reach database server)

If you see `P1001`, it usually means:

- `DATABASE_URL` is wrong, or
- the database is not reachable from your network.

For Neon, ensure your `DATABASE_URL` is correct and that your Neon project is running.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

MIT License. See [LICENSE.md](./LICENSE.md).
