# Nova Store

A full-stack e-commerce platform with a shared backend serving both web (React) and mobile (Flutter) clients.

---

## Stack

| Layer      | Technology                         |
|------------|------------------------------------|
| Backend    | Python · FastAPI                   |
| Database   | Microsoft SQL Server (MSSQL)       |
| ORM        | SQLAlchemy 2.x                     |
| Migrations | Alembic                            |
| Web        | React.js *(planned)*               |
| Mobile     | Flutter · Dart *(planned)*         |
| AI         | TBD                                |

---

## Progress

| Day | Scope |
|-----|-------|
| 1   | Backend foundation — FastAPI, MSSQL, SQLAlchemy, Alembic, health check |
| 2   | Database models — User, Category, Product, TimestampedBase, initial migration |
| 3   | Authentication — register, login, JWT access token, protected `/me` endpoint |
| 4   | Product & Category APIs — full CRUD, filtering, auth integration |

---

## Backend Architecture

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
    ├── alembic/versions/
    └── app/
        ├── main.py
        ├── core/
        │   ├── config.py       ← settings + JWT config
        │   ├── database.py     ← engine, SessionLocal, Base, get_db()
        │   └── security.py     ← bcrypt + JWT
        ├── api/v1/
        │   ├── dependencies.py ← get_current_user
        │   ├── health.py
        │   ├── auth.py         ← register, login, me
        │   ├── categories.py   ← Category CRUD
        │   └── products.py     ← Product CRUD + filter
        ├── models/
        │   ├── base.py · user.py · category.py · product.py
        └── schemas/
            ├── auth.py · category.py · product.py
```

---

## All Endpoints

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/health` | No | App + DB status |

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
| `PUT` | `/api/v1/categories/{id}` | Bearer | Update category |
| `DELETE` | `/api/v1/categories/{id}` | Bearer | Delete category |

### Products

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/products` | Bearer | Create product |
| `GET` | `/api/v1/products` | No | List products (supports filters) |
| `GET` | `/api/v1/products/{id}` | No | Get single product |
| `PUT` | `/api/v1/products/{id}` | Bearer | Update product |
| `DELETE` | `/api/v1/products/{id}` | Bearer | Delete product |

---

## Category API (Day 4)

### Create

```bash
curl -X POST http://localhost:8000/api/v1/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name": "Electronics", "slug": "electronics"}'
```

```json
{
  "id": 1,
  "name": "Electronics",
  "slug": "electronics",
  "created_at": "2026-04-08T10:00:00Z",
  "updated_at": "2026-04-08T10:00:00Z"
}
```

### List

```bash
curl http://localhost:8000/api/v1/categories
```

Returns an array of `CategoryResponse` ordered by `name`.

### Update (partial)

```bash
curl -X PUT http://localhost:8000/api/v1/categories/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name": "Consumer Electronics"}'
```

Only fields included in the body are updated. `slug` stays unchanged unless explicitly sent.

### Delete

```bash
curl -X DELETE http://localhost:8000/api/v1/categories/1 \
  -H "Authorization: Bearer <token>"
```

Returns `204 No Content`.

### Slug Validation

- Lowercase letters, numbers, and hyphens only — e.g. `home-appliances`
- Enforced at the schema level via `@field_validator`
- Duplicate `slug` or `name` returns `409 Conflict`

---

## Product API (Day 4)

### Create

```bash
curl -X POST http://localhost:8000/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Wireless Headphones",
    "description": "Over-ear noise cancelling",
    "price": 149.99,
    "stock": 50,
    "category_id": 1
  }'
```

```json
{
  "id": 1,
  "name": "Wireless Headphones",
  "description": "Over-ear noise cancelling",
  "price": 149.99,
  "stock": 50,
  "category_id": 1,
  "category": { "id": 1, "name": "Electronics", "slug": "electronics", ... },
  "created_at": "...",
  "updated_at": "..."
}
```

### List with filters

```bash
# All products
GET /api/v1/products

# Filter by category
GET /api/v1/products?category_id=1

# Search by name (case-insensitive, partial match)
GET /api/v1/products?search=headphone

# Combined
GET /api/v1/products?category_id=1&search=wireless
```

### Update (partial)

```bash
curl -X PUT http://localhost:8000/api/v1/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"price": 129.99, "stock": 45}'
```

Uses `model_dump(exclude_unset=True)` — only fields explicitly sent are updated.

### Validation Rules

| Field | Rule |
|---|---|
| `name` | Non-empty string |
| `price` | `> 0`, stored as `DECIMAL(10, 2)` |
| `stock` | `>= 0` integer |
| `category_id` | Must reference an existing category (`400` if not) |

### Error Responses

| Scenario | Status | Detail |
|---|---|---|
| Category not found | `404` | `"Category not found"` |
| Product not found | `404` | `"Product not found"` |
| Duplicate category slug | `409` | `"Slug already exists"` |
| Duplicate category name | `409` | `"Name already exists"` |
| Invalid category_id on product | `400` | `"Category with id=X does not exist"` |
| Missing / invalid token | `401` | `"Invalid or expired token"` |

---

## Authentication System

### Flow

```
POST /auth/register  →  hash password → save User → return JWT
POST /auth/login     →  verify password → return JWT
GET  /auth/me        →  decode JWT → return user profile  [protected]
```

### Protected vs Public Endpoints

- **Public** — all `GET` endpoints (browse without login)
- **Protected** — `POST`, `PUT`, `DELETE` (require `Authorization: Bearer <token>`)

### Password Hashing

bcrypt via `passlib`. Raw password is never stored — only the hash.

### JWT Structure

```json
Header:  { "alg": "HS256", "typ": "JWT" }
Payload: { "sub": "user@example.com", "exp": 1234567890 }
```

---

## Database Design

```
users        → id, email (unique), password_hash, is_active, timestamps
categories   → id, name (unique), slug (unique+indexed), timestamps
products     → id, name, description, price DECIMAL(10,2), stock,
               category_id FK → categories.id, timestamps
```

All models share `TimestampedBase` (`id`, `created_at`, `updated_at`).

---

## Running the Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in DB credentials + JWT_SECRET_KEY
alembic upgrade head
uvicorn app.main:app --reload
```

API → `http://localhost:8000` · Docs → `http://localhost:8000/docs`

Generate a secret key:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## Database Migrations

```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
alembic downgrade -1
```

---

## Environment Variables

| Variable             | Default   | Description                          |
|----------------------|-----------|--------------------------------------|
| `DB_SERVER`          | —         | MSSQL hostname                       |
| `DB_PORT`            | `1433`    | MSSQL port                           |
| `DB_NAME`            | —         | Database name                        |
| `DB_USER`            | —         | Username                             |
| `DB_PASSWORD`        | —         | Password *(never commit)*            |
| `DB_DRIVER`          | —         | ODBC driver name                     |
| `JWT_SECRET_KEY`     | —         | JWT signing key *(never commit)*     |
| `JWT_ALGORITHM`      | `HS256`   | Signing algorithm                    |
| `JWT_EXPIRE_MINUTES` | `60`      | Token lifetime in minutes            |
| `DEBUG`              | `false`   | Enables SQL query logging            |

---

## Roadmap

- [x] Backend foundation
- [x] Database models (User, Category, Product)
- [x] Authentication (register, login, JWT, /me)
- [x] Category CRUD API
- [x] Product CRUD API with filtering
- [ ] Shopping cart
- [ ] Orders
- [ ] React web frontend
- [ ] Flutter mobile app
- [ ] AI features
