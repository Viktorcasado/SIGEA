import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/services/auth_service.dart';
import '../../core/services/biometric_service.dart'; // [NOVO]
import '../../core/theme/app_theme.dart';
import '../../routes/app_routes.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  
  void _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;
    
    final authService = Provider.of<AuthService>(context, listen: false);
    
    try {
      await authService.signInWithEmail(
        _emailController.text.trim(),
        _passwordController.text.trim(),
      );
      if (mounted) {
        Navigator.of(context).pushReplacementNamed(AppRoutes.dashboard);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao entrar: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Fundo Gradiente Institucional Suave
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFFF5F5F7), // Cinza Claro iOS
              Color(0xFFE5E5EA),
            ],
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo (Placeholder)
                Icon(Icons.school, size: 80, color: Theme.of(context).primaryColor),
                const SizedBox(height: 16),
                const Text(
                  'SIGEA',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    letterSpacing: -1.0,
                  ),
                ),
                Text(
                  'Gestão de Eventos Acadêmicos',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 48),

                // Card de Login "Liquid Glass"
                GlassContainer(
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        TextFormField(
                          controller: _emailController,
                          decoration: const InputDecoration(
                            labelText: 'E-mail Institucional',
                            prefixIcon: Icon(Icons.email_outlined),
                          ),
                          validator: (v) => v!.isEmpty ? 'Informe o e-mail' : null,
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _passwordController,
                          obscureText: true,
                          decoration: const InputDecoration(
                            labelText: 'Senha',
                            prefixIcon: Icon(Icons.lock_outline),
                          ),
                          validator: (v) => v!.isEmpty ? 'Informe a senha' : null,
                        ),
                        
                        // Botão Esqueci minha senha
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            onPressed: () {
                              // Navegar para recuperação
                            },
                            child: const Text('Esqueci minha senha'),
                          ),
                        ),
                        
                        const SizedBox(height: 24),
                        
                        // Botão Entrar
                        ElevatedButton(
                          onPressed: _handleLogin,
                          child: const Text('ENTRAR'),
                        ),
                        
                        const SizedBox(height: 16),

                        // BIOMETRIA BUTTON [NOVO]
                        Consumer<BiometricService>(
                          builder: (context, bio, _) {
                            if (!bio.isEnabled || !bio.isAvailable) return const SizedBox.shrink();
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 16),
                              child: OutlinedButton.icon(
                                onPressed: () async {
                                  final auth = Provider.of<AuthService>(context, listen: false);
                                  final success = await bio.authenticate();
                                  if (success && mounted) {
                                    // Se biometria OK, verifica se tem sessão válida ou recupera token
                                    if (auth.isAuthenticated) {
                                      Navigator.of(context).pushReplacementNamed(AppRoutes.dashboard);
                                    } else {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(content: Text('Sessão expirada. Faça login com senha novamente.'))
                                      );
                                    }
                                  }
                                },
                                icon: const Icon(Icons.fingerprint),
                                label: const Text('Entrar com Biometria'),
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  side: BorderSide(color: Theme.of(context).primaryColor),
                                ),
                              ),
                            );
                          },
                        ),
                        
                        // Botão Gov.br
                        OutlinedButton.icon(
                          onPressed: () {
                            Provider.of<AuthService>(context, listen: false).signInWithGovBr();
                          },
                          icon: const Icon(Icons.account_balance), 
                          label: const Text('Entrar com gov.br'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            side: BorderSide(color: Theme.of(context).primaryColor),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                
                const SizedBox(height: 32),
                const Text(
                  'Desenvolvido por Viktor Casado\nPlataforma Institucional IFAL',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
