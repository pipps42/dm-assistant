/**
 * Character Manager - Handles all character-related functionality
 */
import dataStore from '../data/data-store.js';
import { Character, ModelFactory } from '../data/models.js';

class CharacterManager {
    constructor() {
        this.currentCharacter = null;
        
        // D&D 5e classes
        this.classes = [
            'Barbaro', 'Bardo', 'Chierico', 'Druido', 'Guerriero', 
            'Monaco', 'Paladino', 'Ranger', 'Ladro', 'Stregone', 
            'Warlock', 'Mago'
        ];
        
        // D&D 5e alignments
        this.alignments = [
            'Legale Buono', 'Neutrale Buono', 'Caotico Buono',
            'Legale Neutrale', 'Neutrale Puro', 'Caotico Neutrale',
            'Legale Malvagio', 'Neutrale Malvagio', 'Caotico Malvagio'
        ];
    }

    /**
     * Render characters section
     */
    async render() {
        const contentBody = document.getElementById('content-body');
        
        try {
            const characters = dataStore.get('characters');
            
            if (characters.length === 0) {
                contentBody.innerHTML = this.renderEmptyState();
                return;
            }

            const cardsHtml = characters.map(char => this.renderCharacterCard(char)).join('');
            contentBody.innerHTML = `<div class="cards-grid">${cardsHtml}</div>`;
            
            // Attach event listeners
            this.attachCardEventListeners();
            
        } catch (error) {
            console.error('Error rendering characters:', error);
            throw error;
        }
    }

    /**
     * Render empty state
     */
    renderEmptyState() {
        return `
            <div class="empty-state">
                <h3>Nessun personaggio creato</h3>
                <p>Aggiungi il primo personaggio giocatore per iniziare la tua campagna</p>
                <button class="btn btn-primary mt-2" onclick="characterManager.openAddForm()">
                    + Crea primo personaggio
                </button>
            </div>
        `;
    }

    /**
     * Render character card
     */
    renderCharacterCard(character) {
        return `
            <div class="card" data-character-id="${character.id}">
                <div class="card-header">
                    <div class="card-avatar">${character.avatar}</div>
                    <div class="card-info">
                        <h3>${character.name}</h3>
                        <p>Giocatore: ${character.playerName}</p>
                    </div>
                </div>
                <div class="card-details">
                    <div class="detail-item">
                        <span class="detail-label">Classe:</span>
                        <span class="detail-value">${character.class}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Livello:</span>
                        <span class="detail-value">${character.level}</span>
                    </div>
                    <div class="detail-item" style="grid-column: 1 / -1;">
                        <span class="detail-label">Allineamento:</span>
                        <span class="detail-value">${character.alignment}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Attach event listeners to character cards
     */
    attachCardEventListeners() {
        document.querySelectorAll('.card[data-character-id]').forEach(card => {
            card.addEventListener('click', () => {
                const characterId = parseInt(card.dataset.characterId);
                this.viewCharacterDetail(characterId);
            });
        });
    }

    /**
     * Open add character form
     */
    openAddForm() {
        this.openCharacterModal();
    }

    /**
     * Open character modal (add or edit)
     */
    openCharacterModal(character = null) {
        const isEdit = character !== null;
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        modalTitle.textContent = isEdit ? 'Modifica Personaggio' : 'Aggiungi Personaggio';
        modalBody.innerHTML = this.generateCharacterForm(character);

        // Show modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Setup form handlers
        this.setupFormHandlers(isEdit, character);
    }

    /**
     * Generate character form HTML
     */
    generateCharacterForm(character = null) {
        return `
            <form id="character-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Nome Personaggio *</label>
                        <input type="text" class="form-input" name="name" value="${character?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nome Giocatore *</label>
                        <input type="text" class="form-input" name="playerName" value="${character?.playerName || ''}" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Classe *</label>
                        <select class="form-select" name="class" required>
                            <option value="">Seleziona classe</option>
                            ${this.classes.map(cls => 
                                `<option value="${cls}" ${character?.class === cls ? 'selected' : ''}>${cls}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Livello *</label>
                        <input type="number" class="form-input" name="level" min="1" max="20" value="${character?.level || 1}" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Allineamento *</label>
                        <select class="form-select" name="alignment" required>
                            <option value="">Seleziona allineamento</option>
                            ${this.alignments.map(align => 
                                `<option value="${align}" ${character?.alignment === align ? 'selected' : ''}>${align}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Avatar (emoji)</label>
                        <input type="text" class="form-input" name="avatar" value="${character?.avatar || '🧙'}" placeholder="🧙" maxlength="2">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Background</label>
                    <textarea class="form-textarea" name="background" placeholder="Descrivi il background del personaggio...">${character?.background || ''}</textarea>
                </div>
                
                <div class="flex gap-1 mt-2" style="justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="characterManager.closeModal()">Annulla</button>
                    <button type="submit" class="btn btn-primary">${character ? 'Aggiorna' : 'Salva'} Personaggio</button>
                </div>
            </form>
        `;
    }

    /**
     * Setup form event handlers
     */
    setupFormHandlers(isEdit, character) {
        const form = document.getElementById('character-form');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmit(isEdit, character);
        });
    }

    /**
     * Handle form submission
     */
    async handleFormSubmit(isEdit, existingCharacter) {
        try {
            const form = document.getElementById('character-form');
            const formData = new FormData(form);
            
            // Create character data object
            const characterData = {
                name: formData.get('name').trim(),
                playerName: formData.get('playerName').trim(),
                class: formData.get('class'),
                level: parseInt(formData.get('level')),
                alignment: formData.get('alignment'),
                avatar: formData.get('avatar').trim() || '🧙',
                background: formData.get('background').trim()
            };

            // Validate data
            const errors = ModelFactory.validate('Character', characterData);
            if (errors.length > 0) {
                alert('Errori di validazione:\n' + errors.join('\n'));
                return;
            }

            if (isEdit && existingCharacter) {
                // Update existing character
                await dataStore.update('characters', existingCharacter.id, characterData);
                window.app.showNotification('Personaggio aggiornato con successo!', 'success');
            } else {
                // Create new character
                const character = new Character(characterData);
                await dataStore.add('characters', character.toObject());
                window.app.showNotification('Personaggio creato con successo!', 'success');
            }

            this.closeModal();
            await this.render(); // Refresh the view

        } catch (error) {
            console.error('Error saving character:', error);
            window.app.showError('Errore durante il salvataggio: ' + error.message);
        }
    }

    /**
     * View character details
     */
    async viewCharacterDetail(characterId) {
        try {
            const character = dataStore.findById('characters', characterId);
            if (!character) {
                window.app.showError('Personaggio non trovato');
                return;
            }

            this.currentCharacter = character;
            
            const modal = document.getElementById('modal');
            const modalTitle = document.getElementById('modal-title');
            const modalBody = document.getElementById('modal-body');

            modalTitle.textContent = character.name;
            modalBody.innerHTML = this.generateCharacterDetailView(character);

            // Show modal
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';

            // Setup detail view handlers
            this.setupDetailViewHandlers(character);

        } catch (error) {
            console.error('Error viewing character:', error);
            window.app.showError('Errore durante la visualizzazione del personaggio');
        }
    }

    /**
     * Generate character detail view
     */
    generateCharacterDetailView(character) {
        const adventures = character.adventures || [];
        
        return `
            <div class="mb-2">
                <h3 style="color: var(--accent); margin-bottom: 10px;">Informazioni Base</h3>
                <div class="form-row">
                    <p><strong>Giocatore:</strong> ${character.playerName}</p>
                    <p><strong>Classe:</strong> ${character.class}</p>
                </div>
                <div class="form-row mt-1">
                    <p><strong>Livello:</strong> ${character.level}</p>
                    <p><strong>Allineamento:</strong> ${character.alignment}</p>
                </div>
                ${character.background ? `
                    <div class="mt-1">
                        <p><strong>Background:</strong></p>
                        <p style="color: var(--text-secondary); line-height: 1.6; background-color: var(--bg-tertiary); padding: 15px; border-radius: 4px; margin-top: 5px;">
                            ${character.background}
                        </p>
                    </div>
                ` : ''}
            </div>
            
            <div class="mb-2">
                <h3 style="color: var(--accent); margin-bottom: 10px;">Avventure e Imprese</h3>
                <div style="background-color: var(--bg-tertiary); padding: 15px; border-radius: 4px; margin-bottom: 15px; max-height: 200px; overflow-y: auto;">
                    ${adventures.length > 0 ? 
                        adventures.map((adv, index) => `
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; padding: 8px; background-color: var(--bg-primary); border-radius: 4px;">
                                <p style="margin: 0; flex: 1;">• ${typeof adv === 'string' ? adv : adv.description}</p>
                                <button class="btn btn-danger btn-small" onclick="characterManager.removeAdventure(${character.id}, ${typeof adv === 'object' ? adv.id : index})" style="margin-left: 10px;">×</button>
                            </div>
                        `).join('') :
                        '<p style="color: var(--text-secondary);">Nessuna avventura registrata ancora.</p>'
                    }
                </div>
                <button class="btn btn-secondary w-full" onclick="characterManager.addAdventure(${character.id})">
                    + Aggiungi Avventura
                </button>
            </div>
            
            <div class="flex flex-between gap-1 mt-2">
                <button class="btn btn-danger" onclick="characterManager.deleteCharacter(${character.id})">Elimina</button>
                <div class="flex gap-1">
                    <button class="btn btn-secondary" onclick="characterManager.editCharacter(${character.id})">Modifica</button>
                    <button class="btn btn-primary" onclick="characterManager.closeModal()">Chiudi</button>
                </div>
            </div>
        `;
    }

    /**
     * Setup detail view event handlers
     */
    setupDetailViewHandlers(character) {
        // Event handlers are already bound via onclick attributes
        // This method can be used for additional complex event handling if needed
    }

    /**
     * Add adventure to character
     */
    async addAdventure(characterId) {
        const adventure = prompt('Inserisci la nuova avventura/impresa:');
        if (!adventure || !adventure.trim()) return;

        try {
            const character = dataStore.findById('characters', characterId);
            if (!character) return;

            // Add adventure
            if (!character.adventures) character.adventures = [];
            character.adventures.push({
                id: Date.now(),
                description: adventure.trim(),
                date: new Date().toISOString()
            });

            // Save to store
            await dataStore.update('characters', characterId, character);
            
            // Refresh detail view
            await this.viewCharacterDetail(characterId);
            
            window.app.showNotification('Avventura aggiunta!', 'success');

        } catch (error) {
            console.error('Error adding adventure:', error);
            window.app.showError('Errore durante l\'aggiunta dell\'avventura');
        }
    }

    /**
     * Remove adventure from character
     */
    async removeAdventure(characterId, adventureId) {
        try {
            const character = dataStore.findById('characters', characterId);
            if (!character) return;

            // Remove adventure
            if (character.adventures) {
                if (typeof adventureId === 'number' && adventureId < character.adventures.length) {
                    // Handle old array-based adventures
                    character.adventures.splice(adventureId, 1);
                } else {
                    // Handle new object-based adventures
                    character.adventures = character.adventures.filter(adv => adv.id !== adventureId);
                }
            }

            // Save to store
            await dataStore.update('characters', characterId, character);
            
            // Refresh detail view
            await this.viewCharacterDetail(characterId);
            
            window.app.showNotification('Avventura rimossa!', 'success');

        } catch (error) {
            console.error('Error removing adventure:', error);
            window.app.showError('Errore durante la rimozione dell\'avventura');
        }
    }

    /**
     * Edit character
     */
    editCharacter(characterId) {
        const character = dataStore.findById('characters', characterId);
        if (!character) return;

        this.closeModal();
        setTimeout(() => {
            this.openCharacterModal(character);
        }, 200);
    }

    /**
     * Delete character
     */
    async deleteCharacter(characterId) {
        if (!confirm('Sei sicuro di voler eliminare questo personaggio?')) return;

        try {
            await dataStore.remove('characters', characterId);
            this.closeModal();
            await this.render();
            window.app.showNotification('Personaggio eliminato', 'success');

        } catch (error) {
            console.error('Error deleting character:', error);
            window.app.showError('Errore durante l\'eliminazione del personaggio');
        }
    }

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentCharacter = null;
    }

    /**
     * Get all characters
     */
    getCharacters() {
        return dataStore.get('characters');
    }

    /**
     * Get character by ID
     */
    getCharacter(id) {
        return dataStore.findById('characters', id);
    }
}

// Create and export singleton instance
const characterManager = new CharacterManager();

export default characterManager;