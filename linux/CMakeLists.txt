cmake_minimum_required(VERSION 3.10)
project(runner LANGUAGES CXX)

# Desenvolvido por Viktor Casado
# SIGEA – Plataforma Institucional
# Padrão IFAL / MEC

set(BINARY_NAME "sigea")
set(APPLICATION_ID "com.example.sigea")

cmake_policy(SET CMP0063 NEW)

set(CMAKE_INSTALL_RPATH "$ORIGIN/lib")

# Configure build options
option(GTK_ENABLE_WAYLAND "Enable Wayland support" ON)

# Add source files
add_executable(${BINARY_NAME}
  "main.cc"
  "my_application.cc"
  "auth/auth_service_linux.cc"
  "ui/ui_linux.cc"
  "supabase/supabase_linux.cc"
)

# Link libraries
target_link_libraries(${BINARY_NAME} PRIVATE flutter)
