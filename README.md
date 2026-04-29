# Stock Management System

A comprehensive inventory management system built with Next.js 15, PostgreSQL, and Prisma.

## 🚀 Features

### 1. Authentication
- Secure User Login and Signup (NextAuth.js).
- Protected API routes and Dashboard access.

### 2. Modern Dashboard
- **Real-time Metrics**: Total Inventory, Received, On Hand, Shipped.
- **Visualizations**:
    - "Inventory Status" Bar Chart (Monthly Received vs Out).
    - "Stock Out Reasons" Donut Chart (Breakdown of usage reasons).
- **Quick Actions**: "Quick Stock In", "Quick Stock Out", and "New Product" shortcuts.
- **Clickable Metrics**: Navigate directly to Products or History from dashboard cards.

### 3. Product Management
- **CRUD Operations**: Add, Edit, Delete products.
- **Search & Filter**: Real-time search by Name/SKU. "Low Stock" filter.
- **Inventory Tracking**: Set minimum stock levels and get alerts.

### 4. Stock Control
- **Stock In/Out**: Dedicated modal for adjusting stock of existing items.
- **History Log**: Complete audit trail of every stock movement (Who, When, Why).

### 5. Supplier Management
- Manage supplier details (Name, Contact, Address).
- Link products to specific suppliers.

## 🛠 Tech Stack
- **Frontend**: Next.js 15 (App Router), TailwindCSS, Recharts, Lucide Icons.
- **Backend**: Next.js API Routes.
- **Database**: PostgreSQL with Prisma ORM.
- **Auth**: NextAuth.js (JWT).

## 📦 Setup & Installation

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Setup Environment Variables** (`.env`):
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/stock_db"
    NEXTAUTH_SECRET="your-secret-key"
    NEXTAUTH_URL="http://localhost:3000"
    ```
4.  **Initialize Database**:
    ```bash
    npx prisma generate
    npx prisma db push
    ```
5.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 📝 Usage Guide
- **Login**: Use your credentials to access the dashboard.
- **Add Product**: Go to "Products" or click "New Product" on Dashboard.
- **Adjust Stock**: Use the Green/Red "Quick" buttons on the Dashboard for daily adjustments.
- **View History**: Check the "Stock History" page for reports.
