import Foundation

/*
 * Desenvolvido por Viktor Casado
 * SIGEA – Plataforma Institucional
 * Padrão IFAL / MEC
 *
 * AuthService.swift - Autenticação MacOS nativa
 */

class AuthService {
    static let shared = AuthService()
    
    private init() {}
    
    func login() {
        print("Login nativo MacOS")
    }
    
    func checkSession() -> Bool {
        return false
    }
}
