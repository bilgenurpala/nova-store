# Nova Store — Flutter Mobile App

![Flutter](https://img.shields.io/badge/Flutter-3.16-02569B?style=flat&logo=flutter&logoColor=white)
![Dart](https://img.shields.io/badge/Dart-3-0175C2?style=flat&logo=dart&logoColor=white)
![Provider](https://img.shields.io/badge/State-Provider-orange?style=flat)
![Offline](https://img.shields.io/badge/Offline-First-success?style=flat)

> The Flutter mobile client for Nova Store. A pixel-perfect Figma implementation with offline-first architecture, Provider-based state management, and a full dark-themed admin panel — all sharing the same FastAPI backend as the React web frontend.

---

## Stack

| Technology | Purpose |
|------------|---------|
| Flutter 3.16 | Cross-platform UI framework |
| Dart 3 | Language |
| Provider | State management (`ChangeNotifier` + `Consumer`) |
| http | REST API calls with JWT auth headers |
| shared_preferences | JWT token and user data persistence across sessions |
| cached_network_image | Efficient network image loading with placeholder/error states |

---

## Architecture

### Offline-First Data Layer

The app never crashes when there is no network. `ApiService` tries data sources in order:

```
1. Live backend API     (5-second timeout)
        ↓ fails
2. assets/products.json (bundled inside the app binary)
        ↓ fails
3. Hardcoded mock list  (last resort — always available)
```

This means every screen renders correctly regardless of network state, making it safe to demo without a running backend.

### Provider State Management

Three `ChangeNotifier` classes are registered at the root via `MultiProvider` in `main.dart`:

| Provider | Responsibility |
|----------|---------------|
| `AuthProvider` | JWT token, user email, role (`customer`/`admin`), login/logout, `SharedPreferences` persistence |
| `CartProvider` | Cart items list, add/remove/update quantity, total price calculation |
| `FavoritesProvider` | Favorites list, toggle add/remove |

Widgets use `Consumer<T>` to rebuild only when their specific provider changes, not the whole tree. `context.read<T>()` provides one-time access without subscribing to rebuilds.

---

## Screens

### Customer

**HomeScreen** — Hero banner with gradient overlay, AI chat shortcut button, horizontal category chip row, 2-column product grid with rating and price. Tapping any product navigates to `ProductDetailScreen`.

**ShopScreen** — AppBar with inline search field, horizontal category filter chips, sort bottom sheet (price low/high, rating, newest), 2-column product grid with Add to Cart button on each card.

**ProductDetailScreen** — Uses `SliverAppBar` inside a `CustomScrollView` with `expandedHeight: 320`. The product image fills the expanded header and collapses into a thin bar as the user scrolls — the back button remains accessible at all times (`pinned: true`). Below the fold: category chip, product name, star rating row, price with discount badge and strikethrough original price, real description text from the API, color selector chips, storage selector chips, quantity counter, delivery info strip (Free Delivery / Easy Returns / Secure Payment), 3-tab `TabBar` (Description / Specifications / Reviews). A sticky bottom bar holds the Add to Cart and Add to Wishlist buttons.

**CartScreen** — Item list with product image, name, price, and inline quantity +/- controls. Swipe-to-remove or tap the trash icon. Order summary with subtotal and total. Checkout button.

**FavoritesScreen** — 2-column grid. Heart icon on each card toggles favorites state and updates the `FavoritesProvider`. Empty state with icon and CTA.

**ProfileScreen** — Two states: not logged in (sign-in prompt) and logged in (blue-bordered avatar with initials, stats row for Orders / Wishlist / Reviews / Points, Admin Panel button visible only to admins, recent order card, grouped menu items for Account / Shopping / Preferences, Sign Out).

### Auth

**LoginScreen** — Tab bar switching between Sign In and Create Account. Email/password form with validation. On success, stores JWT in `SharedPreferences` via `AuthProvider` and navigates to the home shell.

### AI Chat

**AiChatScreen** — Full-screen dark-themed chat interface (background `#0D0D0F`). Message bubbles: user messages align right in the primary blue, AI messages align left with a subtle left-border accent. Animated 3-dot typing indicator while waiting for a response. Quick reply chips below the first AI message. Suggestion chips above the input bar. Input field with visible cursor and white text on dark fill. Calls `POST /api/v1/ai/chat` with full conversation history — the server is stateless and reconstructs context from the history array each time.

### Admin Panel

A separate 5-tab dark-navigation shell accessible from the Profile screen (admin accounts only):

| Tab | Content |
|-----|---------|
| Dashboard | Welcome banner, 4 stat cards, weekly bar chart, recent orders list, quick action buttons |
| Products | Product list with category, price, stock info |
| Orders | Order list with status badges, tap for detail |
| Users | User list with role badges and search |
| Settings | App configuration panel |

---

## Project Structure

```
mobile/
├── pubspec.yaml                          ← Dependencies + asset declarations
├── assets/
│   └── products.json                     ← 10 offline products (fallback data)
├── android/app/src/main/
│   └── AndroidManifest.xml               ← INTERNET + cleartext traffic permissions
└── lib/
    ├── main.dart                         ← App entry, MultiProvider setup
    ├── config/
    │   └── app_config.dart               ← API base URL (change per target device)
    ├── theme/
    │   └── app_theme.dart                ← Colour tokens (kPrimary, kGreen…) + ThemeData
    ├── models/
    │   ├── product.dart                  ← Product model with fromJson factory
    │   └── chat_message.dart             ← ChatMessage model
    ├── providers/
    │   ├── auth_provider.dart
    │   ├── cart_provider.dart
    │   └── favorites_provider.dart
    ├── services/
    │   └── api_service.dart              ← HTTP client + 3-level offline fallback
    └── screens/
        ├── main_shell.dart               ← 5-tab bottom navigation shell
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

- Flutter SDK ≥ 3.16.0 installed and on `PATH`
- Android emulator or physical device with USB debugging enabled

Check your setup:
```bash
flutter doctor
```

### Step 1 — Start the backend

```bash
cd ../backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Skip this step if you want to run in offline mode (the app will use bundled data).

### Step 2 — Configure the API URL

Edit `lib/config/app_config.dart`:

| Target | URL |
|--------|-----|
| Android emulator | `http://10.0.2.2:8000/api/v1` *(default)* |
| iOS simulator | `http://localhost:8000/api/v1` |
| Physical device | `http://<your-local-ip>:8000/api/v1` |

### Step 3 — Run

```bash
flutter pub get
flutter run
```

Target a specific device:
```bash
flutter devices
flutter run -d <device-id>
```

---

## Admin Login

1. Tap **Profile** tab → **Sign In**
2. Email: `admin@admin.com` · Password: `Admin1234!`
3. After login, the Profile tab shows an **Admin Panel** button
4. The admin panel has 5 tabs: Dashboard · Products · Orders · Users · Settings

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
