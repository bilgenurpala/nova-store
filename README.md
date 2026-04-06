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

## What Was Built — Day 1

Backend foundation. No business logic yet — just the skeleton every production FastAPI service needs before anything else.

**Scope:** project structure · FastAPI setup · MSSQL connection · SQLAlchemy ORM base · Alembic migrations · config layer · health check endpoint.

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
    ├── alembic/
    │   ├── env.py
    │   ├── script.py.mako
    │   └── versions/
    └── app/
        ├── main.py
        ├── core/
        │   ├── config.py
        │   └── database.py
        ├── api/
        │   └── v1/
        │       └── health.py
        ├── models/
        └── schemas/
```

- `core/` — framework-agnostic infrastructure (config, DB). Nothing here imports from `api/`.
- `api/v1/` — versioned router namespace. Future `/api/v2/` can be added without touching existing clients.
- `models/` — SQLAlchemy ORM models (Day 2+)
- `schemas/` — Pydantic request/response schemas (Day 2+)

---

## Tech Decisions

**FastAPI** — async-ready, high performance, auto-generates OpenAPI docs (`/docs`) used by both web and mobile clients.

**Microsoft SQL Server** — enterprise-grade relational database. `pyodbc` bridges Python to MSSQL natively.

**SQLAlchemy 2.x** — declarative `Base` means all models are auto-tracked by Alembic. `pool_pre_ping=True` silently reconnects dropped connections.

**Alembic** — migration tool built for SQLAlchemy. `autogenerate` compares your models to the live DB and writes the SQL diff automatically.

**Pydantic Settings** — config loaded once at startup (`@lru_cache`), validated, and immutable at runtime. `.env` in dev, real env vars in prod — zero code change.

---

## Running the Backend

### 1. Prerequisites

- Python 3.11+
- [ODBC Driver 17 for SQL Server](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)
- A running MSSQL instance

### 2. Setup

```bash
cd backend

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
# Fill in your DB credentials in .env
```

### 3. Run

```bash
uvicorn app.main:app --reload
```

API → `http://localhost:8000`
Docs → `http://localhost:8000/docs`

### 4. Health Check

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

## Roadmap

- [ ] Authentication (JWT)
- [ ] User model + migration
- [ ] Product catalog
- [ ] Shopping cart
- [ ] Orders
- [ ] React web frontend
- [ ] Flutter mobile app
- [ ] AI features
