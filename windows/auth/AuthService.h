/*
 * Desenvolvido por Viktor Casado
 * SIGEA – Plataforma Institucional
 * Padrão IFAL / MEC
 *
 * AuthService.h - Header de Autenticação Windows
 */

#ifndef AUTH_SERVICE_H_
#define AUTH_SERVICE_H_

#include <string>

namespace sigea {

class AuthService {
 public:
  AuthService();
  bool Login(const std::string& username, const std::string& password);
  void Logout();
  
 private:
  bool is_authenticated_;
};

} // namespace sigea

#endif // AUTH_SERVICE_H_
