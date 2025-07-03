/**
 * NPC Manager - Handles all NPC-related functionality
 */
import dataStore from "../data/data-store.js";
import { NPC, ModelFactory } from "../data/models.js";

class NPCManager {
  constructor() {
    this.currentNPC = null;

    // D&D 5e alignments (stesso del character manager)
    this.alignments = [
      "Legale Buono",
      "Neutrale Buono",
      "Caotico Buono",
      "Legale Neutrale",
      "Neutrale Puro",
      "Caotico Neutrale",
      "Legale Malvagio",
      "Neutrale Malvagio",
      "Caotico Malvagio",
    ];

    // Atteggiamenti comuni degli NPC
    this.attitudes = [
      "Amichevole",
      "Neutrale",
      "Diffidente",
      "Ostile",
      "Indifferente",
      "Curioso",
      "Protettivo",
      "Servile",
      "Arrogante",
      "Timido",
      "Sospettoso",
      "Entusiasta",
    ];

    // Razze comuni per NPC
    this.races = [
      "Umano",
      "Elfo",
      "Nano",
      "Halfling",
      "Dragonide",
      "Gnomo",
      "Mezzelfo",
      "Mezzorco",
      "Tiefling",
      "Aarakocra",
      "Genasi",
      "Goliath",
      "Tabaxi",
      "Tritone",
      "Firbolg",
      "Kenku",
      "Lizardfolk",
      "Goblin",
      "Orco",
      "Coboldo",
      "Bugbear",
      "Hobgoblin",
      "Yuan-ti",
    ];
  }

  /**
   * Render NPCs section
   */
  async render() {
    const contentBody = document.getElementById("content-body");

    try {
      const npcs = dataStore.get("npcs");

      if (npcs.length === 0) {
        contentBody.innerHTML = this.renderEmptyState();
        return;
      }

      const cardsHtml = npcs.map((npc) => this.renderNPCCard(npc)).join("");
      contentBody.innerHTML = `<div class="cards-grid">${cardsHtml}</div>`;

      // Attach event listeners
      this.attachCardEventListeners();
    } catch (error) {
      console.error("Error rendering NPCs:", error);
      throw error;
    }
  }

  /**
   * Render empty state
   */
  renderEmptyState() {
    return `
            <div class="empty-state">
                <h3>Nessun NPC creato</h3>
                <p>Aggiungi il primo NPC per popolare il tuo mondo di gioco</p>
                <button class="btn btn-primary mt-2" onclick="npcManager.openAddForm()">
                    + Crea primo NPC
                </button>
            </div>
        `;
  }

  /**
   * Render NPC card
   */
  renderNPCCard(npc) {
    const hasImage = npc.avatar && npc.avatar.startsWith("data:image");
    let avatarDisplay;

    if (hasImage) {
      avatarDisplay = `<img src="${npc.avatar}" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
      avatarDisplay = npc.avatar || "🧙";
    }

    // Get environment name if linked
    const environments = dataStore.get("environments");
    const environment = environments.find((env) => env.id == npc.environmentId);

    return `
            <div class="card" data-npc-id="${npc.id}">
                <div class="card-header">
                    <div class="card-avatar">${avatarDisplay}</div>
                    <div class="card-info">
                        <h3>${npc.name}</h3>
                        <p>${
                          environment
                            ? environment.name
                            : "Ambientazione libera"
                        }</p>
                    </div>
                </div>
                <div class="card-details">
                    <div class="detail-item">
                        <span class="detail-label">Razza:</span>
                        <span class="detail-value">${
                          npc.race || "Non specificata"
                        }</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Atteggiamento:</span>
                        <span class="detail-value">${npc.attitude}</span>
                    </div>
                    <div class="detail-item" style="grid-column: 1 / -1;">
                        <span class="detail-label">Allineamento:</span>
                        <span class="detail-value">${npc.alignment}</span>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Attach event listeners to NPC cards
   */
  attachCardEventListeners() {
    document.querySelectorAll(".card[data-npc-id]").forEach((card) => {
      card.addEventListener("click", () => {
        const npcId = parseInt(card.dataset.npcId);
        this.viewNPCDetail(npcId);
      });
    });
  }

  /**
   * Open add NPC form
   */
  openAddForm() {
    this.openNPCModal();
  }

  /**
   * Open add form with pre-selected environment
   */
  openAddFormWithEnvironment(environmentId) {
    this.openNPCModal();

    // Pre-select environment after modal opens
    setTimeout(() => {
      const environmentSelect = document.querySelector(
        'select[name="environmentId"]'
      );
      if (environmentSelect) {
        environmentSelect.value = environmentId;
      }
    }, 100);
  }

  /**
   * Open NPC modal (add or edit)
   */
  openNPCModal(npc = null) {
    const isEdit = npc !== null;
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");

    modalTitle.textContent = isEdit ? "Modifica NPC" : "Aggiungi NPC";
    modalBody.innerHTML = this.generateNPCForm(npc);

    // Show modal
    modal.style.display = "block";
    document.body.style.overflow = "hidden";

    // Setup form handlers
    this.setupFormHandlers(isEdit, npc);
  }

  /**
   * Generate NPC form HTML
   */
  generateNPCForm(npc = null) {
    const hasImage = npc?.avatar && npc.avatar.startsWith("data:image");
    const emojiAvatar = hasImage ? "🧙" : npc?.avatar || "🧙";
    const environments = dataStore.get("environments");

    return `
            <form id="npc-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Nome NPC *</label>
                        <input type="text" class="form-input" name="name" value="${
                          npc?.name || ""
                        }" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Razza</label>
                        <select class="form-select" name="race">
                            <option value="">Seleziona razza</option>
                            ${this.races
                              .map(
                                (race) =>
                                  `<option value="${race}" ${
                                    npc?.race === race ? "selected" : ""
                                  }>${race}</option>`
                              )
                              .join("")}
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Ambientazione</label>
                        <select class="form-select" name="environmentId">
                            <option value="">Nessuna ambientazione</option>
                            ${environments
                              .map(
                                (env) =>
                                  `<option value="${env.id}" ${
                                    npc?.environmentId == env.id
                                      ? "selected"
                                      : ""
                                  }>${env.name}</option>`
                              )
                              .join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Allineamento *</label>
                        <select class="form-select" name="alignment" required>
                            <option value="">Seleziona allineamento</option>
                            ${this.alignments
                              .map(
                                (align) =>
                                  `<option value="${align}" ${
                                    npc?.alignment === align ? "selected" : ""
                                  }>${align}</option>`
                              )
                              .join("")}
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Atteggiamento verso i PG *</label>
                        <select class="form-select" name="attitude" required>
                            <option value="">Seleziona atteggiamento</option>
                            ${this.attitudes
                              .map(
                                (att) =>
                                  `<option value="${att}" ${
                                    npc?.attitude === att ? "selected" : ""
                                  }>${att}</option>`
                              )
                              .join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Avatar</label>
                        <div class="avatar-upload-container" id="avatar-container">
                            <div class="avatar-preview-wrapper">
                                <img id="avatar-preview" class="avatar-preview" src="${
                                  hasImage ? npc.avatar : ""
                                }" style="display: ${
      hasImage ? "block" : "none"
    };">
                                <div class="avatar-emoji" style="display: ${
                                  hasImage ? "none" : "block"
                                }">${emojiAvatar}</div>
                            </div>
                            <input type="file" id="avatar-file-input" accept="image/*" style="display: none;">
                            <input type="hidden" name="avatar" value="${
                              npc?.avatar || "🧙"
                            }">
                            <div class="avatar-upload-text">
                                <p>Trascina un'immagine qui o <button type="button" onclick="document.getElementById('avatar-file-input').click()" class="btn-link">seleziona file</button></p>
                                <small>Formati supportati: JPG, PNG, GIF</small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrizione</label>
                    <textarea class="form-textarea" name="description" placeholder="Descrivi l'aspetto, personalità e ruolo dell'NPC...">${
                      npc?.description || ""
                    }</textarea>
                </div>
                
                <div class="flex gap-1 mt-2" style="justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="npcManager.closeModal()">Annulla</button>
                    <button type="submit" class="btn btn-primary">${
                      npc ? "Aggiorna" : "Salva"
                    } NPC</button>
                </div>
            </form>
        `;
  }

  /**
   * Setup form event handlers
   */
  setupFormHandlers(isEdit, npc) {
    const form = document.getElementById("npc-form");

    // Setup avatar handlers (riusa dal character manager)
    this.setupAvatarHandlers();

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.handleFormSubmit(isEdit, npc);
    });
  }

  /**
   * Setup avatar upload handlers (copiato da character manager)
   */
  setupAvatarHandlers() {
    const avatarInput = document.getElementById("avatar-file-input");
    const avatarPreview = document.getElementById("avatar-preview");
    const avatarContainer = document.getElementById("avatar-container");

    if (!avatarInput || !avatarPreview || !avatarContainer) return;

    // File input change
    avatarInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (file) {
        const base64 = await this.handleAvatarUpload(file);
        if (base64) {
          avatarPreview.src = base64;
          avatarPreview.style.display = "block";
          avatarContainer.querySelector(".avatar-emoji").style.display = "none";
        }
      }
    });

    // Drag and drop
    avatarContainer.addEventListener("dragover", (e) => {
      e.preventDefault();
      avatarContainer.classList.add("drag-over");
    });

    avatarContainer.addEventListener("dragleave", (e) => {
      e.preventDefault();
      avatarContainer.classList.remove("drag-over");
    });

    avatarContainer.addEventListener("drop", async (e) => {
      e.preventDefault();
      avatarContainer.classList.remove("drag-over");

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          const base64 = await this.handleAvatarUpload(file);
          if (base64) {
            avatarPreview.src = base64;
            avatarPreview.style.display = "block";
            avatarContainer.querySelector(".avatar-emoji").style.display =
              "none";
          }
        } else {
          window.app.showError("Seleziona un file immagine valido");
        }
      }
    });
  }

  /**
   * Handle avatar image upload
   */
  async handleAvatarUpload(file) {
    try {
      const base64 = await this.fileToBase64(file);
      return base64;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      window.app.showError("Errore durante il caricamento dell'immagine");
      return null;
    }
  }

  /**
   * Convert file to base64
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Handle form submission
   */
  async handleFormSubmit(isEdit, existingNPC) {
    try {
      const form = document.getElementById("npc-form");
      const formData = new FormData(form);
      const avatarPreview = document.getElementById("avatar-preview");

      // Get avatar (image or emoji)
      let avatar = formData.get("avatar");
      if (avatarPreview.style.display === "block" && avatarPreview.src) {
        avatar = avatarPreview.src;
      }

      // Create NPC data object
      const npcData = {
        name: formData.get("name").trim(),
        race: formData.get("race") || null,
        environmentId: formData.get("environmentId") || null,
        alignment: formData.get("alignment"),
        attitude: formData.get("attitude"),
        avatar: avatar,
        description: formData.get("description").trim(),
      };

      // Validate data
      const errors = ModelFactory.validate("NPC", npcData);
      if (errors.length > 0) {
        alert("Errori di validazione:\n" + errors.join("\n"));
        return;
      }

      if (isEdit && existingNPC) {
        // Update existing NPC
        await dataStore.update("npcs", existingNPC.id, npcData);
        window.app.showNotification("NPC aggiornato con successo!", "success");
      } else {
        // Create new NPC
        const npc = new NPC(npcData);
        await dataStore.add("npcs", npc.toObject());
        window.app.showNotification("NPC creato con successo!", "success");
      }

      this.closeModal();
      await this.render(); // Refresh the view
    } catch (error) {
      console.error("Error saving NPC:", error);
      window.app.showError("Errore durante il salvataggio: " + error.message);
    }
  }

  /**
   * View NPC details
   */
  async viewNPCDetail(npcId) {
    try {
      const npc = dataStore.findById("npcs", npcId);
      if (!npc) {
        window.app.showError("NPC non trovato");
        return;
      }

      this.currentNPC = npc;

      const modal = document.getElementById("modal");
      const modalTitle = document.getElementById("modal-title");
      const modalBody = document.getElementById("modal-body");

      modalTitle.textContent = npc.name;
      modalBody.innerHTML = this.generateNPCDetailView(npc);

      // Show modal
      modal.style.display = "block";
      document.body.style.overflow = "hidden";
    } catch (error) {
      console.error("Error viewing NPC:", error);
      window.app.showError("Errore durante la visualizzazione dell'NPC");
    }
  }

  /**
   * Generate NPC detail view
   */
  generateNPCDetailView(npc) {
    const interactions = npc.interactions || [];
    const environments = dataStore.get("environments");
    const environment = environments.find((env) => env.id == npc.environmentId);

    return `
            <div class="mb-2">
                <h3 style="color: var(--accent); margin-bottom: 10px;">Informazioni Base</h3>
                <div class="form-row">
                    <p><strong>Razza:</strong> ${
                      npc.race || "Non specificata"
                    }</p>
                    <p><strong>Ambientazione:</strong> ${
                      environment ? environment.name : "Libera"
                    }</p>
                </div>
                <div class="form-row mt-1">
                    <p><strong>Allineamento:</strong> ${npc.alignment}</p>
                    <p><strong>Atteggiamento:</strong> ${npc.attitude}</p>
                </div>
                ${
                  npc.description
                    ? `
                    <div class="mt-1">
                        <p><strong>Descrizione:</strong></p>
                        <p style="color: var(--text-secondary); line-height: 1.6; background-color: var(--bg-tertiary); padding: 15px; border-radius: 4px; margin-top: 5px;">
                            ${npc.description}
                        </p>
                    </div>
                `
                    : ""
                }
            </div>
            
            <div class="mb-2">
                <h3 style="color: var(--accent); margin-bottom: 10px;">Interazioni con i Giocatori</h3>
                <div style="background-color: var(--bg-tertiary); padding: 15px; border-radius: 4px; margin-bottom: 15px; max-height: 200px; overflow-y: auto;">
                    ${
                      interactions.length > 0
                        ? interactions
                            .map(
                              (interaction, index) => `
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; padding: 8px; background-color: var(--bg-primary); border-radius: 4px;">
                                <p style="margin: 0; flex: 1;">• ${
                                  typeof interaction === "string"
                                    ? interaction
                                    : interaction.description
                                }</p>
                                <button class="btn btn-danger btn-small" onclick="npcManager.removeInteraction(${
                                  npc.id
                                }, ${
                                typeof interaction === "object"
                                  ? interaction.id
                                  : index
                              })" style="margin-left: 10px;">×</button>
                            </div>
                        `
                            )
                            .join("")
                        : '<p style="color: var(--text-secondary);">Nessuna interazione registrata ancora.</p>'
                    }
                </div>
                <button class="btn btn-secondary w-full" onclick="npcManager.addInteraction(${
                  npc.id
                })">
                    + Aggiungi Interazione
                </button>
            </div>
            
            <div class="flex flex-between gap-1 mt-2">
                <button class="btn btn-danger" onclick="npcManager.deleteNPC(${
                  npc.id
                })">Elimina</button>
                <div class="flex gap-1">
                    <button class="btn btn-secondary" onclick="npcManager.editNPC(${
                      npc.id
                    })">Modifica</button>
                    <button class="btn btn-primary" onclick="npcManager.closeModal()">Chiudi</button>
                </div>
            </div>
        `;
  }

  /**
   * Add interaction to NPC
   */
  async addInteraction(npcId) {
    try {
      const interaction = await window.app.showInputModal(
        "Inserisci una nuova interazione:",
        "Descrivi l'interazione con i giocatori..."
      );

      if (!interaction || !interaction.trim()) return;

      const npc = dataStore.findById("npcs", npcId);
      if (!npc) return;

      // Add interaction
      if (!npc.interactions) npc.interactions = [];
      npc.interactions.push({
        id: Date.now(),
        description: interaction.trim(),
        date: new Date().toISOString(),
      });

      // Save to store
      await dataStore.update("npcs", npcId, npc);

      // Refresh detail view
      await this.viewNPCDetail(npcId);

      window.app.showNotification("Interazione aggiunta!", "success");
    } catch (error) {
      console.error("Error adding interaction:", error);
      window.app.showError("Errore durante l'aggiunta dell'interazione");
    }
  }

  /**
   * Remove interaction from NPC
   */
  async removeInteraction(npcId, interactionId) {
    try {
      const npc = dataStore.findById("npcs", npcId);
      if (!npc) return;

      // Remove interaction
      if (npc.interactions) {
        if (
          typeof interactionId === "number" &&
          interactionId < npc.interactions.length
        ) {
          // Handle old array-based interactions
          npc.interactions.splice(interactionId, 1);
        } else {
          // Handle new object-based interactions
          npc.interactions = npc.interactions.filter(
            (int) => int.id !== interactionId
          );
        }
      }

      // Save to store
      await dataStore.update("npcs", npcId, npc);

      // Refresh detail view
      await this.viewNPCDetail(npcId);

      window.app.showNotification("Interazione rimossa!", "success");
    } catch (error) {
      console.error("Error removing interaction:", error);
      window.app.showError("Errore durante la rimozione dell'interazione");
    }
  }

  /**
   * Edit NPC
   */
  editNPC(npcId) {
    const npc = dataStore.findById("npcs", npcId);
    if (!npc) return;

    this.closeModal();
    setTimeout(() => {
      this.openNPCModal(npc);
    }, 200);
  }

  /**
   * Delete NPC
   */
  async deleteNPC(npcId) {
    const confirmed = await window.app.showConfirmModal(
      "Elimina NPC",
      "Sei sicuro di voler eliminare questo NPC? Questa azione non può essere annullata."
    );

    if (!confirmed) return;

    try {
      await dataStore.remove("npcs", npcId);
      this.closeModal();
      await this.render();
      window.app.showNotification("NPC eliminato", "success");
    } catch (error) {
      console.error("Error deleting NPC:", error);
      window.app.showError("Errore durante l'eliminazione dell'NPC");
    }
  }

  /**
   * Close modal
   */
  closeModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    this.currentNPC = null;
  }

  /**
   * Get all NPCs
   */
  getNPCs() {
    return dataStore.get("npcs");
  }

  /**
   * Get NPC by ID
   */
  getNPC(id) {
    return dataStore.findById("npcs", id);
  }
}

// Create and export singleton instance
const npcManager = new NPCManager();
// Esponi metodi per uso esterno
window.npcManager = npcManager;
npcManager.generateNPCDetailView =
  npcManager.generateNPCDetailView.bind(npcManager);

export default npcManager;
