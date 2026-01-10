import 'package:flutter/material.dart';
import '../theme/ios_glass_theme.dart';

class GlassTextField extends StatelessWidget {
  final TextEditingController controller;
  final String hintText;
  final bool isPassword;
  final IconData icon;
  final TextInputType keyboardType;

  const GlassTextField({
    super.key,
    required this.controller,
    required this.hintText,
    required this.icon,
    this.isPassword = false,
    this.keyboardType = TextInputType.text,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GlassContainer(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 5),
      child: TextField(
        controller: controller,
        obscureText: isPassword,
        keyboardType: keyboardType,
        style: TextStyle(
          color: isDark ? Colors.white : Colors.black87,
        ),
        decoration: InputDecoration(
          border: InputBorder.none,
          hintText: hintText,
          hintStyle: TextStyle(
            color: isDark ? Colors.white54 : Colors.black45,
          ),
          icon: Icon(
            icon,
            color: isDark ? Colors.white70 : Colors.black54,
          ),
        ),
      ),
    );
  }
}
