# Nova Store

> A production-ready full-stack e-commerce platform built with a shared REST API backend, a React web client, and a Flutter mobile app — all developed from scratch in 17 days following a Figma design system.

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Flutter](https://img.shields.io/badge/Flutter-3.16-02569B?style=flat&logo=flutter&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-Live-00C7B7?style=flat&logo=netlify&logoColor=white)

**Live Demo →** [superlative-chebakia-900ccf.netlify.app](https://superlative-chebakia-900ccf.netlify.app)

---

## Overview

Nova Store is a complete e-commerce system where a single FastAPI backend serves two independent clients: a React web application and a Flutter mobile app. The three layers share the same database, authentication tokens, and business logic — a customer who adds an item to their cart on web can see it reflected on mobile.

The project covers the full engineering stack: relational database design and migrations, RESTful API design, JWT-based auth with role separation, AI-assisted shopping via Claude Haiku, a pixel-perfect Figma implementation on both web and mobile, Docker containerisation, and Netlify deployment.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11 · FastAPI · Uvicorn |
| Database | Microsoft SQL Server 2022 (MSSQL) |
| ORM & Migrations | SQLAlchemy 2.x · Alembic |
| Web Frontend | React 18 · Vite · TypeScript · Tailwind CSS v4 |
| Mobile | Flutter 3.16 · Dart · Provider |
| AI | Anthropic Claude Haiku (`claude-haiku-4-5-20251001`) |
| Auth | JWT HS256 · bcrypt password hashing |
| Container | Docker · docker-compose |
| Deployment | Netlify (web frontend) |

---

## Architecture

```
┌─────────────────────────────────────────┐
│              Clients                    │
│                                         │
│  React Web (Vite + TypeScript)          │
│  Flutter Mobile (Dart + Provider)       │
└────────────────────┬────────────────────┘
                     │ REST / JSON
                     ▼
┌─────────────────────────────────────────┐
│         FastAPI Backend (Python)        │
│                                         │
│  /api/v1/auth      JWT login/register   │
│  /api/v1/products  Catalog CRUD         │
│  /api/v1/cart      Per-user cart        │
│  /api/v1/orders    Order lifecycle      │
│  /api/v1/admin     Dashboard + Users    │
│  /api/v1/ai/chat   Claude Haiku + RAG   │
└────────────────────┬────────────────────┘
                     │ SQLAlchemy ORM
                     ▼
┌─────────────────────────────────────────┐
│       MS SQL Server 2022 (MSSQL)        │
│                                         │
│  users · categories · products          │
│  product_images · carts · cart_items    │
│  orders · order_items · addresses       │
└─────────────────────────────────────────┘
```

---

## Features

### Backend
- JWT authentication — register, login, token refresh, protected routes
- Role-based access control — `customer` vs `admin` with dedicated guard dependencies
- Full CRUD for categories and products with search, filter, and pagination
- Shopping cart — auto-created on first access, increments quantity on duplicate adds
- Order system — creates from cart, snapshots product prices at purchase time, full status lifecycle (pending → processing → shipped → delivered / cancelled)
- Admin endpoints — real-time dashboard stats, paginated user management
- AI chat — `POST /api/v1/ai/chat` performs a keyword search of the product catalog and injects matching items into the Claude system prompt (RAG-lite). Falls back to a rule-based engine when no API key is present, so the UI works in every demo environment without billing.
- Graceful error handling — the AI endpoint never returns a 500; it always delivers a usable response
- Fully Dockerised — MSSQL 2022 container with TCP healthcheck, Alembic runs on startup

### React Web Frontend
- Customer-facing storefront: homepage hero, shop with sidebar filters, product detail with gallery and selectors, cart, favorites (localStorage), profile
- Admin panel: dashboard with charts, product/order/user management tables with slide-in panels
- AI chat panel — floating button, slide-up panel, typing indicator, conversation history, quick-start chips
- Axios interceptor attaches JWT to every request; 401 auto-redirects to the correct login page
- Vite dev-server proxy forwards `/api` to the backend — no CORS configuration needed during development

### Flutter Mobile App
- Pixel-perfect Figma implementation across all screens
- Offline-first architecture: tries the live API first (5 s timeout), falls back to a bundled `assets/products.json`, then to a hardcoded mock list — the app never crashes without a network
- Provider pattern state management: `AuthProvider` (JWT + SharedPreferences persistence), `CartProvider`, `FavoritesProvider`
- `ProductDetailScreen` uses `SliverAppBar` (expandedHeight 320 px) — the product image collapses into a thin bar as the user scrolls, keeping the back button always accessible
- Full admin panel with 5-tab dark navigation

---

## Technical Highlights

### RAG-lite AI Context Injection
Rather than passing the entire product catalog to Claude (expensive and slow), the `/ai/chat` endpoint performs a lightweight keyword search of the product table based on the user's message, then injects only the relevant items into the system prompt. This keeps token usage low, latency short, and answers accurate — a simplified form of Retrieval-Augmented Generation.

### Stateless Conversation History
The server holds no session state. The client sends the full conversation history with every request (`history: list[ChatMessage]`), and the server reconstructs context from scratch. This makes the backend horizontally scalable with zero additional infrastructure.

### Offline-First Mobile
Three-level data fallback chain in `ApiService`:
1. Live backend API (5-second timeout)
2. `assets/products.json` bundled inside the app binary
3. Hardcoded mock list

Every screen renders correctly regardless of network state.

### Price Snapshotting
When an order is created, `unit_price` is copied from the product into the `order_items` row at that moment. Future price changes on the product never retroactively affect historical orders — a critical correctness requirement for any real commerce system.

---

## Screenshots

### React Web Frontend

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

### Flutter Mobile App

| Sign In | Create Account | Profile |
|---------|----------------|---------|
| ![Sign In](https://github.com/user-attachments/assets/29da084b-75ff-490a-9384-c0fde1e9eb78) | ![Create Account](https://github.com/user-attachments/assets/fa1265e3-d10b-4384-b6fc-f8cdcdfe86da) | ![Profile](https://github.com/user-attachments/assets/dd2dac3c-3b8f-4450-9edf-f9e8f8854a1f) |

| Homepage | Shop | Favorites |
|----------|------|-----------|
| ![Homepage](https://github.com/user-attachments/assets/b16f6ea9-bf3f-433e-8a6d-2b358ffc13ba) | ![Shop](https://github.com/user-attachments/assets/d68802d9-1b27-4af5-9bf4-46f397e14a5f) | ![Favorites](https://github.com/user-attachments/assets/27ac0e3f-9174-4da9-afe2-cc3af9fa5c3d) |

| Cart | AI Chatbox | Admin Dashboard |
|------|------------|-----------------|
| ![Cart](https://github.com/user-attachments/assets/c866dffd-9508-44ec-9858-e11819adc575) | ![AI Chatbox](https://github.com/user-attachments/assets/076d5215-fadb-4458-8100-5b353917d4dc) | ![Admin Dashboard](https://github.com/user-attachments/assets/24810cdb-cfa6-4dd8-b000-96ce044573ca) |

| Admin Products | Admin Orders | Admin Users | Admin Settings |
|----------------|--------------|-------------|----------------|
| ![Admin Products](https://github.com/user-attachments/assets/df18daec-abc2-4d2f-b9b2-a79ebb4db288) | ![Admin Orders](https://github.com/user-attachments/assets/05f18f39-76e4-4d7f-9b93-d34a2e3c437d) | ![Admin Users](https://github.com/user-attachments/assets/3c46540c-d237-4000-bae6-31e953d978a6) | ![Admin Settings](https://github.com/user-attachments/assets/de4540bd-6c15-4680-b33c-268b377de6d8) |

---

## Project Structure

```
nova-store/
├── README.md
├── docker-compose.yml
├── docs/
│   └── devlog.md                  ← 17-day development log (EN + TR)
├── backend/                       ← FastAPI + SQLAlchemy + Alembic
├── frontend/                      ← React + Vite + TypeScript
└── mobile/                        ← Flutter + Dart
```

See each subdirectory for its own detailed README.

---

## Database Schema

```
users           id · email (unique) · password_hash · role · is_active
categories      id · name (unique) · slug (unique)
products        id · name · description · price · stock · category_id FK
product_images  id · product_id FK · url · is_primary
carts           id · user_id FK (unique — one cart per user)
cart_items      id · cart_id FK · product_id FK · quantity
orders          id · user_id FK · status · total_price
order_items     id · order_id FK · product_id FK · product_name · quantity · unit_price
addresses       id · order_id FK (unique) · full_name · line1 · city · country · postal_code
```

All models inherit from `TimestampedBase` which injects `id`, `created_at`, and `updated_at` automatically.

---

## API Reference

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/auth/register` | — | Create account, returns JWT |
| `POST` | `/api/v1/auth/login` | — | Login, returns JWT |
| `GET` | `/api/v1/auth/me` | Bearer | Current user profile |

### Products
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/products` | — | List (`?category_id`, `?search`, `?skip`, `?limit`) |
| `GET` | `/api/v1/products/{id}` | — | Single product |
| `POST` | `/api/v1/products` | Admin | Create |
| `PUT` | `/api/v1/products/{id}` | Admin | Update |
| `DELETE` | `/api/v1/products/{id}` | Admin | Delete |

### Cart
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/cart` | Bearer | Get cart (auto-created on first access) |
| `POST` | `/api/v1/cart/add` | Bearer | Add item (increments qty if already present) |
| `PUT` | `/api/v1/cart/update` | Bearer | Set exact quantity (0 removes item) |
| `DELETE` | `/api/v1/cart/remove` | Bearer | Remove item |

### Orders
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/orders` | Bearer | Create from cart (clears cart on success) |
| `GET` | `/api/v1/orders/my` | Bearer | My orders |
| `GET` | `/api/v1/orders/{id}` | Bearer | Order detail |
| `PUT` | `/api/v1/orders/{id}/status` | Admin | Update status |
| `PATCH` | `/api/v1/orders/{id}/status` | Admin | Update status (mobile) |
| `GET` | `/api/v1/orders/admin/all` | Admin | All orders (paginated) |

### Admin
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/admin/dashboard` | Admin | `{total_users, total_orders, total_products, total_revenue}` |
| `GET` | `/api/v1/admin/users` | Admin | Paginated user list |

### AI Chat
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/ai/chat` | — | `{message, history[]}` → `{reply}` |

---

## Authentication & Roles

```
POST /auth/register  →  bcrypt hash → save user (role=customer) → return JWT
POST /auth/login     →  verify hash → return JWT
GET  /auth/me        →  decode JWT → return user profile
```

| Role | Access |
|------|--------|
| `customer` | Cart, own orders, public read endpoints |
| `admin` | All of the above + CRUD writes + all orders + user management |

JWT payload: `{ "sub": "user@email.com", "exp": ... }` — signed with HS256.

---

## Running with Docker

```bash
docker-compose up --build
```

- API → `http://localhost:8000`
- Swagger docs → `http://localhost:8000/docs`
- MSSQL → `localhost:1433`

---

## Running Locally

### Backend

```bash
cd backend
copy .env.example .env   # configure DB + JWT + ANTHROPIC_API_KEY
py scripts/create_db.py
alembic upgrade head
py scripts/seed.py
py scripts/fix_admin.py
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Flutter

```bash
cd mobile
flutter pub get
flutter run
```

See `frontend/README.md` and `mobile/README.md` for detailed setup instructions.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_SERVER` | ✓ | SQL Server hostname or `host\instance` |
| `DB_NAME` | ✓ | Database name |
| `DB_TRUSTED_CONNECTION` | — | Use Windows Authentication |
| `DB_USER` / `DB_PASSWORD` | * | SQL login (if not using trusted connection) |
| `JWT_SECRET_KEY` | ✓ | JWT signing key — never commit |
| `JWT_EXPIRE_MINUTES` | — | Token lifetime (default: 60) |
| `ANTHROPIC_API_KEY` | — | Enables Claude Haiku AI chat (optional) |
| `DEBUG` | — | Enables SQL query logging |

---

## Roadmap

- [x] Backend — FastAPI + MSSQL + SQLAlchemy + Alembic + Docker
- [x] Auth — JWT register/login, bcrypt, role-based access control
- [x] Product catalog — CRUD, search, filter, pagination, images
- [x] Shopping cart — auto-create, increment on duplicate
- [x] Order system — create from cart, price snapshot, status lifecycle
- [x] Admin API — dashboard stats, user management
- [x] React web — full customer storefront (7 pages)
- [x] React web — admin panel (Dashboard, Products, Orders, Users)
- [x] React web — AI chat panel (Claude + rule-based fallback)
- [x] React web — deployed to Netlify
- [x] Flutter mobile — pixel-perfect Figma implementation (10 screens)
- [x] Flutter mobile — offline-first (API → JSON asset → mock fallback)
- [x] Flutter mobile — Provider state management (Auth, Cart, Favorites)
- [x] Flutter mobile — admin panel (5-tab dark navigation)
- [x] AI — RAG-lite product context injection, English-only responses
