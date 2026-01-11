import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './theme/globals.css';

// Desenvolvido por Viktor Casado
// Projeto SIGEA – Sistema Institucional

const root = document.getElementById('root');
if (root) {
    // Remove initial loader if present
    const loader = document.getElementById('initial-loader');
    if (loader) loader.remove();

    ReactDOM.createRoot(root).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
