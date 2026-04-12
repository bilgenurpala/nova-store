# Nova Store

A full-stack e-commerce platform — a shared REST backend serving both a React web client and a Flutter mobile app.

---

## Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Backend    | Python · FastAPI                  |
| Database   | Microsoft SQL Server (MSSQL)      |
| ORM        | SQLAlchemy 2.x                    |
| Migrations | Alembic                           |
| Web        | React.js *(planned)*              |
| Mobile     | Flutter · Dart *(planned)*        |
| AI         | TBD                               |

---

## Features

- JWT authentication (register, login, protected routes)
- Role-based access control (`customer` / `admin`)
- Category management (admin-only write, public read)
- Product catalog (admin-only write, public read + search + filter)
- Shopping cart (per-user, auto-created, increment on duplicate add)
- Order management (create from cart, price snapshot, status lifecycle)

---

## Project Structure

```
nova-store/
├── .gitignore
├── README.md
├── docs/
│   └── devlog.md
└── backend/
    ├── requirements.txt
    ├── alembic.ini
    ├── .env.example · .env
    ├── scripts/
    │   ├── create_db.py
    │   ├── create_db.sql
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
        │       └── orders.py
        ├── models/
        │   ├── base.py              ← TimestampedBase (id, created_at, updated_at)
        │   ├── user.py
        │   ├── category.py
        │   ├── product.py
        │   ├── cart.py              ← Cart, CartItem
        │   └── order.py             ← Order, OrderItem, Address
        └── schemas/
            ├── auth.py
            ├── category.py
            ├── product.py
            ├── cart.py
            └── order.py
```

**Layer rules:**
- `core/` has no knowledge of `api/` or `models/`
- `models/` only imports from `core/database.py`
- `schemas/` are pure Pydantic — no ORM imports
- `api/` imports from `models/`, `schemas/`, and `core/`

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

All models inherit from `TimestampedBase` (`__abstract__ = True`) which injects `id`, `created_at`, and `updated_at` — no extra table is created.

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
| `GET` | `/api/v1/orders/admin/all` | Admin | All orders (admin view) |

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
| `admin` | All of the above + Category/Product writes + Order status updates + all orders list |

To promote a user to admin, set `role = 'admin'` directly in the database (no public endpoint — intentional).

### JWT

```json
{ "sub": "user@example.com", "exp": 1234567890 }
```

Signed with **HS256**. Secret and expiry configured via environment variables.

---

## Order Lifecycle

```
POST /orders  →  validates cart + stock  →  creates Order (status=pending)
              →  snapshots product name + price into OrderItem
              →  decrements product stock
              →  saves shipping Address
              →  clears cart
              →  returns OrderResponse

PUT /orders/{id}/status  →  admin only  →  pending → paid → shipped → cancelled
```

**Price snapshot:** `OrderItem.unit_price` stores the product's price at the time of purchase. Future price changes do not affect existing orders.

---

## Product Filtering

```bash
GET /api/v1/products                                   # all products (first 20)
GET /api/v1/products?category_id=1                     # by category
GET /api/v1/products?search=headphone                  # case-insensitive name search
GET /api/v1/products?category_id=1&search=cable        # combined
GET /api/v1/products?skip=20&limit=20                  # page 2
```

---

## Database Setup

### Prerequisites

- Microsoft SQL Server (any edition) running locally
- [ODBC Driver 17 for SQL Server](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server) installed

### Step 1 — Configure .env

```bash
cd backend
copy .env.example .env
```

Edit `.env`:

```env
DB_SERVER=localhost\SQLEXPRESS     # or your instance name
DB_NAME=NovaStoreDB
DB_DRIVER=ODBC Driver 17 for SQL Server
DB_TRUSTED_CONNECTION=true         # Windows Auth (recommended for local dev)
JWT_SECRET_KEY=your-secret-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60
```

If using SQL Server authentication (username + password) instead:

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

### Step 4 — Verify

```bat
py scripts/verify_tables.py
```

---

## Running the Backend

> **Windows:** use `py` instead of `python`, and `venv\Scripts\activate` in CMD or `source venv/Scripts/activate` in Git Bash.

```bat
cd backend
py -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
py scripts/create_db.py
alembic upgrade head
uvicorn app.main:app --reload
```

API → `http://localhost:8000`  
Docs → `http://localhost:8000/docs`

Generate a secure JWT key:

```bat
py -c "import secrets; print(secrets.token_hex(32))"
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
| `DB_DRIVER` | — | `ODBC Driver 17 for SQL Server` | ODBC driver name |
| `DB_TRUSTED_CONNECTION` | — | `false` | Use Windows Authentication |
| `DB_USER` | * | — | SQL login username (*if not using trusted connection) |
| `DB_PASSWORD` | * | — | SQL login password *(never commit)* |
| `JWT_SECRET_KEY` | ✓ | — | JWT signing key *(never commit)* |
| `JWT_ALGORITHM` | — | `HS256` | Signing algorithm |
| `JWT_EXPIRE_MINUTES` | — | `60` | Token lifetime in minutes |
| `DEBUG` | — | `false` | Enables SQL query logging |

---

## Roadmap

- [x] Backend foundation (FastAPI + MSSQL + SQLAlchemy + Alembic)
- [x] Database models (User, Category, Product, Cart, CartItem, Order, OrderItem, Address)
- [x] Authentication (register, login, JWT)
- [x] Role-based access control (customer / admin)
- [x] Category CRUD (admin-protected writes)
- [x] Product CRUD (search + filter, admin-protected writes)
- [x] Shopping cart
- [x] Order system (create from cart, price snapshot, status lifecycle)
- [x] CORS middleware
- [x] Pagination (skip/limit on products and categories)
- [x] Product images (URL-based, primary flag)
- [x] Seed data script
- [x] Docker (Dockerfile + docker-compose)
- [ ] React web frontend
- [ ] Flutter mobile app
- [ ] AI features
