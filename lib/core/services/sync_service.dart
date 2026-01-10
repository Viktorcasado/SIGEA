import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Serviço de Sincronização (Offline-First)
/// Gerencia fila de mutações e cache local
/// Desenvolvido por Viktor Casado
class SyncService extends ChangeNotifier {
  final SupabaseClient _supabase = Supabase.instance.client;
  bool _isOnline = true;
  final List<Map<String, dynamic>> _mutationQueue = [];

  bool get isOnline => _isOnline;
  int get pendingOperations => _mutationQueue.length;

  SyncService() {
    _initConnectivityListeners();
  }

  void _initConnectivityListeners() {
    // Placeholder para ConnectivityPlus ou similar
    // Em produção: Connectivity().onConnectivityChanged.listen(...)
    // Simulando monitoramento:
    Timer.periodic(const Duration(seconds: 30), (timer) {
      _checkConnection();
    });
  }

  Future<void> _checkConnection() async {
    // Verificação simples de reachability
    try {
      // await InternetAddress.lookup('google.com');
      // _isOnline = true;
      // _processQueue();
    } catch (_) {
      _isOnline = false;
    }
    notifyListeners();
  }

  /// Adiciona uma operação de escrita na fila offline
  void queueOperation(String table, String action, Map<String, dynamic> data) {
    _mutationQueue.add({
      'table': table,
      'action': action, // 'INSERT', 'UPDATE', 'DELETE'
      'data': data,
      'timestamp': DateTime.now().toIso8601String(),
    });
    notifyListeners();
  }

  /// Processa a fila quando conexão é restaurada
  Future<void> _processQueue() async {
    if (!_isOnline || _mutationQueue.isEmpty) return;

    final List<Map<String, dynamic>> failedOps = [];

    for (final op in _mutationQueue) {
      try {
        final table = _supabase.from(op['table']);
        switch (op['action']) {
          case 'INSERT':
            await table.insert(op['data']);
            break;
          case 'UPDATE':
            await table.update(op['data']).match({'id': op['data']['id']});
            break;
          case 'DELETE':
            await table.delete().match({'id': op['data']['id']});
            break;
        }
      } catch (e) {
        // Se falhar, mantém na fila ou loga erro
        failedOps.add(op);
        debugPrint('Erro na sincronização: $e');
      }
    }

    _mutationQueue.clear();
    _mutationQueue.addAll(failedOps);
    notifyListeners();
  }
}
