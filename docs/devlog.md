# Nova Store — Development Log

Each day entry is written in both **English** and **Turkish**.  
Her günün notları hem **İngilizce** hem **Türkçe** yazılmıştır.

---

## Day 1 · 2026-04-07 — Backend Foundation / Temel Altyapı

### Summary
The goal of this day was not to write business logic, but to build the foundation everything else will stand on: folder structure, configuration layer, database connectivity, ORM setup, migration tooling, and a live health check endpoint.

### Özet
Bu günün amacı iş mantığı yazmak değil, her şeyin üzerine inşa edileceği zemini kurmaktı: klasör yapısı, konfigürasyon katmanı, veritabanı bağlantısı, ORM kurulumu, migration sistemi ve canlı sağlık kontrolü endpoint'i.

---

### What We Did / Ne Yaptık

- `config.py` — Pydantic Settings; reads `.env`, builds MSSQL connection URL dynamically / `.env` okur, MSSQL bağlantı URL'ini dinamik olarak oluşturur
- `database.py` — SQLAlchemy engine with connection pooling, `SessionLocal`, `Base`, `get_db()` / Bağlantı havuzlu engine, oturum fabrikası, temel sınıf
- `main.py` — FastAPI app with versioned router registration / Versiyonlu router kaydıyla FastAPI uygulaması
- `health.py` — `GET /api/v1/health` with live DB connectivity probe / Canlı DB bağlantı testi içeren health endpoint
- `alembic.ini` + `alembic/env.py` — Alembic reads DB URL from settings / Alembic, DB URL'ini settings nesnesinden okur
- `requirements.txt` with pinned versions / Sabitlenmiş versiyonlarla bağımlılık listesi
- `.env.example` — safe configuration template / Güvenli konfigürasyon şablonu
- `.gitignore`

---

### Key Concepts / Temel Kavramlar

#### Pydantic Settings
**EN:** `os.getenv("DB_PORT")` always returns a `str`. If the field should be an integer, you have to cast it yourself — and if someone puts `DB_PORT=abc` in `.env`, the app crashes at runtime with a confusing error. Pydantic Settings declares types upfront:
```python
DB_PORT: int = 1433
```
It reads the `.env` file, automatically coerces `"1433"` to `int`, and if the value is invalid it raises a clear validation error at **startup** — not at runtime. This is type safety applied to configuration.

**TR:** `os.getenv("DB_PORT")` her zaman `str` döner. Alan bir integer olması gerekiyorsa kendin dönüştürmek zorundasın — ve birisi `.env`'e `DB_PORT=abc` yazarsa uygulama çalışma zamanında kafa karıştırıcı bir hatayla patlar. Pydantic Settings tipleri baştan tanımlar: `DB_PORT: int = 1433`. `.env` dosyasını okur, `"1433"` string'ini otomatik `int`'e çevirir, değer geçersizse **başlangıçta** açık bir hata mesajı verir — runtime'da değil. Bu, konfigürasyona uygulanmış type safety'dir.

---

#### ORM (Object-Relational Mapper)
**EN:** An ORM maps database tables to Python classes and rows to object instances. Instead of writing `SELECT * FROM users WHERE id = 1`, you write `db.get(User, 1)`. SQLAlchemy handles this translation. The benefit: you write Python, not SQL, and database-specific syntax differences disappear.

**TR:** ORM, veritabanı tablolarını Python sınıflarına ve satırları nesne instance'larına eşler. `SELECT * FROM users WHERE id = 1` yazmak yerine `db.get(User, 1)` yazarsın. SQLAlchemy bu dönüşümü yapar. Faydası: Python yazarsın, SQL değil; veritabanına özgü sözdizimi farkları ortadan kalkar.

---

#### Alembic & Database Migrations
**EN:** A production database has data in it. If you add a new column to a model, you can't just recreate the database — the data would be lost. Alembic converts model changes into ordered, reversible migration files. `alembic upgrade head` applies all pending migrations in sequence. `alembic downgrade -1` rolls back one step. Every schema change is tracked and reproducible.

**TR:** Production veritabanında data var. Modele yeni sütun eklersen, veritabanını sıfırdan yaratman mümkün değil — data silinir. Alembic, model değişikliklerini sıralı ve geri alınabilir migration dosyalarına çevirir. `alembic upgrade head` bekleyen tüm migration'ları sırayla uygular. `alembic downgrade -1` bir adım geri alır. Her şema değişikliği izlenir ve tekrarlanabilir.

---

#### Connection Pooling / Bağlantı Havuzu
**EN:** Opening a new TCP connection to the database on every HTTP request is expensive. A connection pool keeps a set of open connections ready and hands them to requests as needed. `pool_size=10` — connections kept open at all times. `max_overflow=20` — extra connections opened during traffic spikes. `pool_pre_ping=True` — validates each connection before use to prevent stale connection errors.

**TR:** Her HTTP isteğinde veritabanına yeni TCP bağlantısı açmak pahalıdır. Bağlantı havuzu, önceden açılmış bağlantıları bekletir ve istekler geldiğinde onlara verir. `pool_size=10` — her zaman açık tutulan bağlantı sayısı. `max_overflow=20` — ani yük artışında açılabilecek ekstra bağlantı sayısı. `pool_pre_ping=True` — her bağlantıyı kullanmadan önce doğrular, stale connection hatasını önler.

---

### Technical Decisions / Teknik Kararlar

| Decision / Karar | Rationale / Gerekçe |
|---|---|
| `pydantic-settings` for config / konfigürasyon için | Type-safe, validated at startup / Tip güvenli, başlangıçta doğrulanır |
| `@lru_cache` on `get_settings()` | Settings created once, not re-read on every request / Bir kez oluşturulur, her istekte yeniden okunmaz |
| `pool_pre_ping=True` | Prevents stale connection errors / Stale bağlantı hatalarını önler |
| `echo=settings.DEBUG` | SQL logs only in DEBUG mode / SQL logları yalnızca DEBUG modunda |
| `api/v1/` namespace | Allows future `/api/v2/` without breaking clients / Mevcut client'ları kırmadan `/api/v2/` çıkarmayı sağlar |
| Separate `models/` and `schemas/` | ORM models own DB shape; Pydantic schemas own API contract / ORM modeli DB şeklini, Pydantic şeması API kontratını yönetir |

---

### Issues & Fixes / Sorunlar ve Çözümler

**EN:** MSSQL connection strings with pyodbc require spaces in the driver name to be URL-encoded (`ODBC Driver 17` → `ODBC+Driver+17`). Solved in the `DATABASE_URL` property with `.replace(" ", "+")`. Alembic's `env.py` needs the `app` package on `sys.path` — solved with `sys.path.insert(0, ...)`.

**TR:** pyodbc'de MSSQL bağlantı string'inde driver adındaki boşluklar URL-encode edilmeli (`ODBC Driver 17` → `ODBC+Driver+17`). `DATABASE_URL` property'sinde `.replace(" ", "+")` ile çözüldü. Alembic'in `env.py`'ı `app` paketini `sys.path`'te bulamazsa import hatası verir — `sys.path.insert(0, ...)` ile çözüldü.

---

## Day 2 · 2026-04-07 — Database Models / Veritabanı Modelleri

### Summary
Bug fixes on the Day 1 foundation, then full database model layer: shared `TimestampedBase` mixin, `User`, `Category`, and `Product` ORM models with relationships, and the initial Alembic migration.

### Özet
Gün 1 altyapısındaki bug düzeltmeleri, ardından tam veritabanı model katmanı: paylaşılan `TimestampedBase` mixin, `User`, `Category` ve `Product` ORM modelleri ilişkilerle birlikte ve ilk Alembic migration.

---

### What We Did / Ne Yaptık

- `app/models/base.py` — `TimestampedBase`: `id` (PK, autoincrement), `created_at`, `updated_at`
- `app/models/user.py` — `User`: `email` (unique, indexed), `password_hash`, `is_active`
- `app/models/category.py` — `Category`: `name` (unique), `slug` (unique, indexed), `products` relationship
- `app/models/product.py` — `Product`: `name`, `description` (nullable), `price` (`DECIMAL(10,2)`), `stock`, `category_id` FK
- `app/models/__init__.py` — imports all models so they register with `Base.metadata` / tüm modeller `Base.metadata`'ya kaydedilmek için import edilir
- `alembic/versions/20260407_0001_initial_tables.py` — creates `users`, `categories`, `products`
- `alembic/env.py` — patched to import `app.models` before reading metadata / metadata okunmadan önce `app.models` import edilecek şekilde güncellendi

---

### Bug Fixes / Bug Düzeltmeleri

| File / Dosya | Bug | Fix / Çözüm |
|---|---|---|
| `alembic/env.py` | `Base.metadata` was empty — no models imported, autogenerate produced empty migration / Hiçbir model import edilmemişti, autogenerate boş migration üretiyordu | Added `import app.models` before `target_metadata` / `target_metadata`'dan önce `import app.models` eklendi |
| `backend/.env` | File didn't exist — Pydantic validation error at startup / Dosya yoktu, Pydantic başlangıçta hata veriyordu | Created from `.env.example` / `.env.example`'dan oluşturuldu |

---

### Key Concepts / Temel Kavramlar

#### `__abstract__ = True` and the Mixin Pattern / Mixin Paterni

**EN:** We don't want `TimestampedBase` to create a database table — we just want it to inject `id`, `created_at`, `updated_at` into every model. `__abstract__ = True` tells SQLAlchemy: don't create a table for this class. Every model that inherits from it gets those columns automatically. This is the DRY principle (Don't Repeat Yourself) applied to database models.

**TR:** `TimestampedBase`'in bir veritabanı tablosu oluşturmasını istemiyoruz — sadece `id`, `created_at`, `updated_at`'ı her modele enjekte etmesini istiyoruz. `__abstract__ = True` SQLAlchemy'ye şunu söyler: bu sınıf için tablo oluşturma. O sınıftan miras alan her model bu sütunları otomatik alır. Bu, veritabanı modellerine uygulanmış DRY (Kendini Tekrar Etme) prensibidir.

---

#### `server_default` vs `default`

**EN:** `default=func.now()` — Python calculates the value and sends it as a query parameter. `server_default=func.now()` — SQLAlchemy adds a `DEFAULT GETDATE()` constraint to the column definition. The database sets the value itself. Even rows inserted outside the ORM (raw SQL, migrations) get correct timestamps.

**TR:** `default=func.now()` — Python değeri hesaplar ve SQL sorgusuna parametre olarak gönderir. `server_default=func.now()` — SQLAlchemy sütun tanımına `DEFAULT GETDATE()` kısıtlaması ekler. Veritabanı değeri kendisi set eder. ORM bypass edilerek yapılan insert'lerde (raw SQL, migration) bile timestamp doğru girilir.

---

#### `Numeric(10, 2)` vs `Float` for Price / Fiyat İçin

**EN:** `Float` uses binary floating-point. It cannot exactly represent `149.99` in binary. You can end up with `0.1 + 0.2 = 0.30000000004`. In financial data, this is catastrophic. `Numeric(10, 2)` uses exact decimal arithmetic: 10 total digits, 2 after the decimal point. Money is always stored with `Numeric`.

**TR:** `Float` binary floating point kullanır. `149.99` gibi bir sayıyı binary'de tam olarak temsil edemez. `0.1 + 0.2 = 0.30000000004` gibi sonuçlar çıkabilir. Finansal veride bu felaket demektir. `Numeric(10, 2)` exact decimal arithmetic kullanır: toplam 10 basamak, virgülden sonra 2. Para her zaman `Numeric` ile saklanır.

---

#### `TYPE_CHECKING` Circular Import Guard

**EN:** `category.py` references `Product` (for the relationship), `product.py` references `Category`. If they import each other directly, Python enters an infinite loop. The solution: wrap the import in `if TYPE_CHECKING:` — this block only runs during static analysis (mypy, IDE), never at runtime. The relationship is defined as a string: `relationship("Product")`. SQLAlchemy resolves the string to the class at runtime.

**TR:** `category.py`, `Product`'a referans veriyor (relationship için); `product.py`, `Category`'ye referans veriyor. İkisi birbirini doğrudan import etmeye çalışırsa Python sonsuz döngüye girer. Çözüm: import'u `if TYPE_CHECKING:` bloğuna sar — bu blok yalnızca statik analiz sırasında (mypy, IDE) çalışır, runtime'da asla. Relationship string olarak tanımlanır: `relationship("Product")`. SQLAlchemy bu string'i runtime'da sınıfa çözer.

---

### Technical Decisions / Teknik Kararlar

| Decision / Karar | Rationale / Gerekçe |
|---|---|
| `TimestampedBase` with `__abstract__ = True` | Shared columns injected, no extra table / Paylaşılan sütunlar enjekte edilir, ekstra tablo oluşmaz |
| `server_default` for timestamps | DB sets value — works even outside ORM / DB değeri set eder, ORM dışında da çalışır |
| `Numeric(10, 2)` for price | Exact decimal, no floating-point rounding errors / Kesin decimal, yuvarlama hatası yok |
| `TYPE_CHECKING` import guards | Prevents circular imports at runtime / Runtime'da circular import'ları önler |
| `category_id` indexed on products | Frequent filter by category — index prevents full table scan / Kategoriye göre sık filtreleme, index tam tablo taramasını önler |

---

## Day 3 · 2026-04-08 — Authentication / Kimlik Doğrulama

### Summary
Full JWT-based authentication system: password hashing with bcrypt, JWT token creation and decoding, register and login endpoints, and a protected `/me` endpoint. JWT configuration moved to `Settings` so secrets stay in `.env`.

### Özet
Tam JWT tabanlı kimlik doğrulama sistemi: bcrypt ile şifre hashleme, JWT token oluşturma ve çözme, kayıt ve giriş endpoint'leri ve korumalı `/me` endpoint'i. JWT konfigürasyonu `Settings`'e taşındı, sırlar `.env`'de kalır.

---

### What We Did / Ne Yaptık

- `app/core/security.py` — `hash_password`, `verify_password` (bcrypt), `create_access_token`, `decode_access_token` (HS256)
- `app/schemas/auth.py` — `RegisterRequest`, `LoginRequest`, `TokenResponse`, `UserResponse`
- `app/api/v1/dependencies.py` — `get_current_user`: decodes Bearer token, loads User, raises 401/403
- `app/api/v1/auth.py` — `POST /register`, `POST /login`, `GET /me`
- `app/core/config.py` — `JWT_SECRET_KEY`, `JWT_ALGORITHM`, `JWT_EXPIRE_MINUTES` added / eklendi

---

### Key Concepts / Temel Kavramlar

#### Why Not Store Plaintext Passwords? / Neden Plaintext Şifre Saklanmaz?

**EN:** If you store `password = "abc123"` in the database and the DB is compromised, every user's password is exposed instantly. bcrypt converts a password into an irreversible (one-way) hash: `hash_password("abc123")` → `"$2b$12$eImiTX..."`. You cannot get `"abc123"` back from this hash. At login: hash the submitted password and compare against the stored hash.

**TR:** Veritabanında `password = "abc123"` saklarsan ve DB ele geçirilirse, herkesin şifresi anında açığa çıkar. bcrypt, şifreyi geri döndürülemez (one-way) bir hash'e çevirir: `hash_password("abc123")` → `"$2b$12$eImiTX..."`. Bu hash'ten `"abc123"`'e geri dönemezsin. Login'de: girilen şifreyi hashle ve saklanan hash ile karşılaştır.

---

#### What is a Salt? / Salt Nedir?

**EN:** Without a salt, the same password always produces the same hash. An attacker could pre-compute a hash table for common passwords (rainbow table attack). bcrypt automatically generates a random salt and embeds it in the hash. Each `hash_password("abc123")` call produces a different hash, but `verify_password("abc123", any_of_those_hashes)` returns `True` for all of them.

**TR:** Salt olmadan, aynı şifre her zaman aynı hash'i üretir. Saldırgan yaygın şifreler için önceden hash tabloları hesaplayabilir (rainbow table saldırısı). bcrypt otomatik olarak rastgele bir salt üretir ve hash'e gömer. Her `hash_password("abc123")` çağrısı farklı bir hash üretir, ama `verify_password("abc123", hash)` hepsinde `True` döner.

---

#### What is JWT? / JWT Nedir?

**EN:** JWT (JSON Web Token) has three parts: `header.payload.signature`. The header contains algorithm info. The payload contains claims: `{"sub": "user@example.com", "exp": 1234567890}`. The signature is an HMAC-SHA256 of header + payload using the secret key. The server issues the JWT and does not store it. On each request, it verifies the signature — if valid, the token is authentic. This is **stateless auth**: no session table needed on the server.

**TR:** JWT (JSON Web Token) üç parçadan oluşur: `header.payload.signature`. Header algoritma bilgisi içerir. Payload claims içerir: `{"sub": "user@example.com", "exp": 1234567890}`. Signature, header + payload'ın secret key ile HMAC-SHA256 imzasıdır. Sunucu JWT'yi verir ve saklamaz. Her istekte signature'ı doğrular — geçerliyse token gerçektir. Bu **stateless auth**'tur: sunucuda session tablosu tutmaya gerek yok.

---

#### FastAPI Dependency Injection — `Depends()`

**EN:** Route handlers can declare dependency functions as parameters:
```python
def get_order(current_user: User = Depends(get_current_user)):
    ...
```
FastAPI automatically runs `get_current_user()` before calling the handler and passes the result as `current_user`. Auth logic is written once and reused across every endpoint. Dependencies can also chain: `get_current_admin` depends on `get_current_user`.

**TR:** Route handler'lar parametre olarak dependency fonksiyonları tanımlayabilir. FastAPI, handler çağrılmadan önce `get_current_user()`'ı otomatik çalıştırır ve sonucu `current_user` parametresine atar. Auth mantığı bir kez yazılır, her endpoint'te yeniden kullanılır. Dependency'ler zincirleme de kullanılabilir: `get_current_admin`, `get_current_user`'a depend eder.

---

#### HS256 vs RS256

**EN:** HS256: a single secret key both signs and verifies. Simple and fast. If multiple services need to verify tokens, the secret must be shared with all of them — a security risk. RS256: a private key signs, a public key verifies. The public key can be shared freely. Preferred in microservice architectures. HS256 is sufficient for now.

**TR:** HS256: tek bir secret key hem imzalar hem doğrular. Basit ve hızlı. Birden fazla servisin token doğrulaması gerekiyorsa secret herkesle paylaşılmak zorunda — güvenlik riski. RS256: private key imzalar, public key doğrular. Public key serbestçe paylaşılabilir. Microservice mimarisinde tercih edilir. Şimdilik HS256 yeterli.

---

### Technical Decisions / Teknik Kararlar

| Decision / Karar | Rationale / Gerekçe |
|---|---|
| `passlib[bcrypt]` | Industry standard password storage / Endüstri standardı şifre saklama |
| `python-jose[cryptography]` | Lightweight JWT; easy RS256 upgrade later / Hafif JWT; sonradan RS256'ya geçiş kolay |
| `sub` = email in JWT | Natural unique identifier; no extra DB round-trip / Doğal unique tanımlayıcı, ekstra DB sorgusu gerekmez |
| `HTTPBearer` | Works identically for web and mobile / Web ve mobil için aynı şekilde çalışır |
| `decode_access_token` returns `None` | `security.py` stays side-effect-free / `security.py` yan etkisiz kalır |

---

## Day 4 · 2026-04-08 — Category & Product APIs

### Summary
Full CRUD APIs for Category and Product. Field-level validation, admin-protected write endpoints, public read endpoints, and product filtering by category and name search.

### Özet
Category ve Product için tam CRUD API'leri. Field bazlı validasyon, admin-korumalı write endpoint'leri, public read endpoint'leri ve kategori ile isim bazlı ürün filtreleme.

---

### What We Did / Ne Yaptık

- `app/schemas/category.py` — `CategoryCreate`, `CategoryUpdate`, `CategoryResponse` (slug format validation / slug format doğrulaması)
- `app/schemas/product.py` — `ProductCreate`, `ProductUpdate`, `ProductResponse` (price/stock validation; CategoryResponse embedded / fiyat/stok doğrulaması; CategoryResponse gömülü)
- `app/api/v1/categories.py` — full CRUD; duplicate slug/name → 409 / tam CRUD; tekrar slug/name → 409
- `app/api/v1/products.py` — full CRUD; `?category_id` filter and `?search` (ilike); `model_dump(exclude_unset=True)` for PUT

---

### Key Concepts / Temel Kavramlar

#### REST API Design Principles / REST API Tasarım Prensipleri

**EN:** REST is resource-centered. The endpoint path is a noun, not a verb. HTTP methods carry the meaning: `POST` = create, `GET` = read, `PUT` = update, `DELETE` = delete. Status codes also carry meaning: 200 = success, 201 = created, 404 = not found, 409 = conflict. Good REST design is predictable — a developer who knows one endpoint can guess the others.

**TR:** REST kaynak merkezlidir. Endpoint yolu fiil değil isimdir. HTTP methodlar anlamı taşır: `POST` = oluştur, `GET` = oku, `PUT` = güncelle, `DELETE` = sil. Status code'lar da anlam taşır: 200 = başarılı, 201 = oluşturuldu, 404 = bulunamadı, 409 = çakışma. İyi REST tasarımı öngörülebilirdir — bir endpoint'i bilen geliştirici diğerlerini tahmin edebilir.

---

#### `model_dump(exclude_unset=True)` — True Partial Update / Gerçek Kısmi Güncelleme

**EN:** For a PUT request, the client sends only `{"price": 49.99}`. `model_dump()` returns all fields including defaults: `{"name": None, "description": None, "price": 49.99, ...}`. Iterating this and calling `setattr` would overwrite `name` and `description` with `None`. `model_dump(exclude_unset=True)` returns only fields the client actually sent: `{"price": 49.99}`. Only that field is updated — everything else stays as it is in the DB.

**TR:** PUT isteğinde client yalnızca `{"price": 49.99}` gönderiyor. `model_dump()` default değerleriyle tüm alanları döner: `{"name": None, "description": None, "price": 49.99, ...}`. Bunun üzerinde dönerek `setattr` çağırmak, `name` ve `description`'ı `None`'a ezer. `model_dump(exclude_unset=True)` ise yalnızca client'ın gönderdiği alanları döner: `{"price": 49.99}`. Yalnızca o alan güncellenir, geri kalanı DB'de olduğu gibi kalır.

---

#### `ilike` — Case-Insensitive Search / Büyük/Küçük Harf Duyarsız Arama

**EN:** `Product.name.ilike(f"%{search}%")` — `%` is a wildcard that matches any characters before and after the search term. `ilike` is case-insensitive `LIKE`. Searching for `wireless` finds `Wireless Headphones`, `WIRELESS EARBUDS`, and `premium wireless speaker` all at once.

**TR:** `Product.name.ilike(f"%{search}%")` — `%` önünde ve arkasında herhangi bir karakter eşleyen wildcard'dır. `ilike` büyük/küçük harf duyarsız `LIKE`'tır. `wireless` araması `Wireless Headphones`, `WIRELESS EARBUDS` ve `premium wireless speaker`'ı hepsini birden bulur.

---

#### `_get_or_404` Helper Pattern

**EN:** Without a helper, every route repeats the same lookup-and-raise pattern. The helper centralizes this in one place:
```python
def _get_or_404(id, db):
    item = db.query(Model).filter(Model.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item
```
Route handlers stay clean. 404 logic lives in one place per router.

**TR:** Helper olmadan, her route aynı lookup-and-raise desenini tekrar eder. Helper bunu tek bir yerde toplar. Route handler'lar temiz kalır. 404 mantığı her router'da tek bir yerde yaşar.

---

### Technical Decisions / Teknik Kararlar

| Decision / Karar | Rationale / Gerekçe |
|---|---|
| Public GET, protected POST/PUT/DELETE | Browsing needs no auth; mutations require identity / Gezinme auth gerektirmez; değiştirme kimlik gerektirir |
| `_get_or_404` helper | Clean handlers, single place for 404 logic / Temiz handler'lar, tek 404 mantığı yeri |
| `_assert_category_exists` | Clear 400 before FK error / FK hatasından önce açık 400 |
| `model_dump(exclude_unset=True)` in PUT | True partial update / Gerçek kısmi güncelleme |
| `ProductResponse` embeds `CategoryResponse` | Client gets full product + category in one request / Client tek istekte tam ürün + kategori alır |

---

## Day 5 · 2026-04-08 — Cart System / Sepet Sistemi

### Summary
Cart system: `Cart` and `CartItem` models, Alembic migration, full cart API (view, add, update quantity, remove), schemas with validation, and `User.cart` back-reference. README rewritten as a professional product document.

### Özet
Sepet sistemi: `Cart` ve `CartItem` modelleri, Alembic migration, tam sepet API'si (görüntüle, ekle, miktar güncelle, kaldır), doğrulamalı şemalar ve `User.cart` back-reference. README profesyonel ürün belgesi olarak yeniden yazıldı.

---

### What We Did / Ne Yaptık

- `app/models/cart.py` — `Cart` (one per user via `unique=True`), `CartItem`; `cascade="all, delete-orphan"`
- `app/models/user.py` — added `cart` relationship (`uselist=False`) / `cart` relationship eklendi
- `alembic/versions/20260408_0002_add_cart_tables.py` — `carts` and `cart_items`
- `app/schemas/cart.py` — request/response schemas / istek/yanıt şemaları
- `app/api/v1/cart.py` — `GET /cart`, `POST /cart/add`, `PUT /cart/update`, `DELETE /cart/remove`

---

### Key Concepts / Temel Kavramlar

#### One-to-One vs One-to-Many Relationships

**EN:** Each user has exactly one cart. This is a one-to-one relationship. SQLAlchemy's `relationship()` defaults to returning a list (one-to-many). For one-to-one, `uselist=False` is required:
```python
cart: Mapped["Cart | None"] = relationship("Cart", uselist=False)
```
Without `uselist=False`, `user.cart` returns a list. With it, `user.cart` returns a single `Cart` object or `None`.

**TR:** Her kullanıcının tam olarak bir sepeti olur. Bu one-to-one ilişkidir. SQLAlchemy'nin `relationship()`'i varsayılan olarak liste döner (one-to-many). One-to-one için `uselist=False` gerekir. `uselist=False` olmadan `user.cart` bir liste döner. Onunla, `user.cart` tek bir `Cart` nesnesi ya da `None` döner.

---

#### Cascade Delete / Kademeli Silme

**EN:** `cascade="all, delete-orphan"` means: when a `Cart` is deleted, all its `CartItem`s are automatically deleted too. "Orphan" refers to a child record whose parent no longer exists. Without this, deleting a `Cart` would leave orphaned rows in `cart_items` and trigger a FK constraint error.

**TR:** `cascade="all, delete-orphan"` şu anlama gelir: bir `Cart` silindiğinde, ona ait tüm `CartItem`'lar da otomatik silinir. "Orphan" — parent'ı artık olmayan child kaydı demektir. Bu olmadan `Cart` silinince `cart_items`'da orphan satırlar kalır ve FK constraint hatası tetiklenir.

---

#### `db.flush()` vs `db.commit()`

**EN:** `db.flush()`: translates pending changes to SQL and sends them to the DB, but does not close the transaction. The change is visible within the current session. Use it when you need a DB-generated value (like `id`) for a FK before committing. `db.commit()`: closes the transaction and makes changes permanent. Other sessions can now see them. On error, `db.rollback()` undoes all flushes since the last commit.

**TR:** `db.flush()`: bekleyen değişiklikleri SQL'e çevirir ve DB'ye gönderir, ama transaction'ı kapatmaz. Değişiklik mevcut session içinde görünür. Commit'ten önce bir FK için DB tarafından üretilen bir değere (örn. `id`) ihtiyaç duyulduğunda kullanılır. `db.commit()`: transaction'ı kapatır ve değişikliği kalıcı yapar. Diğer session'lar artık görebilir. Hata durumunda `db.rollback()`, son commit'ten bu yana tüm flush'ları geri alır.

---

#### `db.refresh()` — Session Cache Problem / Oturum Önbellek Sorunu

**EN:** SQLAlchemy's session acts like a cache. After reading `cart.items`, if you add a `CartItem` and commit, looking at `cart.items` again might still show the old data. `db.refresh(cart)` forces SQLAlchemy to reload all data for that object from the DB. Required after every cart mutation — otherwise the response returns stale cached data.

**TR:** SQLAlchemy session'ı önbellek gibi davranır. `cart.items`'ı okuduktan sonra bir `CartItem` ekleyip commit etsen, `cart.items`'a tekrar baktığında eski veriyi görebilirsin. `db.refresh(cart)`, SQLAlchemy'yi o nesnenin tüm verilerini DB'den yeniden yüklemeye zorlar. Her cart mutasyonundan sonra zorunludur — yoksa response eski önbelleklenmiş veriyi döner.

---

### Technical Decisions / Teknik Kararlar

| Decision / Karar | Rationale / Gerekçe |
|---|---|
| `unique=True` on `Cart.user_id` | One cart per user enforced at DB level / Kullanıcı başına bir sepet DB seviyesinde kısıtlanır |
| `_get_or_create_cart` helper | Auto-create logic in one place / Otomatik oluşturma mantığı tek yerde |
| Adding increments quantity | Mirrors real storefront UX / Gerçek mağaza UX'ini yansıtır |
| `quantity=0` removes item | One endpoint handles change + remove / Tek endpoint değiştirme + kaldırma işini görür |
| `cascade` on `Cart.items` | Deleting cart cleans up items / Sepet silinince item'lar temizlenir |

---

## Day 6 · 2026-04-10 — Database Online / Veritabanı Çevrimiçi

### Summary
The backend was connected to a real Microsoft SQL Server instance. The `NovaStoreDB` database was created, both Alembic migrations were applied, all 5 tables were verified, and utility scripts were added to make this process repeatable. Windows compatibility was addressed throughout.

### Özet
Backend gerçek bir Microsoft SQL Server instance'ına bağlandı. `NovaStoreDB` veritabanı oluşturuldu, her iki Alembic migration'ı uygulandı, 5 tablonun tamamı doğrulandı ve bu süreci tekrarlanabilir kılmak için utility script'ler eklendi. Windows uyumluluğu ele alındı.

---

### What We Did / Ne Yaptık

- `scripts/create_db.py` — connects to `master`, creates `NovaStoreDB` if missing; idempotent / `master`'a bağlanır, yoksa `NovaStoreDB` oluşturur; idempotent
- `scripts/create_db.sql` — equivalent T-SQL for SSMS or sqlcmd / SSMS veya sqlcmd için eşdeğer T-SQL
- `scripts/verify_tables.py` — inspects live DB with SQLAlchemy Inspector, confirms all 5 tables / SQLAlchemy Inspector ile canlı DB'yi inceler, 5 tabloyu doğrular
- `alembic upgrade head` applied — migration chain `a1b2c3d4e5f6 → b2c3d4e5f6a7` / migration zinciri uygulandı
- `config.py` — switched to `odbc_connect` URL format; removed `DB_PORT`; added `DB_TRUSTED_CONNECTION` / `odbc_connect` URL formatına geçildi

---

### Key Concepts / Temel Kavramlar

#### `autocommit=True` — Why `CREATE DATABASE` Fails in a Transaction

**EN:** In SQL Server, `CREATE DATABASE` is a DDL (Data Definition Language) statement that cannot run inside an open transaction. pyodbc opens a transaction by default on every connection. Running `CREATE DATABASE` inside that transaction raises an error. `autocommit=True` makes each statement its own self-contained transaction — the correct behavior for DDL.

**TR:** SQL Server'da `CREATE DATABASE`, açık bir transaction içinde çalıştırılamayan bir DDL (Data Definition Language) komutudur. pyodbc varsayılan olarak her bağlantıda bir transaction açar. Bu transaction içinde `CREATE DATABASE` çalıştırmak hata verir. `autocommit=True` her statement'ı kendi bağımsız transaction'ı yapar — DDL için doğru davranış.

---

#### Windows Authentication vs SQL Authentication

**EN:** SQL Server supports two auth modes. SQL Auth: username + password. The `sa` account uses this mode but is often disabled by default on SQL Server Express. Windows Auth: connects using the current Windows user's identity — no password needed. `Trusted_Connection=yes` in the connection string tells pyodbc to use Windows Auth. For local development on Windows, this is simpler and more secure.

**TR:** SQL Server iki auth modunu destekler. SQL Auth: kullanıcı adı + şifre. `sa` hesabı bu modu kullanır ama SQL Server Express'te varsayılan olarak kapalı olabilir. Windows Auth: mevcut Windows kullanıcısının kimliğiyle bağlanır — şifre gerekmez. Connection string'deki `Trusted_Connection=yes`, pyodbc'ye Windows Auth kullanmasını söyler. Windows'ta lokal geliştirme için daha basit ve güvenlidir.

---

#### Named Instance and `odbc_connect` Format / Named Instance ve `odbc_connect` Formatı

**EN:** SQL Server has two instance types. Default instance: connect with `localhost:1433`. Named instance (e.g. `localhost\SQLEXPRESS`): uses dynamic ports assigned by SQL Server Browser service. The standard `server:port` URL format doesn't work reliably with named instances. The `odbc_connect` URL format passes the full connection string directly to pyodbc, bypassing port resolution entirely.

**TR:** SQL Server iki instance türüne sahip. Varsayılan instance: `localhost:1433` ile bağlanılır. Named instance (örn. `localhost\SQLEXPRESS`): SQL Server Browser servisi tarafından atanan dinamik port kullanır. Standart `server:port` URL formatı named instance'larla güvenilir çalışmaz. `odbc_connect` URL formatı tam connection string'i doğrudan pyodbc'ye iletir, port çözümünü tamamen bypass eder.

---

#### `TrustServerCertificate=yes`

**EN:** Local SQL Server instances typically use self-signed SSL certificates. pyodbc tries to validate this certificate and fails because it wasn't signed by a trusted Certificate Authority. `TrustServerCertificate=yes` tells pyodbc: skip certificate validation, trust this connection. This is only safe for local development — in production, use a real certificate.

**TR:** Lokal SQL Server instance'ları genellikle self-signed SSL sertifika kullanır. pyodbc bu sertifikayı doğrulamaya çalışır ve başarısız olur çünkü güvenilir bir CA tarafından imzalanmamıştır. `TrustServerCertificate=yes` pyodbc'ye "sertifika doğrulamayı atla, bu bağlantıya güven" der. Bu yalnızca lokal geliştirme için güvenlidir — production'da gerçek sertifika kullanılmalı.

---

### Issues & Fixes / Sorunlar ve Çözümler

**EN:** `alembic/env.py` used `config.set_main_option("sqlalchemy.url", ...)`. The `odbc_connect` URL contains `%` characters. Python's `configparser` (used internally by Alembic) treats `%` as an interpolation syntax character and raises a `ValueError`. Fix: stop using `set_main_option` entirely. Create the engine directly from `settings.DATABASE_URL` using `create_engine()`, bypassing configparser.

**TR:** `alembic/env.py`'da `config.set_main_option("sqlalchemy.url", ...)` kullanılıyordu. `odbc_connect` URL'si `%` karakterleri içerir. Python'un `configparser`'ı (Alembic tarafından dahili olarak kullanılır) `%`'i interpolation syntax karakteri olarak görür ve `ValueError` fırlatır. Çözüm: `set_main_option`'ı tamamen kullanmayı bırak. `create_engine()` kullanarak engine'i doğrudan `settings.DATABASE_URL`'den oluştur, configparser'ı bypass et.

---

### Tables Verified / Doğrulanan Tablolar

| Table / Tablo | Migration |
|---|---|
| `users` | 0001_initial_tables |
| `categories` | 0001_initial_tables |
| `products` | 0001_initial_tables |
| `carts` | 0002_add_cart_tables |
| `cart_items` | 0002_add_cart_tables |

---

## Day 7 · 2026-04-11 — Role System & Order Module / Rol Sistemi ve Sipariş Modülü

### Summary
Two critical missing pieces were completed: role-based access control (admin / customer) and a full order system (create from cart, price snapshot, status lifecycle). Categories and products can now only be modified by admin users.

### Özet
İki kritik eksiklik tamamlandı: rol tabanlı erişim kontrolü (admin / customer) ve tam sipariş sistemi (cart'tan oluşturma, fiyat snapshot'ı, durum yaşam döngüsü). Kategoriler ve ürünler artık yalnızca admin kullanıcılar tarafından değiştirilebilir.

---

### What We Did / Ne Yaptık

- `app/models/user.py` — `role` field added (`String(20)`, `server_default="customer"`) / `role` alanı eklendi
- `app/api/v1/dependencies.py` — `get_current_admin` dependency added / `get_current_admin` dependency eklendi
- `app/api/v1/categories.py` + `products.py` — write endpoints → `get_current_admin` / write endpoint'leri güncellendi
- `app/models/order.py` — `Order`, `OrderItem`, `Address` models / modeller
- `app/schemas/order.py` — full order schema set / tam sipariş şema seti
- `app/api/v1/orders.py` — 5 endpoints / 5 endpoint
- `alembic/versions/20260411_0003_role_and_order_tables.py` — `users.role` column + `orders`, `order_items`, `addresses`

---

### Key Concepts / Temel Kavramlar

#### Role-Based Access Control (RBAC)

**EN:** RBAC answers the question: "based on who you are, what can you do?" There are two core concepts: Authentication (who are you?) and Authorization (what can you do?). In this project, `User.role` holds a simple string: `"customer"` or `"admin"`. A FastAPI dependency checks this role and raises 403 if the user doesn't have the required role. More complex systems use separate `roles` and `permissions` tables — overkill for now.

**TR:** RBAC şu soruyu yanıtlar: "kim olduğuna göre ne yapabilirsin?" İki temel kavram: Authentication (kimsin?) ve Authorization (ne yapabilirsin?). Bu projede `User.role`, basit bir string tutar: `"customer"` veya `"admin"`. Bir FastAPI dependency bu rolü kontrol eder ve kullanıcı gerekli role sahip değilse 403 fırlatır. Daha karmaşık sistemler ayrı `roles` ve `permissions` tabloları kullanır — şimdilik overkill.

---

#### Dependency Chain / Dependency Zinciri

**EN:** `get_current_admin` depends on `get_current_user`. FastAPI resolves the chain automatically:
```
Request arrives
  → get_current_user runs (validate token, find user)
  → get_current_admin runs (check role)
  → route handler runs
```
Each layer has a single responsibility. Invalid token → 401. Inactive user → 403. Wrong role → 403. Debugging is straightforward.

**TR:** `get_current_admin`, `get_current_user`'a depend eder. FastAPI zinciri otomatik çözer. Her katmanın tek sorumluluğu vardır. Geçersiz token → 401. Inactive kullanıcı → 403. Yanlış rol → 403. Hata ayıklama kolaydır.

---

#### Price Snapshot Pattern / Fiyat Snapshot Paterni

**EN:** A critical e-commerce rule: store the price at the time of purchase, not a reference to the product's current price. `OrderItem.unit_price` captures the price at order time. If the product's price changes later, existing orders are unaffected. `OrderItem.product_name` is also a snapshot — if the product is renamed, historical orders still show the original name.

**TR:** Kritik bir e-ticaret kuralı: satın alma anındaki fiyatı sakla, ürünün mevcut fiyatına referans verme. `OrderItem.unit_price`, sipariş anındaki fiyatı yakalar. Ürün fiyatı sonradan değişirse mevcut siparişler etkilenmez. `OrderItem.product_name` de bir snapshot'tır — ürün yeniden adlandırılırsa eski siparişler orijinal adı göstermeye devam eder.

---

#### Order Creation Transaction / Sipariş Oluşturma Transaction Mantığı

**EN:** `POST /orders` performs these steps inside a single transaction:
1. Validate cart is not empty → 400 if empty
2. Validate stock for all items → 400 if insufficient
3. Create `Order`, `db.flush()` to get `order.id`
4. Create `OrderItem` for each cart item (snapshot name + price)
5. Decrement `product.stock` for each item
6. Create `Address`
7. Delete all cart items (clear the cart)
8. `db.commit()`

If any step fails, `rollback()` undoes everything. Either the entire order is created cleanly, or nothing changes.

**TR:** `POST /orders` tek bir transaction içinde şu adımları gerçekleştirir: (1) cart'ın boş olmadığını doğrula, (2) tüm itemlar için stok yeterliliğini doğrula, (3) `Order` oluştur, `db.flush()` ile `order.id` al, (4) her cart item için `OrderItem` oluştur (isim + fiyat snapshot), (5) her ürünün stokunu azalt, (6) `Address` oluştur, (7) tüm cart itemlarını sil (sepeti boşalt), (8) `db.commit()`. Herhangi bir adım başarısız olursa `rollback()` her şeyi geri alır. Ya siparişin tamamı temiz oluşturulur, ya hiçbir şey değişmez.

---

#### Order Status Machine / Sipariş Durum Makinesi

**EN:** Order status shouldn't change arbitrarily. The intended flow is `pending → paid → shipped → cancelled` (from any stage). Currently validation is simple — Pydantic's `pattern` field ensures only valid status strings are accepted. In an advanced implementation, transition rules would also be enforced: e.g., you cannot go from `shipped` back to `pending`.

**TR:** Sipariş durumu keyfi değiştirilmemeli; belirli bir akış var: `pending → paid → shipped → cancelled` (herhangi aşamadan). Şu an validasyon basit — Pydantic'in `pattern` alanı yalnızca geçerli durum string'lerinin kabul edilmesini sağlar. Gelişmiş bir implementasyonda geçiş kuralları da uygulanır: örn. `shipped`'dan `pending`'e dönemezsin.

---

### Technical Decisions / Teknik Kararlar

| Decision / Karar | Rationale / Gerekçe |
|---|---|
| `role` column on `User` | Simple two-role system; separate roles table is overkill / Basit iki rol sistemi; ayrı tablo overkill |
| `server_default="customer"` | DB-level default; valid even for ORM-bypassed inserts / DB seviyesi default; ORM bypass insert'lerinde de geçerli |
| No public "promote to admin" endpoint | Security — intentional restriction / Güvenlik — bilinçli kısıtlama |
| `OrderItem.unit_price` snapshot | Future price changes don't affect past orders / Gelecekteki fiyat değişiklikleri eski siparişleri etkilemez |
| `OrderItem.product_name` snapshot | Future renames don't affect historical orders / Yeniden adlandırma eski siparişleri etkilemez |
| `db.flush()` after Order creation | Need `order.id` for FK before committing / Commit'ten önce FK için `order.id` lazım |

---

## Day 8 · 2026-04-12 — Backend Completion / Backend Tamamlama

### Summary
Accumulated backend debt was cleared: CORS middleware, pagination, product images model, seed data script, and Docker configuration. The backend is now fully production-ready before moving to the frontend.

### Özet
Biriken backend borcu kapatıldı: CORS middleware, pagination, product images modeli, seed data script ve Docker konfigürasyonu. Frontend'e geçmeden önce backend tam anlamıyla production-ready hale getirildi.

---

### What We Did / Ne Yaptık

- `app/core/config.py` — `CORS_ORIGINS: list[str]` field added / eklendi
- `app/main.py` — `CORSMiddleware` added / eklendi
- `app/api/v1/products.py` — `skip` and `limit` query params / query parametreleri
- `app/api/v1/categories.py` — `skip` and `limit` query params / query parametreleri
- `app/models/product_image.py` — `ProductImage` model: `product_id`, `url`, `alt_text`, `is_primary`
- `app/models/product.py` — `images` relationship added (`cascade="all, delete-orphan"`) / eklendi
- `app/schemas/product_image.py` — `ProductImageCreate`, `ProductImageResponse`
- `app/schemas/product.py` — `images` field added to `ProductResponse` / eklendi
- `alembic/versions/20260412_0004_add_product_images.py` — `product_images` table
- `scripts/seed.py` — 1 admin user, 5 categories, 11 products with images; idempotent
- `backend/Dockerfile` — Python 3.12-slim, ODBC Driver 17, uvicorn
- `docker-compose.yml` — `db` (MSSQL 2022) + `api` services, healthcheck, named volume

---

### Key Concepts / Temel Kavramlar

#### CORS (Cross-Origin Resource Sharing)

**EN:** Browsers block fetch/XHR requests from one origin (e.g. `http://localhost:5173`) to a different origin (e.g. `http://localhost:8000`) by default. This is the Same-Origin Policy. CORS is the mechanism by which a server declares which origins it will accept requests from. The browser first sends an `OPTIONS` preflight request; if the server responds with an appropriate `Access-Control-Allow-Origin` header, the browser proceeds with the actual request. Without this, every React/Flutter request to the backend fails.

**TR:** Tarayıcılar varsayılan olarak bir origin'den (`http://localhost:5173`) farklı bir origin'e (`http://localhost:8000`) yapılan fetch/XHR isteklerini engeller. Buna Same-Origin Policy denir. CORS, sunucunun hangi origin'lerden gelen istekleri kabul edeceğini bildirdiği mekanizmadır. Tarayıcı önce bir `OPTIONS` preflight isteği gönderir; sunucu uygun `Access-Control-Allow-Origin` header'ıyla yanıt verirse tarayıcı gerçek isteği gönderir. Bu olmadan her React/Flutter isteği backend'e ulaşamaz.

---

#### Pagination — Offset vs Cursor / Sayfalama — Offset vs Cursor

**EN:** There are two main pagination approaches. *Offset pagination* (`skip`/`limit`): `SELECT ... OFFSET 20 ROWS FETCH NEXT 20 ROWS ONLY`. Simple and intuitive. Downside: on large offsets it slows down, and if records are added/deleted between page loads, items can shift across pages. *Cursor pagination*: references the last seen record's ID. Consistent even with real-time insertions — preferred for social media feeds. For an e-commerce product list, offset pagination is sufficient and easy to understand.

**TR:** İki temel sayfalama yöntemi var. *Offset pagination* (`skip`/`limit`): `SELECT ... OFFSET 20 ROWS FETCH NEXT 20 ROWS ONLY`. Basit ve anlaşılır. Dezavantajı: büyük offset'lerde yavaşlar; sayfa yüklemeleri arasında kayıt eklenip silinirse item'lar sayfalar arasında kayabilir. *Cursor pagination*: son görülen kaydın ID'sini referans alır. Gerçek zamanlı ekleme işlemlerinde bile tutarlıdır — sosyal medya akışlarında tercih edilir. E-ticaret ürün listesi için offset pagination yeterli ve anlaşılırdır.

---

#### Why a `limit` Upper Bound Matters / Neden `limit` Üst Sınırı Önemli?

**EN:** Without an upper bound on `limit`, a client can send `?limit=999999` and pull the entire table in one request. This creates a massive load on the DB and network. Setting `le=100` in the Query parameter definition means the server will reject any limit above 100 with a 422 validation error — no extra code needed.

**TR:** `limit` üzerinde üst sınır olmadan bir client `?limit=999999` gönderip tüm tabloyu tek bir istekte çekebilir. Bu DB ve network üzerinde ciddi yük yaratır. Query parametre tanımında `le=100` ayarlamak, sunucunun 100'ün üzerindeki herhangi bir limit'i 422 validation hatası ile reddedeceği anlamına gelir — ekstra kod gerekmez.

---

#### Product Images — URL-Based vs File Upload / URL Tabanlı vs Dosya Yükleme

**EN:** A real file upload endpoint (multipart/form-data, file storage) requires significant infrastructure: cloud storage (S3), CDN, thumbnail generation, file type validation. For a portfolio project, this is overkill. URL-based approach: the admin enters a URL when creating a product; we store only the URL. Simple, functional, and demonstrable in the admin panel. Later, if real uploads are needed, the `url` field can be repurposed as a storage path.

**TR:** Gerçek bir dosya yükleme endpoint'i (multipart/form-data, dosya depolama) ciddi altyapı gerektirir: cloud storage (S3), CDN, thumbnail oluşturma, dosya tipi doğrulama. Bir portfolio projesi için bu aşırıya kaçmaktır. URL tabanlı yaklaşım: admin ürün eklerken bir URL girer; biz yalnızca URL'yi saklarız. Basit, işlevsel ve admin panelde gösterilebilir. Sonradan gerçek upload gerekirse `url` alanı depolama yolu olarak yeniden kullanılabilir.

---

#### Idempotent Seed Script / Idempotent Seed Script

**EN:** Running `py scripts/seed.py` twice should not create duplicate records. Before every insert, we check if the record already exists (by email for users, by slug for categories, by name for products). If it does, we skip it. This "idempotent" behavior means: no matter how many times you run it, the result is the same. Essential for developer workflows where the seed is run repeatedly during setup.

**TR:** `py scripts/seed.py`'ı iki kez çalıştırmak duplicate kayıt oluşturmamalı. Her insert'ten önce kaydın zaten var olup olmadığını kontrol ediyoruz (kullanıcılar için email, kategoriler için slug, ürünler için isim ile). Varsa atlıyoruz. Bu "idempotent" davranış şu anlama gelir: kaç kez çalıştırırsan çalıştır, sonuç aynı. Kurulum sırasında seed'in defalarca çalıştırıldığı geliştirici iş akışları için gereklidir.

---

#### Docker Healthcheck

**EN:** When the MSSQL container starts, the SQL Server engine takes several seconds to fully initialize. If the `api` service starts immediately without waiting, it tries to connect to the DB before it's ready and fails. The `healthcheck` runs `sqlcmd -Q "SELECT 1"` every 10 seconds. `depends_on: condition: service_healthy` ensures the `api` service only starts once the DB is confirmed ready.

**TR:** MSSQL container'ı başladığında SQL Server engine'in tamamen başlatılması birkaç saniye alır. `api` servisi beklemeden hemen başlarsa, hazır olmadan önce DB'ye bağlanmaya çalışır ve başarısız olur. `healthcheck`, her 10 saniyede bir `sqlcmd -Q "SELECT 1"` çalıştırır. `depends_on: condition: service_healthy`, `api` servisinin yalnızca DB'nin hazır olduğu doğrulandıktan sonra başlamasını sağlar.

---

### Technical Decisions / Teknik Kararlar

| Decision / Karar | Rationale / Gerekçe |
|---|---|
| `CORS_ORIGINS` in settings | Origin list is environment-specific; production uses real domains / Origin listesi ortama özel; production gerçek domainler kullanır |
| `limit` max 100 (products) | Prevents unbounded queries / Sınırsız sorguları önler |
| `limit` default 100 (categories) | Category count is small; usually fine to return all / Kategori sayısı azdır, genellikle hepsini döndürmek sorun değil |
| Product images URL-based | Avoids upload infrastructure complexity / Upload altyapısı karmaşıklığından kaçınır |
| `cascade` on `Product.images` | Deleting a product cleans up its images / Ürün silinince görselleri temizlenir |
| Seed script idempotent | Can be run repeatedly during development / Geliştirme sırasında tekrar tekrar çalıştırılabilir |
| Docker Compose healthcheck | API only starts after DB is truly ready / API yalnızca DB gerçekten hazır olduktan sonra başlar |

---

---

## Day 9 · 2026-04-13 — React Frontend Setup / React Frontend Kurulumu

### Summary
The backend is complete. Today we bootstrapped the React web frontend: Vite + TypeScript + Tailwind CSS v4, folder architecture, TypeScript type layer, axios HTTP client with auth interceptors, React Context–based auth state, admin layout skeleton, login page, and a dashboard shell. By end of day the admin panel loads, authenticates against the live FastAPI backend, and renders the protected dashboard.

### Özet
Backend tamam. Bugün React web frontend'ini ayağa kaldırdık: Vite + TypeScript + Tailwind CSS v4, klasör mimarisi, TypeScript tip katmanı, auth interceptor'lü axios HTTP istemcisi, React Context tabanlı auth state'i, admin layout iskeletini, login sayfasını ve bir dashboard kabuğunu. Gün sonunda admin paneli açılıyor, canlı FastAPI backend'e karşı kimlik doğruluyor ve korumalı dashboard'u render ediyor.

---

### What We Did / Ne Yaptık

- `frontend/` — scaffolded with `npm create vite@latest` (React + TypeScript template) / `npm create vite@latest` ile oluşturuldu (React + TypeScript şablonu)
- Tailwind CSS v4 installed with `@tailwindcss/vite` plugin (`init` command removed in v4) / v4'te `init` komutu kaldırıldı; `@tailwindcss/vite` plugin ile kuruldu
- `vite.config.ts` — registered `tailwindcss()` as Vite plugin / `tailwindcss()` Vite plugin olarak kaydedildi
- `src/index.css` — `@import "tailwindcss"` (v4 syntax, replaces `@tailwind base/components/utilities`) / v4 sözdizimi, eski üç direktifi değiştirir
- `src/types/index.ts` — TypeScript interfaces for all entities: `User`, `TokenResponse`, `Category`, `Product`, `ProductImage`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Address`, `PaginationParams`
- `src/api/client.ts` — axios instance with `VITE_API_URL` base, request interceptor (attach Bearer token), response interceptor (401 → redirect to `/admin/login`)
- `src/api/auth.ts` — `login()` and `getMe()` functions
- `src/context/AuthContext.tsx` — `AuthProvider` with `user`, `token`, `isLoading`, `signIn`, `signOut`; persists token in `localStorage`; restores session on page refresh
- `src/components/ProtectedRoute.tsx` — redirects to `/admin/login` if unauthenticated or if role ≠ `admin`
- `src/components/layout/Sidebar.tsx` — dark sidebar, NavLink items (Dashboard, Products, Categories, Orders), user email display, Sign Out button
- `src/components/layout/AdminLayout.tsx` — `<Sidebar />` + topbar + `<Outlet />`
- `src/pages/auth/Login.tsx` — email/password form with error states (401 → "Invalid email or password", 403 → "Your account is inactive")
- `src/pages/admin/Dashboard.tsx` — 4-column stat card grid (placeholders) + recent orders placeholder
- `src/App.tsx` — `BrowserRouter` + `AuthProvider` + `Routes`: `/admin/login` (public), `/admin` (protected, `requireAdmin`) with nested `<Dashboard />`, wildcard `*` redirect to `/admin`
- `frontend/.env` — `VITE_API_URL=http://localhost:8000/api/v1`

---

### Key Concepts / Temel Kavramlar

#### Vite vs Create React App
**EN:** Vite is a build tool that uses native ES modules in the browser during development — no bundling step, near-instant cold start, hot module replacement in milliseconds. Create React App (CRA) bundles everything with Webpack on every change. Vite's dev server is 10–100× faster for large projects.

**TR:** Vite, geliştirme sırasında tarayıcıda native ES modüllerini kullanan bir build aracıdır — bundle adımı yoktur, neredeyse anında soğuk başlangıç, milisaniyelerle HMR. Create React App (CRA) her değişiklikte Webpack ile her şeyi bundle eder. Vite'ın dev sunucusu büyük projelerde 10–100× daha hızlıdır.

---

#### Tailwind CSS v4 — What Changed / Ne Değişti
**EN:** Tailwind v4 dropped the `tailwind.config.js` file and the `tailwind init` CLI command. Instead, you install `@tailwindcss/vite` and import Tailwind with a single CSS line: `@import "tailwindcss"`. This replaces the three directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`). The utility classes are the same — only the configuration mechanism changed.

**TR:** Tailwind v4, `tailwind.config.js` dosyasını ve `tailwind init` CLI komutunu kaldırdı. Bunun yerine `@tailwindcss/vite` yükleniyor ve Tailwind tek bir CSS satırıyla import ediliyor: `@import "tailwindcss"`. Bu, üç direktifin (`@tailwind base`, `@tailwind components`, `@tailwind utilities`) yerini alıyor. Utility sınıfları aynı — yalnızca konfigürasyon mekanizması değişti.

---

#### Axios Interceptors / Axios Interceptor'ları
**EN:** An interceptor is a function that runs on every request or response before your code handles it. The request interceptor reads the token from `localStorage` and injects it into every outgoing request's `Authorization` header — so you don't have to pass headers manually in every API call. The response interceptor catches 401 errors globally and redirects to the login page, preventing unauthorized content from rendering.

**TR:** Interceptor, kodunuz işlemeden önce her istek veya yanıtta çalışan bir fonksiyondur. İstek interceptor'ı token'ı `localStorage`'dan okur ve her giden isteğin `Authorization` header'ına enjekte eder — böylece her API çağrısında header'ları manuel geçmek zorunda kalmazsın. Yanıt interceptor'ı 401 hatalarını global olarak yakalar ve login sayfasına yönlendirir; yetkisiz içeriğin render edilmesini önler.

---

#### React Context API
**EN:** Context is React's built-in state-sharing mechanism. Without it, you'd pass `user` and `signOut` as props down through every component that needs them (`prop drilling`). `AuthProvider` wraps the whole app, stores auth state, and any component can call `useAuth()` to access it directly — no prop chains.

**TR:** Context, React'in yerleşik state paylaşım mekanizmasıdır. Olmadan, `user` ve `signOut`'u her ihtiyaç duyan bileşene prop olarak zincirden geçirmek zorunda kalırsın (`prop drilling`). `AuthProvider` tüm uygulamayı sarar, auth state'ini tutar; herhangi bir bileşen doğrudan `useAuth()` çağırarak erişebilir — prop zinciri gerekmez.

---

#### React Router Nested Routes / İç İçe Route'lar
**EN:** In React Router v6, a parent route that renders `<Outlet />` acts as a layout host. Child routes render into that outlet. Here, `/admin` renders `<AdminLayout />` (sidebar + topbar), and the `index` child renders `<Dashboard />` inside the layout's `<Outlet />`. Adding more admin pages later is a one-liner: `<Route path="products" element={<Products />} />`.

**TR:** React Router v6'da `<Outlet />` render eden bir üst route, layout sunucusu gibi davranır. Alt route'lar bu outlet'e render olur. Burada `/admin`, `<AdminLayout />`'ı (sidebar + topbar) render eder; `index` alt route'u ise layout'un `<Outlet />`'ına `<Dashboard />`'ı render eder. İleride daha fazla admin sayfası eklemek tek satırdır: `<Route path="products" element={<Products />} />`.

---

#### ProtectedRoute Pattern
**EN:** A `ProtectedRoute` component wraps any route that requires authentication. It reads auth state from context — if loading, shows a spinner; if no user, redirects to login; if `requireAdmin` is set and role ≠ `admin`, also redirects. This centralizes auth enforcement: you don't scatter `if (!user) navigate('/login')` calls across every page.

**TR:** `ProtectedRoute` bileşeni, kimlik doğrulaması gerektiren tüm route'ları sarar. Context'ten auth state'ini okur — yükleniyorsa spinner gösterir; kullanıcı yoksa login'e yönlendirir; `requireAdmin` ayarlıysa ve rol `admin` değilse yine yönlendirir. Bu, auth zorunluluğunu merkezileştirir: her sayfaya `if (!user) navigate('/login')` çağrısı serpiştirmek zorunda kalmazsın.

---

### Technical Decisions / Teknik Kararlar

| Decision / Karar | Rationale / Gerekçe |
|---|---|
| `@tailwindcss/vite` (not PostCSS) | Native Vite plugin, faster dev builds / Native Vite plugin, daha hızlı geliştirme build'i |
| `localStorage` for token | Simple persistence across page refreshes; sufficient for admin-only tool / Sayfa yenilemelerinde basit kalıcılık; admin paneli için yeterli |
| Axios interceptor for auth | Centralized header injection — no per-call boilerplate / Merkezi header enjeksiyonu — her çağrıda tekrar yok |
| Context API (not Redux/Zustand) | Auth state is simple; global state lib is overkill / Auth state basittir; global state kütüphanesi aşırıya kaçar |
| `requireAdmin` flag on ProtectedRoute | Same component handles both "must be logged in" and "must be admin" cases / Aynı bileşen her iki durumu da yönetir |
| Nested routes with `<Outlet />` | Admin layout (sidebar+header) shared across all admin pages without repetition / Admin layout tüm admin sayfalarında tekrar etmeden paylaşılır |
| `VITE_` prefix on env vars | Vite only exposes env vars prefixed with `VITE_` to the browser bundle (security) / Vite yalnızca `VITE_` önekli değişkenleri tarayıcıya açar (güvenlik) |

---

### Issues & Fixes / Sorunlar ve Çözümler

**EN:** `npx tailwindcss init -p` threw an error because Tailwind v4 removed the `init` command entirely. Fix: install `@tailwindcss/vite` and use `@import "tailwindcss"` in `index.css` — no config file needed.

**TR:** `npx tailwindcss init -p` hata verdi çünkü Tailwind v4, `init` komutunu tamamen kaldırdı. Çözüm: `@tailwindcss/vite` kuruldu ve `index.css`'e `@import "tailwindcss"` eklendi — konfigürasyon dosyasına gerek yok.

---

---

## Day 10 · 2026-04-15 — Admin Panel (Figma) / Admin Panel (Figma Tasarımı)

### Summary
With the backend complete and the auth layer in place, today we opened the Figma file directly and coded the entire admin panel against the design. We read the Design System page (color tokens, typography), then pulled Dashboard, Products, and Orders frames one by one and converted them into fully functional React pages connected to the live API.

### Özet
Backend tamamlanmış ve auth katmanı kuruluyken, bugün Figma dosyasını doğrudan açtık ve admin panelin tamamını tasarıma bakarak kodladık. Design System sayfasından renk token'larını ve tipografiyi okuduk, ardından Dashboard, Products ve Orders frame'lerini tek tek çekip canlı API'ya bağlı tam işlevli React sayfalarına dönüştürdük.

---

### What We Did / Ne Yaptık

- Connected Figma MCP — read all 11 pages + Design System tokens (colors, typography) directly from file / Figma MCP bağlandı — tüm 11 sayfa + Design System token'ları (renkler, tipografi) doğrudan dosyadan okundu
- `src/index.css` — added CSS custom properties for all design tokens + Inter font via Google Fonts / Tüm design token'lar için CSS değişkenleri + Google Fonts üzerinden Inter fontu eklendi
- `lucide-react` installed for icons (Dashboard, Package, ShoppingCart, Users, LogOut) / İkonlar için lucide-react kuruldu
- `Sidebar.tsx` — rebuilt from Figma: dark `#1a1a24` bg, `#0071e3` active item with 3px white left bar, 48px nav items / Figma'dan yeniden yazıldı: koyu arka plan, mavi aktif item, 3px beyaz sol çizgi
- `AdminLayout.tsx` — rebuilt: sticky white header (72px), page title from route, avatar circle, content offset for sidebar / Yeniden yazıldı: yapışkan beyaz header, route'dan sayfa başlığı, avatar dairesi
- `src/api/products.ts` — CRUD endpoints (getProducts, createProduct, updateProduct, deleteProduct) / CRUD endpoint'leri
- `src/api/orders.ts` — getAdminOrders, getOrder, updateOrderStatus / Admin sipariş endpoint'leri
- `src/api/categories.ts` — getCategories, createCategory, updateCategory, deleteCategory / Kategori endpoint'leri
- `Dashboard.tsx` — 4 stat cards with colored left-accent bars, 12-month bar chart (opacity gradient), recent orders table wired to API / 4 stat kartı (renkli sol çizgi), 12 aylık bar chart (opaklık gradyanı), API'ya bağlı son siparişler tablosu
- `Products.tsx` — full product table (image, name, category, price, stock, status badge, edit/delete), search input, category filter tabs, pagination, Add/Edit modal (all fields, category dropdown) / Tam ürün tablosu, arama, kategori filtreleri, pagination, Add/Edit modal
- `Orders.tsx` — status filter pills (All, Pending, Paid, Shipped, Delivered, Cancelled), search, order table with customer avatar, items preview, status badge, slide-in Order Detail panel (items, totals, status update dropdown) / Durum filtre pill'leri, arama, sipariş tablosu, slayt detay paneli
- `App.tsx` — added `/admin/products` and `/admin/orders` routes / Yeni route'lar eklendi

---

### Key Concepts / Temel Kavramlar

#### Figma MCP — Design-to-Code Workflow
**EN:** The Figma MCP (Model Context Protocol) plugin connects Claude directly to a Figma file. Instead of looking at screenshots and guessing values, we call `get_design_context` on a specific node and receive exact pixel values, hex colors, font weights, and even generated React+Tailwind code as a starting point. The workflow: read the Design System page first (global tokens), then pull each screen by its node ID.

**TR:** Figma MCP plugin'i, Claude'u doğrudan bir Figma dosyasına bağlar. Ekran görüntülerine bakıp değerleri tahmin etmek yerine, belirli bir node üzerinde `get_design_context` çağırırız ve tam piksel değerleri, hex renkler, font ağırlıkları ve başlangıç noktası olarak oluşturulmuş React+Tailwind kodu alırız. İş akışı: önce Design System sayfasını oku (global token'lar), ardından her ekranı node ID'siyle çek.

---

#### CSS Custom Properties as Design Tokens
**EN:** Instead of hardcoding `#0071e3` across 20 files, we define `--color-primary: #0071e3` once in `:root` and use `var(--color-primary)` everywhere. When the brand color changes, you update one line. This is the CSS equivalent of a design system token — the same value drives both the Figma component and the React component.

**TR:** `#0071e3` değerini 20 dosyaya yazmak yerine `:root`'ta bir kez `--color-primary: #0071e3` tanımlıyoruz ve her yerde `var(--color-primary)` kullanıyoruz. Marka rengi değiştiğinde bir satırı güncelliyorsunuz. Bu, design system token'ının CSS karşılığıdır — aynı değer hem Figma component'ini hem de React component'ini yönlendirir.

---

#### Inline Styles vs Tailwind — When to Use Which
**EN:** Tailwind utility classes work best for responsive, component-level styling. But when values come directly from a design spec (exact pixel measurements, CSS variables, dynamic inline values), inline styles are cleaner and more maintainable. In this admin panel we use inline styles for layout and design-token-driven values, keeping the code a direct translation of Figma's output.

**TR:** Tailwind utility sınıfları responsive, component düzeyinde stillendirme için en iyi sonucu verir. Ancak değerler doğrudan bir design spec'ten geldiğinde (tam piksel ölçümleri, CSS değişkenleri, dinamik inline değerler), inline stiller daha temiz ve sürdürülebilir olur. Bu admin panelinde layout ve design-token destekli değerler için inline stiller kullanarak kodu Figma çıktısının doğrudan bir çevirisine dönüştürdük.

---

#### Slide-in Detail Panel Pattern
**EN:** Rather than a full-page route for each order, we use a slide-in panel: a fixed `position: fixed` element that overlays the right side of the screen. An invisible overlay `div` behind it catches outside clicks to close. This is the standard admin UX pattern — fast, no navigation, context preserved.

**TR:** Her sipariş için tam sayfa route kullanmak yerine slayt-giriş panel kullanıyoruz: ekranın sağ tarafını kaplayan `position: fixed` bir element. Arkasındaki görünmez overlay `div`, dışarı tıklamaları yakalayarak paneli kapatır. Bu standart admin UX kalıbıdır — hızlı, navigasyon yok, bağlam korunur.

---

### Technical Decisions / Teknik Kararlar

| Decision / Karar | Rationale / Gerekçe |
|---|---|
| CSS custom properties for tokens | Single source of truth; matches Figma variables / Tek kaynak; Figma değişkenleriyle uyumlu |
| `lucide-react` for icons | Lightweight, tree-shakeable, close match to tabler icons used in Figma / Hafif, tree-shakeable, Figma'daki tabler ikonlarına yakın |
| Inline styles over Tailwind | Exact Figma values (px, CSS vars) map naturally to inline styles / Tam Figma değerleri inline style'a doğal olarak dönüşür |
| Slide-in detail panel (Orders) | Faster UX than full-page navigation for admin workflows / Admin iş akışları için tam sayfa navigasyondan daha hızlı UX |
| `useCallback` + `useEffect` for data fetching | Prevents stale closure issues when filters/pagination change / Filtreler/pagination değiştiğinde stale closure sorunlarını önler |
| Confirm step before delete | Prevents accidental product deletion / Kazara ürün silinmesini önler |

---

---

## Day 11 · 2026-04-15 — Customer-Facing Web / Müşteri Web Sitesi

### Summary
With the admin panel finished, today we turned to the customer side of the store. We read the Shop page directly from Figma (node 237:2), extracted the product card pattern, sidebar filter layout, pagination component, and footer structure. The Login–Register Figma page was empty, so those pages were built from the established design system tokens. The result is a complete customer-facing web experience: Homepage, Shop, Login, Register — all sharing a dark Navbar and Footer.

### Özet
Admin paneli tamamlandıktan sonra bugün müşteri tarafına geçtik. Shop sayfasını doğrudan Figma'dan okuduk (node 237:2): ürün kartı desenini, sidebar filtre düzenini, pagination bileşenini ve footer yapısını çıkardık. Login–Register Figma sayfası boştu, bu yüzden bu sayfalar yerleşik design system token'larından oluşturuldu. Sonuç: Ana Sayfa, Mağaza, Giriş, Kayıt — tümü koyu Navbar ve Footer ile paylaşılan tam bir müşteri deneyimi.

---

### What We Did / Ne Yaptık

- Read Shop page from Figma (node `237:2`) — extracted product card anatomy, sidebar filter sections, sort bar, pagination design / Figma'dan Shop sayfası okundu — ürün kartı anatomisi, sidebar filtre bölümleri, sıralama çubuğu, pagination tasarımı çıkarıldı
- `Navbar.tsx` — sticky dark `#0f0f13` navbar: "NovaStore" logo (blue+white), centered nav links (active=white/inactive=gray), right icons (Search, Favorites, Cart, User menu with sign-out) / Yapışkan koyu navbar: logo, ortalanmış nav, sağ ikonlar + kullanıcı menüsü
- `Footer.tsx` — dark `#0f0f13` footer: brand tagline, 3-column links (Shop / Support / Company), copyright bar / Koyu footer: marka, 3 sütun link, telif hakkı çubuğu
- `CustomerLayout.tsx` — wrapper: `<Navbar />` + `<Outlet />` + `<Footer />` with flex-column layout / `Navbar + Outlet + Footer` sarmalayıcı
- `HomePage.tsx` — full homepage: hero slider (dark overlay on hero image, 64px headline, two CTA buttons), category icon bar (7 categories with lucide icons), deals banner (blue `#0071e3`, two deal cards), Popular Products grid (live API `GET /products`), New Arrivals grid (live API), features strip (Truck / RefreshCw / ShieldCheck / Headphones icons), brands row, newsletter section / Tam ana sayfa: hero, kategori ikonu çubuğu, kampanya bandı, ürün grid'leri (canlı API), özellikler şeridi, markalar, bülten
- `ShopPage.tsx` — sidebar filters (Category radio buttons from API, Price Range display, Brand list, Rating list) + 4-column product grid (live API `GET /products` with `category_id` + `search` params) + sort dropdown (client-side price/newest sort) + breadcrumb + pagination + empty state / Sidebar filtreleri (API'dan kategori) + 4 sütun ürün grid'i (canlı API) + sıralama dropdown + breadcrumb + pagination + boş durum
- `CustomerLogin.tsx` — centered card form: email + password, error banner, calls `POST /auth/login` then `signIn(token)`, redirects to `/` on success / Ortalanmış kart formu: giriş, hata banner'ı, token ile signIn
- `Register.tsx` — centered card form: email + password + confirm, client-side password validation, calls `POST /auth/register`, redirects to `/` on success / Kayıt formu: şifre doğrulama, API kaydı
- `api/cart.ts` — `getCart`, `addToCart`, `updateCartItem`, `removeFromCart` functions wired to `GET/POST/PUT/DELETE /cart` / Sepet API fonksiyonları
- `api/client.ts` — fixed 401 redirect: checks `window.location.pathname.startsWith('/admin')` to route to `/admin/login` vs `/login` / 401 yönlendirmesi düzeltildi: admin ve müşteri route'ları ayrı login sayfalarına yönlendirildi
- `App.tsx` — added customer routes: `/` (HomePage), `/shop` (ShopPage), `/login` (CustomerLogin), `/register` (Register), all wrapped in `CustomerLayout` / Müşteri route'ları eklendi

---

### Key Concepts / Temel Kavramlar

#### Shared Layout with React Router's `<Outlet />`
**EN:** React Router's nested route pattern lets us share a persistent layout (Navbar + Footer) across multiple pages without re-rendering it. The parent route renders `<CustomerLayout />` which contains `<Outlet />` — a placeholder that React Router fills with the matched child route's component. This means the Navbar and Footer mount once and stay mounted as the user navigates between Home, Shop, Login, etc.

**TR:** React Router'ın iç içe route deseni, yeniden render etmeden birden fazla sayfada kalıcı bir layout (Navbar + Footer) paylaşmamıza olanak tanır. Üst route `<CustomerLayout />` render eder; bu layout `<Outlet />` içerir — React Router'ın eşleşen alt route'un bileşeniyle doldurduğu bir yer tutucu. Bu sayede Navbar ve Footer bir kez mount edilir ve kullanıcı Ana Sayfa, Mağaza, Giriş sayfaları arasında gezinirken mounted kalır.

---

#### Role-Aware 401 Redirect
**EN:** The Axios response interceptor previously always redirected to `/admin/login` on a 401. With two separate login pages (`/admin/login` and `/login`), we need context-aware redirection. The fix: check `window.location.pathname.startsWith('/admin')` — admin routes get `/admin/login`, customer routes get `/login`. A more robust solution would use React Router's navigation state, but the window check is simple and reliable for this architecture.

**TR:** Axios response interceptor'ı daha önce her zaman 401'de `/admin/login`'e yönlendiriyordu. İki ayrı login sayfasıyla (`/admin/login` ve `/login`) bağlama duyarlı yönlendirmeye ihtiyacımız var. Çözüm: `window.location.pathname.startsWith('/admin')` kontrolü — admin route'ları `/admin/login`'e, müşteri route'ları `/login`'e gider. Daha sağlam bir çözüm React Router navigation state kullanır, ama bu mimari için window kontrolü basit ve güvenilirdir.

---

#### Product Card: Computed Badges vs. Static Figma Values
**EN:** Figma showed fixed badges (NEW, BEST SELLER, SALE) on static product cards. In the real app, badges are computed at render time: a product is NEW if it was created within the last 14 days, HOT if stock ≤ 5, SALE if price < $100. This keeps the UI dynamic without requiring a separate badge field in the database. Future iterations can add a real `badge` column to the product model.

**TR:** Figma, statik ürün kartlarında sabit rozetler gösterdi (YENİ, EN ÇOK SATAN, İNDİRİM). Gerçek uygulamada rozetler render sırasında hesaplanır: son 14 günde oluşturulan ürünler YENİ, stok ≤ 5 olanlar HOT, fiyat < $100 olanlar SALE olur. Bu, veritabanına ayrı bir rozet alanı eklemeden UI'yi dinamik tutar. Gelecekte ürün modeline gerçek bir `badge` sütunu eklenebilir.

---

#### Sticky Sidebar with `position: sticky`
**EN:** The filter sidebar uses `position: sticky` with `top: 132px` (72px navbar + 52px sort bar + 8px gap). This means the sidebar scrolls with the page until it reaches that offset, then stays fixed — the content column scrolls past it. The trick: the sidebar must be a direct child of a flex/grid container that is taller than the sidebar. If the sidebar is wrapped in an extra `div`, sticky stops working.

**TR:** Filtre sidebar'ı `position: sticky` ile `top: 132px` kullanır (72px navbar + 52px sıralama çubuğu + 8px boşluk). Sidebar sayfayla birlikte kayar, bu offset'e ulaşınca sabit kalır — içerik sütunu onun yanından geçer. Püf nokta: sidebar, kendisinden daha uzun bir flex/grid container'ın doğrudan çocuğu olmalıdır. Fazladan bir `div` içine sarılırsa sticky çalışmayı durdurur.

---

---

## Day 12 · 2026-04-16 — Product Detail & Cart / Ürün Detayı ve Sepet

### Summary
With the customer layout and main listing pages done, today we tackled the two most complex customer pages: Product Detail and Cart. Both pages were read directly from Figma (nodes 266:19 and 267:19). Product Detail features a full image gallery with thumbnail strip, color/storage chip selectors, a quantity stepper, Add to Cart wired to the real API, a tab bar (Description / Specifications / Reviews), a specs table, and a "You Might Also Like" section from the same category. The Cart page handles authenticated and unauthenticated states, live cart from API, quantity updates, item removal, a promo code mechanism, and a complete order summary with tax calculation.

### Özet
Müşteri layout'u ve listeleme sayfaları tamamlandıktan sonra bugün iki en karmaşık müşteri sayfasını ele aldık: Ürün Detayı ve Sepet. Her iki sayfa da doğrudan Figma'dan okundu (node 266:19 ve 267:19). Ürün Detayı; thumbnail şeridiyle tam görsel galerisi, renk/depolama chip seçicileri, miktar seçici, gerçek API'ya bağlı Add to Cart, sekme çubuğu (Açıklama / Teknik Özellikler / Yorumlar), özellik tablosu ve aynı kategoriden "Bunları da Beğenebilirsiniz" bölümü içeriyor. Sepet sayfası; giriş yapılmış/yapılmamış durumları, API'dan canlı sepet, miktar güncellemeleri, ürün kaldırma, promosyon kodu mekanizması ve vergi hesaplamalı eksiksiz sipariş özeti yönetiyor.

---

### What We Did / Ne Yaptık

- Read Figma nodes `266:19` (Product Detail, 1440×2420) and `267:19` (Cart, 1440×1424) using `get_design_context` / `get_design_context` ile iki Figma node'u okundu
- `ProductDetailPage.tsx` (`/product/:id`):
  - Fetches product by `useParams` → `GET /products/:id` / `useParams` ile ID alınıp ürün çekildi
  - Main image + thumbnail strip (max 4 thumbnails, selected = blue border) / Ana görsel + thumbnail şeridi
  - Color selector chips (Natural/Blue/White/Black Titanium — UI only) / Renk seçici chipler (sadece UI)
  - Storage selector chips (128GB/256GB/512GB/1TB — UI only) / Depolama seçici chipler
  - Quantity stepper (min 1, max = stock) / Miktar seçici
  - Add to Cart → `POST /cart/add` with product_id + quantity; shows success/error feedback / Sepete ekle → API çağrısı; başarı/hata geri bildirimi
  - Add to Wishlist button (outline, Heart icon) / İstek listesine ekle butonu
  - Delivery info strip (Free Delivery / Easy Returns / Secure Payment) / Teslimat bilgisi
  - Tab bar: Description (product.description) | Specifications (dynamic spec table) | Reviews (placeholder) / Sekme çubuğu
  - "You Might Also Like": fetches `GET /products?category_id=X&limit=5`, excludes current product / "Bunları da Beğenebilirsiniz": aynı kategoriden ürünler
  - Not Found state (product 404) / Bulunamadı durumu
  - Skeleton loading state / Skeleton yükleme durumu
- `CartPage.tsx` (`/cart`):
  - Unauthenticated state: shows sign-in prompt with link to `/login` / Giriş yapılmamış durum: giriş yönlendirmesi
  - Authenticated: fetches `GET /cart` on mount / Giriş yapılmış: mount'ta sepet çekildi
  - Cart item rows: thumbnail, category + name + price, quantity stepper (− qty +), Remove button → `DELETE /cart/remove` / Sepet öğe satırları
  - Quantity change → `PUT /cart/update` with optimistic opacity feedback / Miktar değişimi → PUT isteği, optimistik opaklık geri bildirimi
  - Promo code input (NOVA10 = 10% off client-side) / Promosyon kodu (NOVA10 = %10 indirim)
  - Order Summary card: subtotal, shipping (Free in green), tax 8%, promo discount, total / Sipariş özeti kartı
  - Empty state (cart icon + CTA) / Boş sepet durumu
  - Sticky order summary (position: sticky, top: 132px) / Yapışkan sipariş özeti
- `HomePage.tsx` + `ShopPage.tsx` — ProductCard `onClick` now navigates to `/product/:id` / Ürün kartı tıklamaları `/product/:id`'ye yönlendirecek şekilde güncellendi
- `App.tsx` — added `/product/:id` and `/cart` routes under CustomerLayout / İki yeni route eklendi

---

### Key Concepts / Temel Kavramlar

#### `useParams` — Dynamic Routes
**EN:** React Router's `useParams` hook reads URL parameters from the matched route pattern. When the route is `/product/:id`, calling `useParams<{ id: string }>()` inside the component gives you `{ id: "42" }`. Always parse to a number with `Number(id)` before sending to the API, and handle the NaN case.

**TR:** React Router'ın `useParams` hook'u, eşleşen route deseninden URL parametrelerini okur. Route `/product/:id` olduğunda, bileşen içinde `useParams<{ id: string }>()` çağırmak `{ id: "42" }` verir. API'ya göndermeden önce `Number(id)` ile sayıya çevirin ve NaN durumunu mutlaka ele alın.

---

#### Optimistic UI — Cart Quantity Updates
**EN:** When the user clicks − or + on a cart item, we don't wait for the API to confirm before showing the change. Instead, we immediately set `opacity: 0.5` on the updating item (visual feedback that something is happening), fire the API call, then update the cart state with the server's response. If the API call fails, the UI rolls back to the server state. This pattern is called "optimistic update" — you assume success and correct only if wrong.

**TR:** Kullanıcı sepet öğesinde − veya + tıkladığında değişikliği göstermek için API onayını beklemiyoruz. Bunun yerine güncellenen öğeye hemen `opacity: 0.5` uyguluyoruz (bir şeyin olduğuna dair görsel geri bildirim), API çağrısını başlatıyoruz, ardından sepet durumunu sunucunun yanıtıyla güncelliyoruz. API çağrısı başarısız olursa UI sunucu durumuna geri dönüyor. Bu desene "iyimser güncelleme" denir — başarıyı varsayın, yalnızca yanlışsa düzeltin.

---

#### Authenticated vs. Guest State
**EN:** The Cart page checks `useAuth()` to determine if the user is logged in before making any API calls. An unauthenticated visitor sees a "Sign in to view your cart" card with a link to `/login` — no API calls are made, no errors thrown. This is important because `GET /cart` returns 401 for unauthenticated requests, and the global Axios interceptor would redirect to `/login` anyway, creating a flash of redirect. Checking auth state upfront is a smoother UX.

**TR:** Sepet sayfası, herhangi bir API çağrısı yapmadan önce kullanıcının giriş yapıp yapmadığını belirlemek için `useAuth()` kullanır. Giriş yapmamış bir ziyaretçi, `/login`'e bağlantıyla birlikte "Sepetinizi görüntülemek için giriş yapın" kartı görür — API çağrısı yapılmaz, hata oluşmaz. Bu önemlidir çünkü `GET /cart` kimlik doğrulanmamış istekler için 401 döndürür ve global Axios interceptor zaten `/login`'e yönlendirirdi; bu da bir yönlendirme yanıp sönmesi oluştururdu. Auth durumunu önceden kontrol etmek daha yumuşak bir UX sağlar.

---

---

## Day 13 · 2026-04-16 — Figma-Accurate Frontend Rebuild / Figma'ya Uygun Frontend Yeniden Yapılandırması

### Summary
Day 13 focused entirely on making every customer-facing page match the Figma designs pixel-precisely. Every section was checked against the live Figma file using the Figma MCP tools (get_design_context, get_screenshot, get_metadata) to extract exact colors, images, layout dimensions, and component specs.

### Özet
Gün 13 tamamen her müşteri sayfasının Figma tasarımlarıyla piksel hassasiyetinde eşleşmesini sağlamaya odaklandı. Her bölüm, tam renkler, görseller, düzen boyutları ve bileşen özellikleri çıkarmak için Figma MCP araçları (get_design_context, get_screenshot, get_metadata) kullanılarak canlı Figma dosyasıyla karşılaştırıldı.

---

### What We Did / Ne Yaptık

**Navbar.tsx — Full rewrite**
- Figma asset URLs for all icons (Search, Wishlist, Cart, User head+body)
- Categories dropdown: 240px white card, 7 items with Lucide icons, hover highlight
- Logged-out: "Sign In" (bordered) + "Sign Up" (blue filled) buttons
- Logged-in: icon set + username + dropdown (Admin Panel if admin, Sign Out)
- Active link detection: white/600 for active path, #6e6e73 for inactive
- Outside-click closes dropdowns; route change closes categories dropdown

**Footer.tsx — Confirmed correct**
- #0f0f13 background, "The future of shopping, today." tagline
- Shop / Support / Company columns with hover-color links
- Bottom bar: rgba(255,255,255,0.04) bg, centered copyright

**HomePage.tsx — Complete rewrite**
- Hero slider: 3 slides with Figma background images, ‹/› arrows, dot navigation, 5s auto-advance
  - Slide 1: MacBook "Next-Gen Tech, At Your Fingertips."
  - Slide 2: iPhone "Power Meets Elegance."
  - Slide 3: AirPods "Sound Beyond Imagination."
- Categories bar (horizontal pills with Lucide icons, hover blue underline)
- Deals banner (#0071e3): "LIMITED OFFER / Up to 40% Off on Laptops" + "NEW ARRIVAL / iPhone 15 Pro"
- Popular Products: 4 static cards with actual Figma product images (iPhone, MacBook, Watch, AirPods)
- New Arrivals: 4 static cards with Figma-matched colored tops
  - Sony WH-1000XM5: #1a1a21 dark, green "New" badge
  - iPad Pro 12.9": #f0f2f7 light, green "New" badge
  - Samsung Galaxy Tab S9: #0f1729 navy, orange "Limited" badge
  - Microsoft Surface Pro 9: #f5f7fa light, green "New" badge
- Testimonials: 3 review cards (Ayse K./#8f45f5, Mehmet A./#1754f5, Zeynep B./#12ad6b)
- Features strip: Free Shipping / Easy Returns / Secure Payment / 24/7 Support
- Brands: Apple · Samsung · Sony · Microsoft · Bose · Google
- Newsletter: dark #0f0f13 card with email subscribe
- AI Chat floating button (#1754f5, bottom-right) with chat panel

**ShopPage.tsx — Card styling update**
- Category label: #0071e3, 11px uppercase
- Product name: 15px semi-bold
- Stars: #ff9500 (Figma orange, not yellow)
- Price: #0071e3 bold (matches Figma card spec)

**ProductDetailPage.tsx — Polish**
- Stars: #ff9500 throughout
- Price: #0071e3 (large price + related card)
- Stock badge: green #34c759 "IN STOCK" (was red)
- SPECS table expanded to 6 rows: Category, Price, Stock, Condition, Warranty, Product ID

**CartPage.tsx — Polish**
- Cart item price: #0071e3 (Figma blue)

**CustomerLogin.tsx + Register.tsx — Confirmed correct**
- Clean white card, NovaStore logo, blue CTA, focus-ring inputs

**CategoriesBar.tsx** *(new shared component)*
- Horizontal category pill bar below the Navbar: Phones / Computers / Tablets / Watches / Headphones / TV / Accessories
- 56px height, `border-bottom: 1px solid #d2d2d7`, white background
- Each pill: category icon (24×24) + label, hover → `color: #0071e3`
- Rendered on all CustomerLayout pages via `CustomerLayout.tsx`

**CartContext.tsx** *(new global context)*
- `CartProvider` wraps the app and exposes `cartCount: number`
- Fetches `GET /cart` on user login, increments on add, decrements on remove
- Drives the blue badge on the Navbar cart icon without prop drilling

**FavoritesContext.tsx** *(new global context)*
- `FavoritesProvider` exposes `favorites: number[]`, `toggleFavorite(id)`, `isFavorite(id)`
- Persists to `localStorage` so wishlist survives page refresh
- Drives the heart badge on the Navbar and the filled/outline heart on product cards

**Admin Panel — Rewrites**
- `admin/Dashboard.tsx` — Stat cards with coloured left-accent bars, Sales Overview 12-month bar chart, Recent Orders table; wired to paginated `GET /orders/admin/all`
- `admin/Orders.tsx` — Filter tabs (All / Pending / Processing / Shipped / Delivered / Cancelled), orders table, slide-in Order Detail panel with address + items + status updater; wired to `GET /orders/admin/all` + `PUT /orders/:id/status`
- `admin/Products.tsx` — Product table (image, name, category, price, stock, status, actions), slide-in Add Product form; wired to `GET /products` + `POST /products`

**index.css + CustomerLayout.tsx — Minor updates**
- `index.css`: CSS variable tokens (`--bg-card`, `--border-default`, `--color-primary`, etc.) for consistent theming across admin and customer pages
- `CustomerLayout.tsx`: Inserted `<CategoriesBar />` between `<Navbar />` and `<Outlet />`

---

### Technical Notes / Teknik Notlar

**Figma Asset URL Pattern — Caution**
Figma MCP asset URLs (`https://www.figma.com/api/mcp/asset/{uuid}`) are MCP-protocol-scoped tokens. They work inside the Figma MCP tool calls but **cannot** be used as `<img src>` in a browser — browsers receive 403 responses. At this stage, icon URLs were placed as `<img src>` props (this was later identified as a bug and fixed on Day 15 by replacing all icon references with inline SVGs). Product/hero image URLs extracted from Figma's CDN work correctly as long as the token hasn't expired; for production these should be migrated to a permanent CDN.

**TR:** Figma MCP asset URL'leri MCP protokolü kapsamlı token'lardır. Figma MCP araç çağrıları içinde çalışırlar ancak tarayıcıda `<img src>` olarak **kullanılamazlar** — tarayıcılar 403 yanıtı alır. Bu aşamada ikon URL'leri `<img src>` prop'u olarak yerleştirildi (bu daha sonra Gün 15'te bir hata olarak tespit edildi ve tüm ikon referansları inline SVG'lerle değiştirildi). Figma CDN'inden çıkarılan ürün/hero görsel URL'leri token süresi dolmadığı sürece düzgün çalışır; üretimde kalıcı bir CDN'e taşınmalıdır.

**Hero Slider State**
The slider uses a `useRef` timer that resets whenever `idx` changes, so manually clicking a dot cancels the auto-advance timer and restarts it — no double-advance bug.

**TR:** Slider, `idx` değiştiğinde sıfırlanan `useRef` zamanlayıcı kullanır, bu nedenle nokta tıklaması otomatik ilerleme zamanlayıcısını iptal eder ve yeniden başlatır.

---

## Revised Project Plan / Revize Proje Planı

### Status as of Day 13 / Gün 13 Sonu İtibarıyla Durum

| Module / Modül | Status / Durum |
|---|---|
| Backend foundation | ✅ |
| Models: User, Category, Product, Cart, CartItem, Order, OrderItem, Address, ProductImage | ✅ |
| Auth (register, login, JWT) | ✅ |
| Role system (admin/customer) | ✅ |
| Category & Product CRUD (admin-protected) | ✅ |
| Cart system | ✅ |
| Order system | ✅ |
| CORS middleware | ✅ |
| Pagination | ✅ |
| Product images | ✅ |
| Seed data script | ✅ |
| Docker | ✅ |
| React frontend — setup + admin auth layer | ✅ |
| React frontend — admin panel (Dashboard, Products, Orders) | ✅ |
| React customer web — Navbar, Footer, CustomerLayout | ✅ |
| React customer web — HomePage (hero, categories, products, newsletter) | ✅ |
| React customer web — ShopPage (filters, grid, sort, pagination) | ✅ |
| React customer web — Login & Register | ✅ |
| React customer web — ProductDetailPage (gallery, tabs, specs, related) | ✅ |
| React customer web — CartPage (items, qty, remove, promo, summary) | ✅ |
| Flutter mobile | ❌ |
| AI integration | ❌ |

### Remaining Schedule / Kalan Plan

| Day / Gün | Date / Tarih | Scope / Kapsam |
|---|---|---|
| Day 13 | 17 Nisan | Flutter mobile |
| Day 14 | 18 Nisan | AI integration / AI entegrasyonu |
| Day 15 | 19 Nisan | Polish + Docker testing / Cilalama + Docker testi |
| Day 16 | 20 Nisan | Final packaging / Final paketleme |

---

## Day 14 · 2026-04-17 — AI Integration / AI Entegrasyonu

### Summary
Built the full Nova AI assistant feature: a FastAPI chat endpoint on the backend wired to the Claude API (with a smart rule-based fallback for demo mode), plus a polished floating chat panel on the frontend with real message history, typing animation, quick-start suggestion chips, and live API calls.

### Özet
Nova AI asistan özelliği eksiksiz inşa edildi: backend'de Claude API'ye bağlı bir FastAPI sohbet endpoint'i (demo modu için akıllı kural tabanlı yedek ile birlikte) ve frontend'de gerçek mesaj geçmişi, yazma animasyonu, hızlı başlangıç öneri chip'leri ve canlı API çağrıları olan şık bir kayan sohbet paneli.

---

### What We Did / Ne Yaptık

- `backend/app/api/v1/ai.py` — New router: `POST /api/v1/ai/chat`
  - Accepts `{ message, history }`, returns `{ reply }`
  - Queries the products table for catalog context (keyword search, up to 5 products)
  - Builds a system prompt with the store persona + relevant product data
  - **If `ANTHROPIC_API_KEY` is set**: calls `claude-haiku-4-5-20251001` via the Anthropic Python SDK
  - **If no API key**: returns smart rule-based replies covering greetings, laptops, phones, audio, tablets, budget queries, comparison requests, and order questions
  - Graceful error handling — never returns a 500 to the user
- `backend/app/main.py` — Registered `ai.router` under `/api/v1`
- `backend/requirements.txt` — Added `anthropic>=0.25.0`
- `frontend/src/components/AIChatPanel.tsx` — New full-featured chat panel
  - Fixed positioning (bottom-right), 380 × 560 px, slide-up open animation
  - Gradient header (blue → purple) with "N" avatar, status line, close button
  - Scrollable message area with user bubbles (right, blue) and AI bubbles (left, grey)
  - Animated typing indicator (3-dot bounce) during API wait
  - 4 quick-suggestion chips visible before first message
  - Input field + send button (disabled when empty/loading)
  - `**bold**` markdown rendering in AI replies
  - Backdrop overlay on mobile
  - `Enter` to send, `Shift+Enter` = newline
  - Auto-scroll to latest message, auto-focus input on open
- `frontend/src/pages/HomePage.tsx` — Replaced old stub `AIChatButton`
  - Floating button: chat icon when closed → X icon when open
  - Green pulse dot indicator (online status)
  - Mounts `<AIChatPanel open={open} onClose={...} />`

---

### Key Concepts / Temel Kavramlar

#### RAG-lite: Database Context Injection
**EN:** Rather than giving the AI a static list of all products (which would be huge), the chat endpoint performs a lightweight keyword search of the product table based on the user's message, then injects only those relevant items into the system prompt. This keeps the prompt small, response fast, and answers accurate — a simplified form of Retrieval-Augmented Generation (RAG).

**TR:** AI'ya tüm ürünlerin statik bir listesini vermek yerine (çok büyük olurdu), chat endpoint'i kullanıcının mesajına göre ürün tablosunda hafif bir anahtar kelime araması yapar ve yalnızca ilgili ürünleri sistem prompt'una enjekte eder. Bu, prompt'u küçük, yanıtı hızlı ve cevapları doğru tutar — Retrieval-Augmented Generation (RAG) sisteminin basitleştirilmiş bir biçimi.

#### Graceful Degradation / Zarif Bozunma
**EN:** The endpoint works in two modes. With an API key, it uses Claude for intelligent, context-aware replies. Without a key, it falls back to a keyword-matching rule engine that covers the most common shopping queries. This means the feature works out of the box in every demo environment — no API key needed to show the UI.

**TR:** Endpoint iki modda çalışır. API anahtarı varsa, bağlam farkında akıllı yanıtlar için Claude kullanır. Anahtar yoksa, en yaygın alışveriş sorgularını kapsayan anahtar kelime eşleştirme kural motoruna geçer. Bu sayede özellik her demo ortamında kutudan çıktığı gibi çalışır — UI'ı göstermek için API anahtarı gerekmez.

---

### Technical Decisions / Teknik Kararlar

| Decision / Karar | Rationale / Gerekçe |
|---|---|
| `claude-haiku-4-5-20251001` model | Fastest Claude model; ideal for low-latency chat / En hızlı Claude modeli; düşük gecikmeli sohbet için ideal |
| `max_tokens=300` | Keeps replies concise; prevents overly long responses / Yanıtları özlü tutar; aşırı uzun yanıtları önler |
| `history: list[ChatMessage]` in request | Client manages conversation memory; server remains stateless / İstemci sohbet hafızasını yönetir; sunucu stateless kalır |
| Rule-based fallback | Demo environments work without billing; CI tests don't need real API / Demo ortamları ödeme olmadan çalışır; CI testleri gerçek API gerektirmez |
| Backdrop on mobile | Prevents background scrolling; standard modal UX pattern / Arka plan kaydırmayı önler; standart modal UX kalıbı |
| Suggestion chips hidden after first message | Keeps the chat area clean after the conversation starts / Konuşma başladıktan sonra sohbet alanını temiz tutar |

---

### Status as of Day 14 / Gün 14 Sonu İtibarıyla Durum

| Module / Modül | Status / Durum |
|---|---|
| Backend foundation | ✅ |
| Models: User, Category, Product, Cart, CartItem, Order, OrderItem, Address, ProductImage | ✅ |
| Auth (register, login, JWT) | ✅ |
| Role system (admin/customer) | ✅ |
| Category & Product CRUD (admin-protected) | ✅ |
| Cart system | ✅ |
| Order system | ✅ |
| CORS middleware | ✅ |
| Pagination | ✅ |
| Product images | ✅ |
| Seed data script | ✅ |
| Docker | ✅ |
| React frontend — setup + admin auth layer | ✅ |
| React frontend — admin panel (Dashboard, Products, Orders) | ✅ |
| React customer web — Navbar, Footer, CustomerLayout | ✅ |
| React customer web — HomePage (hero, categories, products, newsletter) | ✅ |
| React customer web — ShopPage (filters, grid, sort, pagination) | ✅ |
| React customer web — Login & Register | ✅ |
| React customer web — ProductDetailPage (gallery, tabs, specs, related) | ✅ |
| React customer web — CartPage (items, qty, remove, promo, summary) | ✅ |
| AI chat endpoint + Claude integration | ✅ |
| AI chat UI panel (AIChatPanel) | ✅ |
| Flutter mobile | ❌ |

### Remaining Schedule / Kalan Plan

| Day / Gün | Date / Tarih | Scope / Kapsam |
|---|---|---|
| Day 15 | 19 Nisan | Polish + Docker testing / Cilalama + Docker testi |
| Day 16 | 20 Nisan | Final packaging / Final paketleme |

---

## Day 15 · 2026-04-18 — Full Figma Rebuild, Docker Fixes & Navbar Polish / Tam Figma Yeniden Yapılandırması, Docker Düzeltmeleri ve Navbar Cilalaması

### Summary
The longest session of the project. Fixed every Docker/backend infrastructure issue blocking local development, then did a complete pixel-perfect Figma pass over every remaining page (Admin Users, Admin Orders/Products/Dashboard polish, FavoritesPage, ProfilePage, NotFoundPage). Finally solved the persistent Navbar problems: replaced all broken Figma API asset URLs with inline SVGs, fixed the search overlay to be a small inline input that sits directly to the left of the search icon without replacing the nav, and centered the CategoriesBar.

### Özet
Projenin en uzun oturumu. Yerel geliştirmeyi engelleyen tüm Docker/backend altyapı sorunları giderildi, ardından kalan her sayfa (Admin Users, Admin Orders/Products/Dashboard cilalaması, FavoritesPage, ProfilePage, NotFoundPage) üzerinde piksel hassasiyetinde tam Figma geçişi yapıldı. Son olarak kalıcı Navbar sorunları çözüldü: tüm kırık Figma API asset URL'leri inline SVG'lerle değiştirildi, arama overlay'i navbar'ı kaplamazken arama ikonunun hemen solunda küçük bir inline input olacak şekilde düzeltildi ve CategoriesBar ortalandı.

---

### What We Did / Ne Yaptık

**Docker & Backend Infrastructure**
- `backend/Dockerfile` — Fixed deprecated `apt-key` command: switched to `gpg --dearmor` pipeline for SQL Server repo signing (Debian trixie compatibility)
- `backend/Dockerfile` — `msodbcsql17` unavailable on current Debian → switched to `msodbcsql18` + `ACCEPT_EULA=Y`
- `docker-compose.yml` — DB healthcheck was using `sqlcmd` (not installed) → replaced with TCP port check (`bash -c 'cat /dev/null > /dev/tcp/localhost/1433'`)
- `backend/app/api/v1/orders.py` — `/admin/all` endpoint changed from returning a flat `list[OrderResponse]` to a paginated `{ items, total, skip, limit }` object (frontend expected pagination shape)
- `backend/scripts/create_db.py` + `seed.py` — Updated ODBC driver string from 17 to 18
- `backend/app/schemas/auth.py`, `backend/app/schemas/product.py` — Minor schema fixes
- `backend/app/main.py` — Registered AI router
- `backend/requirements.txt` — Added `anthropic>=0.25.0`

**Admin Panel — New & Polished Pages**
- `frontend/src/pages/admin/Users.tsx` *(new)* — Full user management page
  - Stat cards: Total Users, Active Users, New This Month, Suspended
  - Search bar + Role/Status filter dropdowns
  - User table: avatar initials, name, email, role badge, status, join date, action buttons (Edit/Delete)
  - Matches Figma admin Users node
- `frontend/src/pages/admin/Orders.tsx` — Complete rewrite
  - Filter tabs: All / Pending / Processing / Shipped / Delivered / Cancelled with live count badges
  - Orders table: ORDER #, CUSTOMER, DATE, AMOUNT, STATUS columns
  - Order Detail slide-in panel: items list, shipping address, status updater dropdown
  - Wired to real `GET /orders/admin/all` + `PUT /orders/:id/status` APIs
- `frontend/src/pages/admin/Products.tsx` — Complete rewrite
  - Product table: PRODUCT (image+name), CATEGORY, PRICE, STOCK, STATUS, ACTIONS columns
  - Add Product slide-in form panel
  - Wired to `GET /products` + `POST /products` APIs
- `frontend/src/pages/admin/Dashboard.tsx` — Bug fixes + polish
  - Defensive guard for API response shape: handles both flat array and `{items, total}` formats
  - Fixed duplicate React key warning in bar chart (month letters repeated — switched to index key)
  - 4 stat cards with coloured left-accent bars (green/red/orange/blue)
  - Sales Overview bar chart: 12-month static data, opacity gradient bars
  - Recent Orders table: ORDER #, CUSTOMER, DATE, AMOUNT, STATUS

**Customer Pages — New Pages**
- `frontend/src/pages/FavoritesPage.tsx` *(new)*
  - 4-column responsive product grid
  - Filled red heart on each card; click removes from favorites
  - Empty state: heart icon + "Your wishlist is empty" + Browse Products CTA
  - Wired to `FavoritesContext`
- `frontend/src/pages/ProfilePage.tsx` *(new)*
  - Left sidebar: avatar circle with initials, 8 menu items (Personal Info / Security / Orders / Favorites / Addresses / Payment Methods / Notifications / Sign Out)
  - Right panel: Personal Information form (2-column grid: First Name, Last Name, Email, Phone, Location, Website), Bio textarea, Gender radio buttons, Save Changes button
  - Recent Orders section at bottom
- `frontend/src/pages/NotFoundPage.tsx` *(new)*
  - Large layered "404" watermark (120px, stacked opacity)
  - "Page Not Found" heading, description
  - Go Home + Browse Shop buttons
  - Search input for direct recovery
  - Popular Products fetched from API

**Contexts — New**
- `frontend/src/context/CartContext.tsx` *(new)* — Global cart count state wired to API
- `frontend/src/context/FavoritesContext.tsx` *(new)* — Global favorites list with add/remove, persisted in localStorage

**Navbar — Complete Rewrite (Icon & Search Fix)**
- **Root cause fixed:** All Figma `api/mcp/asset/…` URLs are MCP-protocol-only; they cannot be used as `<img src>` in a browser — every icon was broken/invisible
- Replaced all icon `<img>` tags with inline SVG components: `SearchIcon`, `HeartIcon`, `CartIcon`, `UserIcon`
- `HeartIcon` fills red when favorites count > 0
- Search behavior fixed: clicking Search no longer replaces the entire center nav. A **200×36px inline input** now appears directly to the **left of the search icon** within the right icon flex row — logo, nav links, and all other icons stay visible
- Results dropdown appears below the inline input with product thumbnails + "See all results" link
- Removed separate absolute-positioned overlay entirely
- Logo correctly stays at the **far left** (padding: 48px), center nav absolute-centered, buttons at far right — removed `maxWidth: 1280` constraint that was making content look centered on wide screens

**CategoriesBar — Complete Rewrite**
- Replaced all Figma `api/mcp/asset/…` URLs with inline SVG icon components (24×24): Phone, Laptop, Tablet, Watch, Headphones, TV, Accessories
- Items **centered** horizontally (`justifyContent: 'center'`)
- Removed incorrect `maxWidth: 1280` constraint (was left-aligning items on wide screens)

**App.tsx — New Routes**
- `/favorites` → `FavoritesPage`
- `/profile` → `ProfilePage`
- `*` → `NotFoundPage` (catch-all 404)
- `/admin/users` → `Users`

---

### Bug Fixes / Hata Düzeltmeleri

| Bug | Fix |
|---|---|
| Admin login 401 with `admin@admin.com` | `fix_admin.py` script: re-hashed password with bcrypt, verified role = "admin" |
| Docker build fails: `apt-key not found` | Switched to `gpg --dearmor` pipeline in Dockerfile |
| Docker build fails: `msodbcsql17` package 404 | Switched to `msodbcsql18` |
| DB healthcheck fails (sqlcmd missing) | Replaced with TCP port-check bash one-liner |
| Admin dashboard blank (JS crash) | `ordersRes.total` was `undefined` when backend returned flat array; added `Array.isArray` guard |
| Duplicate React key warning in bar chart | Month letters repeat (J, A, M); fixed by using array index as key |
| Navbar icons invisible | Figma MCP asset URLs not usable in `<img src>`; replaced with inline SVGs |
| Search replaced entire navbar | Refactored to inline input in right flex row, left of search icon |
| CategoriesBar left-aligned | `maxWidth` container removed; `justifyContent: center` added |
| NovaStore logo appeared centered | Removed `maxWidth: 1280` from navbar inner div; now truly full-width with padding |

---

### Key Concepts / Temel Kavramlar

#### Figma MCP Asset URLs Are Not Public
**EN:** URLs of the form `https://www.figma.com/api/mcp/asset/{uuid}` are valid only within the Figma MCP protocol context — they are signed, session-scoped tokens. Using them as `<img src>` in a browser results in 403/404 responses. Any icon or image extracted this way must be re-implemented as an inline SVG, a local asset, or a public CDN URL.

**TR:** `https://www.figma.com/api/mcp/asset/{uuid}` formundaki URL'ler yalnızca Figma MCP protokolü bağlamında geçerlidir — imzalı, oturum kapsamlı token'lardır. Bunları tarayıcıda `<img src>` olarak kullanmak 403/404 yanıtlarıyla sonuçlanır. Bu şekilde çıkarılan herhangi bir ikon veya görsel, inline SVG, yerel asset veya public CDN URL olarak yeniden uygulanmalıdır.

#### Inline SVG Icons vs. Icon Libraries
**EN:** For a small, fixed set of icons (search, heart, cart, user, category symbols), hand-crafted inline SVGs are the most reliable approach: zero dependencies, zero network requests, exact control over stroke width / fill / size, and they render identically across all browsers. The trade-off is slightly more JSX verbosity, which is acceptable for a handful of icons.

**TR:** Az sayıda sabit ikon için (arama, kalp, sepet, kullanıcı, kategori sembolleri) elle yazılmış inline SVG'ler en güvenilir yaklaşımdır: sıfır bağımlılık, sıfır ağ isteği, stroke genişliği/dolgu/boyut üzerinde tam kontrol ve tüm tarayıcılarda aynı render. Bunun bedeli biraz daha fazla JSX ayrıntısıdır, bu da az sayıda ikon için kabul edilebilirdir.

---

### Status as of Day 15 / Gün 15 Sonu İtibarıyla Durum

| Module / Modül | Status / Durum |
|---|---|
| Backend foundation | ✅ |
| Models: User, Category, Product, Cart, CartItem, Order, OrderItem, Address, ProductImage | ✅ |
| Auth (register, login, JWT) | ✅ |
| Role system (admin/customer) | ✅ |
| Category & Product CRUD (admin-protected) | ✅ |
| Cart system | ✅ |
| Order system | ✅ |
| CORS middleware | ✅ |
| Pagination | ✅ |
| Product images | ✅ |
| Seed data script | ✅ |
| Docker (msodbcsql18, gpg key, TCP healthcheck) | ✅ |
| React frontend — setup + admin auth layer | ✅ |
| React frontend — admin panel (Dashboard, Products, Orders, Users) | ✅ |
| React customer web — Navbar (inline SVG icons, inline search) | ✅ |
| React customer web — CategoriesBar (inline SVGs, centered) | ✅ |
| React customer web — Footer | ✅ |
| React customer web — HomePage (hero, categories, products, newsletter, AI chat) | ✅ |
| React customer web — ShopPage (filters, grid, sort, pagination) | ✅ |
| React customer web — Login & Register | ✅ |
| React customer web — ProductDetailPage (gallery, tabs, specs, related) | ✅ |
| React customer web — CartPage (items, qty, remove, promo, summary) | ✅ |
| React customer web — FavoritesPage (grid, empty state) | ✅ |
| React customer web — ProfilePage (sidebar, form, orders) | ✅ |
| React customer web — NotFoundPage (404, search, popular products) | ✅ |
| AI chat endpoint + Claude integration | ✅ |
| AI chat UI panel (AIChatPanel) | ✅ |
| Flutter mobile | ❌ |

### Remaining Schedule / Kalan Plan

| Day / Gün | Date / Tarih | Scope / Kapsam |
|---|---|---|
| Day 16 | 19 Nisan | Polish + final Docker testing / Cilalama + final Docker testi |
| Day 17 | 20 Nisan | Final packaging & README / Final paketleme ve README |
