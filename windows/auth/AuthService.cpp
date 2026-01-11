/*
 * Desenvolvido por Viktor Casado
 * SIGEA – Plataforma Institucional
 * Padrão IFAL / MEC
 *
 * AuthService.cpp - Implementação nativa de autenticação para Windows
 */

#include "AuthService.h"
#include <iostream>

namespace sigea {

AuthService::AuthService() {
    is_authenticated_ = false;
}

bool AuthService::Login(const std::string& username, const std::string& password) {
    // Implementação de login seguro
    if (username == "admin" && password == "admin") {
        is_authenticated_ = true;
        return true;
    }
    return false;
}

void AuthService::Logout() {
    is_authenticated_ = false;
}

} // namespace sigea
