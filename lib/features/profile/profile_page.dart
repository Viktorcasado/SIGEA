import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/services/biometric_service.dart';
import '../../core/theme/app_theme.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Meu Perfil Institucional')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Carteirinha Digital
            GlassContainer(
              color: const Color(0xFFB30000).withOpacity(0.8), // Vermelho IFAL
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Row(
                      children: [
                         const Image(
                           image: NetworkImage('https://upload.wikimedia.org/wikipedia/commons/2/23/Instituto_Federal_de_Alagoas_-_Marca_Vertical_2015.svg'), // Placeholder Local
                           height: 50,
                           color: Colors.white,
                         ),
                         const SizedBox(width: 16),
                         Expanded(
                           child: Column(
                             crossAxisAlignment: CrossAxisAlignment.start,
                             children: const [
                               Text('INSTITUTO FEDERAL', style: TextStyle(color: Colors.white70, fontSize: 10)),
                               Text('ALAGOAS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                             ],
                           ),
                         )
                      ],
                    ),
                    const SizedBox(height: 24),
                    const CircleAvatar(
                      radius: 50,
                      backgroundImage: NetworkImage('https://i.pravatar.cc/150'), // Placeholder
                    ),
                    const SizedBox(height: 16),
                    const Text('VIKTOR CASADO', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20)),
                    const Text('Matrícula: 2023123456', style: TextStyle(color: Colors.white70)),
                    const SizedBox(height: 24),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text('ALUNO - CAMPUS MACEIÓ', style: TextStyle(color: Color(0xFFB30000), fontWeight: FontWeight.bold)),
                    )
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Dados Cadastrais
            GlassContainer(
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.email),
                    title: const Text('E-mail'),
                    subtitle: const Text('viktor.casado@aluno.ifal.edu.br'),
                    trailing: const Icon(Icons.edit, size: 16),
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(Icons.fingerprint),
                    title: const Text('CPF'),
                    subtitle: const Text('***.456.789-**'),
                  ),
                  const Divider(),
                  // [NOVO] Configuração de Biometria
                  Consumer<BiometricService>(
                    builder: (context, bio, _) {
                      if (!bio.isAvailable) return const SizedBox.shrink();
                      return SwitchListTile(
                        secondary: Icon(Icons.fingerprint, color: Theme.of(context).primaryColor),
                        title: const Text('Entrada Biométrica'),
                        subtitle: Text(bio.isEnabled ? 'Ativado (FaceID/TouchID)' : 'Toque para ativar'),
                        value: bio.isEnabled,
                        onChanged: (bool value) {
                          bio.toggleBiometrics(value);
                        },
                        activeColor: Theme.of(context).primaryColor,
                      );
                    },
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(Icons.school),
                    title: const Text('Curso'),
                    subtitle: const Text('Sistemas de Informação'),
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}
