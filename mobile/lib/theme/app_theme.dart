import 'package:flutter/material.dart';

// ── Brand colours ──────────────────────────────────────────────────────────
const Color kPrimary       = Color(0xFF1754F5);
const Color kDark          = Color(0xFF0D0D0D);
const Color kDarkCard      = Color(0xFF1A1A1A);
const Color kDarkSurface   = Color(0xFF212121);
const Color kBackground    = Color(0xFFF5F5F7);
const Color kWhite         = Color(0xFFFFFFFF);
const Color kTextDark      = Color(0xFF1D1D1F);
const Color kTextSecondary = Color(0xFF8C8C8C);
const Color kTextHint      = Color(0xFF999EA8);
const Color kBorder        = Color(0xFFE5E8ED);
const Color kGreen         = Color(0xFF22C55E);
const Color kRed           = Color(0xFFEF4444);
const Color kOrange        = Color(0xFFF97316);
const Color kAiBanner      = Color(0xFFEEF3FF);

ThemeData buildTheme() {
  return ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: kPrimary,
      brightness: Brightness.light,
    ),
    scaffoldBackgroundColor: kBackground,
    fontFamily: null,
    appBarTheme: const AppBarTheme(
      backgroundColor: kDark,
      foregroundColor: kWhite,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: TextStyle(
        fontFamily: null,
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: kWhite,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: kPrimary,
        foregroundColor: kWhite,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: const TextStyle(
          fontFamily: null,
          fontSize: 15,
          fontWeight: FontWeight.w600,
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: kWhite,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: kBorder),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: kBorder),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: kPrimary, width: 1.5),
      ),
      hintStyle: const TextStyle(color: kTextHint, fontSize: 14),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    ),
  );
}
