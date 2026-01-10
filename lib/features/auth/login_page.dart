import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/services/auth_service.dart';
import '../../core/widgets/glass_text_field.dart';
import '../../core/widgets/glass_button.dart';
import '../../routes/app_routes.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  Future<void> _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Por favor, preencha todos os campos.')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      await context.read<AuthService>().signInWithEmail(email, password);
      if (mounted) {
        Navigator.pushReplacementNamed(context, AppRoutes.dashboard);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao entrar: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Background Image or Gradient
    return Scaffold(
      body: Stack(
        children: [
          // Background Gradient / Image
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF1a2a6c), Color(0xFFb21f1f), Color(0xFFfdbb2d)], // Sample aesthetic gradient
              ),
            ),
          ),
          
          // Login Form
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 400),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Logo / Title
                    const Text(
                      'SIGEA',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 42,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 2.0,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Sistema Institucional de Gestão\nde Eventos Acadêmicos',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 50),

                    // Inputs
                    GlassTextField(
                      controller: _emailController,
                      hintText: 'Email Institucional',
                      icon: Icons.email_outlined,
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 16),
                    GlassTextField(
                      controller: _passwordController,
                      hintText: 'Senha',
                      icon: Icons.lock_outline,
                      isPassword: true,
                    ),
                    
                    const SizedBox(height: 32),

                    // Action Button
                    GlassButton(
                      text: 'ENTRAR',
                      onPressed: _handleLogin,
                      isLoading: _isLoading,
                    ),

                    const SizedBox(height: 24),
                    
                    // Footer Links
                    TextButton(
                      onPressed: () {
                         // Integrate Gov.br logic or Reset Password
                         Navigator.pushNamed(context, AppRoutes.register);
                      },
                      child: const Text(
                        'Esqueci minha senha',
                        style: TextStyle(color: Colors.white70),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
