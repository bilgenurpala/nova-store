# Nova Store

A full-stack e-commerce platform — shared REST backend serving both a React web client and a Flutter mobile app.

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
- Category management (CRUD)
- Product catalog (CRUD + search + category filter)
- Shopping cart (add, update, remove — per-user, auto-created)

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
    ├── alembic/
    │   └── versions/
    │       ├── 20260407_0001_initial_tables.py
    │       └── 20260408_0002_add_cart_tables.py
    └── app/
        ├── main.py
        ├── core/
        │   ├── config.py            ← Pydantic Settings + JWT config
        │   ├── database.py          ← engine, SessionLocal, Base, get_db()
        │   └── security.py          ← bcrypt hashing + JWT create/decode
        ├── api/
        │   └── v1/
        │       ├── dependencies.py  ← get_current_user
        │       ├── health.py
        │       ├── auth.py
        │       ├── categories.py
        │       ├── products.py
        │       └── cart.py
        ├── models/
        │   ├── base.py              ← TimestampedBase (id, created_at, updated_at)
        │   ├── user.py
        │   ├── category.py
        │   ├── product.py
        │   └── cart.py              ← Cart, CartItem
        └── schemas/
            ├── auth.py
            ├── category.py
            ├── product.py
            └── cart.py
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
  id PK · email (unique, indexed) · password_hash · is_active
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
```

All models inherit from `TimestampedBase` (`__abstract__ = True`) which injects `id`, `created_at`, and `updated_at` — no extra table is created.

---

## API Reference

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/auth/register` | No | Create account, returns JWT |
| `POST` | `/api/v1/auth/login` | No | Login, returns JWT |
| `GET` | `/api/v1/auth/me` | Bearer | Current user profile |

### Categories

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/categories` | Bearer | Create category |
| `GET` | `/api/v1/categories` | No | List all categories |
| `GET` | `/api/v1/categories/{id}` | No | Get single category |
| `PUT` | `/api/v1/categories/{id}` | Bearer | Partial update |
| `DELETE` | `/api/v1/categories/{id}` | Bearer | Delete |

### Products

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/products` | Bearer | Create product |
| `GET` | `/api/v1/products` | No | List products (supports `?category_id` and `?search`) |
| `GET` | `/api/v1/products/{id}` | No | Get single product |
| `PUT` | `/api/v1/products/{id}` | Bearer | Partial update |
| `DELETE` | `/api/v1/products/{id}` | Bearer | Delete |

### Cart

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/cart` | Bearer | Get current user's cart (auto-created if new) |
| `POST` | `/api/v1/cart/add` | Bearer | Add product to cart |
| `PUT` | `/api/v1/cart/update` | Bearer | Set quantity (0 removes the item) |
| `DELETE` | `/api/v1/cart/remove` | Bearer | Remove item from cart |

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/health` | No | App + DB status |

---

## Authentication

### Flow

```
POST /auth/register  →  bcrypt hash → save User → return JWT
POST /auth/login     →  verify hash → return JWT
GET  /auth/me        →  decode JWT → return user profile  [protected]
```

All write operations (POST / PUT / DELETE) and the entire Cart API require `Authorization: Bearer <token>`.

### JWT

```json
{ "sub": "user@example.com", "exp": 1234567890 }
```

Signed with **HS256**. Secret and expiry configured via environment variables.

### Example

```bash
# 1. Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "secret123"}'

# → { "access_token": "eyJ...", "token_type": "bearer" }

# 2. Use token
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer eyJ..."
```

---

## Product Filtering

```bash
GET /api/v1/products                        # all products
GET /api/v1/products?category_id=1          # by category
GET /api/v1/products?search=headphone       # case-insensitive name search
GET /api/v1/products?category_id=1&search=wireless  # combined
```

---

## Cart System

### Behaviour

- Every authenticated user has exactly one cart, created automatically on first access.
- `POST /cart/add` — adds a product. If the product is already in the cart, quantity is incremented.
- `PUT /cart/update` — sets the quantity to an exact value. Sending `quantity: 0` removes the item.
- `DELETE /cart/remove` — removes the item regardless of quantity.

### Example

```bash
TOKEN="eyJ..."

# View cart
curl http://localhost:8000/api/v1/cart \
  -H "Authorization: Bearer $TOKEN"

# Add product
curl -X POST http://localhost:8000/api/v1/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"product_id": 1, "quantity": 2}'

# Update quantity
curl -X PUT http://localhost:8000/api/v1/cart/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"product_id": 1, "quantity": 5}'

# Remove item
curl -X DELETE http://localhost:8000/api/v1/cart/remove \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"product_id": 1}'
```

### Cart Response

```json
{
  "id": 1,
  "user_id": 3,
  "items": [
    {
      "id": 7,
      "product_id": 1,
      "quantity": 2,
      "product": {
        "id": 1,
        "name": "Wireless Headphones",
        "price": 149.99,
        "stock": 50,
        "category": { "id": 1, "name": "Electronics", "slug": "electronics" }
      }
    }
  ],
  "created_at": "...",
  "updated_at": "..."
}
```

---

## Running the Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env    # fill in DB credentials and JWT_SECRET_KEY
alembic upgrade head
uvicorn app.main:app --reload
```

API → `http://localhost:8000`
Docs → `http://localhost:8000/docs`

Generate a secure secret key:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## Migrations

```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
alembic downgrade -1
```

Alembic discovers all tables automatically because `alembic/env.py` imports `app.models` before reading `Base.metadata`.

---

## Environment Variables

| Variable             | Default   | Description                          |
|----------------------|-----------|--------------------------------------|
| `DB_SERVER`          | —         | MSSQL hostname                       |
| `DB_PORT`            | `1433`    | MSSQL port                           |
| `DB_NAME`            | —         | Database name                        |
| `DB_USER`            | —         | Username                             |
| `DB_PASSWORD`        | —         | *(never commit)*                     |
| `DB_DRIVER`          | —         | ODBC driver name                     |
| `JWT_SECRET_KEY`     | —         | JWT signing key *(never commit)*     |
| `JWT_ALGORITHM`      | `HS256`   | Signing algorithm                    |
| `JWT_EXPIRE_MINUTES` | `60`      | Token lifetime in minutes            |
| `DEBUG`              | `false`   | Enables SQL query logging            |

---

## Roadmap

- [x] Backend foundation (FastAPI + MSSQL + SQLAlchemy + Alembic)
- [x] Database models (User, Category, Product, Cart, CartItem)
- [x] Authentication (register, login, JWT, /me)
- [x] Category CRUD API
- [x] Product CRUD API (search + filter)
- [x] Shopping cart API
- [ ] Order system
- [ ] React web frontend
- [ ] Flutter mobile app
- [ ] AI features
