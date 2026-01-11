# SIGEA - Sistema Integrado de Gestão de Eventos Acadêmicos
> Desenvolvido por Viktor Casado

Sistema institucional multiplataforma (Web, PWA, Android, iOS, Desktop) com foco em experiência premium e arquitetura escalável.

## 🚀 Tecnologias

- **Core**: React 18, TypeScript, Vite
- **Estilo**: TailwindCSS + Design Tokens (Liquid Glass / iOS Token System)
- **Backend/Auth**: Supabase (PostgreSQL)
- **Mobile**: Capacitor (Android/iOS) via Web Wrapper
- **Desktop**: Electron (Windows/Linux/macOS) via Web Wrapper
- **Deploy**: Vercel (Web/PWA)

## 📁 Estrutura do Projeto

```bash
/src
  /auth         # Contexto de autenticação e Biometria
  /components   # Componentes UI reutilizáveis
  /lib          # Clientes externos (Supabase)
  /pages        # Telas da aplicação
  /theme        # Design System e Global CSS
  /electron.js  # Entry-point para Desktop
/public
  /pwa          # Ícones e assets do PWA
/supabase
  /migrations   # SQL Schema e Policies
/android        # Configuração nativa Android
/ios            # Configuração nativa iOS
/windows        # Instaladores Windows
/linux          # Wrappers Linux
/macos          # Configuração macOS
```

## 🛠️ Como rodar

### Desenvolvimento Web
```bash
npm install
npm run dev
```

### Build para Produção
```bash
npm run build
```

### Supabase
O schema do banco de dados está em `/supabase/schema.sql`. Execute no editor SQL do Supabase.

## 📱 Mobile & Desktop
As pastas `/android` e `/ios` contém as configurações para build nativo. Para Windows, utilize o script NSIS em `/windows`.

---
© 2024 Instituto Federal de Alagoas - IFAL
