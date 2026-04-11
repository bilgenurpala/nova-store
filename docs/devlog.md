# Nova Store — Development Log

Bu devlog, Nova Store projesinin gün gün gelişim notlarını içerir. Sadece "ne yaptık" değil, "neden bu kararı aldık" ve "bu kavram ne anlama geliyor" sorularına da cevap verir. Ders notu gibi kullanabilirsin.

---

## Day 1 · 2026-04-07 — Backend Foundation

### Özet

Kod yazmadan önce zemin kuruldu. Bu gün boyunca hiçbir iş mantığı (business logic) yazılmadı — yalnızca projenin her şeyin üzerine inşa edileceği iskelet oluşturuldu: klasör yapısı, konfigürasyon katmanı, veritabanı bağlantısı, ORM kurulumu, migration sistemi ve sağlık kontrolü endpoint'i.

---

### Ne Yaptık

- Tam backend klasör hiyerarşisi oluşturuldu
- `config.py` — Pydantic Settings ile `.env` okuma + MSSQL bağlantı URL'i dinamik yapı
- `database.py` — SQLAlchemy engine, bağlantı havuzu, `SessionLocal`, `Base`, `get_db()`
- `main.py` — FastAPI uygulaması, versiyonlu router kaydı
- `health.py` — `GET /api/v1/health` — canlı DB bağlantı testi
- `alembic.ini` + `alembic/env.py` — Alembic aynı settings nesnesinden DB URL'ini okur
- `requirements.txt` sabit versiyonlarla
- `.env.example` — güvenli konfigürasyon şablonu
- `.gitignore`

---

### 📚 Temel Kavramlar

**Pydantic Settings nedir ve neden `os.getenv()` yerine kullanırız?**

`os.getenv("DB_PORT")` her zaman `str` döner. `DB_PORT` bir integer olması gerekiyorsa bunu kendin dönüştürmek zorundasın, yoksa uygulama çalışma zamanında patlar. Pydantic Settings'de şunu yazarsın:

```python
DB_PORT: int = 1433
```

Pydantic `.env` dosyasını okur, `"1433"` string'ini otomatik `int`'e dönüştürür, ve eğer `.env`'de `DB_PORT=abc` gibi geçersiz bir değer varsa uygulama daha başlamadan açık bir hata mesajıyla durur. Type safety — runtime'da değil, startup'ta hata yakala.

**ORM nedir?**

ORM (Object-Relational Mapper), veritabanı tablolarını Python sınıflarına, satırları ise nesne instance'larına çevirir. Yani `SELECT * FROM users WHERE id = 1` yazmak yerine `db.get(User, 1)` yazarsın. SQLAlchemy bu dönüşümü yapar.

**Alembic nedir ve neden migration lazım?**

Üretim ortamında çalışan bir veritabanı var. Modele yeni bir sütun ekledin. Bu sütunu canlı DB'ye nasıl yansıtacaksın? Sıfırdan yaratmak mümkün değil — içinde data var. Alembic, model değişikliklerini sıralı, geri alınabilir migration dosyalarına dönüştürür. `alembic upgrade head` ile tüm değişiklikler sırayla uygulanır, `alembic downgrade -1` ile geri alınır.

**Bağlantı havuzu (connection pool) nedir?**

Her HTTP isteğinde veritabanına yeni bir TCP bağlantısı açmak pahalıdır. Connection pool, önceden açılmış bağlantıları bekletir ve istekler geldiğinde onlara verir. `pool_size=10` — sürekli açık tutulan bağlantı sayısı. `max_overflow=20` — ani yük artışında açılabilecek ekstra bağlantı sayısı. `pool_pre_ping=True` — bağlantıyı kullanmadan önce "hâlâ canlı mı?" diye kontrol eder, stale connection hatasını önler.

---

### Teknik Kararlar

| Karar | Gerekçe |
|---|---|
| `pydantic-settings` ile konfigürasyon | Type-safe, startup'ta doğrulanmış, `.env`'den gerçek env var'a sıfır değişiklikle geçiş |
| `@lru_cache` ile `get_settings()` | Settings nesnesi bir kez oluşturulur, her request'te `.env` yeniden okunmaz |
| `pool_pre_ping=True` | Kullanımdan önce bağlantı doğrulanır, stale connection hatası önlenir |
| `echo=settings.DEBUG` | SQL sorguları DEBUG modunda terminale yazdırılır, production'da sessiz |
| `api/v1/` namespace | Gelecekte `/api/v2/` çıkabilir; web ve mobil client'lar kırılmadan yeni versiyon paralel çalışır |
| `models/` ve `schemas/` ayrımı | ORM modeli DB şeklini bilir; Pydantic şeması API kontratını bilir — bağımsız evrilirler |

---

### Karşılaşılan Sorunlar

- MSSQL bağlantı string'inde pyodbc driver adındaki boşluklar URL-encode edilmeli (`ODBC Driver 17` → `ODBC+Driver+17`). `DATABASE_URL` property'sinde `.replace(" ", "+")` ile çözüldü.
- Alembic'in `env.py`'ı `app` paketini `sys.path`'te bulamazsa import hatası verir. `sys.path.insert(0, ...)` ile çözüldü.

---

### Tamamlananlar → Sonraki Gün

- [x] SQLAlchemy model base mixin (`id`, `created_at`, `updated_at`)
- [x] `User`, `Category`, `Product` modelleri
- [x] İlk Alembic migration

---

## Day 2 · 2026-04-07 — Database Models

### Özet

Bug düzeltmeleri + tam veritabanı model katmanı: paylaşılan `TimestampedBase` mixin, `User`, `Category`, `Product` ORM modelleri, ilişkiler ve ilk Alembic migration dosyası.

---

### Ne Yaptık

- `app/models/base.py` — `TimestampedBase` abstract sınıf: `id` (PK, autoincrement), `created_at`, `updated_at`
- `app/models/user.py` — `User`: `email` (unique, indexed), `password_hash`, `is_active`
- `app/models/category.py` — `Category`: `name` (unique), `slug` (unique, indexed), `products` relationship
- `app/models/product.py` — `Product`: `name`, `description` (nullable), `price` (`DECIMAL(10,2)`), `stock`, `category_id` FK
- `app/models/__init__.py` — tüm modeller import edilerek `Base.metadata`'ya kaydedilir
- `alembic/versions/20260407_0001_initial_tables.py` — `users`, `categories`, `products` tablolarını oluşturur
- `alembic/env.py` — `app.models` import'u eklendi

---

### Bug Düzeltmeleri

| Dosya | Hata | Çözüm |
|---|---|---|
| `alembic/env.py` | `Base.metadata` boştu — hiçbir model import edilmemişti, `autogenerate` boş migration üretiyordu | `target_metadata = Base.metadata` satırından önce `import app.models` eklendi |
| `backend/.env` | Dosya yoktu, uygulama başlarken Pydantic validation hatası veriyordu | `.env.example`'dan `.env` oluşturuldu |

---

### 📚 Temel Kavramlar

**`__abstract__ = True` ve Mixin Paterni**

`TimestampedBase`'i doğrudan `users` gibi bir tabloya dönüştürmek istemiyoruz. Sadece `id`, `created_at`, `updated_at` sütunlarını tüm modellere enjekte etmek istiyoruz. `__abstract__ = True` diyince SQLAlchemy bu sınıf için veritabanında tablo oluşturmaz. Her model bu sınıftan inherit edince o sütunları otomatik alır. DRY (Don't Repeat Yourself) — her modelde aynı sütunları tekrar tekrar yazmana gerek yok.

**`server_default` vs `default`**

`default=func.now()` dersen: Python değeri hesaplar ve SQL sorgusuna parametre olarak ekler.  
`server_default=func.now()` dersen: SQL Server'a `DEFAULT GETDATE()` kısıtlaması eklenir. Veritabanı kendisi bu değeri set eder. ORM bypass edilerek doğrudan SQL ile insert yapılsa bile timestamp doğru girilir.

**Veritabanı Tipi: `Numeric(10, 2)` vs `Float`**

`Float` binary floating point kullanır. `149.99` gibi bir fiyatı binary'de tam temsil edemezsin. `0.1 + 0.2 = 0.30000000004` gibi sonuçlar alabilirsin. Bu finansal veride felaket demektir. `Numeric(10, 2)` exact decimal arithmetic kullanır. Toplam 10 basamak, virgülden sonra 2 basamak. Para her zaman `Numeric` ile saklanır.

**`TYPE_CHECKING` ile Circular Import Çözümü**

`category.py`'da `Product`'a referans var (relationship için), `product.py`'da `Category`'ye referans var. İkisi birbirini import etmeye çalışırsa Python sonsuz döngüye girer. Çözüm:

```python
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.product import Product
```

`TYPE_CHECKING` yalnızca IDE ve mypy gibi static analyzer çalışırken `True` olur. Runtime'da `False`'tur, dolayısıyla o import bloğu hiç çalışmaz. Relationship string ile tanımlanır: `relationship("Product")`. SQLAlchemy string adından sınıfı runtime'da bulur.

---

### Teknik Kararlar

| Karar | Gerekçe |
|---|---|
| `TimestampedBase` (`__abstract__ = True`) | Paylaşılan sütunlar her modele enjekte edilir, `timestampedbase` tablosu oluşmaz |
| `server_default=func.now()` | DB timestamp'i set eder — ORM dışı insertlarda da çalışır |
| `onupdate=func.now()` | SQLAlchemy her ORM flush'ta `updated_at`'ı günceller |
| `Numeric(10, 2)` fiyat için | Exact decimal — finansal hesaplamalarda float'ın yuvarlama hatalarını önler |
| `category_id` products'ta indexed | Kategoriye göre filtreleme sık yapılır — index tam tablo taramasını önler |
| Migration elle yazıldı | Canlı DB yoktu; migration autogenerate'in MSSQL'e karşı ürettiğiyle birebir aynı |

---

### Karşılaşılan Sorunlar

- MSSQL `GETDATE()` kullanır, diğer DB'ler `now()`. Migration dosyasında `sa.text("GETDATE()")` kullanmak gerekti.
- SQLAlchemy 2.x bidirectional `relationship()` circular import yaratır. `TYPE_CHECKING` guard ile çözüldü.

---

## Day 3 · 2026-04-08 — Authentication

### Özet

Tam JWT tabanlı authentication sistemi: bcrypt ile şifre hashleme, JWT token oluşturma/doğrulama, register/login endpoint'leri ve korumalı `/me` endpoint'i. JWT konfigürasyonu `.env`'e taşındı.

---

### Ne Yaptık

- `app/core/security.py` — `hash_password`, `verify_password` (bcrypt), `create_access_token`, `decode_access_token` (HS256)
- `app/schemas/auth.py` — `RegisterRequest`, `LoginRequest`, `TokenResponse`, `UserResponse`
- `app/api/v1/dependencies.py` — `get_current_user`: Bearer token'ı decode eder, User'ı DB'den çeker, 401/403 raise eder
- `app/api/v1/auth.py` — `POST /register`, `POST /login`, `GET /me`
- `app/core/config.py` — `JWT_SECRET_KEY`, `JWT_ALGORITHM`, `JWT_EXPIRE_MINUTES` eklendi

---

### 📚 Temel Kavramlar

**Neden şifreyi plaintext saklamayız?**

Kullanıcı şifresini `password = "abc123"` olarak veritabanına yazsan, bir SQL injection veya DB sızıntısında herkesin şifresine erişilir. bcrypt, şifreyi geri döndürülemez (one-way) bir hash'e çevirir. `hash_password("abc123")` → `"$2b$12$eImiTXuWVxfM37..."`. Bu hash'ten "abc123"e geri dönemezsin. Login'de: kullanıcının girdiği şifreyi hash'le ve sakladığın hash ile karşılaştır.

**Salt nedir?**

Aynı şifreye her zaman aynı hash çıkmasaydı ne olurdu? "abc123" için önceden hesaplanmış hash tabloları (rainbow tables) saldırılarını engeller. bcrypt otomatik random salt üretir ve hash'e gömer. Her `hash_password("abc123")` çağrısı farklı bir hash üretir ama `verify_password("abc123", hash)` hepsinde `True` döner.

**JWT nedir?**

JWT (JSON Web Token), üç parçadan oluşur: `header.payload.signature`. Header algoritma bilgisi içerir. Payload claims içerir — `{"sub": "user@example.com", "exp": 1234567890}`. Signature, header + payload'ın secret key ile HMAC-SHA256 imzasıdır.

Sunucu JWT'yi verir ve saklamaz. İstek geldiğinde signature'ı doğrular — imza geçerliyse token gerçektir. Bu "stateless auth" demektir: sunucunun session tablosu tutmasına gerek yok.

**HS256 vs RS256**

HS256: tek bir secret key hem imzalar hem doğrular. Basit, hızlı. Birden fazla servisin doğrulaması gerekiyorsa secret'ı herkesle paylaşmak zorundayız — güvenlik riski.  
RS256: private key imzalar, public key doğrular. Public key'i herkesle paylaşabilirsin. Microservice mimarisinde tercih edilir. Şimdilik HS256 yeterli.

**FastAPI Dependency Injection — `Depends()`**

FastAPI'de route handler'lar parametre olarak dependency fonksiyonları alabilir:

```python
def get_order(current_user: User = Depends(get_current_user)):
    ...
```

FastAPI, endpoint çağrılmadan önce `get_current_user()`'ı otomatik çalıştırır, sonucu `current_user` parametresine atar. Bu sayede auth kontrolü tek bir yerde yazılır ve her endpoint'te tekrar edilmez. Dependency'ler zincirleme de kullanılabilir — `get_current_admin` → `get_current_user`'a depend eder.

---

### Teknik Kararlar

| Karar | Gerekçe |
|---|---|
| `passlib[bcrypt]` | Endüstri standardı şifre saklama; salt otomatik üretilir |
| `python-jose[cryptography]` | Hafif JWT kütüphanesi; gerekirse RS256'ya geçiş kolay |
| `sub` = email | Natural unique identifier; `user_id`'yi email'e çevirmek için ekstra DB sorgusu gerekmez |
| `HTTPBearer` | Basit, web ve mobil client için aynı şekilde çalışır, OAuth2 form semantiği gerekmez |
| `decode_access_token` `None` döner | `security.py` side-effect-free; HTTP exception dependency katmanında fırlatılır |
| JWT config `Settings`'te | Secret ve expiry ortama özel; `.env`'de durur, kaynak koduna girmez |

---

### Karşılaşılan Sorunlar

- Pydantic v2'de `EmailStr` için `pydantic[email]` ayrıca install edilmeli.
- Pydantic v2'de ORM nesnelerini serialize etmek için `model_config = ConfigDict(from_attributes=True)` gerekli (v1'deki `orm_mode = True`'nun yerini aldı).

---

## Day 4 · 2026-04-08 — Category & Product APIs

### Özet

Category ve Product için tam CRUD API'leri. Field-level validation'lı şemalar, auth-protected write endpoint'leri, public read endpoint'leri, kategori ve isim bazlı ürün filtreleme.

---

### Ne Yaptık

- `app/schemas/category.py` — `CategoryCreate`, `CategoryUpdate`, `CategoryResponse` (slug format validation)
- `app/schemas/product.py` — `ProductCreate`, `ProductUpdate`, `ProductResponse` (fiyat/stok validation; CategoryResponse embed)
- `app/api/v1/categories.py` — tam CRUD; duplicate slug/name → 409
- `app/api/v1/products.py` — tam CRUD; `?category_id` filtresi ve `?search` (ilike); `model_dump(exclude_unset=True)` ile PUT

---

### 📚 Temel Kavramlar

**REST API Tasarım Prensipleri**

REST'te resource (kaynak) merkezli düşünülür. Category bir kaynak. Endpoint'ler fiil değil isim içerir:

```
POST   /categories       → yeni category oluştur
GET    /categories       → tüm categories listele
GET    /categories/5     → id=5 olan category'yi getir
PUT    /categories/5     → id=5 olanı güncelle
DELETE /categories/5     → id=5 olanı sil
```

HTTP methodlar anlamı taşır: `POST` = oluştur, `GET` = oku, `PUT` = güncelle, `DELETE` = sil. Status code'lar da anlam taşır: 200 = başarılı, 201 = oluşturuldu, 404 = bulunamadı, 409 = çakışma.

**`model_dump(exclude_unset=True)` — True Partial Update**

PUT isteğinde şunu düşün: client sadece `{"price": 49.99}` gönderiyor. `model_dump()` tüm alanları döner — gönderilenler + default değerleriyle gönderilenler. `name=None, description=None, price=49.99, ...` gibi. Bu mevcut `name` ve `description`'ı `None`'a ezer.

`model_dump(exclude_unset=True)` ise yalnızca client'ın gönderdiği alanları döner: `{"price": 49.99}`. Sadece bu alan güncellenir, geri kalanı DB'den olduğu gibi kalır. Gerçek anlamda partial update budur.

**`ilike` — Case-Insensitive Search**

```python
Product.name.ilike(f"%{search}%")
```

`%` wildcard'tır — başında ve sonunda olunca "içinde geçiyor mu?" anlamına gelir. `ilike` case-insensitive `LIKE` demektir. `search=wireless` → `Wireless Headphones`, `WIRELESS EARBUDS` hepsini bulur.

**`_get_or_404` Helper Paterni**

Her route handler'da şunu tekrar yazmak yerine:

```python
category = db.query(Category).filter(Category.id == id).first()
if not category:
    raise HTTPException(status_code=404, detail="Category not found")
```

Bunu tek bir yere al:

```python
def _get_or_404(category_id: int, db: Session) -> Category:
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category
```

Route handler temizlenir, 404 mantığı tek yerde yaşar. Bu her modülde ayrı tanımlanır — categories.py'da kendi `_get_or_404`'ü var, products.py'da kendi versiyonu.

---

### Teknik Kararlar

| Karar | Gerekçe |
|---|---|
| Public GET, protected POST/PUT/DELETE | Mağaza browsing auth gerektirmez; mutation'lar kimlik gerektirir |
| `_get_or_404` helper | Route handler'ları temiz tutar, 404 mantığı tek yerde |
| `_assert_category_exists` | DB FK hatasından önce açık API mesajıyla 400 döner |
| `model_dump(exclude_unset=True)` | Yalnızca gönderilen alanlar güncellenir, istem dışı overwrite olmaz |
| `ilike` ile search | Case-insensitive kısmi eşleşme; MSSQL'de ek konfigürasyon gerekmez |
| `ProductResponse` içine `CategoryResponse` embed | Client tek request'te tam ürün + kategori alır |

---

## Day 5 · 2026-04-08 — Cart System

### Özet

Sepet sistemi: `Cart` ve `CartItem` modelleri, Alembic migration, tam sepet API'si (görüntüle, ekle, miktar güncelle, kaldır), şemalar ve `User.cart` back-reference. README profesyonel ürün belgesi olarak yeniden yazıldı.

---

### Ne Yaptık

- `app/models/cart.py` — `Cart` (user başına unique), `CartItem` (cart_id + product_id + quantity); `cascade="all, delete-orphan"`
- `app/models/user.py` — `cart` relationship (`uselist=False`) eklendi
- `alembic/versions/20260408_0002_add_cart_tables.py` — `carts` ve `cart_items` oluşturuldu
- `app/schemas/cart.py` — request/response şemaları
- `app/api/v1/cart.py` — `GET /cart`, `POST /cart/add`, `PUT /cart/update`, `DELETE /cart/remove`

---

### 📚 Temel Kavramlar

**One-to-One vs One-to-Many İlişkiler**

Her kullanıcının tam olarak bir sepeti olur. Bu one-to-one ilişkidir. SQLAlchemy'de `relationship()` varsayılan olarak liste döner (one-to-many). One-to-one için `uselist=False` gerekir:

```python
cart: Mapped["Cart | None"] = relationship("Cart", uselist=False)
```

`uselist=False` olmadan `user.cart` bir liste döner. `uselist=False` ile tek `Cart` nesnesi (veya `None`) döner.

**Cascade Delete**

```python
items: Mapped[list["CartItem"]] = relationship(cascade="all, delete-orphan")
```

`cascade="all, delete-orphan"` şu anlama gelir: bir `Cart` silindiğinde, o sepete ait tüm `CartItem`'lar da otomatik silinir. "Orphan" — parent'ı olmayan child. Bunu yazmasan, `Cart` silince `cart_items` tablosunda orphan kayıtlar kalır ve FK constraint hatası alırsın.

**`db.flush()` vs `db.commit()`**

`db.flush()`: değişiklikleri SQL'e çevirir ve DB'ye gönderir ama transaction'ı kapatmaz. DB'de değişiklik gözükür ama henüz kalıcı değildir. Kullanım amacı: `flush` sonrası `order.id` gibi DB tarafından üretilen bir değere ihtiyaç duyuyorsun — FK için.

`db.commit()`: transaction'ı kapatır ve değişikliği kalıcı yapar. Başka session'lar artık bu veriyi görebilir. Hata durumunda `db.rollback()` ile tüm flush'lar geri alınır.

**`db.refresh()` — Session Cache Problemi**

SQLAlchemy session'ı bir önbellek gibi davranır. `cart.items` koleksiyonunu okuduktan sonra bir `CartItem` ekleyip commit etsen, `cart.items`'a tekrar baksan eski veriyi görebilirsin. `db.refresh(cart)` diyince SQLAlchemy o nesnenin tüm verilerini DB'den yeniden çeker. Her cart mutasyonundan sonra `db.refresh(cart)` şart — yoksa response eski veriyi döner.

**`_get_or_create_cart` Helper**

Kullanıcı ilk kez sepete ürün eklerken henüz bir `Cart` kaydı yok. Her cart endpoint'inde "var mı? yoksa oluştur" mantığını tekrar yazmak yerine tek bir helper:

```python
def _get_or_create_cart(user_id, db):
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.flush()
    return cart
```

---

### Teknik Kararlar

| Karar | Gerekçe |
|---|---|
| `unique=True` on `Cart.user_id` | DB ve ORM seviyesinde bir kullanıcı = bir sepet kısıtı; convention değil constraint |
| `_get_or_create_cart` helper | Auto-create mantığı tek yerde |
| Ekleme mevcut miktarı artırır | Zaten sepette olan ürünü tekrar eklemek sıfırlamak yerine artırır — gerçek UX |
| `quantity=0` ile kaldırma | Tek endpoint hem "miktar güncelle" hem "kaldır" işlevini görür |
| Tüm cart endpoint'leri protected | Sepet kişisel veridir, public read güvensizdir |

---

### Karşılaşılan Sorunlar

- `uselist=False` olmadan `user.cart` liste döner, `None` check'i çalışmaz.
- `db.refresh(cart)` olmadan response eski cache verisini döndürür.

---

## Day 6 · 2026-04-10 — Database Online

### Özet

Backend gerçek bir Microsoft SQL Server instance'ına bağlandı. `nova_store` veritabanı oluşturuldu, iki migration uygulandı, 5 tablo doğrulandı. Tekrarlanabilir utility script'ler eklendi. Windows uyumluluğu için komutlar `py` launcher'a güncellendi.

---

### Ne Yaptık

- `scripts/create_db.py` — `master`'a bağlanır, `nova_store` yoksa oluşturur; idempotent
- `scripts/create_db.sql` — SSMS veya sqlcmd için eşdeğer T-SQL
- `scripts/verify_tables.py` — SQLAlchemy Inspector ile 5 tablonun varlığını doğrular
- `alembic upgrade head` — `a1b2c3d4e5f6 → b2c3d4e5f6a7` migration zinciri çalıştı
- `README.md` — Database Setup bölümü, Windows komutları güncellendi

---

### Doğrulanan Tablolar

| Tablo | Migration |
|---|---|
| `users` | 0001_initial_tables |
| `categories` | 0001_initial_tables |
| `products` | 0001_initial_tables |
| `carts` | 0002_add_cart_tables |
| `cart_items` | 0002_add_cart_tables |

---

### 📚 Temel Kavramlar

**`autocommit=True` — Neden `CREATE DATABASE` Normal Transaction'da Çalışmaz?**

SQL Server'da `CREATE DATABASE` bir DDL (Data Definition Language) komutu. DDL komutları SQL Server'da transaction içinde çalıştırılamaz. pyodbc varsayılan olarak her bağlantıda bir transaction açar. Bu transaction içinde `CREATE DATABASE` dersen hata alırsın. `autocommit=True` ile her statement kendisi ayrı bir transaction olarak çalıştırılır — DDL açısından doğru davranış.

**Windows Authentication (Trusted Connection)**

SQL Server iki auth modu destekler:

- **SQL Auth**: kullanıcı adı + şifre. `sa` hesabı bu moddur.
- **Windows Auth**: mevcut Windows kullanıcısı ile bağlanır. Şifre gerekmez. Kurumsal ortamlarda tercih edilir.

`Trusted_Connection=yes` ile pyodbc'ye "Windows Auth kullan, kullanıcı adı/şifre isteme" deriz. Lokal geliştirmede bu daha güvenli ve kolaydır — şifreyi `.env`'e yazmana gerek yok.

**`TrustServerCertificate=yes`**

Lokal SQL Server instance'ları genellikle self-signed SSL sertifika kullanır. pyodbc bu sertifikayı doğrulamak isteyince başarısız olur çünkü güvenilir bir CA tarafından imzalanmamıştır. `TrustServerCertificate=yes` ile "bu sertifikayı doğrulama, güven" deriz. Production'da bunu yapmamalısın — gerçek sertifika kullanılmalı.

**Named Instance (`localhost\SQLEXPRESS`)**

SQL Server'ın iki çalışma modeli var. Varsayılan instance: `localhost:1433` ile bağlanılır. Named instance: `localhost\SQLEXPRESS` gibi isimlendirilmiş, dinamik port kullanır. `server:port` URL formatı named instance ile güvenilir çalışmaz. `odbc_connect` formatı ile pyodbc'ye tam connection string verilir ve port otomatik bulunur (SQL Server Browser servisi aracılığıyla).

**SQLAlchemy `Inspector`**

`inspect(engine).get_table_names()` direkt SQL yazmadan DB'deki tablo listesini çekmenin dialect-agnostic yolu. MSSQL, PostgreSQL, SQLite'da aynı kod çalışır.

---

### Teknik Kararlar

| Karar | Gerekçe |
|---|---|
| `create_db.py` `master`'a bağlanır | `nova_store` henüz yokken ona bağlanamazsın; `master` her zaman erişilebilir |
| `autocommit=True` | `CREATE DATABASE` transaction içinde çalışmaz |
| `TrustServerCertificate=yes` | Lokal self-signed sertifika hatası önlenir |
| `odbc_connect` URL formatı | Named instance ile `server:port` formatı güvenilmez; tam connection string pyodbc'ye bırakılır |
| Script'ler `.env`'den okur | Tek kaynak; script'lerde hardcoded credential yok |

---

### Karşılaşılan Sorunlar

- `CREATE DATABASE` transaction içinde çalışmaz; `autocommit=True` gerekti.
- `localhost\SQLEXPRESS` named instance için `odbc_connect` URL formatına geçildi; `DB_PORT` kaldırıldı.
- `alembic/env.py`'da `config.set_main_option("sqlalchemy.url", ...)` — URL içindeki `%` karakterleri configparser interpolation syntax'ı ile çakıştı. `create_engine()` ile direkt engine oluşturmaya geçildi.

---

## Day 7 · 2026-04-11 — Role System & Order Module

### Özet

Backend'in iki kritik eksikliği tamamlandı: **rol tabanlı erişim kontrolü** (admin / customer) ve tam **sipariş sistemi** (cart'tan sipariş oluşturma, fiyat snapshot, durum makinesi). Kategoriler ve ürünler artık yalnızca admin kullanıcılar tarafından değiştirilebiliyor.

---

### Ne Yaptık

**Role sistemi:**
- `User.role` alanı eklendi (`String(20)`, server_default `"customer"`)
- `dependencies.py`'a `get_current_admin` dependency eklendi — `role != "admin"` ise 403
- `categories.py` ve `products.py` write endpoint'leri `get_current_admin` ile güncellendi

**Order modülü:**
- `app/models/order.py` — `Order`, `OrderItem`, `Address` modelleri
- `app/schemas/order.py` — `OrderCreate`, `OrderStatusUpdate`, `OrderItemResponse`, `OrderResponse`, `AddressCreate`, `AddressResponse`
- `app/api/v1/orders.py` — 5 endpoint: sipariş oluştur, listele, detay, durum güncelle (admin), tüm siparişler (admin)
- `alembic/versions/20260411_0003_role_and_order_tables.py` — `users.role` sütunu + `orders`, `order_items`, `addresses` tabloları

---

### 📚 Temel Kavramlar

**Role-Based Access Control (RBAC)**

RBAC: "kim olduğuna göre ne yapabilirsin" sorusunun cevabı. İki temel konsept: Authentication (kimsin?) ve Authorization (ne yapabilirsin?).

Bu projede iki rol:
- `customer`: kendi sepeti, kendi siparişleri, public read
- `admin`: her şey + catalog yönetimi + sipariş durum güncellemesi

Uygulama yöntemi olarak `User.role` sütununu seçtik. Basit, yeterli. Daha karmaşık sistemlerde ayrı `roles` ve `permissions` tabloları olur (RBAC tam implementasyonu). Şimdilik overkill.

**Dependency Zinciri**

```python
def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    return current_user
```

`get_current_admin`, `get_current_user`'a depend eder. FastAPI çağrı zincirini otomatik çözer:

```
Request gelir
  → get_current_user çalışır (token doğrula, user bul)
  → get_current_admin çalışır (role kontrol et)
  → route handler çalışır
```

Her katman tek bir sorumluluğa sahip. Token geçersizse 401, user inactive ise 403, rol yanlışsa 403. Hata ayıklama kolaylaşır.

**Admin Yapma — Neden Public Endpoint Yok?**

"Admin olmak için endpoint olmamalı" — bu bilinçli bir güvenlik kararı. Şu an admin yapmak için doğrudan DB'de `UPDATE users SET role='admin' WHERE email='...'` çalıştırmak gerekiyor. Bu kasıtlı bir kısıtlama: internet üzerinden çağrılabilir bir "beni admin yap" endpoint'i olmamalı. Gerçek projelerde bu işlem genellikle güvenli admin CLI veya migration seed script ile yapılır.

**Fiyat Snapshot Paterni**

```python
unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
```

E-ticarette kritik bir kural: sipariş verildiği andaki fiyat saklanmalı, ürünün mevcut fiyatına referans verilmemeli. Neden? Ürün fiyatı sonradan değişebilir. Müşteri 149.99'a satın aldı, fiyat sonradan 199.99 oldu. Müşterinin siparişi hâlâ 149.99 göstermeli. `OrderItem.unit_price` sipariş anındaki fiyatın snapshot'ıdır. `OrderItem.product_name` de aynı nedenle snapshot'tır — ürün adı değişse bile sipariş tarihi görünümü değişmemeli.

**Sipariş Oluşturma Transaction Mantığı**

`POST /orders` bir transaction içinde şunları yapar:

1. Cart boş mu? → 400
2. Tüm ürünler için stok yeterli mi? → 400
3. `Order` oluştur, `db.flush()` (id al)
4. Her cart item için `OrderItem` oluştur (price snapshot + isim snapshot)
5. Her ürünün `stock`'unu azalt
6. `Address` oluştur
7. Cart item'larını sil (sepeti boşalt)
8. `db.commit()`

Eğer adım 4'te bir ürünün stoku sıfırın altına inecekse adım 2'de yakalanır. Adım 8'deki `commit` tüm bunları atomik yapar: ya hepsi gerçekleşir ya hiçbiri. `commit` öncesi hata olursa `rollback` ile her şey geri alınır — DB yarım kalmaz.

**Sipariş Durum Makinesi (Status Machine)**

Sipariş durumu keyfi değiştirilmemeli; belirli bir akış var:

```
pending → paid → shipped → cancelled (herhangi aşamadan)
```

Şu an validasyonu basit tutuyoruz — geçerli değerler Pydantic `pattern` ile kontrol ediliyor:

```python
status: str = Field(..., pattern="^(pending|paid|shipped|cancelled)$")
```

Gelişmiş implementasyonda "shipped'dan pending'e dönemezsin" gibi geçiş kuralları da eklenir (state machine pattern).

**`GET /orders/{id}` — Hem User Hem Admin Erişimi**

```python
if order.user_id != current_user.id and current_user.role != "admin":
    raise HTTPException(status_code=403, detail="Access denied.")
```

Bu endpoint hem customer hem admin kullanır. Customer kendi siparişini, admin herkesin siparişini görebilir. `get_current_admin` değil `get_current_user` dependency'si kullanıldı — sonra route içinde ikinci kontrol yapıldı.

---

### Teknik Kararlar

| Karar | Gerekçe |
|---|---|
| `role` sütunu `User`'da | Basit iki-rol sistemi için ayrı `roles` tablosu overkill |
| `server_default="customer"` | DB seviyesinde default — ORM bypass edilen insertlarda da geçerli |
| Admin yetkisi sadece DB'den değiştirilebilir | Public "promote to admin" endpoint güvenlik riski; kasıtlı kısıtlama |
| `OrderItem.unit_price` snapshot | Sonraki fiyat değişiklikleri tarihi siparişleri etkilemez |
| `OrderItem.product_name` snapshot | Sonraki ürün adı değişiklikleri tarihi siparişleri etkilemez |
| `db.flush()` order'dan sonra | `order.id` FK'lar için lazım; commit olmadan ID'yi kullanmak gerekiyor |
| Cascade delete `Order.items` ve `Order.address` | Sipariş silinince items ve address de temizlenir, orphan kalınmaz |
| `GET /admin/all` admin endpoint'i | Admin tüm siparişleri görebilmeli; müşteri listesi yalnızca kendi siparişlerini döner |

---

### Karşılaşılan Sorunlar

- `categories.py` ve `products.py`'da `get_current_user` import'ları `get_current_admin` ile değiştirilmesi gerekti — eski import varsa `NameError`.
- `orders.py`'da `from __future__ import annotations` kullanmak `Mapped[list[...]]` type hint'lerinin runtime'da sorun çıkarmamasını sağlar.

---

### Migration: 0003

```
users          → role kolonu eklendi (String(20), server_default="customer")
orders         → yeni tablo
order_items    → yeni tablo
addresses      → yeni tablo
```

---

## Revize Proje Planı

Bkz: bu dosyanın sonundaki **Project Plan — Revised 2026-04-10** bölümü.

---

## Project Plan — Revised 2026-04-10

### Context

7. Gün sonu (11 Nisan) itibarıyla backend çekirdeği tamamlandı:

| Modül | Durum |
|---|---|
| Backend foundation (FastAPI, config, DB, Alembic) | ✅ |
| Modeller: User, Category, Product, Cart, CartItem | ✅ |
| Auth: register, login, JWT, /me | ✅ |
| Role sistemi (admin/customer) | ✅ |
| Category CRUD (admin-protected) | ✅ |
| Product CRUD (search, filter, admin-protected) | ✅ |
| Cart sistemi | ✅ |
| Order sistemi (create, list, detail, status) | ✅ |
| CORS middleware | ❌ |
| Pagination | ❌ |
| Product images | ❌ |
| Seed data | ❌ |
| Docker | ❌ |
| React frontend | ❌ |
| Flutter mobile | ❌ |
| AI entegrasyonu | ❌ |

---

### Kalan Plan

#### Gün 8 · 12 Nisan — Backend Tamamlama

- CORS middleware (`CORSMiddleware`, `localhost:3000` ve `localhost:5173`)
- Pagination (`skip`, `limit` parametreleri products ve categories'e)
- Product images modeli (URL tabanlı), migration
- Seed data (`scripts/seed.py`)
- Docker (`Dockerfile` + `docker-compose.yml`)

#### Gün 9 · 13 Nisan — React Kurulumu + Admin Panel Foundation

- Vite + React + TypeScript kurulumu
- `axios` instance, `react-router-dom`, Auth context
- Admin login, protected route, dashboard layout

#### Gün 10 · 14 Nisan — Admin Panel Core

- Ürün ve kategori CRUD formları
- Sipariş listesi + detay + durum güncelleme
- Dashboard istatistik kartları

#### Gün 11 · 15 Nisan — Customer Web Part 1

- Homepage, shop sayfası, ürün detay
- Category filtresi, search bar

#### Gün 12 · 16 Nisan — Customer Web Part 2

- Login/register, cart sayfası, checkout, siparişlerim

#### Gün 13 · 17 Nisan — Flutter Mobile

- Login/register, ürün listesi, detay, sepet, checkout

#### Gün 14 · 18 Nisan — AI Entegrasyonu

- `POST /api/v1/ai/generate-description` (admin-only)
- Admin panelde "AI ile Açıklama Üret" butonu

#### Gün 15 · 19 Nisan — Polish + Docker

- Loading states, empty states, error messages, responsive fixes

#### Gün 16 · 20 Nisan — Final Paketleme

- README, architecture diagram, screenshots, sunum notları
