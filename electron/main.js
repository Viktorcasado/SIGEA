const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "SIGEA - IFAL",
        icon: path.join(__dirname, '../public/favicon.ico'), // Fallback se não houver ícone específico
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Em desenvolvimento, carrega a URL do Vite
    if (isDev) {
        win.loadURL('http://localhost:3000');
        win.webContents.openDevTools();
    } else {
        // Em produção, carrega o arquivo buildado
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Remove menu padrão
    win.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
