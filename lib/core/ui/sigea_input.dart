import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

/**
 * Desenvolvido por Viktor Casado
 * SIGEA – Plataforma Institucional
 * Padrão IFAL / MEC
 * 
 * SigeaInput - Campo de Texto Base
 */

class SigeaInput extends StatelessWidget {
  final String hint;
  final IconData prefixIcon;
  final bool isPassword;
  final TextEditingController? controller;

  const SigeaInput({
    Key? key,
    required this.hint,
    required this.prefixIcon,
    this.isPassword = false,
    this.controller,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final fillColor = isDark ? const Color(0xFF2C2C2E) : const Color(0xFFF2F2F7);

    return Container(
      height: 56,
      decoration: BoxDecoration(
        color: fillColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: TextField(
        controller: controller,
        obscureText: isPassword,
        style: TextStyle(
          color: isDark ? Colors.white : Colors.black,
          fontSize: 17,
        ),
        decoration: InputDecoration(
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          prefixIcon: Icon(prefixIcon, color: AppTheme.textSecondaryLight),
          hintText: hint,
          hintStyle: TextStyle(
            color: AppTheme.textSecondaryLight.withOpacity(0.6),
          ),
        ),
      ),
    );
  }
}
