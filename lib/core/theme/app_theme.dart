import 'package:flutter/material.dart';
import 'dart:ui';

/// SIGEA Design System - Institutional & Premium
/// Desenvolvido por Viktor Casado
class AppTheme {
  // Cores Institucionais IFAL (Modernizadas)
  static const Color primaryRed = Color(0xFFB30000); // Vermelho IFAL Profundo
  static const Color primaryGreen = Color(0xFF006633); // Verde IFAL Clássico
  static const Color secondaryGold = Color(0xFFD4AF37); // Dourado Premium

  // Cores Liquid Glass (Modo Claro)
  static const Color glassWhite = Color(0xCCFFFFFF); // Branco Translúcido 80%
  static const Color glassBorder = Color(0x33FFFFFF); // Borda Sutil

  // Cores Liquid Glass (Modo Escuro)
  static const Color glassDark = Color(0xCC1A1A1A); // Preto Translúcido
  static const Color glassDarkBorder = Color(0x33FFFFFF);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: primaryRed,
      scaffoldBackgroundColor: const Color(0xFFF2F2F7), // iOS System Gray 6
      fontFamily: 'SF Pro Display', // Fallback nativo deve ser tratado
      
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: Colors.black87,
          fontSize: 17,
          fontWeight: FontWeight.w600,
        ),
        iconTheme: IconThemeData(color: primaryRed),
      ),

      colorScheme: ColorScheme.light(
        primary: primaryRed,
        secondary: primaryGreen,
        surface: glassWhite,
        error: const Color(0xFFFF3B30),
      ),

      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: glassWhite,
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14), // iOS Style
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0x1A000000)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: primaryRed, width: 2),
        ),
      ),
      
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryRed,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(vertical: 16),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: primaryRed,
      scaffoldBackgroundColor: const Color(0xFF000000), // iOS Black
      
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontSize: 17,
          fontWeight: FontWeight.w600,
        ),
        iconTheme: IconThemeData(color: primaryRed),
      ),

       colorScheme: ColorScheme.dark(
        primary: primaryRed,
        secondary: primaryGreen,
        surface: glassDark,
        error: const Color(0xFFFF453A),
      ),
    );
  }
}

/// Widget Utilitário para efeito Blur (Liquid Glass)
class GlassContainer extends StatelessWidget {
  final Widget child;
  final double blur;
  final double opacity;
  final Color? color;
  final BorderRadius? borderRadius;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry margin;

  const GlassContainer({
    super.key,
    required this.child,
    this.blur = 15.0,
    this.opacity = 0.2,
    this.color,
    this.borderRadius,
    this.padding = const EdgeInsets.all(16),
    this.margin = EdgeInsets.zero,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin,
      child: ClipRRect(
        borderRadius: borderRadius ?? BorderRadius.circular(20),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              color: (color ?? Theme.of(context).colorScheme.surface).withOpacity(0.7),
              borderRadius: borderRadius ?? BorderRadius.circular(20),
              border: Border.all(
                color: Colors.white.withOpacity(0.2),
                width: 1.0,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}
