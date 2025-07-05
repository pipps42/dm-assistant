/**
 * Enhanced Character Templates - Template HTML migliorati per personaggi
 * Supporta le nuove funzionalità del sistema modulare
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
 * Generate enhanced character detail view template
 */
export function generateDetail(character) {
  const adventures = character.adventures || [];
  const notes = character.notes || [];
  const hasImage =
    character.avatar && character.avatar.startsWith("data:image");

  let avatarDisplay;
  if (hasImage) {
    avatarDisplay = `<img src="${character.avatar}" alt="${character.name}" class="detail-avatar">`;
  } else {
    avatarDisplay = `<div class="detail-avatar-emoji">${
      character.avatar || "🧙"
    }</div>`;
  }

  return `
        <div class="detail-header">
            <div class="detail-avatar-container">${avatarDisplay}</div>
            <div class="detail-header-info">
                <h2 class="detail-title">${character.name}</h2>
                <p class="detail-subtitle">${character.class} ${
    character.race
  } (Livello ${character.level})</p>
                <small class="detail-meta">Giocatore: ${
                  character.playerName
                }</small>
                ${
                  character.level < 20
                    ? `
                <button class="btn btn-success btn-sm mt-1" 
                        data-action="level-up" 
                        data-id="${character.id}"
                        data-entity-type="characters"
                        title="Avanza di livello">
                    📈 Avanza Livello
                </button>`
                    : ""
                }
            </div>
        </div>
        
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
                    <span class="detail-value">
                        ${character.hitPoints}
                        <button class="btn btn-link btn-tiny" 
                                data-action="update-hp" 
                                data-id="${character.id}"
                                data-entity-type="characters"
                                title="Modifica HP">
                            ✏️
                        </button>
                    </span>
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
                <h3 class="detail-section-title">Imprese e Momenti Significativi (${
                  adventures.length
                })</h3>
                <button class="btn btn-secondary btn-sm" 
                        data-action="add-adventure" 
                        data-id="${character.id}"
                        data-entity-type="characters">
                    + Aggiungi Impresa
                </button>
            </div>
            
            <div class="detail-list-container">
                ${
                  adventures.length > 0
                    ? `
                    <div class="detail-list">
                        ${adventures
                          .sort(
                            (a, b) =>
                              new Date(b.date || 0) - new Date(a.date || 0)
                          )
                          .map((adv, index) => {
                            const isString = typeof adv === "string";
                            const description = isString
                              ? adv
                              : adv.description;
                            const date =
                              !isString && adv.date ? new Date(adv.date) : null;
                            const session =
                              !isString && adv.session ? adv.session : null;
                            const type =
                              !isString && adv.type ? adv.type : "adventure";
                            const id = !isString && adv.id ? adv.id : index;

                            const typeIcon = type === "level-up" ? "📈" : "⚔️";
                            const typeClass =
                              type === "level-up" ? "level-up-adventure" : "";

                            return `
                                <div class="detail-list-item ${typeClass}">
                                    <div class="detail-list-content">
                                        <div class="adventure-header">
                                            <span class="adventure-icon">${typeIcon}</span>
                                            <p class="adventure-description">${description}</p>
                                        </div>
                                        ${
                                          date || session
                                            ? `
                                            <div class="adventure-meta">
                                                ${
                                                  date
                                                    ? `
                                                    <small class="detail-list-meta">
                                                        ${date.toLocaleDateString(
                                                          "it-IT"
                                                        )}
                                                    </small>
                                                `
                                                    : ""
                                                }
                                                ${
                                                  session
                                                    ? `
                                                    <small class="detail-list-session">
                                                        Sessione: ${session}
                                                    </small>
                                                `
                                                    : ""
                                                }
                                            </div>
                                        `
                                            : ""
                                        }
                                    </div>
                                    <button class="btn btn-danger btn-sm" 
                                            data-action="remove-adventure" 
                                            data-id="${character.id}" 
                                            data-adventure-id="${id}"
                                            data-entity-type="characters"
                                            title="Rimuovi impresa">
                                        ×
                                    </button>
                                </div>
                            `;
                          })
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

        <div class="detail-section">
            <div class="detail-section-header">
                <h3 class="detail-section-title">Note del Giocatore (${
                  notes.length
                })</h3>
                <button class="btn btn-secondary btn-sm" 
                        data-action="add-note" 
                        data-id="${character.id}"
                        data-entity-type="characters">
                    + Aggiungi Nota
                </button>
            </div>
            
            <div class="detail-list-container">
                ${
                  notes.length > 0
                    ? `
                    <div class="detail-list">
                        ${notes
                          .sort(
                            (a, b) =>
                              new Date(b.date || 0) - new Date(a.date || 0)
                          )
                          .map(
                            (note) => `
                            <div class="detail-list-item note-item">
                                <div class="detail-list-content">
                                    <p class="note-text">${note.text}</p>
                                    ${
                                      note.date || note.session
                                        ? `
                                        <div class="note-meta">
                                            ${
                                              note.date
                                                ? `
                                                <small class="detail-list-meta">
                                                    ${new Date(
                                                      note.date
                                                    ).toLocaleDateString(
                                                      "it-IT"
                                                    )}
                                                </small>
                                            `
                                                : ""
                                            }
                                            ${
                                              note.session
                                                ? `
                                                <small class="detail-list-session">
                                                    Sessione: ${note.session}
                                                </small>
                                            `
                                                : ""
                                            }
                                        </div>
                                    `
                                        : ""
                                    }
                                </div>
                                <button class="btn btn-danger btn-sm" 
                                        data-action="remove-note" 
                                        data-id="${character.id}" 
                                        data-note-id="${note.id}"
                                        data-entity-type="characters"
                                        title="Rimuovi nota">
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
                        <p>Nessuna nota presente.</p>
                        <small>Usa le note per tracciare dettagli importanti sul personaggio</small>
                    </div>
                `
                }
            </div>
        </div>
        
        <div class="detail-section">
            <h3 class="detail-section-title">Statistiche Avanzamento</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-number">${adventures.length}</span>
                    <span class="stat-label">Imprese Totali</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">${
                      adventures.filter(
                        (adv) =>
                          typeof adv === "object" && adv.type === "level-up"
                      ).length
                    }</span>
                    <span class="stat-label">Avanzamenti</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">${notes.length}</span>
                    <span class="stat-label">Note</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">${20 - character.level}</span>
                    <span class="stat-label">Livelli Rimanenti</span>
                </div>
            </div>
        </div>
        
        <div class="modal-footer">
            <div class="footer-actions-left">
                <button class="btn btn-info btn-sm" 
                        data-action="export-sheet" 
                        data-id="${character.id}"
                        data-entity-type="characters">
                    📄 Esporta Scheda
                </button>
            </div>
            <div class="footer-actions-center">
                <button class="btn btn-danger" 
                        data-action="delete" 
                        data-id="${character.id}"
                        data-entity-type="characters">
                    Elimina Personaggio
                </button>
            </div>
            <div class="footer-actions-right">
                <button class="btn btn-secondary" 
                        data-action="edit" 
                        data-id="${character.id}"
                        data-entity-type="characters">
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
 * Generate enhanced character card template
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

  const adventureCount = character.adventures ? character.adventures.length : 0;
  const noteCount = character.notes ? character.notes.length : 0;
  const recentActivity = getRecentActivity(character);

  return `
        <div class="card character-card" data-character-id="${character.id}">
            <div class="card-header">
                <div class="card-avatar">${avatarDisplay}</div>
                <div class="card-info">
                    <h3>${character.name}</h3>
                    <p>Giocatore: ${character.playerName}</p>
                    ${
                      recentActivity
                        ? `
                        <div class="activity-indicator">
                            <span class="activity-dot"></span>
                            <small>Attività recente</small>
                        </div>
                    `
                        : ""
                    }
                </div>
                <div class="card-badges">
                    ${
                      character.level >= 10
                        ? '<span class="badge badge-veteran">Veterano</span>'
                        : ""
                    }
                    ${
                      adventureCount >= 10
                        ? '<span class="badge badge-experienced">Esperto</span>'
                        : ""
                    }
                    ${
                      character.level === 20
                        ? '<span class="badge badge-max-level">Livello Max</span>'
                        : ""
                    }
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
                    <span class="detail-value level-display">
                        ${character.level}
                        ${
                          character.level < 20
                            ? `
                            <div class="level-progress">
                                <div class="level-progress-bar" style="width: ${
                                  (character.level / 20) * 100
                                }%"></div>
                            </div>
                        `
                            : '<span class="max-level-icon">👑</span>'
                        }
                    </span>
                </div>
                <div class="detail-item span-full">
                    <span class="detail-label">Allineamento:</span>
                    <span class="detail-value">${character.alignment}</span>
                </div>
            </div>
            
            <div class="card-stats">
                <div class="card-stat">
                    <span class="stat-icon">⚔️</span>
                    <span class="stat-value">${adventureCount}</span>
                    <span class="stat-label">Imprese</span>
                </div>
                ${
                  character.hitPoints
                    ? `
                <div class="card-stat">
                    <span class="stat-icon">❤️</span>
                    <span class="stat-value">${character.hitPoints}</span>
                    <span class="stat-label">HP</span>
                </div>
                `
                    : ""
                }
                <div class="card-stat">
                    <span class="stat-icon">📝</span>
                    <span class="stat-value">${noteCount}</span>
                    <span class="stat-label">Note</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generate enhanced form template with new features
 */
export function generateForm(character = null, mode = "create") {
  const isEdit = mode === "edit" && character;

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
                        <small class="form-help">Livello attuale del personaggio (1-20)</small>
                    </div>
                    <div class="form-group">
                        <label class="form-label">HP Massimi</label>
                        <input type="number" class="form-input" name="hitPoints" 
                               min="1" max="999" 
                               value="${character?.hitPoints || ""}" 
                               placeholder="Verrà suggerito in base alla classe">
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
                    <!-- Background templates will be added here by form handler -->
                </div>
            </div>

            ${
              isEdit && character.adventures && character.adventures.length > 0
                ? `
            <div class="form-section">
                <h3 class="form-section-title">Riepilogo Attuale</h3>
                <div class="character-summary">
                    <div class="summary-stats">
                        <div class="summary-stat">
                            <span class="summary-number">${
                              character.adventures.length
                            }</span>
                            <span class="summary-label">Imprese</span>
                        </div>
                        <div class="summary-stat">
                            <span class="summary-number">${
                              character.notes ? character.notes.length : 0
                            }</span>
                            <span class="summary-label">Note</span>
                        </div>
                        <div class="summary-stat">
                            <span class="summary-number">${
                              20 - character.level
                            }</span>
                            <span class="summary-label">Livelli Rimanenti</span>
                        </div>
                    </div>
                    <small class="summary-note">
                        Ultimo aggiornamento: ${
                          character.updatedAt
                            ? new Date(character.updatedAt).toLocaleDateString(
                                "it-IT"
                              )
                            : "Sconosciuto"
                        }
                    </small>
                </div>
            </div>
            `
                : ""
            }
            
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
 * Helper function to get recent activity
 */
function getRecentActivity(character) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Check recent adventures
  const recentAdventures = character.adventures
    ? character.adventures.filter((adv) => {
        const date =
          typeof adv === "object" && adv.date ? new Date(adv.date) : null;
        return date && date > oneWeekAgo;
      }).length
    : 0;

  // Check recent notes
  const recentNotes = character.notes
    ? character.notes.filter((note) => {
        const date = note.date ? new Date(note.date) : null;
        return date && date > oneWeekAgo;
      }).length
    : 0;

  // Check if character was updated recently
  const recentUpdate = character.updatedAt
    ? new Date(character.updatedAt) > oneWeekAgo
    : false;

  return recentAdventures > 0 || recentNotes > 0 || recentUpdate;
}

// Export enhanced template functions
export { CHARACTER_DATA };

export default {
  generateForm,
  generateDetail,
  generateCard,
  CHARACTER_DATA,
};
