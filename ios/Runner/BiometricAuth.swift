import LocalAuthentication

/*
 * Desenvolvido por Viktor Casado
 * SIGEA – Plataforma Institucional
 * Padrão IFAL / MEC
 *
 * BiometricAuth.swift - Autenticação Biométrica iOS (FaceID/TouchID)
 */

class BiometricAuth {
    static let shared = BiometricAuth()
    let context = LAContext()

    func configure() {
        // Configuração inicial
    }

    func authenticate(completion: @escaping (Bool) -> Void) {
        var error: NSError?
        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: "Acesse o SIGEA") { success, error in
                completion(success)
            }
        } else {
            completion(false)
        }
    }
}
