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

## Day 1 — Backend Foundation

Project structure · FastAPI setup · MSSQL connection · SQLAlchemy ORM base · Alembic migrations · config layer · health check endpoint.

## Day 2 — Database Models

`User`, `Category`, `Product` models with shared `TimestampedBase` mixin · Alembic initial migration · bug fixes.

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
    ├── .env.example
    ├── .env                   ← copy from .env.example, fill in credentials
    ├── alembic/
    │   ├── env.py
    │   ├── script.py.mako
    │   └── versions/
    │       └── 20260407_0001_initial_tables.py
    └── app/
        ├── main.py
        ├── core/
        │   ├── config.py      ← Pydantic Settings + DATABASE_URL builder
        │   └── database.py    ← engine, SessionLocal, Base, get_db()
        ├── api/
        │   └── v1/
        │       └── health.py  ← GET /api/v1/health (includes DB probe)
        ├── models/
        │   ├── base.py        ← TimestampedBase (id, created_at, updated_at)
        │   ├── user.py
        │   ├── category.py
        │   └── product.py
        └── schemas/           ← Pydantic schemas (Day 3+)
```

**Layer rules:**
- `core/` has zero knowledge of `api/` or `models/`
- `models/` only imports from `core/database.py` (for `Base`)
- `api/` imports from `models/` and `core/` but never the other way around

---

## Database Design

### Why this table structure?

The three tables cover the minimum viable read surface of any e-commerce store: who can buy (`users`), what is sold (`products`), and how products are organized (`categories`). Orders and carts are intentionally left for a later day to keep the schema focused and the first migration small.

### Entity-Relationship Overview

```
users
  id PK
  email (unique)
  password_hash
  is_active
  created_at / updated_at

categories
  id PK
  name (unique)
  slug (unique, indexed)
  created_at / updated_at

products
  id PK
  name
  description (nullable)
  price DECIMAL(10,2)
  stock INT
  category_id FK → categories.id
  created_at / updated_at
```

**Relationship:** `Product` → `Category` is many-to-one. One category holds many products; each product belongs to exactly one category.

**Future:** `User` → `Order` → `OrderItem` → `Product` will be added when the order domain is introduced. The `users` table is already in place so that foreign keys can be added without re-creating the table.

### TimestampedBase Mixin

All three models inherit from `TimestampedBase` (in `app/models/base.py`) which provides:

- `id` — integer primary key, auto-increment, indexed
- `created_at` — set by the database on insert (`GETDATE()` server default)
- `updated_at` — set by the database on insert, updated by SQLAlchemy ORM on every flush

Because `TimestampedBase` carries `__abstract__ = True`, SQLAlchemy does not create a `timestampedbase` table — it only injects the columns into concrete subclasses.

### Why `Numeric(10, 2)` for price?

`FLOAT` and `DECIMAL` both store numbers, but floating-point types introduce rounding errors in financial calculations (e.g., `0.1 + 0.2 ≠ 0.3`). `Numeric(10, 2)` maps to `DECIMAL(10, 2)` in MSSQL — exact precision up to 99,999,999.99 with two decimal places.

---

## Tech Decisions

**FastAPI** — async-ready, high performance, auto-generates OpenAPI docs (`/docs`) used by both web and mobile clients.

**Microsoft SQL Server** — enterprise-grade relational database. `pyodbc` bridges Python to MSSQL natively.

**SQLAlchemy 2.x** — `mapped_column` + `Mapped[T]` type annotations give full static-analysis support. `pool_pre_ping=True` silently reconnects dropped connections.

**Alembic** — migration tool built for SQLAlchemy. `autogenerate` compares your models to the live DB and writes the SQL diff automatically. `alembic/env.py` imports all models before reading `Base.metadata` so autogenerate sees every table.

**Pydantic Settings** — config loaded once at startup (`@lru_cache`), validated, and immutable at runtime. `.env` in dev, real env vars in prod — zero code change.

---

## Running the Backend

### 1. Prerequisites

- Python 3.11+
- [ODBC Driver 17 for SQL Server](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)
- A running MSSQL instance with a database named `nova_store`

### 2. Setup

```bash
cd backend

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
# Edit .env — fill in DB_SERVER, DB_NAME, DB_USER, DB_PASSWORD
```

### 3. Apply migrations

```bash
cd backend
alembic upgrade head
```

This creates `users`, `categories`, and `products` tables in your MSSQL database.

### 4. Run

```bash
uvicorn app.main:app --reload
```

API → `http://localhost:8000`
Docs → `http://localhost:8000/docs`

### 5. Health Check

```bash
curl http://localhost:8000/api/v1/health
```

```json
{
  "status": "ok",
  "app": "Nova Store API",
  "version": "0.1.0",
  "database": "connected"
}
```

---

## Database Migrations

```bash
cd backend

alembic revision --autogenerate -m "describe your change"
alembic upgrade head
alembic downgrade -1
```

**How autogenerate works:** `alembic/env.py` imports `app.models` before reading `Base.metadata`. This causes all ORM model classes to register their table definitions with `Base`. Alembic then compares that metadata against the live database schema and generates only the diff — new columns, dropped tables, index changes, etc.

---

## Environment Variables

| Variable      | Example                          |
|---------------|----------------------------------|
| `APP_NAME`    | `Nova Store API`                 |
| `APP_VERSION` | `0.1.0`                          |
| `DEBUG`       | `false`                          |
| `DB_SERVER`   | `localhost`                      |
| `DB_PORT`     | `1433`                           |
| `DB_NAME`     | `nova_store`                     |
| `DB_USER`     | `sa`                             |
| `DB_PASSWORD` | *(keep secret — never commit)*   |
| `DB_DRIVER`   | `ODBC Driver 17 for SQL Server`  |

---

## Bug Fixes Applied (Day 2)

| File | Issue | Fix |
|---|---|---|
| `alembic/env.py` | `Base.metadata` was empty — no models imported before autogenerate | Added `import app.models` before `target_metadata = Base.metadata` |
| `backend/.env` | File missing — app crashed on startup if `.env` not present | Created `.env` from `.env.example` with placeholder values |

---

## Roadmap

- [x] Backend foundation (FastAPI + MSSQL + SQLAlchemy + Alembic)
- [x] Database models (User, Category, Product)
- [ ] Authentication (JWT)
- [ ] Product catalog endpoints
- [ ] Shopping cart
- [ ] Orders
- [ ] React web frontend
- [ ] Flutter mobile app
- [ ] AI features
