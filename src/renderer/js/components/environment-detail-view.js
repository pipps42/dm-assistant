/**
 * Environment Detail View - Gestione vista dettaglio ambiente
 */
import modalManager from "../ui/modal-manager.js";

export default class EnvironmentDetailView {
  constructor(manager) {
    this.manager = manager;
    this.previousState = null;
  }

  /**
   * Vista dettaglio ambiente - schermata dedicata
   */
  viewDetail(id) {
    const environment = this.manager.getById(id);
    if (!environment) {
      this.manager.showError("Ambientazione non trovata");
      return;
    }

    console.log("🏰 Rendering environment detail view for:", environment.name);

    // Elementi UI
    const contentBody = document.getElementById("content-body");
    const sectionTitle = document.getElementById("section-title");
    const addButton = document.getElementById("add-button");

    // Salva stato precedente
    this.previousState = {
      content: contentBody.innerHTML,
      title: sectionTitle.textContent,
    };

    // Aggiorna header
    sectionTitle.innerHTML = `
      <button class="btn-link environment-back-btn" onclick="environmentManager.detailView.goBack()">
        ← Ambientazioni
      </button>
    `;

    if (addButton) {
      addButton.style.display = "none";
    }

    // Render vista dettaglio
    contentBody.className = "environment-detail-view";
    contentBody.innerHTML = this.generateDetailView(environment);
  }

  /**
   * Genera il template per la vista dettaglio completa
   */
  generateDetailView(environment) {
    const npcs = window.dataStore?.get("npcs") || [];
    const linkedNPCs = npcs.filter(
      (npc) => npc.environmentId == environment.id
    );
    const maps = environment.maps || [];

    // Background image o gradiente default
    const backgroundStyle = environment.image
      ? `background-image: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 70%, rgba(26,26,26,1) 100%), url('${environment.image}');`
      : `background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);`;

    return `
      <!-- Header con immagine di copertina -->
      <div class="environment-header" style="${backgroundStyle}">
        <div class="environment-header-content">
          <h1 class="environment-title">${environment.name}</h1>
          <div class="environment-meta">
            <span class="environment-type">${
              environment.type || "Ambientazione"
            }</span>
            ${
              environment.climate
                ? `<span class="environment-climate">${environment.climate}</span>`
                : ""
            }
            ${
              environment.challengeLevel
                ? `<span class="challenge-badge challenge-${environment.challengeLevel
                    .toLowerCase()
                    .replace(" ", "-")}">${environment.challengeLevel}</span>`
                : ""
            }
          </div>
          <div class="environment-stats">
            <span class="stat-item">${maps.length} ${
      maps.length === 1 ? "mappa" : "mappe"
    }</span>
            <span class="stat-item">${linkedNPCs.length} NPC</span>
            ${
              environment.size
                ? `<span class="stat-item">${environment.size}</span>`
                : ""
            }
          </div>
        </div>
        
        <!-- Pulsanti di azione -->
        <div class="environment-header-actions">
          <button class="btn btn-secondary" onclick="environmentManager.openForm(environmentManager.getById('${
            environment.id
          }'))">
            Modifica
          </button>
          <button class="btn btn-danger" onclick="environmentManager.delete('${
            environment.id
          }')">
            Elimina
          </button>
        </div>
      </div>

      <!-- Contenuto principale -->
      <div class="environment-content">
        ${this.generateSections(environment, linkedNPCs, maps)}
      </div>
    `;
  }

  /**
   * Genera le sezioni del contenuto
   */
  generateSections(environment, linkedNPCs, maps) {
    return `
      ${this.generateDescriptionSection(environment)}
      ${this.generateInfoSection(environment)}
      ${this.generateDangersSection(environment)}
      ${this.generateResourcesSection(environment)}
      ${this.generateMapsSection(environment, maps)}
      ${this.generateNPCsSection(environment, linkedNPCs)}
    `;
  }

  /**
   * Sezione descrizione
   */
  generateDescriptionSection(environment) {
    if (!environment.description) return "";

    return `
      <section class="environment-section">
        <h2 class="section-title">Descrizione</h2>
        <div class="section-content">
          <p class="environment-description">${environment.description}</p>
        </div>
      </section>
    `;
  }

  /**
   * Sezione informazioni
   */
  generateInfoSection(environment) {
    const hasInfo =
      environment.currency || environment.lodgingCost || environment.conditions;
    if (!hasInfo) return "";

    return `
      <section class="environment-section">
        <h2 class="section-title">Informazioni</h2>
        <div class="section-content">
          <div class="info-grid">
            ${
              environment.currency
                ? `
              <div class="info-item">
                <span class="info-label">💰 Moneta Locale</span>
                <span class="info-value">${environment.currency}</span>
              </div>
            `
                : ""
            }
            ${
              environment.lodgingCost
                ? `
              <div class="info-item">
                <span class="info-label">🏠 Costo Soggiorno</span>
                <span class="info-value">${environment.lodgingCost}</span>
              </div>
            `
                : ""
            }
            ${
              environment.conditions
                ? `
              <div class="info-item">
                <span class="info-label">⚠️ Condizioni Speciali</span>
                <span class="info-value">${environment.conditions}</span>
              </div>
            `
                : ""
            }
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Sezione pericoli
   */
  generateDangersSection(environment) {
    if (!environment.dangers || environment.dangers.length === 0) return "";

    return `
      <section class="environment-section">
        <h2 class="section-title">⚔️ Pericoli</h2>
        <div class="section-content">
          <div class="tags-container">
            ${environment.dangers
              .map((danger) => `<span class="tag tag-danger">${danger}</span>`)
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Sezione risorse
   */
  generateResourcesSection(environment) {
    if (!environment.resources || environment.resources.length === 0) return "";

    return `
      <section class="environment-section">
        <h2 class="section-title">🛡️ Risorse e Servizi</h2>
        <div class="section-content">
          <div class="resources-list">
            ${environment.resources
              .map(
                (resource) => `
              <div class="resource-item">
                <span class="resource-icon">•</span>
                <span class="resource-text">${resource}</span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Sezione mappe
   */
  generateMapsSection(environment, maps) {
    return `
      <section class="environment-section">
        <div class="section-header">
          <h2 class="section-title">🗺️ Mappe (${maps.length})</h2>
          <button class="btn btn-primary btn-sm" 
                  onclick="environmentManager.detailView.addMap('${
                    environment.id
                  }')">
            + Aggiungi Mappa
          </button>
        </div>
        <div class="section-content">
          ${
            maps.length > 0
              ? `
            <div class="maps-grid">
              ${maps
                .map((map) => this.generateMapCard(environment.id, map))
                .join("")}
            </div>
          `
              : `
            <div class="empty-state-small">
              <p>Nessuna mappa presente</p>
              <small>Le mappe aiutano a visualizzare l'ambientazione durante il gioco</small>
            </div>
          `
          }
        </div>
      </section>
    `;
  }

  /**
   * Genera card mappa
   */
  generateMapCard(environmentId, map) {
    return `
      <div class="map-card">
        <div class="map-card-header">
          <div class="map-icon">🗺️</div>
          <h3 class="map-title">${map.name}</h3>
          <button class="btn btn-danger btn-tiny" 
                  onclick="environmentManager.detailView.removeMap('${environmentId}', '${
      map.id
    }')">
            ×
          </button>
        </div>
        ${
          map.description
            ? `
          <div class="map-description">
            <p>${map.description}</p>
          </div>
        `
            : ""
        }
        <div class="map-footer">
          ${
            map.gridSize
              ? `<small class="text-secondary">Griglia: ${map.gridSize}px</small>`
              : ""
          }
          ${
            map.createdAt
              ? `<small class="text-secondary">${new Date(
                  map.createdAt
                ).toLocaleDateString("it-IT")}</small>`
              : ""
          }
        </div>
      </div>
    `;
  }

  /**
   * Sezione NPCs
   */
  generateNPCsSection(environment, linkedNPCs) {
    return `
      <section class="environment-section">
        <div class="section-header">
          <h2 class="section-title">🧙 NPCs (${linkedNPCs.length})</h2>
          <button class="btn btn-primary btn-sm" 
                  onclick="environmentManager.detailView.addNPCToEnvironment('${
                    environment.id
                  }')">
            + Aggiungi NPC
          </button>
        </div>
        <div class="section-content">
          ${
            linkedNPCs.length > 0
              ? `
            <div class="npcs-grid">
              ${linkedNPCs.map((npc) => this.generateNPCCard(npc)).join("")}
            </div>
          `
              : `
            <div class="empty-state-small">
              <p>Nessun NPC presente in questa ambientazione</p>
              <small>Gli NPC rendono l'ambientazione viva e interattiva</small>
            </div>
          `
          }
        </div>
      </section>
    `;
  }

  /**
   * Genera card NPC
   */
  generateNPCCard(npc) {
    const hasImage = npc.avatar && npc.avatar.startsWith("data:image");
    const avatarDisplay = hasImage
      ? `<img src="${npc.avatar}" class="npc-card-avatar">`
      : `<div class="npc-card-avatar-emoji">${npc.avatar || "🧙"}</div>`;

    return `
      <div class="npc-card" onclick="environmentManager.detailView.viewNPCDetail('${
        npc.id
      }')">
        <div class="npc-card-header">
          ${avatarDisplay}
          <div class="npc-card-info">
            <h3 class="npc-card-name">${npc.name}</h3>
            <p class="npc-card-details">
              ${npc.race ? `${npc.race} • ` : ""}${npc.attitude || "Neutrale"}
              ${npc.profession ? ` • ${npc.profession}` : ""}
            </p>
          </div>
          <button class="btn btn-danger btn-tiny npc-remove-btn" 
                  onclick="event.stopPropagation(); environmentManager.detailView.removeNPCFromEnvironment('${
                    npc.id
                  }')"
                  title="Rimuovi collegamento">
            ×
          </button>
        </div>
        ${
          npc.description
            ? `
          <div class="npc-card-description">
            <p>${
              npc.description.length > 120
                ? npc.description.substring(0, 120) + "..."
                : npc.description
            }</p>
          </div>
        `
            : ""
        }
        ${
          npc.secrets
            ? `
          <div class="npc-card-footer">
            <span class="tag tag-warning">Ha dei segreti</span>
          </div>
        `
            : ""
        }
      </div>
    `;
  }

  /**
   * Gestisce azioni specifiche del detail Environment
   */
  async handleDetailAction(action, entity, button) {
    switch (action) {
      case "add-map":
        await this.addMap(entity.id);
        break;
      case "remove-map":
        const mapId = button.dataset.mapId;
        await this.removeMap(entity.id, mapId);
        break;
      case "add-npc":
        this.addNPCToEnvironment(entity.id);
        break;
      case "view-npc":
        const npcId = button.dataset.npcId;
        this.viewNPCDetail(npcId);
        break;
    }
  }

  /**
   * Torna alla vista elenco ambientazioni
   */
  goBack() {
    const contentBody = document.getElementById("content-body");
    const sectionTitle = document.getElementById("section-title");
    const addButton = document.getElementById("add-button");

    // Ripristina stato precedente
    if (this.previousState) {
      contentBody.className = "";
      contentBody.innerHTML = this.previousState.content;
      sectionTitle.textContent = this.previousState.title;

      if (addButton) {
        addButton.style.display = "block";
      }

      // Riattacca eventi
      this.manager.attachEvents();
    } else {
      // Fallback: ricarica la sezione
      this.manager.render();
      sectionTitle.textContent = "Ambientazioni & Mappe";
      if (addButton) {
        addButton.style.display = "block";
      }
    }
  }

  /**
   * Aggiungi mappa all'ambiente
   */
  async addMap(environmentId) {
    const environment = this.manager.getById(environmentId);
    if (!environment) return;

    const mapName = await modalManager.input({
      title: "Aggiungi Mappa",
      label: "Nome della mappa:",
      placeholder: "Es. Primo piano, Cantina, Esterno...",
      inputType: "text",
    });

    if (!mapName?.trim()) return;

    const mapDescription = await modalManager.input({
      title: "Descrizione Mappa",
      label: "Descrizione (opzionale):",
      placeholder: "Descrivi la mappa...",
      inputType: "textarea",
    });

    // Add map to environment
    const newMap = {
      id: Date.now(),
      name: mapName.trim(),
      description: mapDescription?.trim() || "",
      gridSize: 30,
      createdAt: new Date().toISOString(),
    };

    if (!environment.maps) environment.maps = [];
    environment.maps.push(newMap);

    await this.manager.update(environment.id, environment);
    this.manager.showSuccess("Mappa aggiunta!");

    // Refresh della vista
    this.viewDetail(environment.id);
  }

  /**
   * Rimuovi mappa dall'ambiente
   */
  async removeMap(environmentId, mapId) {
    const environment = this.manager.getById(environmentId);
    if (!environment) return;

    const confirmed = await modalManager.confirm({
      title: "Rimuovi Mappa",
      message: "Sei sicuro di voler rimuovere questa mappa?",
    });

    if (!confirmed) return;

    // Remove map
    if (environment.maps) {
      environment.maps = environment.maps.filter((map) => map.id != mapId);
    }

    await this.manager.update(environment.id, environment);
    this.manager.showSuccess("Mappa rimossa!");

    // Refresh della vista
    this.viewDetail(environment.id);
  }

  /**
   * Aggiungi NPC all'ambiente
   */
  addNPCToEnvironment(environmentId) {
    const npcManager = window.npcManager;
    if (npcManager) {
      npcManager.openFormWithEnvironment(environmentId);
    }
  }

  /**
   * Visualizza dettaglio NPC
   */
  viewNPCDetail(npcId) {
    const npcManager = window.npcManager;
    if (npcManager) {
      npcManager.openDetail(npcId);
    }
  }

  /**
   * Rimuovi collegamento NPC dall'ambiente
   */
  async removeNPCFromEnvironment(npcId) {
    const npcManager = window.npcManager;
    if (!npcManager) return;

    const npc = npcManager.getById(npcId);
    if (!npc) return;

    const confirmed = await modalManager.confirm({
      title: "Rimuovi Collegamento",
      message: `Rimuovere il collegamento di "${npc.name}" da questa ambientazione?`,
      confirmText: "Rimuovi",
    });

    if (confirmed) {
      await npcManager.update(npcId, { ...npc, environmentId: null });

      // Refresh della vista
      const environment = this.manager
        .getAll()
        .find((env) =>
          this.manager.getNPCsInEnvironment(env.id).some((n) => n.id == npcId)
        );

      if (environment) {
        this.viewDetail(environment.id);
      }

      this.manager.showSuccess("Collegamento NPC rimosso");
    }
  }
}
