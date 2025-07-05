/**
 * NPC Templates - Versione refactorizzata con shared-templates
 * Riduce ~250 righe di codice duplicato
 */

// Import shared template components
import {
  generateAvatarDisplay,
  generateCardHeader,
  generateDetailGrid,
  generateActionList,
  generateSectionHeader,
  generateModalFooter,
  generateBadge,
  generateTagsContainer,
  generateEmptyState,
} from "./shared-templates.js";

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
          <input type="hidden" name="avatar" value="${npc?.avatar || "🧙"}">
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

  // Process interactions for action list
  const processedInteractions = interactions.map((interaction, index) => ({
    id:
      typeof interaction === "object" && interaction.id
        ? interaction.id
        : index,
    description:
      typeof interaction === "string" ? interaction : interaction.description,
    date:
      typeof interaction === "object" && interaction.date
        ? interaction.date
        : null,
    session:
      typeof interaction === "object" && interaction.session
        ? interaction.session
        : null,
  }));

  return `
    <div class="detail-header">
      ${generateAvatarDisplay(npc, { className: "detail-avatar-container" })}
      <div class="detail-header-info">
        <h2 class="detail-title">${npc.name}</h2>
        <p class="detail-subtitle">${npc.race || "Razza sconosciuta"} • ${
    npc.attitude
  }</p>
        ${
          npc.profession
            ? `<small class="detail-meta">${npc.profession}</small>`
            : ""
        }
      </div>
    </div>
    
    <div class="detail-section">
      <h3 class="detail-section-title">Informazioni Base</h3>
      ${generateDetailGrid([
        { label: "Razza", value: npc.race || "Non specificata" },
        ...(npc.profession
          ? [{ label: "Professione", value: npc.profession }]
          : []),
        { label: "Allineamento", value: npc.alignment },
        { label: "Atteggiamento", value: npc.attitude },
        {
          label: "Ambientazione",
          value: environment ? environment.name : "Libera",
        },
      ])}
      
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
      ${generateSectionHeader("Interazioni con i Giocatori", {
        count: interactions.length,
        showAddButton: true,
        addButtonText: "Aggiungi Interazione",
        addAction: "add-interaction",
        entityType: "npcs",
        entityId: npc.id,
      })}
      
      <div class="detail-list-container">
        ${
          interactions.length > 0
            ? generateActionList(processedInteractions, {
                removeAction: "remove-interaction",
                entityType: "npcs",
                entityId: npc.id,
              })
            : generateEmptyState({
                title: "Nessuna interazione registrata ancora.",
                description:
                  "Traccia conversazioni, azioni e sviluppi della relazione con i giocatori",
              })
        }
      </div>
    </div>
    
    ${generateModalFooter(npc, {
      entityType: "npcs",
      deleteText: "Elimina NPC",
      extraButtons: [
        {
          text: "🎭 Cambia Atteggiamento",
          action: "change-attitude",
          type: "info",
          size: "sm",
        },
        ...(npc.secrets && !npc.secretRevealed
          ? [
              {
                text: "🔓 Rivela Segreto",
                action: "reveal-secret",
                type: "warning",
                size: "sm",
              },
            ]
          : []),
      ],
    })}
  `;
}

/**
 * Generate NPC card template
 */
export function generateCard(npc) {
  // Get environment name if linked
  const environments = window.dataStore?.get("environments") || [];
  const environment = environments.find((env) => env.id == npc.environmentId);

  // Generate attitude badge
  const attitudeBadge = {
    text: npc.attitude,
    type: getAttitudeBadgeType(npc.attitude),
  };

  const badges = [
    attitudeBadge,
    ...(npc.secrets && npc.secrets.trim()
      ? [{ text: "Ha segreti", type: "warning" }]
      : []),
  ];

  return `
    <div class="card" data-npc-id="${npc.id}">
      ${generateCardHeader(npc, {
        subtitle: environment ? environment.name : "Ambientazione libera",
        badges,
      })}
      
      ${generateDetailGrid(
        [
          { label: "Razza", value: npc.race || "Non specificata" },
          { label: "Atteggiamento", value: npc.attitude },
          ...(npc.profession
            ? [{ label: "Professione", value: npc.profession }]
            : []),
          { label: "Allineamento", value: npc.alignment },
        ],
        {
          className: "card-details",
          columns: 2,
        }
      )}
      
      ${
        npc.motivations
          ? `
        <div class="card-footer">
          <small class="text-secondary">
            Motivazione: ${
              npc.motivations.length > 30
                ? npc.motivations.substring(0, 30) + "..."
                : npc.motivations
            }
          </small>
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
  const environments = window.dataStore?.get("environments") || [];
  const environment = environments.find((env) => env.id == npc.environmentId);

  const attitudeBadge = {
    text: npc.attitude,
    type: getAttitudeBadgeType(npc.attitude),
  };

  return `
    <div class="card card-list card-compact" data-npc-id="${npc.id}">
      ${generateCardHeader(npc, {
        showAvatar: true,
        avatarSize: "sm",
        subtitle: `${npc.race || "Razza sconosciuta"}${
          npc.profession ? ` • ${npc.profession}` : ""
        }`,
        badges: [attitudeBadge],
      })}
      ${
        environment
          ? `<small class="card-meta text-secondary">${environment.name}</small>`
          : ""
      }
    </div>
  `;
}

/**
 * Generate NPC for environment view
 */
export function generateEnvironmentNPC(npc) {
  return `
    <div class="npc-item" data-npc-id="${npc.id}">
      ${generateAvatarDisplay(npc, {
        className: "npc-avatar-container",
        size: "sm",
      })}
      <div class="npc-info">
        <h4 class="npc-name">${npc.name}</h4>
        <p class="npc-details">
          ${npc.race ? `${npc.race} • ` : ""}${npc.attitude || "Neutrale"}
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
  return `
    <div class="selection-option" data-npc-id="${npc.id}">
      ${generateAvatarDisplay(npc, {
        className: "selection-avatar",
        size: "sm",
      })}
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
 * Helper function to get attitude badge type
 */
function getAttitudeBadgeType(attitude) {
  const friendlyAttitudes = [
    "Amichevole",
    "Protettivo",
    "Entusiasta",
    "Coraggioso",
  ];
  const neutralAttitudes = ["Neutrale", "Indifferente", "Curioso", "Cauto"];
  const hostileAttitudes = ["Ostile", "Diffidente", "Sospettoso", "Arrogante"];
  const timidAttitudes = ["Timido", "Pauroso", "Servile"];

  if (friendlyAttitudes.includes(attitude)) return "success";
  if (hostileAttitudes.includes(attitude)) return "danger";
  if (timidAttitudes.includes(attitude)) return "warning";
  return "default";
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
