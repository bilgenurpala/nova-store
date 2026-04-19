import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/cart_provider.dart';
import 'providers/favorites_provider.dart';
import 'screens/main_shell.dart';
import 'screens/auth/login_screen.dart';
import 'theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
  ));

  final auth = AuthProvider();
  await auth.init();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: auth),
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => FavoritesProvider()),
      ],
      child: const NovaStoreApp(),
    ),
  );
}

class NovaStoreApp extends StatelessWidget {
  const NovaStoreApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NovaStore',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      home: const MainShell(),
      routes: {
        '/login': (_) => const LoginScreen(),
      },
    );
  }
}
