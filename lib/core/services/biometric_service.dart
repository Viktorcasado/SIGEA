import 'package:flutter/services.dart';
import 'package:local_auth/local_auth.dart';
import 'package:local_auth/error_codes.dart' as auth_error;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter/foundation.dart';

/// Serviço de Autenticação Biométrica - SIGEA
/// Suporta: FaceID, TouchID, Fingerprint, WebAuthn (Compatibilidade)
/// Desenvolvido por Viktor Casado
class BiometricService extends ChangeNotifier {
  final LocalAuthentication auth = LocalAuthentication();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  bool _isAvailable = false;
  bool _isAuthenticating = false;
  bool _isEnabled = false;

  bool get isAvailable => _isAvailable;
  bool get isAuthenticating => _isAuthenticating;
  bool get isEnabled => _isEnabled;

  BiometricService() {
    _init();
  }

  Future<void> _init() async {
    await _checkAvailability();
    await _checkIfEnabled();
  }

  /// Verifica se o hardware suporta biometria
  Future<void> _checkAvailability() async {
    try {
      final bool canAuthenticateWithBiometrics = await auth.canCheckBiometrics;
      final bool canAuthenticate = canAuthenticateWithBiometrics || await auth.isDeviceSupported();
      
      _isAvailable = canAuthenticate;
      notifyListeners();
    } on PlatformException catch (e) {
      debugPrint("Erro ao verificar biometria: $e");
      _isAvailable = false;
      notifyListeners();
    }
  }

  /// Verifica se o usuário ativou a opção no app
  Future<void> _checkIfEnabled() async {
    final val = await _storage.read(key: 'biometrics_enabled');
    _isEnabled = val == 'true';
    notifyListeners();
  }

  /// Ativa ou Desativa o uso de Biometria
  Future<void> toggleBiometrics(bool value) async {
    if (value) {
      // Para ativar, exige uma confirmação biométrica primeiro
      final success = await authenticate(reason: "Confirme sua identidade para ativar a biometria");
      if (success) {
        await _storage.write(key: 'biometrics_enabled', value: 'true');
        _isEnabled = true;
      }
    } else {
      await _storage.delete(key: 'biometrics_enabled');
      _isEnabled = false;
    }
    notifyListeners();
  }

  /// Executa a autenticação
  /// [reason] é exibido para o usuário (ex: FaceID prompt)
  Future<bool> authenticate({String reason = 'Acesse o SIGEA com sua biometria'}) async {
    if (!_isAvailable) return false;

    try {
      _isAuthenticating = true;
      notifyListeners();

      final bool didAuthenticate = await auth.authenticate(
        localizedReason: reason,
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: false, // Permite fallback para PIN/Senha do dispositivo se necessário
          useErrorDialogs: true,
        ),
      );

      return didAuthenticate;
    } on PlatformException catch (e) {
      debugPrint("Erro de Autenticação: $e");
      if (e.code == auth_error.notAvailable) {
        // Tratar erro específico de Web ou Hardware indisponível
      }
      return false;
    } finally {
      _isAuthenticating = false;
      notifyListeners();
    }
  }

  /// Helper para PWA/Web: Retorna mensagem amigável se não suportado
  String getWebErrorMessage() {
    if (kIsWeb && !_isAvailable) {
      return "Este dispositivo ou navegador não suporta autenticação biométrica segura.";
    }
    return "";
  }
}
