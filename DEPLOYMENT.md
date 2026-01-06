# Guia de Publicação do SIGEA

Este projeto pode ser publicado de duas formas:
1. **Web (Online):** Acessível via navegador (Deploy na Vercel).
2. **Desktop (Instalável):** Aplicativo para Windows (.exe).

---

## 1. Publicação Web (Online com Vercel)
A forma mais rápida de colocar o SIGEA no ar gratuitamente.

### Pré-requisitos
- Uma conta na [Vercel](https://vercel.com) (pode criar com GitHub).
- Node.js instalado.

### Passo a Passo
1. Abra o terminal na pasta do projeto.
2. Execute o comando de deploy:
   ```powershell
   npx vercel
   ```
3. Siga as instruções no terminal:
   - **Set up and deploy?** [y]
   - **Which scope?** [Enter para selecionar o padrão]
   - **Link to existing project?** [n]
   - **Project name:** [sigea]
   - **In which directory is your code located?** [./] (Enter)
   - **Want to modify these settings?** [n]

4. **Configurar Variáveis de Ambiente na Vercel:**
   Após o deploy, vá no painel da Vercel em **Settings > Environment Variables** e adicione:
   - `VITE_SUPABASE_URL`: (Sua URL do Supabase)
   - `VITE_SUPABASE_ANON_KEY`: (Sua Key Anon do Supabase)
   - `VITE_GEMINI_API_KEY`: (Sua API Key do Google Gemini, se usar IA)

---

## 2. Publicação Desktop (Windows .exe)
Gera um instalador `.exe` para instalar no computador.

### Passo a Passo
1. No terminal, execute:
   ```powershell
   npm run electron:build
   ```
2. Aguarde o processo. Isso vai:
   - Construir o site (Vite).
   - Empacotar com Electron.
   - Gerar o instalador.

3. O arquivo instalador (ex: `SIGEA Setup 0.0.0.exe`) estará na pasta:
   - `dist/` ou `release/` (dependendo da configuração do builder).

---

## Dicas Importantes
- **Banco de Dados:** O Supabase funciona na nuvem, então tanto a versão Web quanto Desktop acessarão os mesmos dados se as chaves estiverem corretas.
- **Segurança:** Nunca compartilhe suas chaves de serviço (Service Role). Use apenas a `ANON_KEY` no frontend.
