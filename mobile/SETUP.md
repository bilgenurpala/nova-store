# NovaStore Flutter App — Setup

## Prerequisites
- Flutter SDK ≥ 3.16.0 (https://flutter.dev/docs/get-started/install)
- Android Studio or Xcode (for emulator/simulator)
- Backend running (`docker-compose up` in the root folder)

## Quick Start

```bash
cd mobile

# Install dependencies
flutter pub get

# Run on Android emulator
flutter run

# Run on iOS simulator
flutter run -d ios

# Build APK
flutter build apk --release
```

## API Configuration

Edit `lib/config/app_config.dart`:

| Platform        | URL                        |
|-----------------|----------------------------|
| Android Emulator | `http://10.0.2.2:8000`    |
| iOS Simulator   | `http://localhost:8000`    |
| Physical Device | `http://<your-local-ip>:8000` |

## Screens

| Screen    | File                                          |
|-----------|-----------------------------------------------|
| Home      | `lib/screens/home/home_screen.dart`           |
| Shop      | `lib/screens/shop/shop_screen.dart`           |
| Cart      | `lib/screens/cart/cart_screen.dart`           |
| Favorites | `lib/screens/favorites/favorites_screen.dart` |
| Profile   | `lib/screens/profile/profile_screen.dart`     |
| Login     | `lib/screens/auth/login_screen.dart`          |
| AI Chat   | `lib/screens/ai_chat/ai_chat_screen.dart`     |

## Fonts (Optional)
Place Inter font files in `assets/fonts/`:
- Inter-Regular.ttf
- Inter-Medium.ttf
- Inter-SemiBold.ttf
- Inter-Bold.ttf

Download from: https://fonts.google.com/specimen/Inter
