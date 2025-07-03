/**
 * Character Templates - Template HTML per personaggi
 */

// Razze, classi e allineamenti D&D 5e
const CHARACTER_DATA = {
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
  ],
  classes: [
    "Barbaro",
    "Bardo",
    "Chierico",
    "Druido",
    "Guerriero",
    "Monaco",
    "Paladino",
    "Ranger",
    "Ladro",
    "Stregone",
    "Warlock",
    "Mago",
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
};

/**
 * Generate character form template
 */
export function generateForm(character = null, mode = "create") {
  const isEdit = mode === "edit" && character;
  const hasImage =
    character?.avatar && character.avatar.startsWith("data:image");
  const emojiAvatar = hasImage ? "🧙" : character?.avatar || "🧙";

  return `
        <form id="character-form" data-entity-type="characters" data-mode="${mode}">
            <div class="form-section">
                <h3 class="form-section-title">Informazioni Base</h3>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Nome Personaggio</label>
                        <input type="text" class="form-input" name="name" 
                               value="${character?.name || ""}" 
                               required 
                               placeholder="Es. Thorin Barbascura">
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Nome Giocatore</label>
                        <input type="text" class="form-input" name="playerName" 
                               value="${character?.playerName || ""}" 
                               required 
                               placeholder="Es. Marco Rossi">
                    </div>
                </div>
                
                <div class="form-row-3">
                    <div class="form-group">
                        <label class="form-label required">Razza</label>
                        <select class="form-select" name="race" required>
                            <option value="">Seleziona razza</option>
                            ${CHARACTER_DATA.races
                              .map(
                                (race) =>
                                  `<option value="${race}" ${
                                    character?.race === race ? "selected" : ""
                                  }>${race}</option>`
                              )
                              .join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Classe</label>
                        <select class="form-select" name="class" required>
                            <option value="">Seleziona classe</option>
                            ${CHARACTER_DATA.classes
                              .map(
                                (cls) =>
                                  `<option value="${cls}" ${
                                    character?.class === cls ? "selected" : ""
                                  }>${cls}</option>`
                              )
                              .join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Allineamento</label>
                        <select class="form-select" name="alignment" required>
                            <option value="">Seleziona allineamento</option>
                            ${CHARACTER_DATA.alignments
                              .map(
                                (align) =>
                                  `<option value="${align}" ${
                                    character?.alignment === align
                                      ? "selected"
                                      : ""
                                  }>${align}</option>`
                              )
                              .join("")}
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Livello</label>
                        <input type="number" class="form-input" name="level" 
                               min="1" max="20" 
                               value="${character?.level || 1}" 
                               required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">HP Massimi</label>
                        <input type="number" class="form-input" name="hitPoints" 
                               min="1" max="999" 
                               value="${character?.hitPoints || ""}" 
                               placeholder="Es. 45">
                        <small class="form-help">Punti ferita massimi del personaggio</small>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h3 class="form-section-title">Avatar</h3>
                <div class="form-group">
                    <div id="character-avatar-upload" class="image-upload-avatar">
                        <!-- Image upload component will be initialized here -->
                    </div>
                    <input type="hidden" name="avatar" value="${
                      character?.avatar || "🧙"
                    }">
                </div>
            </div>
            
            <div class="form-section">
                <h3 class="form-section-title">Background</h3>
                <div class="form-group">
                    <label class="form-label">Storia del Personaggio</label>
                    <textarea class="form-textarea" name="background" 
                              placeholder="Descrivi il background, la storia e la personalità del personaggio..."
                              style="min-height: 120px;">${
                                character?.background || ""
                              }</textarea>
                    <small class="form-help">Includi informazioni su origine, motivazioni, legami e ideali</small>
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-action="cancel">Annulla</button>
                <button type="submit" class="btn btn-primary">
                    ${isEdit ? "Aggiorna" : "Salva"} Personaggio
                </button>
            </div>
        </form>
    `;
}

/**
 * Generate character detail view template
 */
export function generateDetail(character) {
  const adventures = character.adventures || [];

  return `
        <div class="detail-section">
            <h3 class="detail-section-title">Informazioni Base</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Giocatore:</span>
                    <span class="detail-value">${character.playerName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Razza:</span>
                    <span class="detail-value">${
                      character.race || "Non specificata"
                    }</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Classe:</span>
                    <span class="detail-value">${character.class}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Livello:</span>
                    <span class="detail-value">${character.level}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Allineamento:</span>
                    <span class="detail-value">${character.alignment}</span>
                </div>
                ${
                  character.hitPoints
                    ? `
                    <div class="detail-item">
                        <span class="detail-label">HP Massimi:</span>
                        <span class="detail-value">${character.hitPoints}</span>
                    </div>
                `
                    : ""
                }
            </div>
            
            ${
              character.background
                ? `
                <div class="detail-content mt-2">
                    <h4>Background</h4>
                    <p class="detail-description">${character.background}</p>
                </div>
            `
                : ""
            }
        </div>
        
        <div class="detail-section">
            <div class="detail-section-header">
                <h3 class="detail-section-title">Imprese e Scelte (${
                  adventures.length
                })</h3>
                <button class="btn btn-secondary btn-sm" data-action="add-adventure" data-id="${
                  character.id
                }">
                    + Aggiungi Impresa
                </button>
            </div>
            
            <div class="detail-list-container">
                ${
                  adventures.length > 0
                    ? `
                    <div class="detail-list">
                        ${adventures
                          .map(
                            (adv, index) => `
                            <div class="detail-list-item">
                                <div class="detail-list-content">
                                    <p>${
                                      typeof adv === "string"
                                        ? adv
                                        : adv.description
                                    }</p>
                                    ${
                                      typeof adv === "object" && adv.date
                                        ? `
                                        <small class="detail-list-meta">
                                            ${new Date(
                                              adv.date
                                            ).toLocaleDateString("it-IT")}
                                        </small>
                                    `
                                        : ""
                                    }
                                </div>
                                <button class="btn btn-danger btn-sm" 
                                        data-action="remove-adventure" 
                                        data-id="${character.id}" 
                                        data-adventure-id="${
                                          typeof adv === "object"
                                            ? adv.id
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
                        <p>Nessuna impresa registrata ancora.</p>
                        <small>Le imprese rappresentano momenti significativi nella storia del personaggio</small>
                    </div>
                `
                }
            </div>
        </div>
        
        <div class="modal-footer">
            <button class="btn btn-danger" data-action="delete" data-id="${
              character.id
            }">
                Elimina Personaggio
            </button>
            <div class="flex gap-1">
                <button class="btn btn-secondary" data-action="edit" data-id="${
                  character.id
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
 * Generate character card template
 */
export function generateCard(character) {
  const hasImage =
    character.avatar && character.avatar.startsWith("data:image");
  let avatarDisplay;

  if (hasImage) {
    avatarDisplay = `<img src="${character.avatar}" alt="${character.name}">`;
  } else {
    avatarDisplay = character.avatar || "🧙";
  }

  return `
        <div class="card" data-character-id="${character.id}">
            <div class="card-header">
                <div class="card-avatar">${avatarDisplay}</div>
                <div class="card-info">
                    <h3>${character.name}</h3>
                    <p>Giocatore: ${character.playerName}</p>
                </div>
            </div>
            
            <div class="card-details">
                <div class="detail-item">
                    <span class="detail-label">Razza:</span>
                    <span class="detail-value">${
                      character.race || "Non specificata"
                    }</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Classe:</span>
                    <span class="detail-value">${character.class}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Livello:</span>
                    <span class="detail-value">${character.level}</span>
                </div>
                <div class="detail-item span-full">
                    <span class="detail-label">Allineamento:</span>
                    <span class="detail-value">${character.alignment}</span>
                </div>
            </div>
            
            ${
              character.hitPoints
                ? `
                <div class="card-footer">
                    <small class="text-secondary">HP Massimi: ${character.hitPoints}</small>
                </div>
            `
                : ""
            }
        </div>
    `;
}

/**
 * Generate compact character list item
 */
export function generateListItem(character) {
  const hasImage =
    character.avatar && character.avatar.startsWith("data:image");
  let avatarDisplay;

  if (hasImage) {
    avatarDisplay = `<img src="${character.avatar}" alt="${character.name}">`;
  } else {
    avatarDisplay = character.avatar || "🧙";
  }

  return `
        <div class="card card-list card-compact" data-character-id="${character.id}">
            <div class="card-header">
                <div class="card-avatar card-avatar-sm">${avatarDisplay}</div>
                <div class="card-info">
                    <h3>${character.name}</h3>
                    <p>${character.class} ${character.race} (Livello ${character.level})</p>
                </div>
                <div class="card-actions">
                    <small class="text-secondary">${character.playerName}</small>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generate character selection option for encounters
 */
export function generateSelectionOption(character) {
  const hasImage =
    character.avatar && character.avatar.startsWith("data:image");
  let avatarDisplay;

  if (hasImage) {
    avatarDisplay = `<img src="${character.avatar}" alt="${character.name}">`;
  } else {
    avatarDisplay = character.avatar || "🧙";
  }

  return `
        <div class="selection-option" data-character-id="${character.id}">
            <div class="selection-avatar">${avatarDisplay}</div>
            <div class="selection-info">
                <h4>${character.name}</h4>
                <p>${character.class} ${character.race} - Livello ${character.level}</p>
                <small>Giocatore: ${character.playerName}</small>
            </div>
        </div>
    `;
}

/**
 * Get form validation config for characters
 */
export function getValidationConfig() {
  return {
    entityType: "characters",
    rules: {
      name: {
        required: true,
        minLength: 2,
        maxLength: 50,
      },
      playerName: {
        required: true,
        minLength: 2,
        maxLength: 50,
      },
      race: {
        required: true,
        enum: CHARACTER_DATA.races,
      },
      class: {
        required: true,
        enum: CHARACTER_DATA.classes,
      },
      level: {
        required: true,
        type: "number",
        min: 1,
        max: 20,
      },
      hitPoints: {
        type: "number",
        min: 1,
        max: 999,
      },
      alignment: {
        required: true,
        enum: CHARACTER_DATA.alignments,
      },
    },
  };
}

export default {
  generateForm,
  generateDetail,
  generateCard,
  generateListItem,
  generateSelectionOption,
  getValidationConfig,
  CHARACTER_DATA,
};
