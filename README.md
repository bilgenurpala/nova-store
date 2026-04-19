# Nova Store

A full-stack e-commerce platform — a shared REST backend serving both a React web client and a Flutter mobile app.

---

## Stack

| Layer      | Technology                                         |
|------------|----------------------------------------------------|
| Backend    | Python · FastAPI                                   |
| Database   | Microsoft SQL Server (MSSQL)                       |
| ORM        | SQLAlchemy 2.x                                     |
| Migrations | Alembic                                            |
| Web        | React.js · Vite · TypeScript · Tailwind CSS v4     |
| Mobile     | Flutter · Dart                                     |
| AI         | Anthropic Claude Haiku (`claude-haiku-4-5-20251001`) |
| Container  | Docker · docker-compose                            |

---

## Features

- JWT authentication (register, login, protected routes)
- Role-based access control (`customer` / `admin`)
- Category management (admin-only write, public read)
- Product catalog (admin-only write, public read + search + filter + pagination)
- Product images (URL-based, primary flag)
- Shopping cart (per-user, auto-created, increment on duplicate add)
- Order management (create from cart, price snapshot, status lifecycle)
- Admin panel (Dashboard, Products, Orders, Users)
- Customer web (HomePage, ShopPage, ProductDetailPage, CartPage, FavoritesPage, ProfilePage, 404)
- AI chat assistant (Claude Haiku with RAG-lite product context + rule-based fallback)
- Fully Dockerised (MSSQL 2022 + FastAPI, TCP healthcheck)

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

---

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
├── .gitignore
├── README.md
├── docker-compose.yml
├── docs/
│   └── devlog.md
├── mobile/
│   ├── pubspec.yaml
│   ├── assets/
│   │   └── products.json          ← offline product data (10 items)
│   ├── android/app/src/main/
│   │   └── AndroidManifest.xml    ← INTERNET + cleartext traffic permissions
│   └── lib/
│       ├── main.dart              ← app entry, MultiProvider setup
│       ├── config/
│       │   └── app_config.dart    ← API base URL config
│       ├── theme/
│       │   └── app_theme.dart     ← colour tokens + ThemeData
│       ├── models/
│       │   ├── product.dart       ← Product (id, name, price, description, badge…)
│       │   └── chat_message.dart
│       ├── providers/
│       │   ├── auth_provider.dart     ← JWT token, role, SharedPreferences persist
│       │   ├── cart_provider.dart
│       │   └── favorites_provider.dart
│       ├── services/
│       │   └── api_service.dart   ← HTTP client, 3-level fallback (API→JSON→mock)
│       └── screens/
│           ├── main_shell.dart            ← 5-tab bottom nav shell
│           ├── home/home_screen.dart      ← hero, AI banner, categories, products
│           ├── shop/shop_screen.dart      ← search, filter, sort, grid
│           ├── product/product_detail_screen.dart ← SliverAppBar, selectors, tabs
│           ├── favorites/favorites_screen.dart
│           ├── cart/cart_screen.dart
│           ├── profile/profile_screen.dart ← stats, orders, menu, admin button
│           ├── auth/login_screen.dart
│           ├── admin/admin_screen.dart    ← 5-tab dark admin panel
│           └── ai_chat/ai_chat_screen.dart
├── frontend/
│   ├── .env
│   ├── vite.config.ts
│   ├── package.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx               ← BrowserRouter + all Routes
│       ├── index.css             ← CSS variable tokens + global resets
│       ├── api/
│       │   ├── client.ts         ← axios instance + auth interceptor
│       │   ├── auth.ts
│       │   ├── categories.ts
│       │   ├── products.ts
│       │   ├── cart.ts
│       │   └── orders.ts
│       ├── context/
│       │   ├── AuthContext.tsx   ← AuthProvider, useAuth hook
│       │   ├── CartContext.tsx   ← global cart count, drives Navbar badge
│       │   └── FavoritesContext.tsx ← favorites list, localStorage persist
│       ├── types/
│       │   └── index.ts          ← TypeScript interfaces (Product, Order, …)
│       ├── components/
│       │   ├── ProtectedRoute.tsx
│       │   ├── AIChatPanel.tsx   ← 380×560px AI chat panel, Claude integration
│       │   ├── CategoriesBar.tsx ← horizontal category pill bar (below Navbar)
│       │   └── layout/
│       │       ├── AdminLayout.tsx
│       │       ├── Sidebar.tsx
│       │       ├── CustomerLayout.tsx  ← Navbar + CategoriesBar + Outlet + Footer
│       │       ├── Navbar.tsx          ← dark sticky navbar, inline SVG icons
│       │       └── Footer.tsx          ← dark 4-column footer
│       └── pages/
│           ├── auth/
│           │   ├── Login.tsx           ← admin login
│           │   ├── CustomerLogin.tsx   ← customer login
│           │   └── Register.tsx        ← customer register
│           ├── admin/
│           │   ├── Dashboard.tsx       ← stat cards, bar chart, recent orders
│           │   ├── Products.tsx        ← product table, add/edit panel
│           │   ├── Orders.tsx          ← filter tabs, order table, detail panel
│           │   └── Users.tsx           ← user table, search, role/status filters
│           ├── HomePage.tsx            ← hero slider, deals, products, AI chat
│           ├── ShopPage.tsx            ← sidebar filters, 4-col grid, pagination
│           ├── ProductDetailPage.tsx   ← gallery, selectors, tabs, related
│           ├── CartPage.tsx            ← items, qty, remove, promo, summary
│           ├── FavoritesPage.tsx       ← wishlist grid, empty state
│           ├── ProfilePage.tsx         ← sidebar menu, personal info form
│           └── NotFoundPage.tsx        ← 404 with search + popular products
└── backend/
    ├── Dockerfile
    ├── requirements.txt
    ├── alembic.ini
    ├── .env.example · .env
    ├── scripts/
    │   ├── create_db.py
    │   ├── create_db.sql
    │   ├── seed.py               ← seeds categories, products, product images
    │   ├── fix_admin.py          ← re-hashes admin password, ensures role=admin
    │   └── verify_tables.py
    ├── alembic/
    │   └── versions/
    │       ├── 20260407_0001_initial_tables.py
    │       ├── 20260408_0002_add_cart_tables.py
    │       └── 20260411_0003_role_and_order_tables.py
    └── app/
        ├── main.py
        ├── core/
        │   ├── config.py            ← Pydantic Settings + DB + JWT config
        │   ├── database.py          ← engine, SessionLocal, Base, get_db()
        │   └── security.py          ← bcrypt hashing + JWT create/decode
        ├── api/
        │   └── v1/
        │       ├── dependencies.py  ← get_current_user, get_current_admin
        │       ├── health.py
        │       ├── auth.py
        │       ├── categories.py
        │       ├── products.py
        │       ├── cart.py
        │       ├── orders.py
        │       └── ai.py            ← POST /ai/chat — Claude Haiku + fallback
        ├── models/
        │   ├── base.py              ← TimestampedBase (id, created_at, updated_at)
        │   ├── user.py
        │   ├── category.py
        │   ├── product.py           ← Product + ProductImage
        │   ├── cart.py              ← Cart, CartItem
        │   └── order.py             ← Order, OrderItem, Address
        └── schemas/
            ├── auth.py
            ├── category.py
            ├── product.py
            ├── cart.py
            └── order.py
```

---

## Database Schema

```
users
  id PK · email (unique, indexed) · password_hash · is_active · role
  created_at · updated_at

categories
  id PK · name (unique) · slug (unique, indexed)
  created_at · updated_at

products
  id PK · name · description · price DECIMAL(10,2) · stock
  category_id FK → categories.id
  created_at · updated_at

product_images
  id PK · product_id FK → products.id · url · is_primary
  created_at · updated_at

carts
  id PK · user_id FK → users.id (unique — one cart per user)
  created_at · updated_at

cart_items
  id PK · cart_id FK → carts.id · product_id FK → products.id · quantity
  created_at · updated_at

orders
  id PK · user_id FK → users.id · status · total_price DECIMAL(10,2)
  created_at · updated_at

order_items
  id PK · order_id FK → orders.id · product_id FK → products.id
  product_name · quantity · unit_price DECIMAL(10,2)
  created_at · updated_at

addresses
  id PK · order_id FK → orders.id (unique — one address per order)
  full_name · line1 · line2 · city · country · postal_code
  created_at · updated_at
```

All models inherit from `TimestampedBase` (`__abstract__ = True`) which injects `id`, `created_at`, and `updated_at`.

---

## API Reference

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/auth/register` | — | Create account, returns JWT |
| `POST` | `/api/v1/auth/login` | — | Login, returns JWT |
| `GET` | `/api/v1/auth/me` | Bearer | Current user profile |

### Categories

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/categories` | Admin | Create category |
| `GET` | `/api/v1/categories` | — | List all categories |
| `GET` | `/api/v1/categories/{id}` | — | Get single category |
| `PUT` | `/api/v1/categories/{id}` | Admin | Partial update |
| `DELETE` | `/api/v1/categories/{id}` | Admin | Delete |

### Products

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/products` | Admin | Create product |
| `GET` | `/api/v1/products` | — | List products (`?category_id`, `?search`, `?skip`, `?limit`) |
| `GET` | `/api/v1/products/{id}` | — | Get single product |
| `PUT` | `/api/v1/products/{id}` | Admin | Partial update |
| `DELETE` | `/api/v1/products/{id}` | Admin | Delete |

### Cart

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/cart` | Bearer | Get current user's cart (auto-created on first access) |
| `POST` | `/api/v1/cart/add` | Bearer | Add product; increments qty if already in cart |
| `PUT` | `/api/v1/cart/update` | Bearer | Set exact quantity (0 removes the item) |
| `DELETE` | `/api/v1/cart/remove` | Bearer | Remove item |

### Orders

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/orders` | Bearer | Create order from cart (clears cart on success) |
| `GET` | `/api/v1/orders` | Bearer | List current user's orders |
| `GET` | `/api/v1/orders/{id}` | Bearer | Order detail |
| `PUT` | `/api/v1/orders/{id}/status` | Admin | Update order status |
| `GET` | `/api/v1/orders/admin/all` | Admin | Paginated all orders `{items, total, skip, limit}` |

### AI Chat

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/ai/chat` | — | `{ message, history[] }` → `{ reply }` — Claude Haiku with product context |

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/health` | — | App + DB connectivity status |

---

## Authentication & Roles

### Flow

```
POST /auth/register  →  bcrypt hash → save User (role=customer) → return JWT
POST /auth/login     →  verify hash → return JWT
GET  /auth/me        →  decode JWT → return user profile  [protected]
```

### Roles

| Role | Access |
|------|--------|
| `customer` | Cart, Orders (own), public read endpoints |
| `admin` | All of the above + Category/Product writes + Order status updates + all orders list + Users list |

To promote a user to admin, run `python scripts/fix_admin.py` or set `role = 'admin'` directly in the database.

### JWT

```json
{ "sub": "user@example.com", "exp": 1234567890 }
```

Signed with **HS256**. Secret and expiry configured via environment variables.

---

## Running with Docker (Recommended)

```bash
docker-compose up --build
```

- API → `http://localhost:8000`
- Docs → `http://localhost:8000/docs`
- MSSQL → `localhost:1433`

The compose file starts MSSQL 2022, waits for it via TCP healthcheck, then starts the FastAPI container which runs Alembic migrations automatically on startup.

---

## Running Locally (Without Docker)

### Prerequisites

- Microsoft SQL Server (any edition)
- [ODBC Driver 18 for SQL Server](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server) installed

### Step 1 — Configure .env

```bash
cd backend
copy .env.example .env
```

Edit `.env`:

```env
DB_SERVER=localhost\SQLEXPRESS     # or your instance name
DB_NAME=NovaStoreDB
DB_DRIVER=ODBC Driver 18 for SQL Server
DB_TRUSTED_CONNECTION=true         # Windows Auth (recommended for local dev)
JWT_SECRET_KEY=your-secret-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60
```

If using SQL Server authentication (username + password):

```env
DB_TRUSTED_CONNECTION=false
DB_USER=sa
DB_PASSWORD=your_password
```

### Step 2 — Create the database

```bat
py scripts/create_db.py
```

### Step 3 — Apply migrations

```bat
alembic upgrade head
```

| Migration | Tables created |
|---|---|
| `0001_initial_tables` | `users`, `categories`, `products` |
| `0002_add_cart_tables` | `carts`, `cart_items` |
| `0003_role_and_order_tables` | `role` column on `users`, `orders`, `order_items`, `addresses` |

### Step 4 — Seed data + admin user

```bat
py scripts/seed.py
py scripts/fix_admin.py
```

### Step 5 — Run

```bat
uvicorn app.main:app --reload
```

API → `http://localhost:8000`  
Docs → `http://localhost:8000/docs`

---

## Running the Frontend

```bat
cd frontend
npm install
npm run dev
```

App → `http://localhost:5173`  
Admin panel → `http://localhost:5173/admin`  
Admin credentials → `admin@admin.com` / `admin123`

The frontend expects the backend at `http://localhost:8000`. Configure via `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## Running the Flutter Mobile App

### Prerequisites

- Flutter SDK ≥ 3.16.0 installed and on PATH
- Android emulator (Pixel 8 API 35 recommended) **or** physical device with USB debugging enabled

### Step 1 — Start the backend first

```bat
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 2 — Run the app

```bat
cd mobile
flutter pub get
flutter run
```

For a specific device:

```bat
flutter devices                        # list connected devices
flutter run -d <device-id>
```

### Connection URLs

| Target | URL in `lib/config/app_config.dart` |
|--------|--------------------------------------|
| Android emulator | `http://10.0.2.2:8000` *(default)* |
| iOS simulator | `http://localhost:8000` |
| Physical device | `http://<your-local-ip>:8000` |

### Admin login (mobile)

1. Open the app → tap **Profile** tab → **Sign In**
2. Email: `admin@admin.com` · Password: `Admin1234!`
3. After login, Profile tab shows **Admin Panel** button
4. Admin Panel has 5 tabs: Dashboard · Products · Orders · Users · Settings

### Offline mode

If the backend is not running, the app automatically falls back to:
1. `assets/products.json` (10 local products)
2. Hardcoded mock list

All screens work without a backend connection.

---

## AI Chat

The AI assistant is available on every page via the floating button (bottom-right corner).

- **With `ANTHROPIC_API_KEY`** set in `backend/.env`: uses Claude Haiku for intelligent, context-aware replies. The endpoint performs a lightweight keyword search of the products table and injects matching products into the system prompt (RAG-lite).
- **Without an API key**: falls back to a rule-based engine covering greetings, product categories, budget queries, and order questions. The UI works identically in both modes.

```env
# backend/.env
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Migrations

```bash
# Create a new migration after changing a model
alembic revision --autogenerate -m "describe your change"

# Apply all pending migrations
alembic upgrade head

# Roll back one step
alembic downgrade -1

# Check current state
alembic current
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DB_SERVER` | ✓ | — | SQL Server hostname or `host\instance` |
| `DB_NAME` | ✓ | — | Database name |
| `DB_DRIVER` | — | `ODBC Driver 18 for SQL Server` | ODBC driver name |
| `DB_TRUSTED_CONNECTION` | — | `false` | Use Windows Authentication |
| `DB_USER` | * | — | SQL login username *(if not using trusted connection)* |
| `DB_PASSWORD` | * | — | SQL login password *(never commit)* |
| `JWT_SECRET_KEY` | ✓ | — | JWT signing key *(never commit)* |
| `JWT_ALGORITHM` | — | `HS256` | Signing algorithm |
| `JWT_EXPIRE_MINUTES` | — | `60` | Token lifetime in minutes |
| `DEBUG` | — | `false` | Enables SQL query logging |
| `ANTHROPIC_API_KEY` | — | — | Enables Claude Haiku AI chat *(optional)* |

---

## Roadmap

- [x] Backend foundation (FastAPI + MSSQL + SQLAlchemy + Alembic)
- [x] Database models (User, Category, Product, ProductImage, Cart, CartItem, Order, OrderItem, Address)
- [x] Authentication (register, login, JWT)
- [x] Role-based access control (customer / admin)
- [x] Category CRUD (admin-protected writes)
- [x] Product CRUD (search + filter + pagination, admin-protected writes)
- [x] Shopping cart
- [x] Order system (create from cart, price snapshot, status lifecycle)
- [x] CORS middleware
- [x] Product images (URL-based, primary flag)
- [x] Seed data script
- [x] Docker (Dockerfile + docker-compose, MSSQL 2022, TCP healthcheck)
- [x] React admin panel — auth layer (login, protected routes, layout)
- [x] React admin panel — Dashboard (stat cards, bar chart, recent orders)
- [x] React admin panel — Products page (table, Add/Edit panel)
- [x] React admin panel — Orders page (filter tabs, table, detail panel, status update)
- [x] React admin panel — Users page (table, search, role/status filters)
- [x] React customer web — Navbar (sticky dark, inline SVG icons, inline search, categories dropdown)
- [x] React customer web — CategoriesBar (7 categories, inline SVG icons, centered)
- [x] React customer web — Footer (dark, 4-column links)
- [x] React customer web — Homepage (hero slider, deals banner, popular products, new arrivals, testimonials, features strip, brands, newsletter)
- [x] React customer web — Shop page (sidebar filters, 4-column product grid, sort, pagination)
- [x] React customer web — Login & Register pages
- [x] React customer web — Product Detail page (image gallery, color/storage selectors, qty picker, Add to Cart, tabs, specs, related products)
- [x] React customer web — Cart page (item list, qty update, remove, promo code NOVA10, order summary)
- [x] React customer web — Favorites page (wishlist grid, empty state)
- [x] React customer web — Profile page (sidebar menu, personal info form, recent orders)
- [x] React customer web — 404 page (layered design, search, popular products)
- [x] AI chat endpoint (Claude Haiku + RAG-lite product context + rule-based fallback)
- [x] AI chat UI panel (AIChatPanel — slide-up, message history, typing indicator, quick-start chips)
- [x] Flutter mobile app — Figma-pixel-perfect screens (Home, Shop, Favorites, Cart, Profile, Login)
- [x] Flutter — ProductDetailScreen (SliverAppBar, color/storage selectors, qty counter, tabs)
- [x] Flutter — Admin panel (5-tab dark nav: Dashboard, Products, Orders, Users, Settings)
- [x] Flutter — AI Chat screen accessible from Home AppBar robot icon + AI banner
- [x] Flutter — Offline-first: assets/products.json → API → hardcoded mock fallback chain
- [x] Flutter — Provider pattern: AuthProvider, CartProvider, FavoritesProvider
- [x] Flutter — AndroidManifest INTERNET permission + cleartext traffic fix
- [x] Flutter — Product card overflow fix (childAspectRatio tuned, AspectRatio 1.1)
- [x] Backend — Admin router: GET /admin/dashboard, GET /admin/users
- [x] Backend — PATCH /orders/{id}/status + GET /orders/my endpoints added
- [x] Backend — "delivered" added to valid order statuses
