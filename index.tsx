
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

/// Desenvolvido por Viktor Casado /// Projeto SIGEA – IFAL

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}