import 'dart:convert';
import 'package:crypto/crypto.dart';

/// Serviço de Geração de Certificados
/// Lógica de geração de texto dinâmico e validação hash
/// Desenvolvido por Viktor Casado
class CertificateService {
  
  /// Gera o texto do certificado baseado no tipo de vínculo e dados do evento
  String generateCertificateText({
    required String userName,
    required String eventName,
    required String eventDate,
    required String role, // PARTICIPANTE, PALESTRANTE, ETC.
    required int hours,
  }) {
    switch (role.toUpperCase()) {
      case 'PALESTRANTE':
        return 'Certificamos que $userName ministrou palestra no evento "$eventName", '
               'realizado em $eventDate, com carga horária de $hours horas, contribuindo para '
               'o desenvolvimento acadêmico e tecnológico da comunidade IFAL.';
      
      case 'ORGANIZADOR':
        return 'Certificamos que $userName atuou como membro da Comissão Organizadora '
               'do evento "$eventName", realizado em $eventDate, desempenhando atividades '
               'de planejamento e execução com carga horária total de $hours horas.';

      case 'PARTICIPANTE':
      default:
        return 'Certificamos que $userName participou do evento "$eventName", '
               'promovido pelo Instituto Federal de Alagoas, realizado em $eventDate, '
               'com carga horária total de $hours horas.';
    }
  }

  /// Gera um Hash único para validação do certificado (QR Code)
  String generateValidationCode(String userId, String eventId, DateTime date) {
    final payload = '$userId-$eventId-${date.toIso8601String()}-SIGEA-SECRET';
    final bytes = utf8.encode(payload);
    final digest = sha256.convert(bytes);
    
    // Retorna os primeiros 16 caracteres do hash em maiúsculo (formato XXXX-XXXX-XXXX-XXXX)
    final hash = digest.toString().toUpperCase().substring(0, 16);
    return '${hash.substring(0, 4)}-${hash.substring(4, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}';
  }
}
