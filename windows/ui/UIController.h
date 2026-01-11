/*
 * Desenvolvido por Viktor Casado
 * SIGEA – Plataforma Institucional
 * Padrão IFAL / MEC
 *
 * UIController.h
 */

#ifndef UI_CONTROLLER_H_
#define UI_CONTROLLER_H_

#include <string>

namespace sigea {

class UIController {
 public:
  void InitializeUI();
  void SetTitle(const std::string& title);
};

} // namespace sigea

#endif
