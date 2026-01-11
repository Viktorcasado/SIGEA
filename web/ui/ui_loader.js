/**
 * Desenvolvido por Viktor Casado
 * SIGEA – Plataforma Institucional
 * Padrão IFAL / MEC
 * 
 * UI Loader - Gerenciador de Interface Web
 * Responsável por carregar componentes visuais e temas iniciais
 */

class UILoader {
    constructor() {
        this.theme = 'light';
    }

    /**
     * Aplica o tema institucional
     */
    applyTheme() {
        document.documentElement.style.setProperty('--primary-color', '#0175C2');
        console.log('Tema Institucional SIGEA Aplicado');
    }

    /**
     * Mostra loading inicial
     */
    showLoader() {
        const loader = document.createElement('div');
        loader.id = 'app-loader';
        loader.innerHTML = 'Carregando SIGEA...';
        document.body.appendChild(loader);
    }

    hideLoader() {
        const loader = document.getElementById('app-loader');
        if (loader) loader.remove();
    }
}

const uiLoader = new UILoader();
uiLoader.applyTheme();
