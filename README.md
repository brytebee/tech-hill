# Tech Hill — The Future of African Tech Education

**Tech Hill** is a project-based online learning platform engineered for the Nigerian and pan-African tech market. Students build real-world products — not just watch tutorials.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **Payments**: Paystack
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## 🧱 Architecture

This repository is the **public application shell**. Core business logic (services, hooks, types) lives in a private engine submodule (`src/engine`), initialized at build time.

## 🛠 Getting Started

```bash
# 1. Clone with submodules
git clone --recurse-submodules https://github.com/brytebee/tech-hill.git
cd tech-hill

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Fill in your values in .env

# 4. Set up the database
npx prisma db push

# 5. Run the dev server
npm run dev
```

## 📦 Environment Variables

See `.env.example` for all required variables.

## 📄 License

Private — All rights reserved © Tech Hill 2025.
