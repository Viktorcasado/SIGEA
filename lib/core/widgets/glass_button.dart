import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/ios_glass_theme.dart';

class GlassButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isLoading;

  const GlassButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return GestureDetector(
      onTap: isLoading ? null : onPressed,
      child: Container(
        height: 55,
        decoration: BoxDecoration(
          color: AppTheme.primaryGreen.withOpacity(0.8),
          borderRadius: BorderRadius.circular(IosGlassTheme.borderRadius),
          boxShadow: [
            BoxShadow(
              color: AppTheme.primaryGreen.withOpacity(0.3),
              blurRadius: 15,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Center(
          child: isLoading 
            ? const SizedBox(
                height: 20, 
                width: 20, 
                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
              )
            : Text(
                text,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.0,
                ),
              ),
        ),
      ),
    );
  }
}
