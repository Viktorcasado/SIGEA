/*
 * Desenvolvido por Viktor Casado
 * SIGEA – Plataforma Institucional
 * Padrão IFAL / MEC
 *
 * auth_service_linux.cc
 */

#include <iostream>

class AuthServiceLinux {
public:
    void Authenticate() {
        std::cout << "Autenticando via Linux PAM ou similar..." << std::endl;
    }
};
