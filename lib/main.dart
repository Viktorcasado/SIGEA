import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'core/services/supabase_service.dart';
import 'core/services/auth_service.dart';
import 'core/theme/app_theme.dart';
import 'routes/app_routes.dart';

/// SIGEA – Sistema Institucional IFAL
/// Desenvolvido por Viktor Casado
/// Projeto Federal Educacional

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Supabase
  await SupabaseService.initialize();

  runApp(const SigeaApp());
}

class SigeaApp extends StatelessWidget {
  const SigeaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
      ],
      child: MaterialApp(
        title: 'SIGEA IFAL',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('pt', 'BR'),
        ],
        initialRoute: AppRoutes.login,
        routes: AppRoutes.routes,
      ),
    );
  }
}
