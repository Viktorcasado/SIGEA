import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/services/auth_service.dart';
import '../../core/theme/ios_glass_theme.dart';
import '../../core/theme/app_theme.dart';

/// SIGEA – Sistema Institucional IFAL
/// Desenvolvido por Viktor Casado
/// Projeto Federal Educacional

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Dashboard SIGEA'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => context.read<AuthService>().signOut(),
          ),
        ],
      ),
      drawer: MediaQuery.of(context).size.width < 800 ? const _MobileDrawer() : null,
      body: Row(
        children: [
          if (MediaQuery.of(context).size.width >= 800)
            const _DesktopSidebar(),
          
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                     AppTheme.primaryGreen.withOpacity(0.1),
                     AppTheme.backgroundLight,
                  ],
                ),
              ),
              child: const Center(
                child: SingleChildScrollView(
                  padding: EdgeInsets.all(20),
                  child: Column(
                    children: [
                      GlassContainer(
                        width: double.infinity,
                        padding: EdgeInsets.all(24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Eventos Recentes', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                            SizedBox(height: 10),
                            Text('Nenhum evento registrado hoje.'),
                          ],
                        ),
                      ),
                      SizedBox(height: 20),
                      Wrap(
                        spacing: 20,
                        runSpacing: 20,
                        children: [
                          _StatCard(title: 'Certificados', value: '12', icon: Icons.workspace_premium),
                          _StatCard(title: 'Inscrições', value: '5', icon: Icons.event_available),
                          _StatCard(title: 'Horas', value: '48h', icon: Icons.timer),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;

  const _StatCard({required this.title, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      width: 150,
      height: 150,
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
           Icon(icon, size: 40, color: AppTheme.primaryGreen),
           const SizedBox(height: 10),
           Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
           Text(title),
        ],
      ),
    );
  }
}

class _MobileDrawer extends StatelessWidget {
  const _MobileDrawer();

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          const UserAccountsDrawerHeader(
            accountName: Text("Viktor Casado"),
            accountEmail: Text("admin@ifal.edu.br"),
            decoration: BoxDecoration(color: AppTheme.primaryGreen),
          ),
          ListTile(
            leading: const Icon(Icons.dashboard),
            title: const Text('Dashboard'),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.event),
            title: const Text('Meus Eventos'),
            onTap: () {},
          ),
        ],
      ),
    );
  }
}

class _DesktopSidebar extends StatelessWidget {
  const _DesktopSidebar();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 250,
      color: Colors.white70,
      child: Column(
        children: [
          const SizedBox(height: 50),
          const Text("SIGEA ADMIN", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 50),
          ListTile(
            leading: const Icon(Icons.dashboard),
            title: const Text('Dashboard'),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.event),
            title: const Text('Eventos'),
            onTap: () {},
          ),
          // More items
        ],
      ),
    );
  }
}
