/**
 * NPC Templates - Template HTML per NPC
 */

// Dati per NPC D&D 5e
const NPC_DATA = {
  races: [
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
  ],
  alignments: [
    "Legale Buono",
    "Neutrale Buono",
    "Caotico Buono",
    "Legale Neutrale",
    "Neutrale Puro",
    "Caotico Neutrale",
    "Legale Malvagio",
    "Neutrale Malvagio",
    "Caotico Malvagio",
  ],
  attitudes: [
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
    "Cauto",
    "Coraggioso",
    "Pauroso",
  ],
  professions: [
    "Mercante",
    "Guardia",
    "Taverniere",
    "Fabbro",
    "Agricoltore",
    "Soldato",
    "Chierico",
    "Studioso",
    "Ladro",
    "Bardo",
    "Cacciatore",
    "Pescatore",
    "Artigiano",
    "Nobile",
    "Mendicante",
    "Spia",
    "Assassino",
    "Guaritore",
    "Mago",
    "Druido",
  ],
};

/**
 * Generate NPC form template
 */
export function generateForm(npc = null, mode = "create") {
  const isEdit = mode === "edit" && npc;
  const hasImage = npc?.avatar && npc.avatar.startsWith("data:image");

  // Get environments for selection
  const environments = window.dataStore?.get("environments") || [];

  return `
        <form id="npc-form" data-entity-type="npcs" data-mode="${mode}">
            <div class="form-section">
                <h3 class="form-section-title">Informazioni Base</h3>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Nome NPC</label>
                        <input type="text" class="form-input" name="name" 
                               value="${npc?.name || ""}" 
                               required 
                               placeholder="Es. Elda la Mercante">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Professione</label>
                        <select class="form-select" name="profession">
                            <option value="">Seleziona professione</option>
                            ${NPC_DATA.professions
                              .map(
                                (prof) =>
                                  `<option value="${prof}" ${
                                    npc?.profession === prof ? "selected" : ""
                                  }>${prof}</option>`
                              )
                              .join("")}
                        </select>
                    </div>
                </div>
                
                <div class="form-row-3">
                    <div class="form-group">
                        <label class="form-label">Razza</label>
                        <select class="form-select" name="race">
                            <option value="">Seleziona razza</option>
                            ${NPC_DATA.races
                              .map(
                                (race) =>
                                  `<option value="${race}" ${
                                    npc?.race === race ? "selected" : ""
                                  }>${race}</option>`
                              )
                              .join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Allineamento</label>
                        <select class="form-select" name="alignment" required>
                            <option value="">Seleziona allineamento</option>
                            ${NPC_DATA.alignments
                              .map(
                                (align) =>
                                  `<option value="${align}" ${
                                    npc?.alignment === align ? "selected" : ""
                                  }>${align}</option>`
                              )
                              .join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Atteggiamento</label>
                        <select class="form-select" name="attitude" required>
                            <option value="">Seleziona atteggiamento</option>
                            ${NPC_DATA.attitudes
                              .map(
                                (att) =>
                                  `<option value="${att}" ${
                                    npc?.attitude === att ? "selected" : ""
                                  }>${att}</option>`
                              )
                              .join("")}
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Ambientazione</label>
                    <select class="form-select" name="environmentId">
                        <option value="">Nessuna ambientazione specifica</option>
                        ${environments
                          .map(
                            (env) =>
                              `<option value="${env.id}" ${
                                npc?.environmentId == env.id ? "selected" : ""
                              }>${env.name}</option>`
                          )
                          .join("")}
                    </select>
                    <small class="form-help">Collega questo NPC a un'ambientazione specifica</small>
                </div>
            </div>

            <div class="form-section">
                <h3 class="form-section-title">Avatar</h3>
                <div class="form-group">
                    <div id="npc-avatar-upload" class="image-upload-avatar">
                        <!-- Image upload component will be initialized here -->
                    </div>
                    <input type="hidden" name="avatar" value="${
                      npc?.avatar || "🧙"
                    }">
                </div>
            </div>
            
            <div class="form-section">
                <h3 class="form-section-title">Descrizione</h3>
                
                <div class="form-group">
                    <label class="form-label">Aspetto e Personalità</label>
                    <textarea class="form-textarea" name="description" 
                              placeholder="Descrivi l'aspetto fisico, la personalità, le motivazioni e il ruolo dell'NPC nel mondo di gioco..."
                              style="min-height: 120px;">${
                                npc?.description || ""
                              }</textarea>
                    <small class="form-help">Includi dettagli su aspetto, comportamento, dialoghi tipici e relazioni</small>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Motivazioni</label>
                        <input type="text" class="form-input" name="motivations" 
                               value="${npc?.motivations || ""}" 
                               placeholder="Es. Proteggere la famiglia, accumulare ricchezze...">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Segreti</label>
                        <input type="text" class="form-input" name="secrets" 
                               value="${npc?.secrets || ""}" 
                               placeholder="Es. È un membro di una setta segreta...">
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-action="cancel">Annulla</button>
                <button type="submit" class="btn btn-primary">
                    ${isEdit ? "Aggiorna" : "Salva"} NPC
                </button>
            </div>
        </form>
    `;
}

/**
 * Generate NPC detail view template
 */
export function generateDetail(npc) {
  const interactions = npc.interactions || [];
  const environments = window.dataStore?.get("environments") || [];
  const environment = environments.find((env) => env.id == npc.environmentId);

  return `
        <div class="detail-section">
            <h3 class="detail-section-title">Informazioni Base</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Razza:</span>
                    <span class="detail-value">${
                      npc.race || "Non specificata"
                    }</span>
                </div>
                ${
                  npc.profession
                    ? `
                    <div class="detail-item">
                        <span class="detail-label">Professione:</span>
                        <span class="detail-value">${npc.profession}</span>
                    </div>
                `
                    : ""
                }
                <div class="detail-item">
                    <span class="detail-label">Allineamento:</span>
                    <span class="detail-value">${npc.alignment}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Atteggiamento:</span>
                    <span class="detail-value">${npc.attitude}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Ambientazione:</span>
                    <span class="detail-value">${
                      environment ? environment.name : "Libera"
                    }</span>
                </div>
            </div>
            
            ${
              npc.description
                ? `
                <div class="detail-content mt-2">
                    <h4>Descrizione</h4>
                    <p class="detail-description">${npc.description}</p>
                </div>
            `
                : ""
            }
            
            ${
              npc.motivations || npc.secrets
                ? `
                <div class="detail-content mt-2">
                    ${
                      npc.motivations
                        ? `
                        <div class="mb-2">
                            <h4>Motivazioni</h4>
                            <p class="detail-description">${npc.motivations}</p>
                        </div>
                    `
                        : ""
                    }
                    ${
                      npc.secrets
                        ? `
                        <div>
                            <h4>Segreti</h4>
                            <p class="detail-description text-warning">${npc.secrets}</p>
                        </div>
                    `
                        : ""
                    }
                </div>
            `
                : ""
            }
        </div>
        
        <div class="detail-section">
            <div class="detail-section-header">
                <h3 class="detail-section-title">Interazioni con i Giocatori (${
                  interactions.length
                })</h3>
                <button class="btn btn-secondary btn-sm" data-action="add-interaction" data-id="${
                  npc.id
                }">
                    + Aggiungi Interazione
                </button>
            </div>
            
            <div class="detail-list-container">
                ${
                  interactions.length > 0
                    ? `
                    <div class="detail-list">
                        ${interactions
                          .map(
                            (interaction, index) => `
                            <div class="detail-list-item">
                                <div class="detail-list-content">
                                    <p>${
                                      typeof interaction === "string"
                                        ? interaction
                                        : interaction.description
                                    }</p>
                                    ${
                                      typeof interaction === "object" &&
                                      interaction.date
                                        ? `
                                        <small class="detail-list-meta">
                                            ${new Date(
                                              interaction.date
                                            ).toLocaleDateString("it-IT")}
                                        </small>
                                    `
                                        : ""
                                    }
                                </div>
                                <button class="btn btn-danger btn-sm" 
                                        data-action="remove-interaction" 
                                        data-id="${npc.id}" 
                                        data-interaction-id="${
                                          typeof interaction === "object"
                                            ? interaction.id
                                            : index
                                        }">
                                    ×
                                </button>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                `
                    : `
                    <div class="detail-empty">
                        <p>Nessuna interazione registrata ancora.</p>
                        <small>Traccia conversazioni, azioni e sviluppi della relazione con i giocatori</small>
                    </div>
                `
                }
            </div>
        </div>
        
        <div class="modal-footer">
            <button class="btn btn-danger" data-action="delete" data-id="${
              npc.id
            }">
                Elimina NPC
            </button>
            <div class="flex gap-1">
                <button class="btn btn-secondary" data-action="edit" data-id="${
                  npc.id
                }">
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
 * Generate NPC card template
 */
export function generateCard(npc) {
  const hasImage = npc.avatar && npc.avatar.startsWith("data:image");
  let avatarDisplay;

  if (hasImage) {
    avatarDisplay = `<img src="${npc.avatar}" alt="${npc.name}">`;
  } else {
    avatarDisplay = npc.avatar || "🧙";
  }

  // Get environment name if linked
  const environments = window.dataStore?.get("environments") || [];
  const environment = environments.find((env) => env.id == npc.environmentId);

  return `
        <div class="card" data-npc-id="${npc.id}">
            <div class="card-header">
                <div class="card-avatar">${avatarDisplay}</div>
                <div class="card-info">
                    <h3>${npc.name}</h3>
                    <p>${
                      environment ? environment.name : "Ambientazione libera"
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
                ${
                  npc.profession
                    ? `
                    <div class="detail-item">
                        <span class="detail-label">Professione:</span>
                        <span class="detail-value">${npc.profession}</span>
                    </div>
                `
                    : ""
                }
                <div class="detail-item span-full">
                    <span class="detail-label">Allineamento:</span>
                    <span class="detail-value">${npc.alignment}</span>
                </div>
            </div>
            
            ${
              npc.motivations || npc.secrets
                ? `
                <div class="card-footer">
                    ${
                      npc.motivations
                        ? `<small class="text-secondary">Motivazione: ${
                            npc.motivations.length > 30
                              ? npc.motivations.substring(0, 30) + "..."
                              : npc.motivations
                          }</small>`
                        : ""
                    }
                    ${
                      npc.secrets
                        ? `<small class="text-warning">Ha dei segreti</small>`
                        : ""
                    }
                </div>
            `
                : ""
            }
        </div>
    `;
}

/**
 * Generate compact NPC list item
 */
export function generateListItem(npc) {
  const hasImage = npc.avatar && npc.avatar.startsWith("data:image");
  let avatarDisplay;

  if (hasImage) {
    avatarDisplay = `<img src="${npc.avatar}" alt="${npc.name}">`;
  } else {
    avatarDisplay = npc.avatar || "🧙";
  }

  const environments = window.dataStore?.get("environments") || [];
  const environment = environments.find((env) => env.id == npc.environmentId);

  return `
        <div class="card card-list card-compact" data-npc-id="${npc.id}">
            <div class="card-header">
                <div class="card-avatar card-avatar-sm">${avatarDisplay}</div>
                <div class="card-info">
                    <h3>${npc.name}</h3>
                    <p>${npc.race || "Razza sconosciuta"} ${
    npc.profession ? `• ${npc.profession}` : ""
  }</p>
                </div>
                <div class="card-actions">
                    <span class="attitude-badge attitude-${npc.attitude
                      .toLowerCase()
                      .replace(" ", "-")}">${npc.attitude}</span>
                    ${
                      environment
                        ? `<small class="text-secondary">${environment.name}</small>`
                        : ""
                    }
                </div>
            </div>
        </div>
    `;
}

/**
 * Generate NPC for environment view
 */
export function generateEnvironmentNPC(npc) {
  const hasImage = npc.avatar && npc.avatar.startsWith("data:image");
  let avatarDisplay;

  if (hasImage) {
    avatarDisplay = `<img src="${npc.avatar}" alt="${npc.name}" class="npc-avatar">`;
  } else {
    avatarDisplay = `<div class="npc-avatar-emoji">${npc.avatar || "🧙"}</div>`;
  }

  return `
        <div class="npc-item" data-npc-id="${npc.id}">
            <div class="npc-avatar-container">${avatarDisplay}</div>
            <div class="npc-info">
                <h4 class="npc-name">${npc.name}</h4>
                <p class="npc-details">
                    ${npc.race ? `${npc.race} • ` : ""}${
    npc.attitude || "Neutrale"
  }
                    ${npc.profession ? ` • ${npc.profession}` : ""}
                </p>
                ${
                  npc.description
                    ? `
                    <p class="npc-description">
                        ${
                          npc.description.length > 100
                            ? npc.description.substring(0, 100) + "..."
                            : npc.description
                        }
                    </p>
                `
                    : ""
                }
            </div>
            <div class="npc-actions">
                <span class="view-arrow">→</span>
            </div>
        </div>
    `;
}

/**
 * Generate NPC selection option for encounters
 */
export function generateSelectionOption(npc) {
  const hasImage = npc.avatar && npc.avatar.startsWith("data:image");
  let avatarDisplay;

  if (hasImage) {
    avatarDisplay = `<img src="${npc.avatar}" alt="${npc.name}">`;
  } else {
    avatarDisplay = npc.avatar || "🧙";
  }

  return `
        <div class="selection-option" data-npc-id="${npc.id}">
            <div class="selection-avatar">${avatarDisplay}</div>
            <div class="selection-info">
                <h4>${npc.name}</h4>
                <p>${npc.race || "Razza sconosciuta"}${
    npc.profession ? ` • ${npc.profession}` : ""
  }</p>
                <small>Atteggiamento: ${npc.attitude}</small>
            </div>
        </div>
    `;
}

/**
 * Get form validation config for NPCs
 */
export function getValidationConfig() {
  return {
    entityType: "npcs",
    rules: {
      name: {
        required: true,
        minLength: 2,
        maxLength: 50,
      },
      race: {
        enum: [...NPC_DATA.races, ""], // Allow empty
      },
      profession: {
        enum: [...NPC_DATA.professions, ""], // Allow empty
      },
      alignment: {
        required: true,
        enum: NPC_DATA.alignments,
      },
      attitude: {
        required: true,
        enum: NPC_DATA.attitudes,
      },
      environmentId: {
        type: "number", // Will be validated against existing environments
      },
    },
  };
}

export default {
  generateForm,
  generateDetail,
  generateCard,
  generateListItem,
  generateEnvironmentNPC,
  generateSelectionOption,
  getValidationConfig,
  NPC_DATA,
};
