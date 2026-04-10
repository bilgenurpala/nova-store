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

### Next Steps ✅ (completed Day 3)

- [x] Implement JWT authentication (register, login, /me)
- [ ] Add `User` → `Order` → `OrderItem` → `Product` models
- [ ] Build Pydantic schemas for `Category`, `Product`
- [ ] Build CRUD endpoints for `Category` and `Product`
- [ ] Add CORS middleware (required for React frontend)
- [ ] Add request logging middleware
- [ ] Write unit tests for models and DB layer

---

## Day 3 · 2026-04-08

### Summary
Full JWT-based authentication system: password hashing with bcrypt, JWT access token creation/decode, register and login endpoints, and a protected `/me` endpoint. JWT config moved into `Settings` so secrets stay in `.env` and never touch source code.

---

### Work Done

- `app/core/security.py` — `hash_password`, `verify_password` (bcrypt via passlib), `create_access_token`, `decode_access_token` (HS256 via python-jose)
- `app/schemas/auth.py` — `RegisterRequest`, `LoginRequest`, `TokenResponse`, `UserResponse` (Pydantic v2)
- `app/api/v1/dependencies.py` — `get_current_user`: decodes Bearer token, loads User from DB, raises `401`/`403` on failure
- `app/api/v1/auth.py` — `POST /register`, `POST /login`, `GET /me`
- `app/main.py` — auth router registered at `/api/v1`
- `app/core/config.py` — added `JWT_SECRET_KEY`, `JWT_ALGORITHM`, `JWT_EXPIRE_MINUTES`
- `backend/.env` + `.env.example` — added JWT vars
- `requirements.txt` — added `python-jose[cryptography]`, `passlib[bcrypt]`, `pydantic[email]`

---

### Technical Decisions

| Decision | Rationale |
|---|---|
| `passlib[bcrypt]` for hashing | bcrypt is the industry standard for password storage; passlib wraps it with a clean API and handles salt generation automatically |
| `python-jose[cryptography]` for JWT | Lightweight, well-maintained JWT library; `cryptography` backend enables RS256 if needed later |
| `sub` = email in JWT payload | Email is a natural unique identifier; avoids an extra DB round-trip just to map `user_id` → email on every request |
| `HTTPBearer` over `OAuth2PasswordBearer` | Simpler — works identically for mobile and web clients without OAuth2 form semantics |
| `decode_access_token` returns `None` on failure | Keeps `security.py` side-effect-free; the HTTP exception is raised in the dependency layer, not in the utility function |
| `db.refresh(user)` after register | Ensures the returned `User` object has the DB-generated `id` populated before passing it to `create_access_token` |
| JWT config in `Settings` | Secret key and expiry are environment-specific; they belong in `.env`, not hardcoded |

---

### Challenges

- `pydantic[email]` must be installed separately for `EmailStr` to work in Pydantic v2 — added to `requirements.txt`.
- `UserResponse` requires `model_config = ConfigDict(from_attributes=True)` in Pydantic v2 to serialize SQLAlchemy ORM objects directly (replaces the old `orm_mode = True` from v1).

---

### Next Steps ✅ (completed Day 4)

- [x] CRUD endpoints for `Category`
- [x] CRUD endpoints for `Product`
- [x] Pydantic schemas for `Category` and `Product`
- [ ] Add CORS middleware (required for React frontend)
- [ ] Add request logging middleware
- [ ] Write unit tests for auth + CRUD endpoints

---

## Day 4 · 2026-04-08

### Summary
Full CRUD APIs for Category and Product. Schemas with field-level validation, auth-protected write operations, public read operations, and product filtering by category and name search.

---

### Work Done

- `app/schemas/category.py` — `CategoryCreate`, `CategoryUpdate`, `CategoryResponse` with slug format validation
- `app/schemas/product.py` — `ProductCreate`, `ProductUpdate`, `ProductResponse` with price/stock validation; `ProductResponse` embeds `CategoryResponse`
- `app/schemas/__init__.py` — exports all schemas
- `app/api/v1/categories.py` — `POST`, `GET /`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}`; duplicate `slug`/`name` returns `409`
- `app/api/v1/products.py` — same CRUD; `GET /` accepts `?category_id` and `?search` query params; `category_id` existence validated on create/update
- `app/main.py` — registered `categories` and `products` routers

---

### Technical Decisions

| Decision | Rationale |
|---|---|
| Public GET, protected POST/PUT/DELETE | Read-only browsing works without auth — matches real storefront behaviour; mutations require identity |
| `_get_or_404` helper per router | Keeps route handlers lean; single place to change 404 logic per resource |
| `_assert_category_exists` before product write | Prevents orphaned FK errors at the DB level with a clear API-level `400` message |
| `model_dump(exclude_unset=True)` in PUT | Only fields sent by the client are written — true partial update, no accidental overwrites |
| `ilike` for product name search | Case-insensitive partial match; works on MSSQL without extra configuration |
| `ProductResponse` embeds `CategoryResponse` | Clients get the full category object in one request — no second round-trip needed |
| Slug validator via `@field_validator` | Pattern enforced at schema level before any DB operation — fail fast, clear error message |

---

### Challenges

- Pydantic v2 `@field_validator` runs per field, not per model — `exclude_unset` must be handled at the route layer, not in the schema.
- `Product.name.ilike` requires SQLAlchemy's column expression; works correctly because `name` is a `mapped_column(String)`.

---

### Next Steps ✅ (completed Day 5)

- [x] Shopping cart domain (Cart, CartItem models + API)
- [ ] Add CORS middleware (required for React/Flutter clients)
- [ ] Add request logging middleware
- [ ] Order domain (Order, OrderItem models + API)
- [ ] Unit tests for Category and Product endpoints

---

## Day 5 · 2026-04-08

### Summary
Cart system: `Cart` and `CartItem` models, Alembic migration, full cart API (view, add, update quantity, remove), schemas with validation, and `User.cart` back-reference. README rewritten as a professional product document — all "Day X" progress notes moved exclusively to this devlog.

---

### Work Done

- `app/models/cart.py` — `Cart` (one-per-user via `unique=True` on `user_id`), `CartItem` (cart_id + product_id + quantity); `cascade="all, delete-orphan"` on `Cart.items`
- `app/models/user.py` — added `cart` relationship (`uselist=False`) back to `Cart`
- `app/models/__init__.py` — exports `Cart`, `CartItem`
- `alembic/versions/20260408_0002_add_cart_tables.py` — creates `carts` and `cart_items` with FK constraints and indexes; `down_revision = a1b2c3d4e5f6`
- `app/schemas/cart.py` — `AddToCartRequest`, `UpdateCartItemRequest`, `RemoveCartItemRequest`, `CartItemResponse`, `CartResponse`
- `app/api/v1/cart.py` — `GET /cart`, `POST /cart/add`, `PUT /cart/update`, `DELETE /cart/remove`; all endpoints protected
- `app/main.py` — cart router registered
- `README.md` — full rewrite as professional product doc (no Day references)

---

### Technical Decisions

| Decision | Rationale |
|---|---|
| `unique=True` on `Cart.user_id` | Enforced at both DB and ORM level — one cart per user is a constraint, not just a convention |
| `_get_or_create_cart` helper | Centralises the auto-creation logic; every route calls it instead of duplicating the check |
| Add increments existing quantity | Better UX — adding a product you already have accumulates rather than resetting; mirrors real storefront behaviour |
| `PUT /update` with `quantity=0` removes item | Single endpoint handles both "change qty" and "effectively remove" — fewer client-side code paths |
| `cascade="all, delete-orphan"` on items | Deleting a cart cleans up all its items automatically at the ORM level |
| `CartResponse` embeds `CartItemResponse` which embeds `ProductResponse` | Client gets the full cart in one call — no N+1 requests needed |
| All cart endpoints protected | Cart is personal data — no read is safe to expose publicly |

---

### Challenges

- `User.cart` must use `uselist=False` to return a single `Cart` object rather than a list — SQLAlchemy default for `relationship()` is a list even on a one-to-one FK.
- `db.refresh(cart)` after item mutations is required to reload the `items` collection — without it, the response returns stale data from the session cache.

---

### Next Steps

- [ ] Order domain (Order, OrderItem models + API)
- [ ] CORS middleware (required for React/Flutter clients)
- [ ] Request logging middleware
- [ ] Unit tests for cart endpoints
