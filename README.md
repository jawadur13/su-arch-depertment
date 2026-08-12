# Sonargaon University — Architecture Department

A full-stack **Next.js 15** CMS website for the Architecture department at Sonargaon University. The public-facing site is entirely database-driven via an admin panel with 30+ editable content entities. Built with **React 19**, **TypeScript**, **Tailwind CSS v4**, **Prisma**, **Better Auth**, and **Cloudinary**.

## Tech Stack

| Layer            | Technology                                     |
| ---------------- | ---------------------------------------------- |
| Framework        | Next.js 15 (App Router)                        |
| Language         | TypeScript 5.8                                 |
| Database         | PostgreSQL via **Neon** (serverless)           |
| ORM              | Prisma 6.19                                    |
| Auth             | Better Auth (email + password, session cookie) |
| Styling          | Tailwind CSS 4                                 |
| Animations       | Motion                                         |
| Media Storage    | Cloudinary (images + PDFs)                     |
| Email            | Resend (contact form)                          |
| Icons            | Lucide React                                   |
| Validation       | Zod 4                                          |
| Drag & Drop      | @dnd-kit (admin reordering)                    |
| Notifications    | Sonner                                         |
| HTML Sanitization| sanitize-html                                  |

## Prerequisites

- **Node.js** 20+
- **PostgreSQL** database (recommended: [Neon](https://neon.tech) serverless Postgres)
- **Cloudinary** account (for image/PDF uploads)
- **Resend** account (optional — for contact form email delivery)

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable                        | Required | Description                                      |
| ------------------------------- | -------- | ------------------------------------------------ |
| `DATABASE_URL`                  | Yes      | Neon **pooled** connection (contains `-pooler.`)  |
| `DIRECT_URL`                    | Yes      | Neon direct connection (for migrations)           |
| `BETTER_AUTH_SECRET`            | Yes      | Encryption key for sessions/tokens                |
| `BETTER_AUTH_URL`               | Yes      | `http://localhost:3000` (local) or production URL |
| `CLOUDINARY_CLOUD_NAME`         | Yes      | Cloudinary cloud name                             |
| `CLOUDINARY_API_KEY`            | Yes      | Cloudinary API key                                |
| `CLOUDINARY_API_SECRET`         | Yes      | Cloudinary API secret                             |
| `CLOUDINARY_UPLOAD_FOLDER`      | No       | Upload folder (default: `sonargaon-arch`)         |
| `RESEND_API_KEY`                | No       | Resend API key; omit to disable email delivery    |
| `INITIAL_SUPER_ADMIN_EMAIL`     | No       | Bootstrap super-admin email (one-time use)        |
| `INITIAL_SUPER_ADMIN_PASSWORD`  | No       | Bootstrap super-admin password (one-time use)     |

## Local Development

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Start dev server (http://localhost:3000)
npm run dev
```

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public-facing routes
│   │   ├── about/         # About pages (overview, mission, innovation hub, labs)
│   │   ├── admission/     # Admission (notices, requirements, fees, transfer, waiver)
│   │   ├── contact/       # Contact form + campus locations
│   │   ├── faculty-member/
│   │   ├── gallery/
│   │   ├── news/
│   │   ├── research/
│   │   ├── student-society/
│   │   └── transport-service/
│   ├── admin/             # Admin dashboard (45+ sections)
│   │   ├── login/
│   │   └── (authed)/      # Auth-gated admin pages
│   └── api/               # API routes (auth, contact, uploads, etc.)
├── components/
│   ├── admin/             # Admin panel building blocks (editors, uploaders, dialogs)
│   ├── layout/            # Navbar, Footer, PageShell
│   ├── sections/          # Public page content sections
│   ├── common/            # Shared components (splash, branded loader)
│   ├── gallery/           # Gallery grid component
│   ├── forms/             # Contact form
│   └── ui/                # UI primitives (Button, Container, icons)
├── lib/
│   ├── db.ts              # Prisma client singleton
│   ├── auth.ts            # Better Auth configuration
│   ├── validation.ts      # Zod schemas (all models)
│   ├── cloudinary.ts      # Cloudinary upload helper
│   ├── email.ts           # Resend email delivery
│   ├── sanitize-html.ts   # HTML sanitization
│   ├── identity.ts        # Department/university identity queries
│   ├── admin-actions/     # Server actions (46 files, one per admin entity)
│   └── *-data.ts          # Public data-access modules
└── prisma/
    └── schema.prisma      # Database schema (57 models)
```

## Available Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start dev server at localhost:3000       |
| `npm run build`     | Production build (prisma generate + next build) |
| `npm start`         | Start production server                  |
| `npm run typecheck` | TypeScript type checking                 |
| `npm run db:migrate`| Run Prisma migrations                   |
| `npm run db:studio` | Open Prisma Studio (DB browser)          |

## Admin Access

The admin panel is at `/admin`. Access requires a user account in the database with the `admin` or `super_admin` role. The first super-admin is created during initial setup via the `INITIAL_SUPER_ADMIN_*` environment variables.

## Deployment (Vercel)

1. Create a project on Vercel, linked to this repository.
2. Vercel auto-detects Next.js — no framework override needed.
3. Set all **required** environment variables in Vercel → Settings → Environment Variables.
4. The build command `prisma generate && next build` is already configured in `package.json`.
5. Deploy. Public pages are statically generated at build time; admin pages are dynamic.
