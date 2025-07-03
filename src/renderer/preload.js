const { contextBridge, ipcRenderer } = require('electron');

// Expose secure API to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Data management
    data: {
        read: (filename) => ipcRenderer.invoke('data:read', filename),
        write: (filename, data) => ipcRenderer.invoke('data:write', filename, data),
        backup: () => ipcRenderer.invoke('data:backup')
    },

    // App info
    app: {
        getDataPath: () => ipcRenderer.invoke('app:getDataPath'),
        getVersion: () => ipcRenderer.invoke('app:getVersion')
    },

    // Utility functions
    utils: {
        log: (level, message) => {
            console[level](`[DM Assistant] ${message}`);
        }
    }
});

// Log that preload has loaded
console.log('DM Assistant preload script loaded');