import 'dart:async';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter/foundation.dart';

/// Serviço de Autenticação SIGEA
/// Gerencia Login, Logout, Persistência e Gov.br
/// Desenvolvido por Viktor Casado
class AuthService extends ChangeNotifier {
  final SupabaseClient _supabase = Supabase.instance.client;
  User? _currentUser;
  bool _isLoading = false;

  User? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _currentUser != null;

  AuthService() {
    _init();
  }

  /// Inicializa e escuta mudanças na sessão para evitar loops
  void _init() {
    // Escuta estado da autenticação
    _supabase.auth.onAuthStateChange.listen((data) {
      final AuthChangeEvent event = data.event;
      final Session? session = data.session;

      if (event == AuthChangeEvent.signedIn || event == AuthChangeEvent.tokenRefreshed) {
        _currentUser = session?.user;
      } else if (event == AuthChangeEvent.signedOut) {
        _currentUser = null;
      }
      
      notifyListeners();
    });

    // Recupera sessão atual se existir
    _currentUser = _supabase.auth.currentUser;
  }

  /// Login com Email e Senha
  Future<void> signInWithEmail(String email, String password) async {
    try {
      _setLoading(true);
      await _supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  /// Registro de Novo Usuário
  Future<void> signUp(String email, String password, Map<String, dynamic> metadata) async {
    try {
      _setLoading(true);
      await _supabase.auth.signUp(
        email: email,
        password: password,
        data: metadata, // Envia dados para o Trigger handle_new_user
      );
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  /// Login com Gov.br (OAuth 2.0)
  /// Nota: Requer configuração no Painel Supabase com Client ID/Secret do Gov.br
  Future<void> signInWithGovBr() async {
    try {
      _setLoading(true);
      await _supabase.auth.signInWithOAuth(
        OAuthProvider.google, // Placeholder: Gov.br não é nativo no SDK, usaria 'custom' ou OpenID
        // Para produção real Gov.br:
        // provider: OAuthProvider.oidc,
        // authScreenLaunchMode: kIsWeb ? LaunchMode.platformDefault : LaunchMode.externalApplication,
        redirectTo: kIsWeb ? null : 'br.edu.ifal.sigea://login-callback',
      );
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  /// Função de Recuperação de Senha
  Future<void> sendPasswordResetEmail(String email) async {
    await _supabase.auth.resetPasswordForEmail(
      email,
      redirectTo: 'br.edu.ifal.sigea://reset-password',
    );
  }

  /// Logout Seguro
  Future<void> signOut() async {
    try {
      _setLoading(true);
      await _supabase.auth.signOut();
      // Limpeza de cache local ou dados sensíveis pode ser feita aqui
    } finally {
      _setLoading(false);
    }
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}
