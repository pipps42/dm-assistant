/**
 * Enhanced Character Templates - Versione refactorizzata con shared-templates
 */

// Import shared template components
import {
  generateAvatarDisplay,
  generateCardHeader,
  generateDetailGrid,
  generateStatsGrid,
  generateActionList,
  generateSectionHeader,
  generateModalFooter,
  generateBadge,
  generateProgressBar,
  generateEmptyState,
} from "./shared-templates.js";

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

  // Prepare adventures for action list
  const processedAdventures = adventures
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .map((adv, index) => {
      const isString = typeof adv === "string";
      const type = !isString && adv.type ? adv.type : "adventure";
      const typeIcon = type === "level-up" ? "📈" : "⚔️";

      return {
        id: !isString && adv.id ? adv.id : index,
        description: `${typeIcon} ${isString ? adv : adv.description}`,
        date: !isString && adv.date ? adv.date : null,
        session: !isString && adv.session ? adv.session : null,
        className: type === "level-up" ? "level-up-adventure" : "",
      };
    });

  // Prepare notes for action list
  const processedNotes = notes
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .map((note) => ({
      id: note.id,
      description: note.text,
      date: note.date,
      session: note.session,
      className: "note-item",
    }));

  return `
    <div class="detail-header">
      ${generateAvatarDisplay(character, {
        className: "detail-avatar-container",
      })}
      <div class="detail-header-info">
        <h2 class="detail-title">${character.name}</h2>
        <p class="detail-subtitle">${character.class} ${
    character.race
  } (Livello ${character.level})</p>
        <small class="detail-meta">Giocatore: ${character.playerName}</small>
        ${
          character.level < 20
            ? `
          <button class="btn btn-success btn-sm mt-1" 
                  data-action="level-up" 
                  data-id="${character.id}"
                  data-entity-type="characters"
                  title="Avanza di livello">
            📈 Avanza Livello
          </button>
        `
            : ""
        }
      </div>
    </div>
    
    <div class="detail-section">
      <h3 class="detail-section-title">Informazioni Base</h3>
      ${generateDetailGrid([
        { label: "Giocatore", value: character.playerName },
        { label: "Razza", value: character.race || "Non specificata" },
        { label: "Classe", value: character.class },
        { label: "Allineamento", value: character.alignment },
        { label: "Livello", value: character.level },
        ...(character.hitPoints
          ? [
              {
                label: "HP Massimi",
                value: `${character.hitPoints} <button class="btn btn-link btn-tiny" data-action="update-hp" data-id="${character.id}" data-entity-type="characters" title="Modifica HP">✏️</button>`,
              },
            ]
          : []),
      ])}
      
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
      ${generateSectionHeader("Imprese e Momenti Significativi", {
        count: adventures.length,
        showAddButton: true,
        addButtonText: "Aggiungi Impresa",
        addAction: "add-adventure",
        entityType: "characters",
        entityId: character.id,
      })}
      
      <div class="detail-list-container">
        ${
          adventures.length > 0
            ? generateActionList(processedAdventures, {
                removeAction: "remove-adventure",
                entityType: "characters",
                entityId: character.id,
              })
            : generateEmptyState({
                title: "Nessuna impresa registrata ancora.",
                description:
                  "Le imprese rappresentano momenti significativi nella storia del personaggio",
              })
        }
      </div>
    </div>

    <div class="detail-section">
      ${generateSectionHeader("Note del Giocatore", {
        count: notes.length,
        showAddButton: true,
        addButtonText: "Aggiungi Nota",
        addAction: "add-note",
        entityType: "characters",
        entityId: character.id,
      })}
      
      <div class="detail-list-container">
        ${
          notes.length > 0
            ? generateActionList(processedNotes, {
                removeAction: "remove-note",
                entityType: "characters",
                entityId: character.id,
              })
            : generateEmptyState({
                title: "Nessuna nota presente.",
                description:
                  "Usa le note per tracciare dettagli importanti sul personaggio",
              })
        }
      </div>
    </div>
    
    <div class="detail-section">
      <h3 class="detail-section-title">Statistiche Avanzamento</h3>
      ${generateStatsGrid([
        { value: adventures.length, label: "Imprese Totali" },
        {
          value: adventures.filter(
            (adv) => typeof adv === "object" && adv.type === "level-up"
          ).length,
          label: "Avanzamenti",
        },
        { value: notes.length, label: "Note" },
        { value: 20 - character.level, label: "Livelli Rimanenti" },
      ])}
    </div>
    
    ${generateModalFooter(character, {
      entityType: "characters",
      deleteText: "Elimina Personaggio",
      extraButtons: [
        {
          text: "📄 Esporta Scheda",
          action: "export-sheet",
          type: "info",
          size: "sm",
        },
      ],
    })}
  `;
}

/**
 * Generate enhanced character card template
 */
export function generateCard(character) {
  const adventureCount = character.adventures ? character.adventures.length : 0;
  const noteCount = character.notes ? character.notes.length : 0;
  const recentActivity = getRecentActivity(character);

  // Generate level progress bar
  const levelProgressHtml =
    character.level < 20
      ? generateProgressBar(character.level, 20, {
          showNumbers: false,
          className: "level-progress",
          color: "primary",
        })
      : '<span class="max-level-icon">👑</span>';

  // Generate character badges
  const badges = [
    ...(character.level >= 10 ? [{ text: "Veterano", type: "veteran" }] : []),
    ...(adventureCount >= 10 ? [{ text: "Esperto", type: "experienced" }] : []),
    ...(character.level === 20
      ? [{ text: "Livello Max", type: "max-level" }]
      : []),
  ];

  return `
    <div class="card character-card" data-character-id="${character.id}">
      ${generateCardHeader(character, {
        subtitle: `Giocatore: ${character.playerName}`,
        showMeta: recentActivity,
        metaText: recentActivity ? "Attività recente" : "",
        badges,
      })}
      
      ${generateDetailGrid(
        [
          { label: "Razza", value: character.race || "Non specificata" },
          { label: "Classe", value: character.class },
          {
            label: "Livello",
            value: `<div class="level-display">${character.level}${levelProgressHtml}</div>`,
          },
          { label: "Allineamento", value: character.alignment },
        ],
        {
          className: "card-details",
          columns: 2,
        }
      )}
      
      <div class="card-stats">
        ${[
          { icon: "⚔️", value: adventureCount, label: "Imprese" },
          ...(character.hitPoints
            ? [{ icon: "❤️", value: character.hitPoints, label: "HP" }]
            : []),
          { icon: "📝", value: noteCount, label: "Note" },
        ]
          .map(
            (stat) => `
          <div class="card-stat">
            <span class="stat-icon">${stat.icon}</span>
            <span class="stat-value">${stat.value}</span>
            <span class="stat-label">${stat.label}</span>
          </div>
        `
          )
          .join("")}
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
                      character?.alignment === align ? "selected" : ""
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
            ${generateStatsGrid(
              [
                { value: character.adventures.length, label: "Imprese" },
                {
                  value: character.notes ? character.notes.length : 0,
                  label: "Note",
                },
                { value: 20 - character.level, label: "Livelli Rimanenti" },
              ],
              { className: "summary-stats", showIcons: false }
            )}
            <small class="summary-note">
              Ultimo aggiornamento: ${
                character.updatedAt
                  ? new Date(character.updatedAt).toLocaleDateString("it-IT")
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
