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
    ├── .env
    ├── alembic/
    │   ├── env.py
    │   ├── script.py.mako
    │   └── versions/
    │       └── 20260407_0001_initial_tables.py
    └── app/
        ├── main.py
        ├── core/
        │   ├── config.py            ← settings + JWT config
        │   ├── database.py          ← engine, SessionLocal, Base, get_db()
        │   └── security.py          ← password hashing, JWT create/decode
        ├── api/
        │   └── v1/
        │       ├── dependencies.py  ← get_current_user
        │       ├── health.py
        │       └── auth.py          ← register, login, me
        ├── models/
        │   ├── base.py              ← TimestampedBase
        │   ├── user.py
        │   ├── category.py
        │   └── product.py
        └── schemas/
            └── auth.py              ← RegisterRequest, LoginRequest, TokenResponse, UserResponse
```

**Layer rules:**
- `core/` has zero knowledge of `api/` or `models/`
- `models/` only imports from `core/database.py`
- `schemas/` are pure Pydantic — no ORM imports
- `api/` imports from `models/`, `schemas/`, and `core/`

---

## Authentication System (Day 3)

### How it works

```
Client                       API
  │                           │
  ├── POST /auth/register ───►│ hash password → save User → return JWT
  │                           │
  ├── POST /auth/login ──────►│ verify password → return JWT
  │                           │
  ├── GET  /auth/me ─────────►│ decode JWT → load User → return profile
  │   Authorization: Bearer   │
  │   <token>                 │
```

### Password Hashing

Passwords are hashed with **bcrypt** via `passlib`. The raw password never leaves the request object — only the hash is stored in the database. Verification is a constant-time comparison, which prevents timing attacks.

```python
hash_password("secret")          # → "$2b$12$..."
verify_password("secret", hash)  # → True / False
```

### JWT Structure

Tokens are signed **HS256** (HMAC + SHA-256) using `JWT_SECRET_KEY` from your `.env`.

```json
Header:  { "alg": "HS256", "typ": "JWT" }
Payload: { "sub": "user@example.com", "exp": 1234567890 }
```

- `sub` — the user's email (used to load the user on protected routes)
- `exp` — Unix timestamp of expiry (controlled by `JWT_EXPIRE_MINUTES`)

### Protected Routes

Any endpoint that depends on `get_current_user` requires a valid Bearer token:

```
Authorization: Bearer <access_token>
```

`get_current_user` decodes the token, queries the user from the DB, and raises `401` if anything is invalid.

---

## Auth Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/auth/register` | No | Create account, returns JWT |
| `POST` | `/api/v1/auth/login` | No | Login with credentials, returns JWT |
| `GET`  | `/api/v1/auth/me` | Bearer token | Return current user profile |

### Register

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "secret123"}'
```

```json
{ "access_token": "eyJ...", "token_type": "bearer" }
```

### Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "secret123"}'
```

```json
{ "access_token": "eyJ...", "token_type": "bearer" }
```

### Me

```bash
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer eyJ..."
```

```json
{ "id": 1, "email": "user@example.com", "is_active": true }
```

### Error Responses

| Scenario | Status | Detail |
|---|---|---|
| Email already registered | `409` | `"Email already registered"` |
| Wrong email or password | `401` | `"Invalid credentials"` |
| Missing / invalid token | `401` | `"Invalid or expired token"` |
| Inactive user | `403` | `"Inactive user"` |

---

## Database Design

### Entity-Relationship Overview

```
users
  id PK · email (unique) · password_hash · is_active · created_at / updated_at

categories
  id PK · name (unique) · slug (unique, indexed) · created_at / updated_at

products
  id PK · name · description · price DECIMAL(10,2) · stock
  category_id FK → categories.id · created_at / updated_at
```

**Relationship:** `Product` → `Category` is many-to-one.

### TimestampedBase Mixin

All models inherit from `TimestampedBase` (`__abstract__ = True`) which injects `id`, `created_at`, `updated_at`. No separate table is created in the DB.

### Why `Numeric(10, 2)` for price?

Floating-point types introduce rounding errors in financial calculations. `Numeric(10, 2)` maps to `DECIMAL(10, 2)` in MSSQL — exact precision, no surprises.

---

## Running the Backend

### Setup

```bash
cd backend

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
# Fill in DB credentials and a strong JWT_SECRET_KEY
```

Generate a secret key:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Apply migrations

```bash
cd backend
alembic upgrade head
```

### Run

```bash
uvicorn app.main:app --reload
```

API → `http://localhost:8000`
Docs → `http://localhost:8000/docs`

---

## Database Migrations

```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
alembic downgrade -1
```

---

## Environment Variables

| Variable             | Default   | Description                              |
|----------------------|-----------|------------------------------------------|
| `APP_NAME`           | —         | API display name                         |
| `APP_VERSION`        | `0.1.0`   | Version string                           |
| `DEBUG`              | `false`   | Enables SQL query logging                |
| `DB_SERVER`          | —         | MSSQL hostname                           |
| `DB_PORT`            | `1433`    | MSSQL port                               |
| `DB_NAME`            | —         | Database name                            |
| `DB_USER`            | —         | Database username                        |
| `DB_PASSWORD`        | —         | Database password *(never commit)*       |
| `DB_DRIVER`          | —         | ODBC driver name                         |
| `JWT_SECRET_KEY`     | —         | Signing key for JWT *(never commit)*     |
| `JWT_ALGORITHM`      | `HS256`   | JWT signing algorithm                    |
| `JWT_EXPIRE_MINUTES` | `60`      | Token lifetime in minutes                |

---

## Roadmap

- [x] Backend foundation
- [x] Database models (User, Category, Product)
- [x] Authentication (register, login, JWT, /me)
- [ ] Product catalog endpoints (CRUD)
- [ ] Category endpoints
- [ ] Shopping cart
- [ ] Orders
- [ ] React web frontend
- [ ] Flutter mobile app
- [ ] AI features
