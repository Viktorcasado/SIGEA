import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/services/local_storage_service.dart';
import '../models/event_model.dart';

class EventRepository {
  final SupabaseClient _supabase;
  final LocalStorageService _localStorage;

  EventRepository(this._supabase, this._localStorage);

  /// Busca eventos: Tenta online, falha para offline
  Future<List<EventModel>> getEvents() async {
    try {
      // 1. Tenta buscar do Supabase
      final data = await _supabase
          .from('eventos')
          .select()
          .order('data_inicio', ascending: true);

      // 2. Transforma em Lista de Map para Cache
      final List<Map<String, dynamic>> eventsMap = List<Map<String, dynamic>>.from(data);
      
      // 3. Atualiza Cache Local
      await _localStorage.cacheEvents(eventsMap);
      
      // 4. Retorna Modelos
      return eventsMap.map((e) => EventModel.fromJson(e)).toList();

    } catch (e) {
      // 5. Se der erro (offline), busca do cache
      try {
        final cachedData = await _localStorage.getCachedEvents();
        return cachedData.map((e) => EventModel.fromJson(e)).toList();
      } catch (cacheError) {
        // Se não tiver nada, retorna vazio
        return [];
      }
    }
  }

  /// Inscrever usuário no evento
  Future<void> registerForEvent(String eventId, String userId) async {
    try {
      await _supabase.from('inscricoes').insert({
        'evento_id': eventId,
        'user_id': userId,
      });
    } catch (e) {
      // TODO: Adicionar à fila de sincronização offline (SyncService)
      rethrow;
    }
  }
  
  /// Criar evento (Apenas servidores)
  Future<void> createEvent(Map<String, dynamic> eventData) async {
    await _supabase.from('eventos').insert(eventData);
  }
}
