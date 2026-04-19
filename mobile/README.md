# Nova Store — Flutter Mobile App

Flutter + Dart ile geliştirilmiş Nova Store e-ticaret platformunun mobil istemcisi. Figma tasarımına piksel hassasiyetinde uygun, offline-first mimariye sahip tam donanımlı bir alışveriş uygulaması.

---

## Stack

| Technology | Purpose |
|------------|---------|
| Flutter ≥ 3.16 | UI framework (cross-platform) |
| Dart | Language |
| Provider | State management |
| http | HTTP client |
| shared_preferences | JWT token persistence |
| cached_network_image | Network image loading |

---

## Features

### Customer Screens
- **HomeScreen** — Hero banner, AI chat shortcut, category chips, product grid
- **ShopScreen** — Search bar, category filter chips, sort bottom sheet, 2-column product grid
- **ProductDetailScreen** — SliverAppBar (expandedHeight 320px, product image), color/storage selector chips, quantity counter, delivery info strip, 3-tab TabBar (Description / Specifications / Reviews), sticky Add to Cart + Wishlist bottom bar
- **CartScreen** — Item list with quantity update/remove, order summary
- **FavoritesScreen** — Wishlist grid with heart toggle
- **ProfileScreen** — Not-logged-in state; logged-in: avatar, stats row (Orders/Wishlist/Reviews/Points), Admin Panel button (admin only), recent order card, account menu groups, Sign Out

### Auth Screens
- **LoginScreen** — Email/password form with Register tab, JWT login

### AI Chat
- **AiChatScreen** — Dark-themed full-screen chat (bg `#0D0D0F`), typing indicator (3-dot bounce), quick reply chips, suggestion chips, calls `POST /api/v1/ai/chat`
- Accessible via robot icon in HomeScreen AppBar and AI banner on homepage

### Admin Panel (5-tab dark nav)
- **Dashboard** — Welcome banner, 4 stat cards, weekly bar chart, recent orders, quick actions
- **Products** — Product list with category, price, stock info
- **Orders** — Order list with status badges, filter by status
- **Users** — User list with role badges, search
- **Settings** — App configuration panel

---

## Project Structure

```
mobile/
├── pubspec.yaml                   ← Dependencies + asset declarations
├── assets/
│   └── products.json              ← Offline product data (10 items)
├── android/app/src/main/
│   └── AndroidManifest.xml        ← INTERNET + cleartext traffic permissions
└── lib/
    ├── main.dart                  ← App entry, MultiProvider setup
    ├── config/
    │   └── app_config.dart        ← API base URL config
    ├── theme/
    │   └── app_theme.dart         ← Colour tokens + ThemeData
    ├── models/
    │   ├── product.dart           ← Product (id, name, price, description, badge…)
    │   └── chat_message.dart
    ├── providers/
    │   ├── auth_provider.dart     ← JWT token, role, SharedPreferences persist
    │   ├── cart_provider.dart     ← Cart items, add/remove/update
    │   └── favorites_provider.dart
    ├── services/
    │   └── api_service.dart       ← HTTP client, 3-level fallback (API → JSON → mock)
    └── screens/
        ├── main_shell.dart                      ← 5-tab bottom nav shell
        ├── home/home_screen.dart
        ├── shop/shop_screen.dart
        ├── product/product_detail_screen.dart
        ├── favorites/favorites_screen.dart
        ├── cart/cart_screen.dart
        ├── profile/profile_screen.dart
        ├── auth/login_screen.dart
        ├── admin/admin_screen.dart
        └── ai_chat/ai_chat_screen.dart
```

---

## Running

### Prerequisites

- Flutter SDK ≥ 3.16.0 on PATH
- Android emulator (Pixel 8 API 35 recommended) **or** physical device with USB debugging

### Step 1 — Start the backend first

```bash
cd ../backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 2 — Run the app

```bash
flutter pub get
flutter run
```

For a specific device:

```bash
flutter devices          # list connected devices
flutter run -d <device-id>
```

---

## Connection URLs

Edit `lib/config/app_config.dart` to match your setup:

| Target | URL |
|--------|-----|
| Android emulator | `http://10.0.2.2:8000` *(default)* |
| iOS simulator | `http://localhost:8000` |
| Physical device | `http://<your-local-ip>:8000` |

---

## Offline Mode

If the backend is not running, the app automatically falls back through a 3-level chain:

1. `assets/products.json` — 10 products bundled inside the app binary
2. Hardcoded mock list — last resort if asset fails

All screens work without a backend connection.

---

## Admin Login

1. Open the app → tap **Profile** tab → **Sign In**
2. Email: `admin@admin.com` · Password: `Admin1234!`
3. After login, Profile tab shows **Admin Panel** button
4. Admin Panel has 5 tabs: Dashboard · Products · Orders · Users · Settings

---

## State Management

The app uses the Provider pattern with three `ChangeNotifier` classes registered at the root via `MultiProvider`:

| Provider | Responsibility |
|----------|---------------|
| `AuthProvider` | JWT token, user role, SharedPreferences persistence, login/logout |
| `CartProvider` | Cart items, add/remove/update quantity, total calculation |
| `FavoritesProvider` | Favorites list, toggle add/remove |

---

## Screenshots

| Sign In | Create Account | Profile |
|---------|----------------|---------|
| ![Sign In](https://github.com/user-attachments/assets/29da084b-75ff-490a-9384-c0fde1e9eb78) | ![Create Account](https://github.com/user-attachments/assets/fa1265e3-d10b-4384-b6fc-f8cdcdfe86da) | ![Profile](https://github.com/user-attachments/assets/dd2dac3c-3b8f-4450-9edf-f9e8f8854a1f) |

| Homepage | Shop | Favorites |
|----------|------|-----------|
| ![Homepage](https://github.com/user-attachments/assets/b16f6ea9-bf3f-433e-8a6d-2b358ffc13ba) | ![Shop](https://github.com/user-attachments/assets/d68802d9-1b27-4af5-9bf4-46f397e14a5f) | ![Favorites](https://github.com/user-attachments/assets/27ac0e3f-9174-4da9-afe2-cc3af9fa5c3d) |

| Cart | AI Chatbox | Admin Dashboard |
|------|------------|-----------------|
| ![Cart](https://github.com/user-attachments/assets/c866dffd-9508-44ec-9858-e11819adc575) | ![AI Chatbox](https://github.com/user-attachments/assets/076d5215-fadb-4458-8100-5b353917d4dc) | ![Admin Dashboard](https://github.com/user-attachments/assets/24810cdb-cfa6-4dd8-b000-96ce044573ca) |

| Admin Products | Admin Orders | Admin Users | Admin Settings |
|----------------|--------------|-------------|----------------|
| ![Admin Products](https://github.com/user-attachments/assets/df18daec-abc2-4d2f-b9b2-a79ebb4db288) | ![Admin Orders](https://github.com/user-attachments/assets/05f18f39-76e4-4d7f-9b93-d34a2e3c437d) | ![Admin Users](https://github.com/user-attachments/assets/3c46540c-d237-4000-bae6-31e953d978a6) | ![Admin Settings](https://github.com/user-attachments/assets/de4540bd-6c15-4680-b33c-268b377de6d8) |
