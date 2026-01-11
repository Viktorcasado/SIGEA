import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/**
 * Desenvolvido por Viktor Casado
 * SIGEA – Plataforma Institucional
 * Padrão IFAL / MEC
 * 
 * AppTheme - Definição de Cores e Tipografia
 */

class AppTheme {
  // Cores Primárias (Brand)
  static const Color ifalBlue = Color(0xFF005DA5);
  static const Color ifalBlueLight = Color(0xFF0077D4);
  
  // Cores de Ação
  static const Color mecRed = Color(0xFFCB2127);
  static const Color mecRedLight = Color(0xFFE03E43);
  static const Color successGreen = Color(0xFF28A745);

  // Surface Colors (Glass & Backgrounds)
  static const Color lightBackground = Color(0xFFF2F2F7);
  static const Color darkBackground = Color(0xFF000000); // Pure black for OLED
  static const Color darkSurface = Color(0xFF1C1C1E);
  
  // Texto
  static const Color textPrimaryLight = Color(0xFF1C1C1E);
  static const Color textSecondaryLight = Color(0xFF8E8E93);
  static const Color textPrimaryDark = Color(0xFFFFFFFF);
  static const Color textSecondaryDark = Color(0xFFAEAEB2);

  // Gradientes
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [ifalBlue, ifalBlueLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient mechGradient = LinearGradient(
    colors: [mecRed, mecRedLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Tema Claro
  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: lightBackground,
      primaryColor: ifalBlue,
      textTheme: GoogleFonts.interTextTheme().apply(
        bodyColor: textPrimaryLight,
        displayColor: textPrimaryLight,
      ),
      colorScheme: const ColorScheme.light(
        primary: ifalBlue,
        secondary: ifalBlueLight,
        error: mecRed,
        surface: Colors.white,
      ),
      useMaterial3: true,
    );
  }

  // Tema Escuro
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: darkBackground,
      primaryColor: ifalBlueLight,
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).apply(
        bodyColor: textPrimaryDark,
        displayColor: textPrimaryDark,
      ),
      colorScheme: const ColorScheme.dark(
        primary: ifalBlueLight,
        secondary: ifalBlue,
        error: mecRedLight,
        surface: darkSurface,
      ),
      useMaterial3: true,
    );
  }
}
