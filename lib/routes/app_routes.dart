import 'package:flutter/material.dart';
import '../features/auth/login_page.dart';
import '../features/auth/register_page.dart' as register_page;
import '../features/dashboard/dashboard_page.dart' as dashboard_page;

/// SIGEA – Sistema Institucional IFAL
/// Desenvolvido por Viktor Casado
/// Projeto Federal Educacional

class AppRoutes {
  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String dashboard = '/dashboard';
  static const String events = '/events';
  static const String profile = '/profile';

  static Map<String, WidgetBuilder> get routes => {
    login: (context) => const LoginPage(),
    register: (context) => const register_page.RegisterPage(),
    dashboard: (context) => const dashboard_page.DashboardPage(),
  };
}
