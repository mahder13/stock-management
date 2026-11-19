# 📦 Enterprise Stock & Inventory Management System

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.3-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

A high-performance, full-stack enterprise inventory and stock control platform engineered with **Next.js 15 (App Router)**, **React 19**, **Prisma ORM 7**, and **PostgreSQL**. Designed to eliminate inventory leakage, automate low-stock alerts, track supplier dependencies, and provide real-time operational analytics through interactive data visualization.

---

## 🌟 Key Highlights & Business Value

- **Full Audit Traceability**: Logs every inventory adjustment (`STOCK_IN` / `STOCK_OUT`) with reason codes, quantities, product SKU, and timestamps.
- **Automated Low-Stock Thresholds**: Instant dashboard alerts when product inventory dips below safety thresholds (`minStockLevel`), preventing costly stockouts.
- **Supplier & Catalog Synergy**: Direct relational mapping between vendors and product lines with integrated contact management.
- **Interactive Business Intelligence**: Recharts-powered analytics for inventory turnover, monthly intake vs. dispatch, and stock depletion reason distributions.
- **Role-Based Security (RBAC)**: Secure multi-role access control (`ADMIN` vs. `STAFF`) powered by NextAuth.js JWT sessions and bcrypt encryption.

---

## 🏛 System Architecture & Data Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser (UI)                      │
│   Next.js 15 (React 19) + TailwindCSS + Recharts + Lucide   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON REST
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Next.js App Router (Backend APIs)               │
│  - /api/auth/[...nextauth]  - NextAuth JWT + Bcrypt         │
│  - /api/products            - CRUD + Low-Stock Filter       │
│  - /api/stock               - Transactional Movement Engine │
│  - /api/suppliers           - Supplier Directory & Rel.     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Prisma Client 7 + Connection Pool
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Prisma ORM (Schema & Migrations)                │
└──────────────────────────────┬──────────────────────────────┘
                               │ PostgreSQL Wire Protocol
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             PostgreSQL Database (Supabase / AWS)            │
│  [User] ─── [Product] ◄─── [Supplier]                       │
│                   │                                         │
│                   └───► [StockMovement (Audit)]             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Core Modules & Capabilities

### 1. 📊 Executive Operations Dashboard
- **KPI Summary Metrics**: Total Inventory Units, Inbound Received, On-Hand Stock, and Outbound Shipped.
- **Monthly In/Out Trends**: Multi-series bar charts comparing incoming shipments vs outgoing fulfillment over time.
- **Stock Depletion Analysis**: Donut breakdown of usage categories (Client Orders, Damaged/Spoiled, Internal Transfers, Expired).
- **Fast-Action Controls**: One-click modal launches for Quick Stock In, Quick Stock Out, and New Product onboarding.

### 2. 🏷 Product & SKU Management
- **Full CRUD Support**: Add, update, view, and retire inventory items.
- **Dynamic Search & Filtering**: Instant client-side & server-side filtering by Name, SKU code, and Low Stock status.
- **Configurable Safety Stock**: Granular threshold configuration per SKU with real-time visual warning badges.

### 3. 🔄 Stock Movement & Audit Logging
- **Strict Transaction Handling**: Atomic quantity adjustments with verified balances.
- **Reason Categorization**: Enforces structured movement reasons (`PURCHASE_RECEIPT`, `CUSTOMER_SALE`, `DAMAGED_RETURN`, etc.).
- **Complete Movement Ledger**: Chronological, searchable audit trail detailing who executed the change, the delta, and why.

### 4. 🏢 Supplier Relationship Directory
- **Vendor Profiles**: Centralized contact records (Company Name, Representative, Email, Phone, Physical Address).
- **Product Relationship Tracking**: Trace which suppliers supply which catalog items to streamline procurement reorders.

### 5. 🔐 Enterprise Authentication & RBAC
- **NextAuth.js Integration**: Secure stateless JWT session tokens.
- **Salted Password Hashing**: `bcryptjs` with salt rounds for credential security.
- **Protected Layouts & Middleware**: Automatic session verification protecting dashboard and API endpoints.

---

## 🛠 Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 15.0 (App Router) | High-performance Server Components & API routes |
| **Frontend Library** | React 19 | Declarative UI rendering & state management |
| **Styling** | Tailwind CSS 3.4 | Utility-first, responsive, and accessible styling |
| **Charts** | Recharts 3.7 | Interactive, animated SVG data visualization |
| **Icons** | Lucide React | Modern, lightweight icon system |
| **ORM** | Prisma 7.3 | Type-safe database queries, migrations, and schema modeling |
| **Database** | PostgreSQL 16 | Relational database (Supabase / Neon / AWS RDS compatible) |
| **Authentication** | NextAuth.js 4.24 + bcryptjs | Secure JWT-based credentials authentication |
| **Language** | TypeScript 5.0 | End-to-end static typing and interface consistency |

---

## 🗄 Database Entity Relationship (ER) Model

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  role      String   @default("STAFF") // STAFF | ADMIN
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Supplier {
  id        String    @id @default(cuid())
  name      String
  contact   String?
  email     String?   @unique
  address   String?
  products  Product[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Product {
  id             String          @id @default(cuid())
  name           String
  description    String?
  sku            String          @unique
  price          Float
  quantity       Int             @default(0)
  minStockLevel  Int             @default(5)
  supplier       Supplier?       @relation(fields: [supplierId], references: [id])
  supplierId     String?
  stockMovements StockMovement[]
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
}

model StockMovement {
  id        String   @id @default(cuid())
  product   Product  @relation(fields: [productId], references: [id])
  productId String
  type      String   // IN | OUT
  quantity  Int
  reason    String?
  createdAt DateTime @default(now())
}
```

---

## ⚙️ Quick Start & Installation

### Prerequisites
- **Node.js**: v18.18.0 or higher
- **npm** or **pnpm** or **yarn**
- **PostgreSQL Database** (Local or cloud-hosted instance via Supabase, Neon, or Railway)

### 1. Clone the Repository
```bash
git clone https://github.com/mahder13/stock-management.git
cd stock-management
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update your credentials in `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/stock_db?schema=public"
DIRECT_URL="postgresql://username:password@localhost:5432/stock_db?schema=public"
NEXTAUTH_SECRET="your-super-secret-random-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Initialize Database & Run Migrations
```bash
npx prisma generate
npx prisma db push
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Reference Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/signup` | Register new user account | No |
| `POST` | `/api/auth/[...nextauth]` | NextAuth login/session dispatch | No |
| `GET` | `/api/products` | Retrieve catalog with stock counters | Yes |
| `POST` | `/api/products` | Create a new product entry | Yes |
| `PUT` | `/api/products/:id` | Update product details or thresholds | Yes |
| `DELETE`| `/api/products/:id` | Remove a product from inventory | Yes |
| `GET` | `/api/suppliers` | List all suppliers & linked products | Yes |
| `POST` | `/api/suppliers` | Register a new supplier | Yes |
| `POST` | `/api/stock` | Record an atomic Stock In / Stock Out movement | Yes |

---

## 🚢 Production Deployment

The project is optimized for deployment on **Vercel** with **Supabase / Neon PostgreSQL**:

1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Set your Production Environment Variables (`DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`).
4. Set Build Command: `prisma generate && next build`.
5. Deploy!

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
