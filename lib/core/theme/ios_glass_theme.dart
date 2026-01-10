import 'package:flutter/material.dart';
import 'dart:ui';

/// SIGEA – Sistema Institucional IFAL
/// Desenvolvido por Viktor Casado
/// Projeto Federal Educacional

class IosGlassTheme {
  static const double blurAmount = 20.0;
  static const double borderRadius = 20.0;
  
  static BoxDecoration get glassDecorationLight => BoxDecoration(
    color: Colors.white.withOpacity(0.7),
    borderRadius: BorderRadius.circular(borderRadius),
    border: Border.all(
      color: Colors.white.withOpacity(0.2),
    ),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.05),
        blurRadius: 20,
        spreadRadius: 5,
        offset: const Offset(0, 10),
      ),
    ],
  );

  static BoxDecoration get glassDecorationDark => BoxDecoration(
    color: Colors.black.withOpacity(0.6),
    borderRadius: BorderRadius.circular(borderRadius),
    border: Border.all(
      color: Colors.white.withOpacity(0.1),
    ),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.3),
        blurRadius: 20,
        spreadRadius: 5,
        offset: const Offset(0, 10),
      ),
    ],
  );
}

class GlassContainer extends StatelessWidget {
  final Widget child;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final VoidCallback? onTap;

  const GlassContainer({
    super.key, 
    required this.child, 
    this.width, 
    this.height, 
    this.padding, 
    this.margin,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Widget container = Container(
      width: width,
      height: height,
      padding: padding,
      decoration: isDark ? IosGlassTheme.glassDecorationDark : IosGlassTheme.glassDecorationLight,
      child: child,
    );

    if (onTap != null) {
      container = InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(IosGlassTheme.borderRadius),
        child: container,
      );
    }

    return Padding(
      padding: margin ?? EdgeInsets.zero,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(IosGlassTheme.borderRadius),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: IosGlassTheme.blurAmount, sigmaY: IosGlassTheme.blurAmount),
          child: container,
        ),
      ),
    );
  }
}
