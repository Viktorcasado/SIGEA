terraform_
cmake_minimum_required(VERSION 3.14)
project("sigea")

# Desenvolvido por Viktor Casado
# SIGEA – Plataforma Institucional
# Padrão IFAL / MEC

set(INSTALL_BUNDLE_DATA ON)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_subdirectory(flutter)

add_executable(sigea
  "runner/main.cpp"
  "runner/flutter_window.cpp"
  "runner/utils.cpp"
  "auth/AuthService.cpp"
  "ui/UIController.cpp"
  "supabase/SupabaseBridge.cpp" 
)

target_link_libraries(sigea PRIVATE flutter flutter_wrapper_app)
