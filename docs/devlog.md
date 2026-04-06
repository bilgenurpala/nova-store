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

### Next Steps

- [ ] Add SQLAlchemy model base mixins (`id`, `created_at`, `updated_at`)
- [ ] Implement JWT authentication
- [ ] Define `User` model + migration
- [ ] Define `Product` model + migration
- [ ] Add CORS middleware (required for React frontend)
- [ ] Add request logging middleware
- [ ] Write unit tests for health check and DB layer
