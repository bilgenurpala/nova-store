# Nova Store — Improvement Plan

Bu döküman projenin mevcut durumunu analiz ederek öncelik sırasına göre yapılması gereken geliştirmeleri listeler. Her madde bağımsız bir görev olarak ele alınabilir.

**Öncelik Seviyeleri**
- 🔴 Kritik — Şu an production'a çıkamazsın
- 🟠 Yüksek — Projeyi gerçek yapan şeyler
- 🟡 Orta — Kaliteyi ciddi artırır
- 🟢 Düşük — Polish ve detay

---

## Bölüm 1 — Backend

### 🔴 1.1 Rate Limiting
**Ne:** Auth endpointlerine sınırsız istek atılabiliyor. Brute force saldırısına açık.  
**Nasıl:** `slowapi` kütüphanesi ile login endpoint'ine dakikada 5 istek limiti.  
**Tahmini süre:** 2 saat  
```python
# Örnek
@limiter.limit("5/minute")
async def login(request: Request, ...):
```

### 🔴 1.2 Refresh Token Mekanizması
**Ne:** Access token expire olunca kullanıcı direkt çıkış yapıyor.  
**Nasıl:** `POST /auth/refresh` endpoint'i, kısa ömürlü access token (15 dk) + uzun ömürlü refresh token (7 gün) sistemi.  
**Tahmini süre:** 1 gün

### 🔴 1.3 CORS Kısıtlaması
**Ne:** Tüm origin'lere açık muhtemelen.  
**Nasıl:** `allow_origins` listesine sadece kendi Netlify domain'ini ve localhost ekle. Production'da wildcard `*` kullanma.  
**Tahmini süre:** 30 dakika

### 🟠 1.4 Repository Pattern
**Ne:** Her endpoint direkt `db.query()` yapıyor. Business logic ile database query karışık.  
**Nasıl:** `app/repositories/` klasörü aç. `ProductRepository`, `OrderRepository`, `UserRepository` sınıfları yaz.  
**Tahmini süre:** 2 gün  
```
app/
└── repositories/
    ├── base.py
    ├── product.py
    ├── order.py
    └── user.py
```

### 🟠 1.5 Soft Delete
**Ne:** Ürün silinince gerçekten siliniyor. O ürünü içeren eski siparişlerde ürün detayına gidince 404.  
**Nasıl:** `products` tablosuna `is_deleted BOOLEAN DEFAULT FALSE` ve `deleted_at DATETIME` ekle. Tüm query'lere `WHERE is_deleted = FALSE` filtresi.  
**Tahmini süre:** 1 gün (migration dahil)

### 🟠 1.6 Full-Text Search
**Ne:** `LIKE '%query%'` büyük kataloglarda yavaş ve yetersiz.  
**Nasıl:** MSSQL'de `FULLTEXT INDEX` oluştur. Uzun vadede Elasticsearch veya AI embedding tabanlı semantic search.  
**Tahmini süre:** 1 gün

### 🟠 1.7 Redis Cache
**Ne:** Ürün listesi, kategori listesi, dashboard istatistikleri her istekte database'den çekiliyor.  
**Nasıl:** `redis` + `fastapi-cache2`. Popüler endpoint'lere 5 dakika cache. Ürün güncellenince cache invalidate.  
**Tahmini süre:** 1 gün

### 🟠 1.8 Background Jobs
**Ne:** Sipariş oluşturulunca email, stok azalınca admin uyarısı, raporlar async olmalı.  
**Nasıl:** `FastAPI BackgroundTasks` (basit) veya `Celery + Redis` (production). Email için `SendGrid` veya `Resend`.  
**Tahmini süre:** 2 gün

### 🟠 1.9 Kullanıcı Güncelleme Endpoint'i
**Ne:** Frontend'de Profile sayfasında "Save Changes" butonu var ama backend endpoint'i yok.  
**Nasıl:** `PATCH /auth/me` — first_name, last_name, phone, city alanları güncellenebilir.  
**Tahmini süre:** 3 saat

### 🟡 1.10 Audit Log
**Ne:** Kim ne zaman ne yaptı? Admin hangi siparişi değiştirdi? Production'da debug imkansız.  
**Nasıl:** `audit_logs` tablosu: `user_id`, `action`, `entity`, `entity_id`, `old_value`, `new_value`, `created_at`.  
**Tahmini süre:** 1 gün

### 🟡 1.11 Email Verification & Password Reset
**Ne:** Kayıt olunca email doğrulama yok. Şifre unutulunca sıfırlama yok.  
**Nasıl:** `email_verifications` ve `password_resets` tabloları. Token tabanlı flow. Email servisi.  
**Tahmini süre:** 2 gün

### 🟡 1.12 Webhook Altyapısı
**Ne:** Ödeme sistemi ve kargo entegrasyonu için gerekli.  
**Nasıl:** `POST /webhooks/stripe`, `POST /webhooks/cargo` endpoint'leri. HMAC signature doğrulama.  
**Tahmini süre:** 1 gün

---

## Bölüm 2 — AI Entegrasyonu

### 🔴 2.1 Streaming Responses
**Ne:** Cevabın tamamı gelene kadar typing indicator dönüyor. ChatGPT gibi kelime kelime akmalı.  
**Nasıl:** FastAPI `StreamingResponse` + Anthropic SDK `stream=True`. Frontend'de `ReadableStream` ile chunk'ları oku.  
**Tahmini süre:** 1 gün  
```python
# Backend
async def chat_stream(...):
    with client.messages.stream(...) as stream:
        for text in stream.text_stream:
            yield f"data: {text}\n\n"

return StreamingResponse(chat_stream(), media_type="text/event-stream")
```

### 🔴 2.2 Structured Output + Ürün Kartları
**Ne:** AI şu an sadece düz metin döndürüyor. Cevabın içinde tıklanabilir ürün kartları, "Sepete Ekle" butonu olmalı.  
**Nasıl:** Claude'dan JSON döndürmesini iste. Frontend'de parse edip ürün kartı render et.  
**Tahmini süre:** 2 gün  
```json
{
  "message": "Bütçene göre iki harika seçenek var:",
  "products": [
    { "id": 7, "reason": "En iyi gürültü engelleme bu fiyata" },
    { "id": 9, "reason": "Daha kompakt, ANC dahil" }
  ],
  "action": "compare"
}
```

### 🔴 2.3 Tool Use / Function Calling
**Ne:** AI'nın gerçek aksiyonlar alabilmesi. "Sepete ekle", "Siparişimi göster", "Fiyat filtrele."  
**Nasıl:** Anthropic tool use API. Her tool bir FastAPI endpoint'i çağırır.  
**Tahmini süre:** 3 gün  
```python
tools = [
    {
        "name": "search_products",
        "description": "Search products by query and filters",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "max_price": {"type": "number"},
                "category": {"type": "string"}
            }
        }
    },
    {
        "name": "add_to_cart",
        "description": "Add a product to the user's cart",
        "input_schema": {
            "type": "object",
            "properties": {
                "product_id": {"type": "integer"},
                "quantity": {"type": "integer"}
            }
        }
    },
    {
        "name": "get_my_orders",
        "description": "Get the current user's order history"
    }
]
```

### 🟠 2.4 Semantic Search / Gerçek RAG
**Ne:** Şu an `LIKE '%laptop%'` yapıyor. "Uzun pil ömrü olan hafif bir şey" desen bulamaz.  
**Nasıl:** Ürün açıklamalarını embedding'e çevir (`text-embedding-3-small`). `pgvector` veya `ChromaDB`'ye kaydet. Kullanıcı mesajını da embedding'e çevir, cosine similarity ile en yakın ürünleri bul.  
**Tahmini süre:** 3 gün

### 🟠 2.5 Konuşma Geçmişi Kalıcılığı
**Ne:** Sayfa yenilenince konuşma siliniyor. Kullanıcının geçmiş AI konuşmaları kaybolmamalı.  
**Nasıl:** `conversations` ve `conversation_messages` tabloları. Kullanıcı giriş yapmışsa konuşma DB'ye kaydedilir.  
**Tahmini süre:** 1 gün

### 🟠 2.6 Kullanıcı Kişiselleştirmesi
**Ne:** AI şu an herkese aynı cevabı veriyor. Kullanıcının geçmişini bilmeli.  
**Nasıl:** System prompt'a kullanıcının son 5 siparişi, favori kategorileri, fiyat aralığı bilgisini ekle.  
**Tahmini süre:** 1 gün

### 🟡 2.7 Proaktif Öneriler
**Ne:** CartPage, ProductDetailPage gibi sayfalarda "AI önerisi" widget'ı.  
**Nasıl:** Sayfa açılınca arka planda AI çağrısı. "Bu ürünü alanların %60'ı bunu da aldı" veya "Bütçene göre daha iyi seçenek var."  
**Tahmini süre:** 2 gün

### 🟡 2.8 AI Rate Limiting
**Ne:** AI endpoint'ine de sınır koymak gerekiyor. Hem maliyet kontrolü hem abuse önleme.  
**Nasıl:** Kullanıcı başına günlük 50 mesaj limiti. `ai_usage` tablosu ile takip.  
**Tahmini süre:** 4 saat

---

## Bölüm 3 — Frontend (React)

### 🔴 3.1 Ödeme Entegrasyonu
**Ne:** Checkout butonu var ama hiçbir şey olmuyor.  
**Nasıl:** Stripe.js + `@stripe/react-stripe-js`. Test mode. `PaymentElement` component ile kart formu.  
**Tahmini süre:** 2 gün

### 🟠 3.2 Favoriler Backend'e Kaydedilmeli
**Ne:** Şu an `localStorage`'da. Başka cihazdan girilince favoriler yok.  
**Nasıl:** `favorites` tablosu backend'de. `POST /favorites/:product_id`, `DELETE /favorites/:product_id`, `GET /favorites`. `FavoritesContext` API'ye bağlanır.  
**Tahmini süre:** 1 gün

### 🟠 3.3 Optimistic Updates
**Ne:** Sepete eklenince API cevabı bekleniyor. Kullanıcı gecikme hissediyor.  
**Nasıl:** Önce UI'ı güncelle, sonra API çağır. API başarısız olursa geri al.  
**Tahmini süre:** 1 gün

### 🟠 3.4 Infinite Scroll / Virtual List
**Ne:** 1000 ürünle ShopPage'i açsan browser donacak.  
**Nasıl:** `react-virtualized` veya `@tanstack/react-virtual`. Intersection Observer ile sayfa sonunda otomatik yükleme.  
**Tahmini süre:** 1 gün

### 🟠 3.5 Error Boundary
**Ne:** Herhangi bir component çökerse tüm sayfa beyaz ekrana düşüyor.  
**Nasıl:** `React.ErrorBoundary` wrapper. Hata durumunda kullanıcıya anlam ifade eden mesaj göster.  
**Tahmini süre:** 4 saat

### 🟠 3.6 Form Validation
**Ne:** Register, login, profile sayfalarında inline hata mesajları eksik veya tutarsız.  
**Nasıl:** `react-hook-form` + `zod` ile schema-based validation. Her field için anında hata göster.  
**Tahmini süre:** 1 gün

### 🟡 3.7 Dark / Light Mode
**Ne:** Hiç yok.  
**Nasıl:** CSS variable'lar zaten var (`index.css`). `data-theme` attribute ile toggle. `localStorage`'a kaydet.  
**Tahmini süre:** 1 gün

### 🟡 3.8 SEO & Meta Tags
**Ne:** SPA olduğu için `<title>` değişmiyor, meta description yok.  
**Nasıl:** `react-helmet-async`. Her sayfa için dinamik title, description, Open Graph tags.  
**Tahmini süre:** 4 saat

### 🟡 3.9 PWA
**Ne:** Mobilde "Ana ekrana ekle" çalışmıyor, offline support yok.  
**Nasıl:** Vite PWA plugin. `manifest.json`, service worker, offline fallback page.  
**Tahmini süre:** 1 gün

### 🟡 3.10 Skeleton Loading Standardizasyonu
**Ne:** Bazı yerlerde skeleton var, bazı yerlerde yok.  
**Nasıl:** `SkeletonCard`, `SkeletonTable`, `SkeletonDetail` component'leri yaz. Async olan her yerde kullan.  
**Tahmini süre:** 4 saat

### 🟡 3.11 Toast Notification Sistemi
**Ne:** "Sepete eklendi", "Favorilere alındı", "Hata oluştu" mesajları tutarsız veya yok.  
**Nasıl:** `react-hot-toast` veya `sonner`. Tek satır import ile her yerden çağrılabilir.  
**Tahmini süre:** 2 saat

### 🟢 3.12 Micro-Interactions
**Ne:** Butonlar, kartlar, kalp ikonu — hiçbirinde animasyon yok.  
**Nasıl:** `framer-motion`. Sepete eklenince kart yukarı zıplar, kalbe tıklanınca büyür, sayfa geçişleri fade ile olur.  
**Tahmini süre:** 2 gün

### 🟢 3.13 Accessibility (a11y)
**Ne:** ARIA label yok, keyboard navigation düşünülmemiş.  
**Nasıl:** `eslint-plugin-jsx-a11y`. Tüm interactive element'lere `aria-label`. Tab ile gezinebilir form.  
**Tahmini süre:** 1 gün

---

## Bölüm 4 — Flutter (Mobile)

### 🔴 4.1 App Icon & Splash Screen
**Ne:** Muhtemelen hâlâ default Flutter ikonu ve beyaz splash ekran.  
**Nasıl:** `flutter_launcher_icons` + `flutter_native_splash` paketleri. Nova Store branding.  
**Tahmini süre:** 2 saat

### 🟠 4.2 Ödeme Entegrasyonu
**Ne:** Flutter tarafında da checkout yok.  
**Nasıl:** `flutter_stripe` paketi. Test mode ile kart input + payment intent.  
**Tahmini süre:** 2 gün

### 🟠 4.3 Push Notifications
**Ne:** Sipariş durumu değişince bildirim gelmiyor.  
**Nasıl:** `firebase_messaging` paketi. FCM token backend'e kaydedilir. Sipariş status değişince backend notification gönderir.  
**Tahmini süre:** 2 gün

### 🟠 4.4 Biometric Authentication
**Ne:** Face ID / parmak izi ile giriş yok.  
**Nasıl:** `local_auth` paketi. JWT token `SharedPreferences`'ta varsa biometric ile kilidi aç.  
**Tahmini süre:** 4 saat

### 🟠 4.5 Deep Linking
**Ne:** `novastore://product/42` linki uygulamayı açıp doğru sayfaya gitmiyor.  
**Nasıl:** `go_router` paketi ile deep link routing. Android `intent-filter`, iOS `Associated Domains`.  
**Tahmini süre:** 1 gün

### 🟠 4.6 Favoriler Backend Senkronizasyonu
**Ne:** Favoriler sadece local state'te, backend'e kaydedilmiyor.  
**Nasıl:** Frontend ile aynı — `favorites` tablosu backend'e eklendikten sonra `FavoritesProvider` API'ye bağlanır.  
**Tahmini süre:** 4 saat (backend değişikliği yapıldıktan sonra)

### 🟡 4.7 iOS Konfigürasyonu
**Ne:** Sadece Android test edilmiş. iOS `Info.plist` network ayarları eksik.  
**Nasıl:** `Info.plist`'e `NSAppTransportSecurity` ayarı. CocoaPods kurulumu. TestFlight'a yükleme.  
**Tahmini süre:** 1 gün

### 🟡 4.8 Haptic Feedback
**Ne:** Sepete eklenince, favoriye alınca fiziksel geri bildirim yok.  
**Nasıl:** `HapticFeedback.lightImpact()` — sepete ekleme, `HapticFeedback.selectionClick()` — seçim değiştirme.  
**Tahmini süre:** 2 saat

### 🟡 4.9 Dark / Light Mode
**Ne:** Uygulama sadece light mode'da.  
**Nasıl:** `app_theme.dart`'ta dark `ThemeData` tanımla. `ThemeMode.system` ile cihaz ayarına bağla.  
**Tahmini süre:** 4 saat

### 🟡 4.10 Skeleton Loading Standardizasyonu
**Ne:** Bazı ekranlarda skeleton var, bazılarında yok.  
**Nasıl:** `shimmer` paketi. `ShimmerProductCard`, `ShimmerList` widget'ları. Her async ekranda kullan.  
**Tahmini süre:** 4 saat

### 🟢 4.11 Animasyonlar
**Ne:** Ekranlar arası geçiş, bottom sheet, dialog — hepsi default Flutter animasyonu.  
**Nasıl:** `animations` paketi. `SharedAxisTransition`, `FadeThroughTransition`. Ürün kartına tap animasyonu.  
**Tahmini süre:** 1 gün

---

## Bölüm 5 — DevOps & Güvenlik

### 🔴 5.1 Backend Deploy
**Ne:** Frontend Netlify'da ama backend hâlâ localhost. AI chat, login, ürün listesi çalışmıyor.  
**Nasıl:** Railway veya Render'a deploy. MSSQL yerine PostgreSQL'e geçmek kolaylaştırır (Railway'de ücretsiz PostgreSQL var).  
**Tahmini süre:** 4 saat

### 🔴 5.2 Test Suite
**Ne:** Tek bir test bile yok. En büyük eksik bu.  
**Nasıl:**
- Backend: `pytest` + `httpx` ile endpoint testleri
- Frontend: `Vitest` + `React Testing Library`
- Flutter: `flutter_test` ile widget testleri
- Hedef: kritik path'ler için minimum %60 coverage  
**Tahmini süre:** 1 hafta

### 🟠 5.3 CI/CD Pipeline
**Ne:** Push yapınca otomatik test çalışmıyor, deploy olmuyor.  
**Nasıl:** GitHub Actions. PR açılınca test çalıştır. `main`'e merge olunca Netlify + Railway otomatik deploy.  
**Tahmini süre:** 1 gün  
```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install -r requirements.txt
      - run: pytest
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - run: npm ci && npm test
```

### 🟠 5.4 Monitoring & Error Tracking
**Ne:** Production'da neler olduğunu görmek imkansız.  
**Nasıl:** `Sentry` — hem backend hem frontend için. Hata olunca email bildirimi. Response time tracking.  
**Tahmini süre:** 4 saat

### 🟠 5.5 Database Migrations Güvenliği
**Ne:** Alembic'te `--autogenerate` her zaman doğru migration üretmez. Production'da veri kaybı riski.  
**Nasıl:** Her migration'ı manuel review et. `downgrade` fonksiyonlarını doldur. Staging environment'ta önce test et.  
**Tahmini süre:** Ongoing

### 🟡 5.6 Secrets Management
**Ne:** `.env` dosyası ile yönetiliyor. Production için yetersiz.  
**Nasıl:** Railway/Render environment variables. Uzun vadede AWS Secrets Manager veya HashiCorp Vault.  
**Tahmini süre:** 2 saat

### 🟡 5.7 API Documentation
**Ne:** FastAPI'nin otomatik Swagger var ama yetersiz. Request/response örnekleri eksik.  
**Nasıl:** Her endpoint'e `summary`, `description`, `response_model` ekle. Örnek request body'ler yaz.  
**Tahmini süre:** 1 gün

---

## Bölüm 6 — Design

### 🟠 6.1 Micro-Interactions & Animasyonlar
**Ne:** Hiçbir etkileşimde animasyon yok. "Polished" ile "amatör" arasındaki en büyük fark bu.  
**Nasıl:**
- Sepete eklenince buton `✓ Added` animasyonu
- Kalp ikonuna tıklanınca scale + color animasyonu
- Navbar cart badge'i sayı değişince zıplar
- Sayfa geçişleri fade/slide ile olur  
**Tahmini süre:** 2 gün

### 🟠 6.2 Responsive Design Düzeltmesi
**Ne:** Tablet ve ara ekran boyutlarında (768px–1024px arası) grid muhtemelen bozuluyor.  
**Nasıl:** Her sayfayı 320px, 768px, 1280px, 1920px'de test et. `sm:`, `md:`, `lg:` breakpoint'lerini gözden geçir.  
**Tahmini süre:** 1 gün

### 🟡 6.3 Illustration & Empty States
**Ne:** Boş sepet, boş favoriler sayfaları metin ve ikon ile geçiştirilmiş.  
**Nasıl:** Undraw.co veya custom SVG illustration. "Sepetiniz boş" yerine görsel hikaye anlat.  
**Tahmini süre:** 4 saat

### 🟡 6.4 Typography Hiyerarşisi
**Ne:** Başlık, alt başlık, body, caption boyutları tutarsız.  
**Nasıl:** `tailwind.config`'te type scale tanımla. `text-display`, `text-heading`, `text-body`, `text-caption` class'ları.  
**Tahmini süre:** 4 saat

---

## Öncelik Sırası — Nereden Başlamalı

Eğer bu projeye devam etmek istersen önerilen sıra:

### Faz 1 — Çalışır Hale Getir (1-2 hafta)
1. Backend deploy (Railway) → AI chat ve login çalışır
2. Rate limiting → güvenlik
3. CORS kısıtlaması → güvenlik
4. Kullanıcı güncelleme endpoint'i → Profile sayfası çalışır
5. Toast notification sistemi → UX

### Faz 2 — Gerçek Ürün Yap (2-4 hafta)
6. Stripe ödeme entegrasyonu
7. Favoriler backend senkronizasyonu
8. AI streaming
9. AI structured output + ürün kartları
10. Error boundary + form validation

### Faz 3 — Kalite (2-4 hafta)
11. Test suite (en az kritik path'ler)
12. CI/CD pipeline
13. AI tool use (sepete ekle, sipariş sorgula)
14. Push notifications (mobile)
15. Sentry monitoring

### Faz 4 — Polish (ongoing)
16. Micro-interactions
17. Dark mode
18. SEO
19. Accessibility
20. Semantic AI search (RAG)

---

*Bu plan projenin mevcut durumuna göre Nisan 2026'da hazırlanmıştır.*
