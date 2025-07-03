/**
 * Environment Manager - Handles all environment/location-related functionality
 */
import dataStore from "../data/data-store.js";
import { Environment, ModelFactory } from "../data/models.js";

class EnvironmentManager {
  constructor() {
    this.currentEnvironment = null;

    // Tipi di ambientazioni comuni
    this.environmentTypes = [
      "Città",
      "Villaggio",
      "Dungeon",
      "Foresta",
      "Montagna",
      "Deserto",
      "Palude",
      "Costa",
      "Isola",
      "Pianura",
      "Caverna",
      "Fortezza",
      "Tempio",
      "Rovine",
      "Torre",
      "Castello",
      "Taverna",
      "Mercato",
      "Porto",
      "Miniera",
    ];

    // Climi/atmosfere
    this.climates = [
      "Temperato",
      "Tropicale",
      "Desertico",
      "Artico",
      "Montano",
      "Umido",
      "Secco",
      "Ventoso",
      "Nebbioso",
      "Magico",
      "Corrotto",
      "Maledetto",
      "Benedetto",
      "Neutrale",
    ];
  }

  /**
   * Render environments section
   */
  async render() {
    const contentBody = document.getElementById("content-body");

    try {
      const environments = dataStore.get("environments");

      if (environments.length === 0) {
        contentBody.innerHTML = this.renderEmptyState();
        return;
      }

      const cardsHtml = environments
        .map((env) => this.renderEnvironmentCard(env))
        .join("");
      contentBody.innerHTML = `<div class="cards-grid">${cardsHtml}</div>`;

      // Attach event listeners
      this.attachCardEventListeners();
    } catch (error) {
      console.error("Error rendering environments:", error);
      throw error;
    }
  }

  /**
   * Render empty state
   */
  renderEmptyState() {
    return `
            <div class="empty-state">
                <h3>Nessuna ambientazione creata</h3>
                <p>Crea la prima ambientazione per organizzare le tue mappe e NPC</p>
                <button class="btn btn-primary mt-2" onclick="environmentManager.openAddForm()">
                    + Crea prima ambientazione
                </button>
            </div>
        `;
  }

  /**
   * Render environment card con immagine di sfondo
   */
  renderEnvironmentCard(environment) {
    // Count NPCs and maps
    const npcs = dataStore.get("npcs");
    const npcCount = npcs.filter(
      (npc) => npc.environmentId == environment.id
    ).length;
    const mapCount = environment.maps ? environment.maps.length : 0;

    // Background image o gradiente di default
    const backgroundStyle = environment.image
      ? `background-image: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 50%, rgba(26,26,26,0.9) 100%), url('${environment.image}');`
      : `background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);`;

    return `
        <div class="environment-card" data-environment-id="${
          environment.id
        }" style="${backgroundStyle}">
            <div class="environment-card-content">
                <h3 class="environment-card-title">${environment.name}</h3>
                <p class="environment-card-stats">${mapCount} mappe • ${npcCount} NPC</p>
                <p class="environment-card-description">
                    ${
                      environment.description
                        ? environment.description.length > 120
                          ? environment.description.substring(0, 120) + "..."
                          : environment.description
                        : "Nessuna descrizione"
                    }
                </p>
            </div>
        </div>
    `;
  }

  /**
   * Attach event listeners per le nuove card
   */
  attachCardEventListeners() {
    document
      .querySelectorAll(".environment-card[data-environment-id]")
      .forEach((card) => {
        card.addEventListener("click", () => {
          const environmentId = parseInt(card.dataset.environmentId);
          this.showEnvironmentView(environmentId);
        });
      });
  }

  /**
   * Open add environment form
   */
  openAddForm() {
    this.openEnvironmentModal();
  }

  /**
   * Open environment modal (add or edit)
   */
  openEnvironmentModal(environment = null) {
    const isEdit = environment !== null;
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");

    modalTitle.textContent = isEdit
      ? "Modifica Ambientazione"
      : "Nuova Ambientazione";
    modalBody.innerHTML = this.generateEnvironmentForm(environment);

    // Show modal
    modal.style.display = "block";
    document.body.style.overflow = "hidden";

    // Setup form handlers
    this.setupFormHandlers(isEdit, environment);
  }

  /**
   * Generate environment form con upload immagine
   */
  generateEnvironmentForm(environment = null) {
    const hasImage =
      environment?.image && environment.image.startsWith("data:image");

    return `
        <form id="environment-form">
            <div class="form-group">
                <label class="form-label">Immagine di Copertina</label>
                <div class="environment-image-upload" id="environment-image-container">
                    <div class="environment-image-preview" style="display: ${
                      hasImage ? "block" : "none"
                    };">
                        <img id="environment-image-preview" src="${
                          hasImage ? environment.image : ""
                        }" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
                    </div>
                    <div class="environment-image-placeholder" style="display: ${
                      hasImage ? "none" : "block"
                    };">
                        <div class="image-placeholder-content">
                            <span style="font-size: 48px;">🖼️</span>
                            <p>Trascina un'immagine qui o <button type="button" onclick="document.getElementById('environment-image-input').click()" class="btn-link">seleziona file</button></p>
                            <small>Consigliato: 16:9, min 800x450px</small>
                        </div>
                    </div>
                    <input type="file" id="environment-image-input" accept="image/*" style="display: none;">
                    <input type="hidden" name="image" value="${
                      environment?.image || ""
                    }">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Nome Ambientazione *</label>
                    <input type="text" class="form-input" name="name" value="${
                      environment?.name || ""
                    }" required placeholder="Es. Taverna del Drago Rosso">
                </div>
                <div class="form-group">
                    <label class="form-label">Tipo</label>
                    <select class="form-select" name="type">
                        <option value="">Seleziona tipo</option>
                        ${this.environmentTypes
                          .map(
                            (type) =>
                              `<option value="${type}" ${
                                environment?.type === type ? "selected" : ""
                              }>${type}</option>`
                          )
                          .join("")}
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Clima/Atmosfera</label>
                    <select class="form-select" name="climate">
                        <option value="">Seleziona clima</option>
                        ${this.climates
                          .map(
                            (climate) =>
                              `<option value="${climate}" ${
                                environment?.climate === climate
                                  ? "selected"
                                  : ""
                              }>${climate}</option>`
                          )
                          .join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Pericoli</label>
                    <input type="text" class="form-input" name="dangers" value="${
                      environment?.dangers ? environment.dangers.join(", ") : ""
                    }" placeholder="Trappole, mostri, ambiente...">
                    <small style="color: var(--text-secondary); font-size: 0.8em;">Separa con virgole</small>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Descrizione</label>
                <textarea class="form-textarea" name="description" placeholder="Descrivi l'ambientazione, l'atmosfera, i punti di interesse...">${
                  environment?.description || ""
                }</textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">Risorse/Servizi</label>
                <textarea class="form-textarea" name="resources" placeholder="Negozi, servizi, PNG importanti, oggetti disponibili..." style="min-height: 60px;">${
                  environment?.resources ? environment.resources.join("\n") : ""
                }</textarea>
                <small style="color: var(--text-secondary); font-size: 0.8em;">Una risorsa per riga</small>
            </div>
            
            <div class="flex gap-1 mt-2" style="justify-content: flex-end;">
                <button type="button" class="btn btn-secondary" onclick="environmentManager.closeModal()">Annulla</button>
                <button type="submit" class="btn btn-primary">${
                  environment ? "Aggiorna" : "Salva"
                } Ambientazione</button>
            </div>
        </form>
    `;
  }

  /**
   * Setup form handlers con gestione immagine
   */
  setupFormHandlers(isEdit, environment) {
    const form = document.getElementById("environment-form");

    // Setup image upload
    this.setupImageUpload();

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.handleFormSubmit(isEdit, environment);
    });
  }

  /**
   * Handle form submission
   */
  async handleFormSubmit(isEdit, existingEnvironment) {
    try {
      const form = document.getElementById("environment-form");
      const formData = new FormData(form);

      // Parse dangers and resources
      const dangersText = formData.get("dangers").trim();
      const dangers = dangersText
        ? dangersText
            .split(",")
            .map((d) => d.trim())
            .filter((d) => d)
        : [];

      const resourcesText = formData.get("resources").trim();
      const resources = resourcesText
        ? resourcesText
            .split("\n")
            .map((r) => r.trim())
            .filter((r) => r)
        : [];

      // Create environment data object
      const environmentData = {
        name: formData.get("name").trim(),
        type: formData.get("type") || "generic",
        climate: formData.get("climate") || "",
        description: formData.get("description").trim(),
        image: formData.get("image") || null, // Aggiunto campo immagine
        dangers: dangers,
        resources: resources,
      };

      // Validate data
      const errors = ModelFactory.validate("Environment", environmentData);
      if (errors.length > 0) {
        alert("Errori di validazione:\n" + errors.join("\n"));
        return;
      }

      if (isEdit && existingEnvironment) {
        // Preserve existing maps
        environmentData.maps = existingEnvironment.maps || [];

        // Update existing environment
        await dataStore.update(
          "environments",
          existingEnvironment.id,
          environmentData
        );
        window.app.showNotification(
          "Ambientazione aggiornata con successo!",
          "success"
        );
      } else {
        // Create new environment
        const environment = new Environment(environmentData);
        await dataStore.add("environments", environment.toObject());
        window.app.showNotification(
          "Ambientazione creata con successo!",
          "success"
        );
      }

      this.closeModal();
      await this.render(); // Refresh the view
    } catch (error) {
      console.error("Error saving environment:", error);
      window.app.showError("Errore durante il salvataggio: " + error.message);
    }
  }

  /**
   * View environment details
   */
  async viewEnvironmentDetail(environmentId) {
    try {
      const environment = dataStore.findById("environments", environmentId);
      if (!environment) {
        window.app.showError("Ambientazione non trovata");
        return;
      }

      this.currentEnvironment = environment;

      const modal = document.getElementById("modal");
      const modalTitle = document.getElementById("modal-title");
      const modalBody = document.getElementById("modal-body");

      modalTitle.textContent = environment.name;
      modalBody.innerHTML = this.generateEnvironmentDetailView(environment);

      // Show modal
      modal.style.display = "block";
      document.body.style.overflow = "hidden";
    } catch (error) {
      console.error("Error viewing environment:", error);
      window.app.showError(
        "Errore durante la visualizzazione dell'ambientazione"
      );
    }
  }

  /**
   * Generate environment detail view
   */
  generateEnvironmentDetailView(environment) {
    const npcs = dataStore.get("npcs");
    const linkedNPCs = npcs.filter(
      (npc) => npc.environmentId == environment.id
    );
    const maps = environment.maps || [];

    return `
            <div class="mb-2">
                <h3 style="color: var(--accent); margin-bottom: 10px;">Informazioni Base</h3>
                <div class="form-row">
                    <p><strong>Tipo:</strong> ${
                      environment.type || "Generico"
                    }</p>
                    <p><strong>Clima:</strong> ${
                      environment.climate || "Temperato"
                    }</p>
                </div>
                
                ${
                  environment.description
                    ? `
                    <div class="mt-1">
                        <p><strong>Descrizione:</strong></p>
                        <p style="color: var(--text-secondary); line-height: 1.6; background-color: var(--bg-tertiary); padding: 15px; border-radius: 4px; margin-top: 5px;">
                            ${environment.description}
                        </p>
                    </div>
                `
                    : ""
                }
                
                ${
                  environment.dangers && environment.dangers.length > 0
                    ? `
                    <div class="mt-1">
                        <p><strong>Pericoli:</strong></p>
                        <div style="background-color: var(--bg-tertiary); padding: 10px; border-radius: 4px; margin-top: 5px;">
                            ${environment.dangers
                              .map(
                                (danger) =>
                                  `<span style="background-color: var(--danger); color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8em; margin: 2px;">${danger}</span>`
                              )
                              .join(" ")}
                        </div>
                    </div>
                `
                    : ""
                }
                
                ${
                  environment.resources && environment.resources.length > 0
                    ? `
                    <div class="mt-1">
                        <p><strong>Risorse/Servizi:</strong></p>
                        <div style="background-color: var(--bg-tertiary); padding: 15px; border-radius: 4px; margin-top: 5px;">
                            ${environment.resources
                              .map(
                                (resource) =>
                                  `<p style="margin: 5px 0;">• ${resource}</p>`
                              )
                              .join("")}
                        </div>
                    </div>
                `
                    : ""
                }
            </div>
            
            <div class="mb-2">
                <h3 style="color: var(--accent); margin-bottom: 10px;">Mappe (${
                  maps.length
                })</h3>
                <div style="background-color: var(--bg-tertiary); padding: 15px; border-radius: 4px; margin-bottom: 15px;">
                    ${
                      maps.length > 0
                        ? maps
                            .map(
                              (map) => `
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 10px; background-color: var(--bg-primary); border-radius: 4px;">
                                <div>
                                    <strong>${map.name}</strong>
                                    ${
                                      map.description
                                        ? `<br><small style="color: var(--text-secondary);">${map.description}</small>`
                                        : ""
                                    }
                                </div>
                                <button class="btn btn-danger btn-small" onclick="environmentManager.removeMap(${
                                  environment.id
                                }, ${map.id})">Rimuovi</button>
                            </div>
                        `
                            )
                            .join("")
                        : '<p style="color: var(--text-secondary);">Nessuna mappa caricata</p>'
                    }
                </div>
                <button class="btn btn-secondary w-full" onclick="environmentManager.addMap(${
                  environment.id
                })">
                    + Aggiungi Mappa
                </button>
            </div>
            
            <div class="mb-2">
                <h3 style="color: var(--accent); margin-bottom: 10px;">NPC Collegati (${
                  linkedNPCs.length
                })</h3>
                <div style="background-color: var(--bg-tertiary); padding: 15px; border-radius: 4px;">
                    ${
                      linkedNPCs.length === 0
                        ? '<p style="color: var(--text-secondary);">Nessun NPC collegato a questa ambientazione.</p>'
                        : linkedNPCs
                            .map((npc) => {
                              const hasImage =
                                npc.avatar &&
                                npc.avatar.startsWith("data:image");
                              const avatarDisplay = hasImage
                                ? `<img src="${npc.avatar}" style="width: 20px; height: 20px; border-radius: 50%; object-fit: cover;">`
                                : npc.avatar;

                              return `
                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; padding: 8px; background-color: var(--bg-primary); border-radius: 4px; cursor: pointer;" onclick="environmentManager.viewNPCFromEnvironment(${
                                  npc.id
                                })">
                                    <span style="display: flex; align-items: center; justify-content: center; width: 20px; height: 20px;">${avatarDisplay}</span>
                                    <div style="flex: 1;">
                                        <strong>${npc.name}</strong>
                                        <span style="color: var(--text-secondary); font-size: 0.85em; margin-left: 10px;">${
                                          npc.attitude || "Neutrale"
                                        }</span>
                                    </div>
                                </div>
                            `;
                            })
                            .join("")
                    }
                </div>
            </div>
            
            <div class="flex flex-between gap-1 mt-2">
                <button class="btn btn-danger" onclick="environmentManager.deleteEnvironment(${
                  environment.id
                })">Elimina</button>
                <div class="flex gap-1">
                    <button class="btn btn-secondary" onclick="environmentManager.editEnvironment(${
                      environment.id
                    })">Modifica</button>
                    <button class="btn btn-primary" onclick="environmentManager.closeModal()">Chiudi</button>
                </div>
            </div>
        `;
  }

  /**
   * Add map to environment
   */
  async addMap(environmentId) {
    try {
      const mapName = await window.app.showInputModal(
        "Nome della mappa:",
        "Inserisci il nome della mappa..."
      );

      if (!mapName || !mapName.trim()) return;

      const mapDescription = await window.app.showInputModal(
        "Descrizione della mappa (opzionale):",
        "Breve descrizione della mappa..."
      );

      const environment = dataStore.findById("environments", environmentId);
      if (!environment) return;

      // Add map
      if (!environment.maps) environment.maps = [];
      environment.maps.push({
        id: Date.now(),
        name: mapName.trim(),
        description: mapDescription ? mapDescription.trim() : "",
        file: null, // In futuro si potrà caricare il file
        gridSize: 30,
        dimensions: { width: 20, height: 20 },
        createdAt: new Date().toISOString(),
      });

      // Save to store
      await dataStore.update("environments", environmentId, environment);

      // Refresh detail view
      await this.viewEnvironmentDetail(environmentId);

      window.app.showNotification("Mappa aggiunta!", "success");
    } catch (error) {
      console.error("Error adding map:", error);
      window.app.showError("Errore durante l'aggiunta della mappa");
    }
  }

  /**
   * Remove map from environment
   */
  async removeMap(environmentId, mapId) {
    try {
      const environment = dataStore.findById("environments", environmentId);
      if (!environment) return;

      // Remove map
      if (environment.maps) {
        environment.maps = environment.maps.filter((map) => map.id !== mapId);
      }

      // Save to store
      await dataStore.update("environments", environmentId, environment);

      // Refresh detail view
      await this.viewEnvironmentDetail(environmentId);

      window.app.showNotification("Mappa rimossa!", "success");
    } catch (error) {
      console.error("Error removing map:", error);
      window.app.showError("Errore durante la rimozione della mappa");
    }
  }

  /**
   * View NPC from environment detail
   */
  viewNPCFromEnvironment(npcId) {
    // Close current modal and open NPC detail
    this.closeModal();

    // Small delay to avoid modal conflicts
    setTimeout(() => {
      if (window.npcManager) {
        window.npcManager.viewNPCDetail(npcId);
      }
    }, 200);
  }

  /**
   * Edit environment
   */
  editEnvironment(environmentId) {
    const environment = dataStore.findById("environments", environmentId);
    if (!environment) return;

    this.closeModal();
    setTimeout(() => {
      this.openEnvironmentModal(environment);
    }, 200);
  }

  /**
   * Delete environment
   */
  async deleteEnvironment(environmentId) {
    const npcs = dataStore.get("npcs");
    const linkedNPCs = npcs.filter((npc) => npc.environmentId == environmentId);

    let message =
      "Sei sicuro di voler eliminare questa ambientazione? Questa azione non può essere annullata.";
    if (linkedNPCs.length > 0) {
      message += `\n\nATTENZIONE: Ci sono ${linkedNPCs.length} NPC collegati a questa ambientazione. Perderanno il riferimento all'ambientazione.`;
    }

    const confirmed = await window.app.showConfirmModal(
      "Elimina Ambientazione",
      message
    );

    if (!confirmed) return;

    try {
      // Remove environment reference from NPCs
      for (const npc of linkedNPCs) {
        npc.environmentId = null;
        await dataStore.update("npcs", npc.id, npc);
      }

      // Delete environment
      await dataStore.remove("environments", environmentId);
      this.closeModal();
      await this.render();

      if (linkedNPCs.length > 0) {
        window.app.showNotification(
          `Ambientazione eliminata. ${linkedNPCs.length} NPC scollegati.`,
          "warning"
        );
      } else {
        window.app.showNotification("Ambientazione eliminata", "success");
      }
    } catch (error) {
      console.error("Error deleting environment:", error);
      window.app.showError("Errore durante l'eliminazione dell'ambientazione");
    }
  }

  /**
   * Close modal
   */
  closeModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    this.currentEnvironment = null;
  }

  /**
   * Get all environments
   */
  getEnvironments() {
    return dataStore.get("environments");
  }

  /**
   * Get environment by ID
   */
  getEnvironment(id) {
    return dataStore.findById("environments", id);
  }

  /**
   * Get NPCs in environment
   */
  getNPCsInEnvironment(environmentId) {
    const npcs = dataStore.get("npcs");
    return npcs.filter((npc) => npc.environmentId == environmentId);
  }

  /**
   * Setup image upload handlers
   */
  setupImageUpload() {
    const imageInput = document.getElementById("environment-image-input");
    const imagePreview = document.getElementById("environment-image-preview");
    const imagePlaceholder = document.querySelector(
      ".environment-image-placeholder"
    );
    const imageContainer = document.getElementById(
      "environment-image-container"
    );

    if (!imageInput || !imageContainer) return;

    // File input change
    imageInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (file) {
        const base64 = await this.fileToBase64(file);
        if (base64) {
          this.setEnvironmentImage(base64);
        }
      }
    });

    // Drag and drop
    imageContainer.addEventListener("dragover", (e) => {
      e.preventDefault();
      imageContainer.classList.add("drag-over");
    });

    imageContainer.addEventListener("dragleave", (e) => {
      e.preventDefault();
      imageContainer.classList.remove("drag-over");
    });

    imageContainer.addEventListener("drop", async (e) => {
      e.preventDefault();
      imageContainer.classList.remove("drag-over");

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          const base64 = await this.fileToBase64(file);
          if (base64) {
            this.setEnvironmentImage(base64);
          }
        } else {
          window.app.showError("Seleziona un file immagine valido");
        }
      }
    });
  }

  /**
   * Set environment image preview
   */
  setEnvironmentImage(base64) {
    const imagePreview = document.getElementById("environment-image-preview");
    const imagePlaceholder = document.querySelector(
      ".environment-image-placeholder"
    );
    const imagePreviewContainer = document.querySelector(
      ".environment-image-preview"
    );

    if (imagePreview && imagePlaceholder && imagePreviewContainer) {
      imagePreview.src = base64;
      imagePreviewContainer.style.display = "block";
      imagePlaceholder.style.display = "none";

      // Update hidden input
      const hiddenInput = document.querySelector('input[name="image"]');
      if (hiddenInput) {
        hiddenInput.value = base64;
      }
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
   * Show environment in full screen view instead of modal
   */
  async showEnvironmentView(environmentId) {
    try {
      const environment = dataStore.findById("environments", environmentId);
      if (!environment) {
        window.app.showError("Ambientazione non trovata");
        return;
      }

      // Hide main app content and show environment view
      const mainContent = document.querySelector(".main-content");
      const sidebar = document.querySelector(".sidebar");

      // Create environment view container
      const environmentView = document.createElement("div");
      environmentView.id = "environment-view";
      environmentView.className = "environment-view";
      environmentView.innerHTML = this.generateEnvironmentView(environment);

      // Hide sidebar and main content
      sidebar.style.display = "none";
      mainContent.style.display = "none";

      // Add environment view to body
      document.body.appendChild(environmentView);

      // Setup close handler
      this.setupEnvironmentViewHandlers(environment);
    } catch (error) {
      console.error("Error showing environment view:", error);
      window.app.showError(
        "Errore durante la visualizzazione dell'ambientazione"
      );
    }
  }

  /**
   * Generate full-screen environment view
   */
  generateEnvironmentView(environment) {
    const npcs = dataStore.get("npcs");
    const linkedNPCs = npcs.filter(
      (npc) => npc.environmentId == environment.id
    );
    const maps = environment.maps || [];

    // Header background
    const headerStyle = environment.image
      ? `background-image: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 70%, rgba(26,26,26,0.95) 100%), url('${environment.image}');`
      : `background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-primary) 100%);`;

    return `
        <div class="environment-view-header" style="${headerStyle}">
            <div class="environment-view-nav">
                <button class="btn btn-secondary" onclick="environmentManager.closeEnvironmentView()">
                    ← Torna alle Ambientazioni
                </button>
                <div class="environment-view-actions">
                    <button class="btn btn-secondary" onclick="environmentManager.editEnvironment(${
                      environment.id
                    })">Modifica</button>
                    <button class="btn btn-danger" onclick="environmentManager.deleteEnvironment(${
                      environment.id
                    })">Elimina</button>
                </div>
            </div>
            <div class="environment-view-header-content">
                <h1 class="environment-view-title">${environment.name}</h1>
                <div class="environment-view-stats">
                    <span class="environment-stat">
                        <strong>${maps.length}</strong> mappe
                    </span>
                    <span class="environment-stat">
                        <strong>${linkedNPCs.length}</strong> NPC
                    </span>
                    <span class="environment-stat">
                        <strong>${environment.type || "Generico"}</strong>
                    </span>
                </div>
                ${
                  environment.description
                    ? `
                    <p class="environment-view-description">${environment.description}</p>
                `
                    : ""
                }
            </div>
        </div>
        
        <div class="environment-view-body">
            <div class="environment-view-content">
                
                ${
                  environment.dangers && environment.dangers.length > 0
                    ? `
                    <section class="environment-section">
                        <h3>Pericoli</h3>
                        <div class="dangers-container">
                            ${environment.dangers
                              .map(
                                (danger) =>
                                  `<span class="danger-tag">${danger}</span>`
                              )
                              .join("")}
                        </div>
                    </section>
                `
                    : ""
                }
                
                ${
                  environment.resources && environment.resources.length > 0
                    ? `
                    <section class="environment-section">
                        <h3>Risorse e Servizi</h3>
                        <div class="resources-list">
                            ${environment.resources
                              .map(
                                (resource) =>
                                  `<div class="resource-item">• ${resource}</div>`
                              )
                              .join("")}
                        </div>
                    </section>
                `
                    : ""
                }
                
                <section class="environment-section">
                    <div class="section-header">
                        <h3>NPC (${linkedNPCs.length})</h3>
                        ${
                          linkedNPCs.length === 0
                            ? `<button class="btn btn-primary btn-small" onclick="environmentManager.createNPCForEnvironment(${environment.id})">+ Aggiungi NPC</button>`
                            : ""
                        }
                    </div>
                    
                    ${
                      linkedNPCs.length === 0
                        ? `
                        <div class="empty-section">
                            <p>Nessun NPC presente in questa ambientazione</p>
                        </div>
                    `
                        : `
                        <div class="npcs-list">
                            ${linkedNPCs
                              .map((npc) => {
                                const hasImage =
                                  npc.avatar &&
                                  npc.avatar.startsWith("data:image");
                                const avatarDisplay = hasImage
                                  ? `<img src="${npc.avatar}" class="npc-avatar">`
                                  : `<div class="npc-avatar-emoji">${npc.avatar}</div>`;

                                return `
                                    <div class="npc-item" onclick="environmentManager.viewNPCFromEnvironment(${
                                      npc.id
                                    })">
                                        <div class="npc-avatar-container">${avatarDisplay}</div>
                                        <div class="npc-info">
                                            <h4 class="npc-name">${
                                              npc.name
                                            }</h4>
                                            <p class="npc-details">
                                                ${
                                                  npc.race
                                                    ? `${npc.race} • `
                                                    : ""
                                                }${npc.attitude || "Neutrale"}
                                            </p>
                                            ${
                                              npc.description
                                                ? `
                                                <p class="npc-description">${
                                                  npc.description.length > 100
                                                    ? npc.description.substring(
                                                        0,
                                                        100
                                                      ) + "..."
                                                    : npc.description
                                                }</p>
                                            `
                                                : ""
                                            }
                                        </div>
                                        <div class="npc-actions">
                                            <span class="view-arrow">→</span>
                                        </div>
                                    </div>
                                `;
                              })
                              .join("")}
                        </div>
                    `
                    }
                </section>
                
                <section class="environment-section">
                    <div class="section-header">
                        <h3>Mappe (${maps.length})</h3>
                        <button class="btn btn-primary btn-small" onclick="environmentManager.addMap(${
                          environment.id
                        })">+ Aggiungi Mappa</button>
                    </div>
                    
                    ${
                      maps.length === 0
                        ? `
                        <div class="empty-section">
                            <p>Nessuna mappa caricata per questa ambientazione</p>
                        </div>
                    `
                        : `
                        <div class="maps-grid">
                            ${maps
                              .map(
                                (map) => `
                                <div class="map-card">
                                    <div class="map-card-icon">🗺️</div>
                                    <div class="map-card-content">
                                        <h4 class="map-card-title">${
                                          map.name
                                        }</h4>
                                        ${
                                          map.description
                                            ? `<p class="map-card-description">${map.description}</p>`
                                            : ""
                                        }
                                    </div>
                                    <div class="map-card-actions">
                                        <button class="btn btn-danger btn-small" onclick="environmentManager.removeMap(${
                                          environment.id
                                        }, ${map.id})">Rimuovi</button>
                                    </div>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                    `
                    }
                </section>
                
            </div>
        </div>
    `;
  }

  /**
   * Setup environment view handlers
   */
  setupEnvironmentViewHandlers(environment) {
    // Add keyboard handler for ESC
    const escHandler = (e) => {
      if (e.key === "Escape") {
        this.closeEnvironmentView();
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);
  }

  /**
   * Close environment view and return to main app
   */
  closeEnvironmentView() {
    const environmentView = document.getElementById("environment-view");
    const mainContent = document.querySelector(".main-content");
    const sidebar = document.querySelector(".sidebar");

    if (environmentView) {
      environmentView.remove();
    }

    // Restore main app
    sidebar.style.display = "flex";
    mainContent.style.display = "flex";
  }

  /**
   * Create NPC for this environment
   */
  createNPCForEnvironment(environmentId) {
    this.closeEnvironmentView();

    // Switch to NPCs section and open add form with pre-selected environment
    setTimeout(async () => {
      await window.app.switchSection("npcs");

      // Small delay to ensure NPC manager is loaded
      setTimeout(() => {
        if (window.npcManager) {
          window.npcManager.openAddFormWithEnvironment(environmentId);
        }
      }, 200);
    }, 100);
  }
}

// Create and export singleton instance
const environmentManager = new EnvironmentManager();

export default environmentManager;
