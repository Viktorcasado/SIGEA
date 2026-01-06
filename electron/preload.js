const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Adicione APIs seguras aqui se necessário
    platform: process.platform,
});
