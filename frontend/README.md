# Nova Store — React Web Frontend

React + TypeScript + Vite ile geliştirilmiş Nova Store e-ticaret platformunun web istemcisi. Hem müşteri arayüzünü hem de tam donanımlı admin panelini kapsar.

---

## Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool + dev server |
| Tailwind CSS v4 | Utility-first styling |
| Axios | HTTP client + auth interceptor |
| React Router v6 | Client-side routing |

---

## Features

### Customer Pages
- **HomePage** — Hero slider, deals banner, popular products, new arrivals, testimonials, features strip, brands, newsletter
- **ShopPage** — Sidebar filters (category, price, rating), 4-column product grid, sort dropdown, pagination
- **ProductDetailPage** — Image gallery, color/storage selectors, quantity picker, Add to Cart, tabbed specs & reviews, related products
- **CartPage** — Item list with quantity update/remove, promo code (NOVA10), order summary
- **FavoritesPage** — Wishlist grid with heart toggle, empty state CTA
- **ProfilePage** — Left sidebar nav, personal info form (2-column), recent orders
- **NotFoundPage** — Layered 404, search recovery, popular products

### Admin Panel (`/admin`)
- **Dashboard** — 4 stat cards, 12-month bar chart, recent orders table
- **Products** — Product table (image, name, category, price, stock, status) + Add/Edit slide-in panel
- **Orders** — Filter tabs (All/Pending/Processing/Shipped/Delivered/Cancelled), order table, detail panel with status updater
- **Users** — User table (avatar, name, email, role badge, status), search, role/status filters

### Auth
- **Customer Login / Register** — JWT-based login and registration
- **Admin Login** — Separate admin login page (`/admin/login`)
- Protected routes via `ProtectedRoute` component

### AI Chat
- Floating chat button (bottom-right corner) available on all customer pages
- `AIChatPanel` — 380×528px slide-up panel, dark header, message history, typing indicator (3-dot bounce), 4 quick-start suggestion chips
- `**bold**` markdown rendering in AI replies
- Calls `POST /api/v1/ai/chat` (proxied to backend via Vite)

---

## Project Structure

```
frontend/
├── .env                         ← API base URL
├── vite.config.ts               ← Vite config + /api proxy
├── package.json
└── src/
    ├── main.tsx                 ← App entry
    ├── App.tsx                  ← BrowserRouter + all Routes
    ├── index.css                ← CSS variable tokens + global resets
    ├── api/
    │   ├── client.ts            ← Axios instance + Bearer token interceptor
    │   ├── auth.ts
    │   ├── categories.ts
    │   ├── products.ts
    │   ├── cart.ts
    │   └── orders.ts
    ├── context/
    │   ├── AuthContext.tsx      ← AuthProvider, useAuth hook (JWT persist)
    │   ├── CartContext.tsx      ← Global cart count, drives Navbar badge
    │   └── FavoritesContext.tsx ← Favorites list, localStorage persist
    ├── types/
    │   └── index.ts             ← TypeScript interfaces (Product, Order, …)
    ├── components/
    │   ├── ProtectedRoute.tsx
    │   ├── AIChatPanel.tsx      ← AI chat panel (Claude integration)
    │   ├── CategoriesBar.tsx    ← Horizontal category pill bar
    │   └── layout/
    │       ├── AdminLayout.tsx
    │       ├── Sidebar.tsx
    │       ├── CustomerLayout.tsx   ← Navbar + CategoriesBar + Outlet + Footer
    │       ├── Navbar.tsx           ← Sticky dark navbar, inline SVG icons
    │       └── Footer.tsx           ← Dark 4-column footer
    └── pages/
        ├── auth/
        │   ├── Login.tsx            ← Admin login
        │   ├── CustomerLogin.tsx    ← Customer login
        │   └── Register.tsx         ← Customer register
        ├── admin/
        │   ├── Dashboard.tsx
        │   ├── Products.tsx
        │   ├── Orders.tsx
        │   └── Users.tsx
        ├── HomePage.tsx
        ├── ShopPage.tsx
        ├── ProductDetailPage.tsx
        ├── CartPage.tsx
        ├── FavoritesPage.tsx
        ├── ProfilePage.tsx
        └── NotFoundPage.tsx
```

---

## Running

### Prerequisites
- Node.js ≥ 18
- Backend running on `http://localhost:8000`

### Install & start

```bash
npm install
npm run dev
```

App → `http://localhost:5173`  
Admin panel → `http://localhost:5173/admin`

### Build for production

```bash
npm run build
```

---

## Environment Variables

Create a `.env` file in this directory:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

The Vite dev server also proxies all `/api` requests to the backend automatically (configured in `vite.config.ts`), so relative fetch calls like `/api/v1/ai/chat` work in development without CORS issues.

---

## Routes

| Path | Component | Auth |
|------|-----------|------|
| `/` | HomePage | — |
| `/shop` | ShopPage | — |
| `/shop/:id` | ProductDetailPage | — |
| `/cart` | CartPage | Customer |
| `/favorites` | FavoritesPage | Customer |
| `/profile` | ProfilePage | Customer |
| `/login` | CustomerLogin | — |
| `/register` | Register | — |
| `/admin` | Dashboard | Admin |
| `/admin/products` | Products | Admin |
| `/admin/orders` | Orders | Admin |
| `/admin/users` | Users | Admin |
| `/admin/login` | Login | — |
| `*` | NotFoundPage | — |

---

## Admin Credentials

```
Email:    admin@admin.com
Password: admin123
```

---

## Screenshots

| Sign In | Sign Up | Admin Sign In |
|---------|---------|---------------|
| ![Sign In](https://github.com/user-attachments/assets/e1776d40-46cb-4ec4-9c77-9feb790ff5a1) | ![Sign Up](https://github.com/user-attachments/assets/c53be5a0-59e9-4098-8fb6-c23a014c720b) | ![Admin Sign In](https://github.com/user-attachments/assets/f0d7342b-cc2b-4116-8c70-49dfee50d671) |

| Homepage | Homepage (cont.) | AI Chatbox |
|----------|-----------------|------------|
| ![Homepage 1](https://github.com/user-attachments/assets/8e0ff2b9-197a-487c-96c0-8e4468751d0e) | ![Homepage 2](https://github.com/user-attachments/assets/91f0fb9d-f68e-4f85-ab04-802710494b8e) | ![AI Chatbox](https://github.com/user-attachments/assets/7b5cda1c-bf7f-458c-a6d8-e37208bc0f05) |

| Shop | Shop Categories | Favorites |
|------|-----------------|-----------|
| ![Shop](https://github.com/user-attachments/assets/8860bf5a-9ca6-4f16-a961-8cb919026952) | ![Shop Categories](https://github.com/user-attachments/assets/a8422eb2-394a-4082-8843-1fad0117a1d8) | ![Favorites](https://github.com/user-attachments/assets/e6d3cbe6-fe8c-446b-9f9c-ae6785b02ab4) |

| Cart | Profile | Admin Dashboard |
|------|---------|-----------------|
| ![Cart](https://github.com/user-attachments/assets/aa8ba1f0-b828-491f-9c4f-1bd0c1e6bffa) | ![Profile](https://github.com/user-attachments/assets/b7c7aa28-9eea-4eb2-8569-bfdf266345f2) | ![Admin Dashboard](https://github.com/user-attachments/assets/46475daa-89fd-4e2b-98e9-9c50f4d2b945) |

| Admin Products | Admin Orders | Admin Users |
|----------------|--------------|-------------|
| ![Admin Products](https://github.com/user-attachments/assets/e76ef1e4-8736-43a3-a344-db43df58e6a7) | ![Admin Orders](https://github.com/user-attachments/assets/a74a5783-0c57-4224-94f9-3787b7cf5209) | ![Admin Users](https://github.com/user-attachments/assets/d2abfccd-9b9e-4de2-b7f0-4d24e1382d92) |
