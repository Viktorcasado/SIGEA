import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// SIGEA – Sistema Institucional IFAL
/// Desenvolvido por Viktor Casado
/// Projeto Federal Educacional

class AppTheme {
  // Institutional Colors (IFAL Inspired but Modernized)
  static const Color primaryGreen = Color(0xFF2E7D32); // IFAL Green
  static const Color secondaryRed = Color(0xFFC62828); // IFAL Red
  
  // Premium / Glass Colors
  static const Color glassWhite = Color(0xCCFFFFFF);
  static const Color glassDark = Color(0xCC1A1A1A);
  static const Color backgroundLight = Color(0xFFF5F5F7); // iOS Light Gray
  static const Color backgroundDark = Color(0xFF000000);  // Deep Black

  static final ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    scaffoldBackgroundColor: backgroundLight,
    primaryColor: primaryGreen,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primaryGreen,
      brightness: Brightness.light,
      surface: glassWhite,
    ),
    textTheme: GoogleFonts.interTextTheme(ThemeData.light().textTheme),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: TextStyle(
        color: Colors.black87,
        fontSize: 18,
        fontWeight: FontWeight.w600,
      ),
      iconTheme: IconThemeData(color: Colors.black87),
    ),
  );

  static final ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: backgroundDark,
    primaryColor: primaryGreen,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primaryGreen,
      brightness: Brightness.dark,
      surface: glassDark,
    ),
    textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: TextStyle(
        color: Colors.white,
        fontSize: 18,
        fontWeight: FontWeight.w600,
      ),
      iconTheme: IconThemeData(color: Colors.white),
    ),
  );
}
