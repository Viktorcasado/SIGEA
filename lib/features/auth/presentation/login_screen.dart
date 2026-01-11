import 'package:flutter/material.dart';
import '../../core/ui/glass_container.dart';
import '../../core/ui/sigea_buttons.dart';
import '../../core/ui/sigea_input.dart';
import '../../core/theme/app_theme.dart';

/**
 * Desenvolvido por Viktor Casado
 * SIGEA – Plataforma Institucional
 * Padrão IFAL / MEC
 * 
 * LoginScreen - Tela de Autenticação
 */

class LoginScreen extends StatelessWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background (Imagem + Overlay)
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF005DA5), Color(0xFF003366)], // Fallback gradient
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
            // Na prática usaria: Image.asset('assets/images/ifal_campus.jpg', fit: BoxFit.cover),
          ),
          
          // Conteúdo
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo e Saudação
                  const Icon(Icons.school, size: 64, color: Colors.white), // Logo Placeholder
                  const SizedBox(height: 16),
                  const Text(
                    "Olá, acadêmico",
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const Text(
                    "Faça login para continuar",
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white70,
                    ),
                  ),
                  const SizedBox(height: 40),

                  // Glass Form
                  GlassContainer(
                    width: double.infinity,
                    child: Column(
                      children: [
                         const SigeaInput(
                          hint: "E-mail institucional",
                          prefixIcon: Icons.email_outlined,
                        ),
                        const SizedBox(height: 16),
                        const SigeaInput(
                          hint: "Senha",
                          prefixIcon: Icons.lock_outline,
                          isPassword: true,
                        ),
                        const SizedBox(height: 12),
                        
                        // Esqueci senha
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            onPressed: () {},
                            child: const Text(
                              "Esqueci minha senha",
                              style: TextStyle(color: AppTheme.ifalBlue),
                            ),
                          ),
                        ),
                        
                        const SizedBox(height: 24),
                        PrimaryButton(
                          label: "Entrar",
                          onPressed: () {},
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),
                  
                  // Divisor
                  Row(
                    children: [
                      const Expanded(child: Divider(color: Colors.white30)),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text("OU", style: TextStyle(color: Colors.white.withOpacity(0.6))),
                      ),
                      const Expanded(child: Divider(color: Colors.white30)),
                    ],
                  ),
                  
                  const SizedBox(height: 32),
                  
                  // Botões Alternativos
                  GovBrButton(onPressed: () {}),
                  
                  const SizedBox(height: 24),
                  
                  // Biometria
                  Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white30),
                        ),
                        child: const Icon(Icons.fingerprint, size: 32, color: Colors.white),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        "Usar Biometria",
                        style: TextStyle(color: Colors.white70),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
