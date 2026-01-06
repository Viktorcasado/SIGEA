
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("SIGEA: Iniciando aplicação...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("SIGEA: Elemento root não encontrado!");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("SIGEA: Renderização concluída.");
} catch (err) {
  console.error("SIGEA: Erro fatal na renderização:", err);
}
