const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const log = require('electron-log');

// Development mode check
const isDev = process.argv.includes('--dev');

// Configure logging
log.info('DM Assistant starting...');

class DMAssistantApp {
    constructor() {
        this.mainWindow = null;
        this.dataPath = this.getDataPath();
        
        // Ensure data directory exists
        this.initializeDataDirectory();
    }

    getDataPath() {
        // In development, use project data folder
        // In production, use user data directory
        if (isDev) {
            return path.join(__dirname, '../../data');
        }
        return path.join(app.getPath('userData'), 'data');
    }

    async initializeDataDirectory() {
        try {
            await fs.mkdir(this.dataPath, { recursive: true });
            log.info('Data directory initialized:', this.dataPath);
        } catch (error) {
            log.error('Error creating data directory:', error);
        }
    }

    createMainWindow() {
        this.mainWindow = new BrowserWindow({
            width: 1400,
            height: 900,
            minWidth: 1000,
            minHeight: 700,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, '../renderer/preload.js')
            },
            icon: path.join(__dirname, '../../assets/icon.png'), // Aggiungeremo dopo
            show: false, // Don't show until ready
            titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
        });

        // Load the renderer
        this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

        // Show window when ready
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow.show();
            
            // Open DevTools in development
            if (isDev) {
                this.mainWindow.webContents.openDevTools();
            }
        });

        // Handle window closed
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });

        log.info('Main window created');
    }

    setupIPC() {
        // Data management IPC handlers
        ipcMain.handle('data:read', async (event, filename) => {
            try {
                const filePath = path.join(this.dataPath, filename);
                const data = await fs.readFile(filePath, 'utf8');
                return JSON.parse(data);
            } catch (error) {
                if (error.code === 'ENOENT') {
                    // File doesn't exist, return empty array/object
                    return filename.includes('settings') ? {} : [];
                }
                log.error('Error reading data file:', error);
                throw error;
            }
        });

        ipcMain.handle('data:write', async (event, filename, data) => {
            try {
                const filePath = path.join(this.dataPath, filename);
                await fs.writeFile(filePath, JSON.stringify(data, null, 2));
                log.info('Data saved:', filename);
                return true;
            } catch (error) {
                log.error('Error writing data file:', error);
                throw error;
            }
        });

        ipcMain.handle('data:backup', async () => {
            try {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const backupDir = path.join(this.dataPath, 'backups');
                await fs.mkdir(backupDir, { recursive: true });

                const files = await fs.readdir(this.dataPath);
                const jsonFiles = files.filter(file => file.endsWith('.json'));

                for (const file of jsonFiles) {
                    const sourcePath = path.join(this.dataPath, file);
                    const backupPath = path.join(backupDir, `${timestamp}-${file}`);
                    await fs.copyFile(sourcePath, backupPath);
                }

                log.info('Backup created:', timestamp);
                return { success: true, timestamp };
            } catch (error) {
                log.error('Error creating backup:', error);
                throw error;
            }
        });

        ipcMain.handle('app:getDataPath', () => this.dataPath);
        ipcMain.handle('app:getVersion', () => app.getVersion());

        log.info('IPC handlers registered');
    }

    init() {
        // App event handlers
        app.whenReady().then(() => {
            this.createMainWindow();
            this.setupIPC();

            // macOS: Re-create window when dock icon clicked
            app.on('activate', () => {
                if (BrowserWindow.getAllWindows().length === 0) {
                    this.createMainWindow();
                }
            });
        });

        // Quit when all windows are closed (except macOS)
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

        // Security: Prevent new window creation
        app.on('web-contents-created', (event, contents) => {
            contents.on('new-window', (event, navigationUrl) => {
                event.preventDefault();
                log.warn('Blocked new window:', navigationUrl);
            });
        });

        log.info('App initialized');
    }
}

// Create and start the app
const dmApp = new DMAssistantApp();
dmApp.init();