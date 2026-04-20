# Nova Store — React Web Frontend

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-Live-00C7B7?style=flat&logo=netlify&logoColor=white)

> The React web client for Nova Store. Covers both the customer-facing storefront and a full admin panel, connected to a shared FastAPI backend via Axios.

**Live Demo →** [superlative-chebakia-900ccf.netlify.app](https://superlative-chebakia-900ccf.netlify.app)

---

## Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Static typing across the entire codebase |
| Vite 5 | Build tool, HMR dev server, API proxy |
| Tailwind CSS v4 | Utility-first styling with CSS variable tokens |
| Axios | HTTP client with request/response interceptors |
| React Router v6 | Client-side routing with protected routes |

---

## Pages & Features

### Customer Storefront

**HomePage** — Hero image slider, deals banner, popular products grid, new arrivals, testimonials strip, brand logos, newsletter signup. Floating AI chat button (bottom-right) toggles the `AIChatPanel`.

**ShopPage** — Left sidebar with category, price range, and rating filters. 4-column responsive product grid with sort dropdown (price, rating, newest) and pagination. Filters and search are reflected in URL query params.

**ProductDetailPage** — Multi-image gallery with thumbnail navigation, color and storage selector chips, quantity picker, Add to Cart / Add to Favorites buttons. Tabbed content area (Description / Specifications / Reviews). Related products carousel at the bottom.

**CartPage** — Item list with inline quantity update and remove controls. Promo code input (NOVA10 applies 10% discount). Order summary with subtotal, discount, shipping, and total. Checkout button.

**FavoritesPage** — Wishlist grid with filled red heart on each card. Clicking the heart removes the item instantly. Empty state shows a heart icon and a "Browse Products" CTA.

**ProfilePage** — Left sidebar navigation with 8 menu items. Right panel: 2-column personal information form (first name, last name, email, phone, location, website), bio textarea, gender radio buttons, Save Changes button. Recent orders section at the bottom.

**NotFoundPage** — Layered large "404" watermark, Go Home + Browse Shop buttons, inline search input for direct recovery, Popular Products section fetched from the API.

### Admin Panel (`/admin`)

**Dashboard** — 4 stat cards (total users, orders, products, revenue) with colour-coded left-accent bars. 12-month sales overview bar chart with opacity-gradient bars. Recent orders table with status badges.

**Products** — Full product table (image, name, category, price, stock, status). Add Product slide-in panel with form validation. Wired to `GET /products` and `POST /products`.

**Orders** — Filter tab bar (All / Pending / Processing / Shipped / Delivered / Cancelled) with live count badges. Orders table. Order detail slide-in panel showing item list, shipping address, and a status updater dropdown. Wired to `GET /orders/admin/all` and `PUT /orders/:id/status`.

**Users** — User table with avatar initials, email, role badge (admin / customer), status, join date, and action buttons. Search bar and role/status filter dropdowns. Wired to `GET /admin/users`.

### AI Chat Panel

`AIChatPanel` is a 380 × 528 px floating panel that slides up from the bottom-right corner. It maintains full conversation history and sends it with every request so the server stays stateless. Key details:

- Animated typing indicator (3-dot bounce) while waiting for a response
- 4 quick-start suggestion chips visible before the first message is sent; hidden afterwards to keep the conversation clean
- `**bold**` markdown syntax in AI replies is rendered as `<strong>` tags
- `Enter` sends; `Shift+Enter` inserts a newline
- Auto-scrolls to the latest message; auto-focuses the input when opened

---

## How the API Layer Works

```
src/api/
├── client.ts       ← Axios instance (baseURL from VITE_API_URL)
├── auth.ts         ← register, login, getMe
├── categories.ts   ← list, get
├── products.ts     ← list, get, create, update, delete
├── cart.ts         ← getCart, addItem, updateItem, removeItem
└── orders.ts       ← createOrder, getMyOrders, getOrder
```

**Auth interceptor** — Every outgoing request has the JWT from `localStorage` attached as `Authorization: Bearer <token>`. On a 401 response, the token is cleared and the user is redirected to the appropriate login page (`/login` for customers, `/admin/login` for admins).

**Vite proxy** — In development, `vite.config.ts` proxies all `/api` requests to `http://localhost:8000`. This means relative fetch calls (e.g. `/api/v1/ai/chat`) work without CORS issues and without changing the `VITE_API_URL` during development. In production (Netlify), `VITE_API_URL` points directly to the deployed backend.

---

## Global State

Three React Contexts manage shared state across the component tree:

| Context | State | Persistence |
|---------|-------|-------------|
| `AuthContext` | JWT token, user email, role, `isAdmin` flag | `localStorage` |
| `CartContext` | Cart item count (drives Navbar badge) | API (server-side) |
| `FavoritesContext` | Favorites list, add/remove toggle | `localStorage` |

---

## Project Structure

```
frontend/
├── .env                          ← VITE_API_URL
├── netlify.toml                  ← Build config + SPA redirect rules
├── vite.config.ts                ← Vite + Tailwind plugins + /api proxy
├── package.json
└── src/
    ├── main.tsx
    ├── App.tsx                   ← BrowserRouter + all Routes
    ├── index.css                 ← CSS variable tokens + global resets
    ├── api/
    │   ├── client.ts             ← Axios instance + interceptors
    │   ├── auth.ts · categories.ts · products.ts · cart.ts · orders.ts
    ├── context/
    │   ├── AuthContext.tsx
    │   ├── CartContext.tsx
    │   └── FavoritesContext.tsx
    ├── types/
    │   └── index.ts              ← Product, Order, CartItem, User…
    ├── components/
    │   ├── ProtectedRoute.tsx
    │   ├── AIChatPanel.tsx
    │   ├── CategoriesBar.tsx
    │   └── layout/
    │       ├── CustomerLayout.tsx
    │       ├── AdminLayout.tsx
    │       ├── Navbar.tsx
    │       ├── Sidebar.tsx
    │       └── Footer.tsx
    └── pages/
        ├── auth/         Login.tsx · CustomerLogin.tsx · Register.tsx
        ├── admin/        Dashboard.tsx · Products.tsx · Orders.tsx · Users.tsx
        ├── HomePage.tsx · ShopPage.tsx · ProductDetailPage.tsx
        ├── CartPage.tsx · FavoritesPage.tsx · ProfilePage.tsx
        └── NotFoundPage.tsx
```

---

## Running Locally

```bash
# Install dependencies
npm install

# Start dev server (backend must be running on port 8000)
npm run dev
# → http://localhost:5173

# Production build
npm run build
```

### Environment variable

```env
# .env
VITE_API_URL=http://localhost:8000/api/v1
```

In production, set `VITE_API_URL` to your deployed backend URL in the Netlify dashboard under **Site configuration → Environment variables**.

---

## Routes

| Path | Page | Auth required |
|------|------|---------------|
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
