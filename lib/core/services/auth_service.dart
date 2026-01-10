import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter/foundation.dart';
import 'supabase_service.dart';

/// SIGEA – Sistema Institucional IFAL
/// Desenvolvido por Viktor Casado
/// Projeto Federal Educacional

class AuthService extends ChangeNotifier {
  final SupabaseClient _client = SupabaseService.client;

  User? get currentUser => _client.auth.currentUser;
  Session? get currentSession => _client.auth.currentSession;
  
  bool get isAuthenticated => currentUser != null;

  Future<AuthResponse> signInWithEmail(String email, String password) async {
    try {
      final response = await _client.auth.signInWithPassword(
        email: email,
        password: password,
      );
      notifyListeners();
      return response;
    } catch (e) {
      rethrow;
    }
  }

  Future<AuthResponse> signUp(String email, String password, String fullName) async {
    try {
      final response = await _client.auth.signUp(
        email: email,
        password: password,
        data: {'full_name': fullName}, // Trigger will capture this
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> signOut() async {
    await _client.auth.signOut();
    notifyListeners();
  }

  Future<void> resetPassword(String email) async {
    // Redirection URL should be configured in Supabase Dashboard -> Auth -> URL Configuration
    // Example: io.supabase.sigea://login-callback
    await _client.auth.resetPasswordForEmail(
      email,
      redirectTo: kIsWeb ? null : 'io.supabase.sigea://login-callback',
    );
  }

  Future<void> updatePassword(String newPassword) async {
    await _client.auth.updateUser(
      UserAttributes(password: newPassword),
    );
  }
}
