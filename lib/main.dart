import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:provider/provider.dart';

import 'core/theme/app_theme.dart';
import 'core/services/auth_service.dart';
import 'core/services/biometric_service.dart'; // [NOVO]
import 'routes/app_routes.dart';

const String supabaseUrl = 'YOUR_SUPABASE_URL_HERE';
const String supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY_HERE';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Supabase.initialize(
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  );

  runApp(const SigeaApp());
}

class SigeaApp extends StatelessWidget {
  const SigeaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
        ChangeNotifierProvider(create: (_) => BiometricService()), // [NOVO]
      ],
      child: Consumer<AuthService>(
        builder: (context, auth, _) {
          return MaterialApp(
            title: 'SIGEA - IFAL',
            debugShowCheckedModeBanner: false,
            
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: ThemeMode.system,

            initialRoute: auth.isAuthenticated ? AppRoutes.dashboard : AppRoutes.login,
            onGenerateRoute: AppRoutes.generateRoute,
            
            builder: (context, child) {
              return child!;
            },
          );
        },
      ),
    );
  }
}
