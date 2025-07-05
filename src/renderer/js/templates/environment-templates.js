/**
 * Environment Templates - Template HTML per ambientazioni
 */

// Dati per ambientazioni D&D 5e
const ENVIRONMENT_DATA = {
  types: [
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
    "Cimitero",
    "Biblioteca",
    "Accademia",
    "Gilda",
  ],
  climates: [
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
    "Instabile",
    "Tenebroso",
  ],
  commonDangers: [
    "Trappole",
    "Mostri",
    "Banditi",
    "Condizioni ambientali",
    "Magia instabile",
    "Veleni",
    "Malattie",
    "Precipizi",
    "Labirinti",
    "Guardie",
    "Maledizioni",
    "Spiriti",
    "Animali selvatici",
    "Piante velenose",
    "Gas tossici",
  ],
  commonResources: [
    "Taverna",
    "Negozio di equipaggiamenti",
    "Tempio",
    "Biblioteca",
    "Fabbro",
    "Alchimista",
    "Guardie",
    "Guide locali",
    "Mercanti",
    "Informatori",
    "Guaritori",
    "Trasporti",
    "Banca",
    "Magazzini",
    "Stalle",
    "Locande",
  ],
};

/**
 * Generate environment form template
 */
export function generateForm(environment = null, mode = "create") {
  const isEdit = mode === "edit" && environment;
  const hasImage =
    environment?.image && environment.image.startsWith("data:image");

  return `
        <form id="environment-form" data-entity-type="environments" data-mode="${mode}">
            <div class="form-section">
                <h3 class="form-section-title">Immagine di Copertina</h3>
                <div class="form-group">
                    <div id="environment-image-upload" class="image-upload-cover">
                        <!-- Image upload component will be initialized here -->
                    </div>
                    <input type="hidden" name="image" value="${
                      environment?.image || ""
                    }">
                </div>
            </div>
            
            <div class="form-section">
                <h3 class="form-section-title">Informazioni Base</h3>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Nome Ambientazione</label>
                        <input type="text" class="form-input" name="name" 
                               value="${environment?.name || ""}" 
                               required 
                               placeholder="Es. Taverna del Drago Rosso">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="">Seleziona tipo</option>
                            ${ENVIRONMENT_DATA.types
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
                            ${ENVIRONMENT_DATA.climates
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
                        <label class="form-label">Dimensioni</label>
                        <select class="form-select" name="size">
                            <option value="">Seleziona dimensioni</option>
                            <option value="Minuscola" ${
                              environment?.size === "Minuscola"
                                ? "selected"
                                : ""
                            }>Minuscola (stanza singola)</option>
                            <option value="Piccola" ${
                              environment?.size === "Piccola" ? "selected" : ""
                            }>Piccola (edificio)</option>
                            <option value="Media" ${
                              environment?.size === "Media" ? "selected" : ""
                            }>Media (quartiere/area)</option>
                            <option value="Grande" ${
                              environment?.size === "Grande" ? "selected" : ""
                            }>Grande (città/regione)</option>
                            <option value="Enorme" ${
                              environment?.size === "Enorme" ? "selected" : ""
                            }>Enorme (continente)</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrizione</label>
                    <textarea class="form-textarea" name="description" 
                              placeholder="Descrivi l'ambientazione, l'atmosfera, i punti di interesse..."
                              style="min-height: 120px;">${
                                environment?.description || ""
                              }</textarea>
                    <small class="form-help">Includi dettagli visivi, sonori, olfattivi e tattili per immergere i giocatori</small>
                </div>
            </div>
            
            <div class="form-section">
                <h3 class="form-section-title">Pericoli e Ostacoli</h3>
                
                <div class="form-group">
                    <label class="form-label">Pericoli Principali</label>
                    <input type="text" class="form-input" name="dangers" 
                           value="${
                             environment?.dangers
                               ? environment.dangers.join(", ")
                               : ""
                           }" 
                           placeholder="Trappole, mostri, ambiente ostile...">
                    <small class="form-help">Separa con virgole. Esempi: ${ENVIRONMENT_DATA.commonDangers
                      .slice(0, 5)
                      .join(", ")}</small>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Livello di Sfida</label>
                        <select class="form-select" name="challengeLevel">
                            <option value="">Seleziona difficoltà</option>
                            <option value="Molto Facile" ${
                              environment?.challengeLevel === "Molto Facile"
                                ? "selected"
                                : ""
                            }>Molto Facile (1-2 livello)</option>
                            <option value="Facile" ${
                              environment?.challengeLevel === "Facile"
                                ? "selected"
                                : ""
                            }>Facile (3-4 livello)</option>
                            <option value="Medio" ${
                              environment?.challengeLevel === "Medio"
                                ? "selected"
                                : ""
                            }>Medio (5-10 livello)</option>
                            <option value="Difficile" ${
                              environment?.challengeLevel === "Difficile"
                                ? "selected"
                                : ""
                            }>Difficile (11-15 livello)</option>
                            <option value="Molto Difficile" ${
                              environment?.challengeLevel === "Molto Difficile"
                                ? "selected"
                                : ""
                            }>Molto Difficile (16+ livello)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Condizioni Speciali</label>
                        <input type="text" class="form-input" name="conditions" 
                               value="${environment?.conditions || ""}" 
                               placeholder="Es. Luce fioca, terreno difficile, silenzio magico...">
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h3 class="form-section-title">Risorse e Servizi</h3>
                
                <div class="form-group">
                    <label class="form-label">Servizi Disponibili</label>
                    <textarea class="form-textarea" name="resources" 
                              placeholder="Negozi, servizi, PNG importanti, oggetti disponibili..."
                              style="min-height: 80px;">${
                                environment?.resources
                                  ? environment.resources.join("\n")
                                  : ""
                              }</textarea>
                    <small class="form-help">Una risorsa per riga. Esempi: ${ENVIRONMENT_DATA.commonResources
                      .slice(0, 4)
                      .join(", ")}</small>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Costo Soggiorno (per notte)</label>
                        <input type="text" class="form-input" name="lodgingCost" 
                               value="${environment?.lodgingCost || ""}" 
                               placeholder="Es. 2 mo (modesto), 1 mo (squallido)...">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Moneta Locale</label>
                        <input type="text" class="form-input" name="currency" 
                               value="${environment?.currency || ""}" 
                               placeholder="Es. Monete d'oro imperiali, Talleri elfici...">
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-action="cancel">Annulla</button>
                <button type="submit" class="btn btn-primary">
                    ${isEdit ? "Aggiorna" : "Salva"} Ambientazione
                </button>
            </div>
        </form>
    `;
}

/**
 * Generate environment detail view template
 */
export function generateDetail(environment) {
  const npcs = window.dataStore?.get("npcs") || [];
  const linkedNPCs = npcs.filter((npc) => npc.environmentId == environment.id);
  const maps = environment.maps || [];

  return `
        <div class="detail-section">
            <h3 class="detail-section-title">Informazioni Base</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Tipo:</span>
                    <span class="detail-value">${
                      environment.type || "Generico"
                    }</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Clima:</span>
                    <span class="detail-value">${
                      environment.climate || "Temperato"
                    }</span>
                </div>
                ${
                  environment.size
                    ? `
                    <div class="detail-item">
                        <span class="detail-label">Dimensioni:</span>
                        <span class="detail-value">${environment.size}</span>
                    </div>
                `
                    : ""
                }
                ${
                  environment.challengeLevel
                    ? `
                    <div class="detail-item">
                        <span class="detail-label">Livello di Sfida:</span>
                        <span class="detail-value">${environment.challengeLevel}</span>
                    </div>
                `
                    : ""
                }
                ${
                  environment.currency
                    ? `
                    <div class="detail-item">
                        <span class="detail-label">Moneta:</span>
                        <span class="detail-value">${environment.currency}</span>
                    </div>
                `
                    : ""
                }
                ${
                  environment.lodgingCost
                    ? `
                    <div class="detail-item">
                        <span class="detail-label">Costo Soggiorno:</span>
                        <span class="detail-value">${environment.lodgingCost}</span>
                    </div>
                `
                    : ""
                }
            </div>
            
            ${
              environment.description
                ? `
                <div class="detail-content mt-2">
                    <h4>Descrizione</h4>
                    <p class="detail-description">${environment.description}</p>
                </div>
            `
                : ""
            }
            
            ${
              environment.conditions
                ? `
                <div class="detail-content mt-2">
                    <h4>Condizioni Speciali</h4>
                    <p class="detail-description">${environment.conditions}</p>
                </div>
            `
                : ""
            }
        </div>
        
        ${
          environment.dangers && environment.dangers.length > 0
            ? `
            <div class="detail-section">
                <h3 class="detail-section-title">Pericoli</h3>
                <div class="dangers-container">
                    ${environment.dangers
                      .map(
                        (danger) => `<span class="danger-tag">${danger}</span>`
                      )
                      .join("")}
                </div>
            </div>
        `
            : ""
        }
        
        ${
          environment.resources && environment.resources.length > 0
            ? `
            <div class="detail-section">
                <h3 class="detail-section-title">Risorse e Servizi</h3>
                <div class="resources-list">
                    ${environment.resources
                      .map(
                        (resource) =>
                          `<div class="resource-item">• ${resource}</div>`
                      )
                      .join("")}
                </div>
            </div>
        `
            : ""
        }
        
        <div class="detail-section">
            <div class="detail-section-header">
                <h3 class="detail-section-title">Mappe (${maps.length})</h3>
                <button class="btn btn-secondary btn-sm" 
                        data-action="add-map" 
                        data-id="${environment.id}"
                        data-entity-type="environments">
                    + Aggiungi Mappa
                </button>
            </div>
            
            <div class="detail-list-container">
                ${
                  maps.length > 0
                    ? `
                    <div class="maps-grid">
                        ${maps
                          .map(
                            (map) => `
                            <div class="map-card">
                                <div class="map-card-icon">🗺️</div>
                                <div class="map-card-content">
                                    <h4 class="map-card-title">${map.name}</h4>
                                    ${
                                      map.description
                                        ? `<p class="map-card-description">${map.description}</p>`
                                        : ""
                                    }
                                    ${
                                      map.gridSize
                                        ? `<small class="text-secondary">Griglia: ${map.gridSize}px</small>`
                                        : ""
                                    }
                                </div>
                                <div class="map-card-actions">
                                    <button class="btn btn-danger btn-small"
                                            data-action="remove-map"
                                            data-entity-type="environments"
                                            data-id="${
                                              environment.id
                                            }" data-map-id="${map.id}">
                                        Rimuovi
                                    </button>
                                </div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                `
                    : `
                    <div class="detail-empty">
                        <p>Nessuna mappa caricata per questa ambientazione</p>
                        <small>Le mappe aiutano a visualizzare l'ambientazione durante il gioco</small>
                    </div>
                `
                }
            </div>
        </div>
        
        <div class="detail-section">
            <div class="detail-section-header">
                <h3 class="detail-section-title">NPC Collegati (${
                  linkedNPCs.length
                })</h3>
                ${
                  linkedNPCs.length === 0
                    ? `<button class="btn btn-primary btn-small"
                              data-action="add-npc"
                              data-entity-type="environments"
                              data-environment-id="${environment.id}">
                        + Aggiungi NPC
                       </button>`
                    : ""
                }
            </div>
            
            <div class="detail-list-container">
                ${
                  linkedNPCs.length === 0
                    ? `
                    <div class="detail-empty">
                        <p>Nessun NPC presente in questa ambientazione</p>
                        <small>Gli NPC rendono l'ambientazione viva e interattiva</small>
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
                                    <div class="npc-item"
                                      data-action="view-npc"
                                      data-entity-type="environments"
                                      data-npc-id="${npc.id}">
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
                                                ${
                                                  npc.profession
                                                    ? ` • ${npc.profession}`
                                                    : ""
                                                }
                                            </p>
                                            ${
                                              npc.description
                                                ? `<p class="npc-description">
                                                  ${
                                                    npc.description.length > 100
                                                      ? npc.description.substring(
                                                          0,
                                                          100
                                                        ) + "..."
                                                      : npc.description
                                                  }
                                                </p>`
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
            </div>
        </div>
        
        <div class="modal-footer">
            <button class="btn btn-danger" 
                    data-action="delete" 
                    data-id="${environment.id}"
                    data-entity-type="environments">
                Elimina Ambientazione
            </button>
            <div class="flex gap-1">
                <button class="btn btn-secondary" 
                        data-action="edit" 
                        data-id="${environment.id}"
                        data-entity-type="environments">
                    Modifica
                </button>
                <button class="btn btn-primary" data-action="close">
                    Chiudi
                </button>
            </div>
        </div>
    `;
}

/**
 * Generate environment card template with background image
 */
export function generateCard(environment) {
  // Count NPCs and maps
  const npcs = window.dataStore?.get("npcs") || [];
  const npcCount = npcs.filter(
    (npc) => npc.environmentId == environment.id
  ).length;
  const mapCount = environment.maps ? environment.maps.length : 0;

  // Background image or default gradient
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
                ${
                  environment.type || environment.climate
                    ? `
                    <div class="environment-card-tags">
                        ${
                          environment.type
                            ? `<span class="tag tag-type">${environment.type}</span>`
                            : ""
                        }
                        ${
                          environment.climate
                            ? `<span class="tag tag-climate">${environment.climate}</span>`
                            : ""
                        }
                    </div>
                `
                    : ""
                }
            </div>
        </div>
    `;
}

/**
 * Generate compact environment list item
 */
export function generateListItem(environment) {
  const npcs = window.dataStore?.get("npcs") || [];
  const npcCount = npcs.filter(
    (npc) => npc.environmentId == environment.id
  ).length;
  const mapCount = environment.maps ? environment.maps.length : 0;

  return `
        <div class="card card-list card-compact" data-environment-id="${
          environment.id
        }">
            <div class="card-header">
                <div class="card-avatar">🗺️</div>
                <div class="card-info">
                    <h3>${environment.name}</h3>
                    <p>${
                      environment.type || "Ambientazione"
                    } • ${npcCount} NPC • ${mapCount} mappe</p>
                </div>
                <div class="card-actions">
                    ${
                      environment.challengeLevel
                        ? `<span class="challenge-badge challenge-${environment.challengeLevel
                            .toLowerCase()
                            .replace(" ", "-")}">${
                            environment.challengeLevel
                          }</span>`
                        : ""
                    }
                </div>
            </div>
        </div>
    `;
}

/**
 * Get form validation config for environments
 */
export function getValidationConfig() {
  return {
    entityType: "environments",
    rules: {
      name: {
        required: true,
        minLength: 2,
        maxLength: 100,
      },
      type: {
        enum: [...ENVIRONMENT_DATA.types, ""], // Allow empty
      },
      climate: {
        enum: [...ENVIRONMENT_DATA.climates, ""], // Allow empty
      },
      size: {
        enum: ["Minuscola", "Piccola", "Media", "Grande", "Enorme", ""], // Allow empty
      },
      challengeLevel: {
        enum: [
          "Molto Facile",
          "Facile",
          "Medio",
          "Difficile",
          "Molto Difficile",
          "",
        ], // Allow empty
      },
    },
  };
}

export default {
  generateForm,
  generateDetail,
  generateCard,
  generateListItem,
  getValidationConfig,
  ENVIRONMENT_DATA,
};
