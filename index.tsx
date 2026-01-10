
import React from 'react';
import { createRoot } from 'react-dom/client';
import { injectSpeedInsights } from '@vercel/speed-insights';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    // Initialize Vercel Speed Insights
    injectSpeedInsights();

    const root = createRoot(rootElement);
    // Removendo StrictMode para garantir comportamento previsível em APIs de hardware (Biometria)
    root.render(<App />);
  } catch (error) {
    console.error("Critical Render Error:", error);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: sans-serif; height: 100vh; display: flex; flex-direction: column; justify-content: center; background: #f3f7f7;">
        <h2 style="color: #ef4444;">Erro de Inicialização</h2>
        <p style="color: #666; font-size: 14px; margin-top: 10px;">Não foi possível carregar os módulos. Tente recarregar a página.</p>
        <button onclick="location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #10b981; color: white; border: none; border-radius: 12px; font-weight: bold;">Recarregar App</button>
      </div>
    `;
  }
}
