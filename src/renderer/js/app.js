// Import modules
import dataStore from './data/data-store.js';
import characterManager from './components/character-manager.js';

// Main application entry point
class DMAssistantApp {
    constructor() {
        this.currentSection = 'characters';
        this.isInitialized = false;
        
        // Component managers
        this.managers = {
            characters: characterManager
        };
        
        // Navigation items configuration
        this.navigationItems = [
            { id: 'characters', icon: '👥', label: 'Personaggi', title: 'Personaggi Giocatori', button: '+ Aggiungi Personaggio' },
            { id: 'environments', icon: '🗺️', label: 'Ambientazioni', title: 'Ambientazioni & Mappe', button: '+ Nuova Ambientazione' },
            { id: 'npcs', icon: '🧙', label: 'NPC', title: 'NPC', button: '+ Nuovo NPC' },
            { id: 'bestiary', icon: '👹', label: 'Bestiario', title: 'Bestiario', button: '+ Nuovo Mostro' },
            { id: 'encounters', icon: '⚔️', label: 'Incontri', title: 'Gestione Incontri', button: null }
        ];
    }

    async init() {
        try {
            console.log('Initializing DM Assistant...');
            
            // Wait for electron API to be available
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }

            // Initialize data store
            await dataStore.init();
            console.log('DataStore initialized');

            // Show app version
            await this.displayAppVersion();
            
            // Setup navigation
            this.setupNavigation();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load initial section
            await this.switchSection('characters');
            
            // Hide splash screen and show app
            this.hideSplashScreen();
            
            this.isInitialized = true;
            console.log('DM Assistant initialized successfully');
            
            // Show welcome notification
            this.showNotification('DM Assistant caricato con successo!', 'success');
            
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Errore durante l\'inizializzazione dell\'app: ' + error.message);
        }
    }

    async displayAppVersion() {
        try {
            const version = await window.electronAPI.app.getVersion();
            const versionElement = document.getElementById('app-version');
            if (versionElement) {
                versionElement.textContent = `v${version}`;
            }
        } catch (error) {
            console.warn('Could not get app version:', error);
        }
    }

    hideSplashScreen() {
        const splash = document.getElementById('splash-screen');
        const app = document.getElementById('app');
        
        setTimeout(() => {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
                app.style.display = 'flex';
                app.style.opacity = '0';
                
                setTimeout(() => {
                    app.style.transition = 'opacity 0.3s ease-in';
                    app.style.opacity = '1';
                }, 50);
            }, 200);
        }, 500); // Minimum splash time
    }

    setupNavigation() {
        const navMenu = document.getElementById('nav-menu');
        if (!navMenu) return;

        navMenu.innerHTML = this.navigationItems.map(item => `
            <div class="nav-item ${item.id === this.currentSection ? 'active' : ''}" data-section="${item.id}">
                <span>${item.icon}</span> ${item.label}
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Navigation click handlers
        document.getElementById('nav-menu').addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                const section = navItem.dataset.section;
                this.switchSection(section);
            }
        });

        // Add button handler
        document.getElementById('add-button').addEventListener('click', () => {
            this.handleAddButton();
        });

        // Modal close handlers
        document.getElementById('modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') {
                this.closeModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    async switchSection(sectionId) {
        if (!this.isInitialized) return;

        const section = this.navigationItems.find(item => item.id === sectionId);
        if (!section) return;

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === sectionId);
        });

        // Update header
        document.getElementById('section-title').textContent = section.title;
        
        const addButton = document.getElementById('add-button');
        if (section.button) {
            addButton.textContent = section.button;
            addButton.style.display = 'block';
        } else {
            addButton.style.display = 'none';
        }

        this.currentSection = sectionId;

        // Render section content
        await this.renderSection(sectionId);
    }

    async renderSection(sectionId) {
        const contentBody = document.getElementById('content-body');
        
        try {
            const manager = this.managers[sectionId];
            if (manager && manager.render) {
                await manager.render();
            } else {
                // Fallback for sections not yet migrated
                switch(sectionId) {
                    case 'environments':
                        await this.renderEnvironments();
                        break;
                    case 'npcs':
                        await this.renderNPCs();
                        break;
                    case 'bestiary':
                        await this.renderBestiary();
                        break;
                    case 'encounters':
                        await this.renderEncounters();
                        break;
                    default:
                        contentBody.innerHTML = '<div class="empty-state"><h3>Sezione in sviluppo</h3></div>';
                }
            }
        } catch (error) {
            console.error(`Error rendering section ${sectionId}:`, error);
            this.showError(`Errore nel caricamento della sezione: ${error.message}`);
        }
    }

    // Temporary placeholder rendering methods - will be moved to separate modules
    async renderEnvironments() {
        const contentBody = document.getElementById('content-body');
        contentBody.innerHTML = `
            <div class="empty-state">
                <h3>Modulo Ambientazioni</h3>
                <p>Modulo in fase di migrazione...</p>
                <p style="margin-top: 10px; color: var(--text-secondary); font-size: 0.9em;">
                    Dati disponibili: ${dataStore.get('environments').length} ambientazioni
                </p>
                <button class="btn btn-secondary mt-2" onclick="app.testDataStore('environments')">
                    Test DataStore Ambientazioni
                </button>
            </div>
        `;
    }

    async renderNPCs() {
        const contentBody = document.getElementById('content-body');
        contentBody.innerHTML = `
            <div class="empty-state">
                <h3>Modulo NPC</h3>
                <p>Modulo in fase di migrazione...</p>
                <p style="margin-top: 10px; color: var(--text-secondary); font-size: 0.9em;">
                    Dati disponibili: ${dataStore.get('npcs').length} NPC
                </p>
                <button class="btn btn-secondary mt-2" onclick="app.testDataStore('npcs')">
                    Test DataStore NPC
                </button>
            </div>
        `;
    }

    async renderBestiary() {
        const contentBody = document.getElementById('content-body');
        contentBody.innerHTML = `
            <div class="empty-state">
                <h3>Modulo Bestiario</h3>
                <p>Modulo in fase di migrazione...</p>
                <p style="margin-top: 10px; color: var(--text-secondary); font-size: 0.9em;">
                    Dati disponibili: ${dataStore.get('monsters').length} mostri
                </p>
                <button class="btn btn-secondary mt-2" onclick="app.testDataStore('monsters')">
                    Test DataStore Mostri
                </button>
            </div>
        `;
    }

    async renderEncounters() {
        const contentBody = document.getElementById('content-body');
        contentBody.innerHTML = `
            <div class="empty-state">
                <h3>Modulo Incontri</h3>
                <p>Modulo in fase di migrazione...</p>
                <p style="margin-top: 10px; color: var(--text-secondary); font-size: 0.9em;">
                    Dati disponibili: ${dataStore.get('encounters').length} incontri
                </p>
                <button class="btn btn-secondary mt-2" onclick="app.testDataStore('encounters')">
                    Test DataStore Incontri
                </button>
            </div>
        `;
    }

    handleAddButton() {
        const manager = this.managers[this.currentSection];
        if (manager && manager.openAddForm) {
            manager.openAddForm();
        } else {
            this.showNotification(`Funzione "Aggiungi" per ${this.currentSection} in sviluppo`, 'warning');
        }
    }

    // Modal management
    openModal() {
        document.getElementById('modal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('modal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Notification system
    showNotification(message, type = 'info', duration = 4000) {
        const notifications = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        notifications.appendChild(notification);

        // Auto remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, duration);
    }

    showError(message) {
        this.showNotification(message, 'error', 6000);
    }

    // Test function for DataStore
    async testDataStore(collection) {
        try {
            console.log(`Testing DataStore for collection: ${collection}`);
            
            const data = dataStore.get(collection);
            console.log(`Current ${collection} data:`, data);
            
            // Test adding item
            const testItem = {
                name: `Test ${collection}`,
                description: 'Test item created by DataStore test',
                testFlag: true
            };
            
            const addedItem = await dataStore.add(collection, testItem);
            console.log('Added test item:', addedItem);
            
            // Test reading back
            const updatedData = dataStore.get(collection);
            console.log(`Updated ${collection} data:`, updatedData);
            
            // Test removing test item
            await dataStore.remove(collection, addedItem.id);
            console.log('Test item removed');
            
            const finalData = dataStore.get(collection);
            console.log(`Final ${collection} data:`, finalData);
            
            this.showNotification(`Test DataStore per ${collection} completato con successo!`, 'success');
            
            // Refresh the section to show updated count
            await this.renderSection(this.currentSection);
            
        } catch (error) {
            console.error(`DataStore test failed for ${collection}:`, error);
            this.showError(`Test DataStore fallito per ${collection}: ${error.message}`);
        }
    }

    // Get DataStore statistics
    getDataStats() {
        return dataStore.getStats();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    window.app = new DMAssistantApp();
    
    // Expose managers globally for onclick handlers
    window.characterManager = characterManager;
    window.dataStore = dataStore;
    
    await window.app.init();
});

// Export for global access
window.DMAssistantApp = DMAssistantApp;