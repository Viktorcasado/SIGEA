import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

/// Serviço de Armazenamento Local (SQLite)
/// Cache offline para Eventos, Perfis e Inscrições
/// Desenvolvido por Viktor Casado
class LocalStorageService {
  static final LocalStorageService _instance = LocalStorageService._internal();
  static Database? _database;

  factory LocalStorageService() => _instance;

  LocalStorageService._internal();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB();
    return _database!;
  }

  Future<Database> _initDB() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'sigea_offline.db');

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future<void> _createDB(Database db, int version) async {
    // Tabela de Eventos (Cache)
    await db.execute('''
      CREATE TABLE events (
        id TEXT PRIMARY KEY,
        titulo TEXT,
        descricao TEXT,
        banner_url TEXT,
        data_inicio TEXT,
        data_fim TEXT,
        local TEXT,
        campus_id TEXT,
        status TEXT,
        carga_horaria INTEGER,
        json_data TEXT
      )
    ''');
    
    // Tabela de Inscrições (Cache)
    await db.execute('''
      CREATE TABLE registrations (
        id TEXT PRIMARY KEY,
        evento_id TEXT,
        user_id TEXT,
        status TEXT
      )
    ''');
  }

  // --- CRUD Eventos ---

  Future<void> cacheEvents(List<Map<String, dynamic>> events) async {
    final db = await database;
    final batch = db.batch();
    
    // Limpa cache antigo (estratégia simples)
    batch.delete('events');
    
    for (var event in events) {
      batch.insert('events', {
        'id': event['id'],
        'titulo': event['titulo'],
        'descricao': event['descricao'],
        'banner_url': event['banner_url'],
        'data_inicio': event['data_inicio'],
        'data_fim': event['data_fim'],
        'local': event['local'],
        'campus_id': event['campus_id'],
        'status': event['status'],
        'carga_horaria': event['carga_horaria'],
        'json_data': event.toString(), // Backup cru
      });
    }
    
    await batch.commit(noResult: true);
  }

  Future<List<Map<String, dynamic>>> getCachedEvents() async {
    final db = await database;
    return await db.query('events');
  }
}
