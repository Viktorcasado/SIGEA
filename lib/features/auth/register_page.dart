import 'package:flutter/material.dart';
import '../../core/widgets/glass_button.dart';
import '../../core/widgets/glass_text_field.dart';

/// SIGEA – Sistema Institucional IFAL
/// Desenvolvido por Viktor Casado
/// Projeto Federal Educacional

class RegisterPage extends StatelessWidget {
  const RegisterPage({super.key});

  @override
  Widget build(BuildContext context) {
     final emailController = TextEditingController();
    
    return Scaffold(
      appBar: AppBar(title: const Text('Cadastro SIGEA')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Crie sua conta institucional'),
              const SizedBox(height: 20),
               GlassTextField(controller: emailController, hintText: 'Email', icon: Icons.email),
              const SizedBox(height: 20),
              GlassButton(text: 'REGISTRAR', onPressed: () {
                Navigator.pop(context);
              }),
            ],
          ),
        ),
      ),
    );
  }
}
