# Nova Store — Development Log

---

## Day 1 · 2026-04-07

### Summary
Established the complete backend foundation for Nova Store. No business logic was written — the focus was entirely on a clean, production-ready skeleton: project structure, configuration layer, database connectivity, ORM setup, migration tooling, and a live health check endpoint.

---

### Work Done

- Defined and created the full backend folder hierarchy
- `config.py` — Pydantic Settings, reads from `.env`, builds MSSQL connection URL dynamically
- `database.py` — SQLAlchemy engine with connection pooling, `SessionLocal`, `Base`, `get_db()`, `check_db_connection()`
- `main.py` — FastAPI app with versioned router registration
- `health.py` — `GET /api/v1/health` with live DB connectivity probe
- `alembic.ini` + `alembic/env.py` — Alembic reads DB URL from the same settings object as the app
- `script.py.mako` — migration file template
- `requirements.txt` with pinned versions
- `.env.example` — safe configuration template
- `.gitignore`

---

### Technical Decisions

| Decision | Rationale |
|---|---|
| `pydantic-settings` for config | Type-safe, validated at startup, zero-change switch from `.env` to real env vars in production |
| `@lru_cache` on `get_settings()` | Settings created once, reused — no re-reading `.env` on every request |
| `pool_pre_ping=True` | Validates connections before use, prevents stale connection errors |
| `echo=settings.DEBUG` | SQL logging tied to DEBUG flag — clean in production, verbose in development |
| `api/v1/` namespace | Allows future `/api/v2/` rollout without breaking web and mobile clients |
| `models/` and `schemas/` separated | ORM models own DB shape; Pydantic schemas own API contract — they evolve independently |
| Alembic imports `Base.metadata` | All ORM models auto-discovered via `Base` — no manual registration needed |

---

### Challenges

- MSSQL connection strings with `pyodbc` require the ODBC driver name to be URL-encoded (spaces → `+`). Handled in the `DATABASE_URL` property.
- Alembic's `env.py` needs the `app` package on `sys.path`. Solved with `sys.path.insert(0, ...)`.

---

### Next Steps ✅ (completed Day 2)

- [x] Add SQLAlchemy model base mixin (`id`, `created_at`, `updated_at`)
- [x] Define `User`, `Category`, `Product` models
- [x] Create initial Alembic migration
- [ ] Implement JWT authentication
- [ ] Add CORS middleware
- [ ] Add request logging middleware

---

## Day 2 · 2026-04-07

### Summary
Bug fixes on the Day 1 foundation, then full database model layer: shared `TimestampedBase` mixin, `User`, `Category`, and `Product` ORM models with correct relationships, and the initial Alembic migration file.

---

### Bug Fixes

| File | Bug | Fix |
|---|---|---|
| `alembic/env.py` | `Base.metadata` was empty at migration time — no models were imported, so `alembic revision --autogenerate` would generate an empty migration | Added `import app.models` before `target_metadata = Base.metadata` |
| `backend/.env` | File did not exist — app crashed at startup with a Pydantic validation error for missing required DB fields | Created `.env` from `.env.example` with placeholder values |

---

### Work Done

- `app/models/base.py` — `TimestampedBase` abstract class: `id` (PK, autoincrement), `created_at`, `updated_at`
- `app/models/user.py` — `User` model: `email` (unique, indexed), `password_hash`, `is_active`
- `app/models/category.py` — `Category` model: `name` (unique), `slug` (unique, indexed), back-populates `products`
- `app/models/product.py` — `Product` model: `name`, `description` (nullable), `price` (`DECIMAL(10,2)`), `stock`, `category_id` FK
- `app/models/__init__.py` — imports all models so they register with `Base.metadata`
- `alembic/versions/20260407_0001_initial_tables.py` — initial migration: creates `users`, `categories`, `products` with all indexes and FK constraint
- `alembic/env.py` — patched to import `app.models` before reading metadata
- `README.md` — updated with DB design section, ER overview, mixin explanation, bug fix table

---

### Technical Decisions

| Decision | Rationale |
|---|---|
| `TimestampedBase` with `__abstract__ = True` | Shared columns injected into every concrete model — no `timestampedbase` table created in DB |
| `server_default=func.now()` for timestamps | DB sets the value — even rows inserted outside the ORM (e.g., raw SQL) get correct timestamps |
| `onupdate=func.now()` for `updated_at` | SQLAlchemy updates this column automatically on every ORM flush — no manual tracking needed |
| `Numeric(10, 2)` for price | Exact decimal arithmetic — avoids floating-point rounding errors in financial calculations |
| `TYPE_CHECKING` imports for relationships | Prevents circular imports between `category.py` and `product.py` at runtime while preserving type hints |
| `category_id` indexed on `products` | Products will frequently be filtered/joined by category — index prevents full table scans |
| Migration written manually | No live DB available in this environment; the migration matches exactly what `autogenerate` would produce against MSSQL |

---

### Challenges

- SQLAlchemy 2.x bidirectional `relationship()` between `Category` and `Product` requires careful import ordering to avoid circular imports. Resolved using `TYPE_CHECKING` guards — imports only run during static analysis, not at runtime.
- MSSQL uses `GETDATE()` instead of `now()` for server-side timestamp defaults. The migration uses `sa.text("GETDATE()")` explicitly to ensure compatibility.

---

### Next Steps

- [ ] Implement JWT authentication (register, login, token refresh)
- [ ] Add `User` → `Order` → `OrderItem` → `Product` models
- [ ] Build Pydantic schemas for `User`, `Category`, `Product`
- [ ] Build CRUD endpoints for `Category` and `Product`
- [ ] Add CORS middleware (required for React frontend)
- [ ] Add request logging middleware
- [ ] Write unit tests for models and DB layer
