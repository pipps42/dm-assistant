/**
 * Shared Templates - Libreria di componenti template riutilizzabili
 * Elimina duplicazione tra character-templates.js, npc-templates.js, environment-templates.js
 */

/**
 * Genera display avatar uniforme (immagine o emoji)
 */
export function generateAvatarDisplay(entity, options = {}) {
  const {
    size = "default", // default, sm, lg
    showFallback = true,
    className = "",
    altText = entity.name || "Avatar",
  } = options;

  const hasImage = entity.avatar && entity.avatar.startsWith("data:image");
  const sizeClass = size !== "default" ? `avatar-${size}` : "";
  const containerClass = `avatar-container ${sizeClass} ${className}`.trim();

  if (hasImage) {
    return `
        <div class="${containerClass}">
          <img src="${entity.avatar}" alt="${altText}" class="avatar-image">
        </div>
      `;
  } else {
    const fallbackAvatar = entity.avatar || (showFallback ? "🧙" : "");
    return `
        <div class="${containerClass}">
          <div class="avatar-emoji">${fallbackAvatar}</div>
        </div>
      `;
  }
}

/**
 * Genera card header standardizzato
 */
export function generateCardHeader(entity, options = {}) {
  const {
    showAvatar = true,
    avatarSize = "default",
    subtitle = "",
    showMeta = false,
    metaText = "",
    badges = [],
  } = options;

  const avatarHtml = showAvatar
    ? generateAvatarDisplay(entity, {
        size: avatarSize,
        className: "card-avatar",
      })
    : "";

  const badgesHtml =
    badges.length > 0
      ? `<div class="card-badges">${badges
          .map((badge) => generateBadge(badge))
          .join("")}</div>`
      : "";

  return `
      <div class="card-header">
        ${avatarHtml}
        <div class="card-info">
          <h3 class="card-title">${entity.name}</h3>
          ${subtitle ? `<p class="card-subtitle">${subtitle}</p>` : ""}
          ${
            showMeta && metaText
              ? `<small class="card-meta">${metaText}</small>`
              : ""
          }
        </div>
        ${badgesHtml}
      </div>
    `;
}

/**
 * Genera badge uniformi
 */
export function generateBadge(badge) {
  const {
    text,
    type = "default",
    icon = "",
    title = "",
  } = typeof badge === "string" ? { text: badge } : badge;

  const iconHtml = icon ? `<span class="badge-icon">${icon}</span>` : "";
  const titleAttr = title ? `title="${title}"` : "";

  return `
      <span class="badge badge-${type}" ${titleAttr}>
        ${iconHtml}${text}
      </span>
    `;
}

/**
 * Genera griglia di dettagli standardizzata
 */
export function generateDetailGrid(items, options = {}) {
  const {
    className = "detail-grid",
    columns = 2,
    showEmpty = false,
    emptyText = "Non specificato",
  } = options;

  const gridClass = `${className} grid-cols-${columns}`;

  const itemsHtml = items
    .filter((item) => showEmpty || item.value)
    .map(
      (item) => `
        <div class="detail-item">
          <span class="detail-label">${item.label}:</span>
          <span class="detail-value">${item.value || emptyText}</span>
        </div>
      `
    )
    .join("");

  return `<div class="${gridClass}">${itemsHtml}</div>`;
}

/**
 * Genera griglia di statistiche
 */
export function generateStatsGrid(stats, options = {}) {
  const { className = "stats-grid", showIcons = true } = options;

  const statsHtml = stats
    .map((stat) => {
      const iconHtml =
        showIcons && stat.icon
          ? `<span class="stat-icon">${stat.icon}</span>`
          : "";

      return `
        <div class="stat-card">
          ${iconHtml}
          <span class="stat-number">${stat.value}</span>
          <span class="stat-label">${stat.label}</span>
        </div>
      `;
    })
    .join("");

  return `<div class="${className}">${statsHtml}</div>`;
}

/**
 * Genera lista di elementi con azioni
 */
export function generateActionList(items, options = {}) {
  const {
    className = "detail-list",
    showActions = true,
    removeAction = "remove-item",
    entityType = "",
    entityId = "",
  } = options;

  if (!items || items.length === 0) {
    return `
        <div class="detail-empty">
          <p>Nessun elemento presente.</p>
        </div>
      `;
  }

  const itemsHtml = items
    .map((item, index) => {
      const itemId = item.id || index;
      const description =
        typeof item === "string" ? item : item.description || item.text;
      const date =
        typeof item === "object" && item.date
          ? new Date(item.date).toLocaleDateString("it-IT")
          : "";
      const session =
        typeof item === "object" && item.session ? item.session : "";

      const metaHtml =
        date || session
          ? `
        <div class="detail-list-meta">
          ${date ? `<small class="date-meta">${date}</small>` : ""}
          ${
            session
              ? `<small class="session-meta">Sessione: ${session}</small>`
              : ""
          }
        </div>
      `
          : "";

      const actionButton = showActions
        ? `
        <button class="btn btn-danger btn-sm" 
                data-action="${removeAction}" 
                data-id="${entityId}"
                data-item-id="${itemId}"
                data-entity-type="${entityType}"
                title="Rimuovi">
          ×
        </button>
      `
        : "";

      return `
        <div class="detail-list-item">
          <div class="detail-list-content">
            <p class="detail-list-text">${description}</p>
            ${metaHtml}
          </div>
          ${actionButton}
        </div>
      `;
    })
    .join("");

  return `<div class="${className}">${itemsHtml}</div>`;
}

/**
 * Genera section header con azione
 */
export function generateSectionHeader(title, options = {}) {
  const {
    count = null,
    showAddButton = false,
    addButtonText = "Aggiungi",
    addAction = "add-item",
    entityType = "",
    entityId = "",
  } = options;

  const titleWithCount = count !== null ? `${title} (${count})` : title;

  const addButtonHtml = showAddButton
    ? `
      <button class="btn btn-secondary btn-sm" 
              data-action="${addAction}" 
              data-id="${entityId}"
              data-entity-type="${entityType}">
        + ${addButtonText}
      </button>
    `
    : "";

  return `
      <div class="detail-section-header">
        <h3 class="detail-section-title">${titleWithCount}</h3>
        ${addButtonHtml}
      </div>
    `;
}

/**
 * Genera footer modale standardizzato
 */
export function generateModalFooter(entity, options = {}) {
  const {
    entityType = "",
    showDelete = true,
    showEdit = true,
    showClose = true,
    deleteText = "Elimina",
    editText = "Modifica",
    closeText = "Chiudi",
    extraButtons = [],
  } = options;

  const deleteButton = showDelete
    ? `
      <button class="btn btn-danger" 
              data-action="delete" 
              data-id="${entity.id}"
              data-entity-type="${entityType}">
        ${deleteText}
      </button>
    `
    : "";

  const editButton = showEdit
    ? `
      <button class="btn btn-secondary" 
              data-action="edit" 
              data-id="${entity.id}"
              data-entity-type="${entityType}">
        ${editText}
      </button>
    `
    : "";

  const closeButton = showClose
    ? `
      <button class="btn btn-primary" data-action="close">
        ${closeText}
      </button>
    `
    : "";

  const extraButtonsHtml = extraButtons
    .map(
      (btn) => `
      <button class="btn btn-${btn.type || "secondary"} ${
        btn.size ? "btn-" + btn.size : ""
      }" 
              data-action="${btn.action}" 
              data-id="${entity.id}"
              data-entity-type="${entityType}"
              ${btn.title ? `title="${btn.title}"` : ""}>
        ${btn.text}
      </button>
    `
    )
    .join("");

  return `
      <div class="modal-footer">
        <div class="footer-actions-left">
          ${extraButtonsHtml}
        </div>
        <div class="footer-actions-center">
          ${deleteButton}
        </div>
        <div class="footer-actions-right">
          ${editButton}
          ${closeButton}
        </div>
      </div>
    `;
}

/**
 * Genera tags container
 */
export function generateTagsContainer(tags, options = {}) {
  const {
    className = "tags-container",
    tagType = "default", // default, danger, success, warning
    showEmpty = false,
    emptyText = "Nessun tag presente",
  } = options;

  if (!tags || tags.length === 0) {
    return showEmpty ? `<div class="${className}">${emptyText}</div>` : "";
  }

  const tagsHtml = tags
    .map(
      (tag) => `
      <span class="tag tag-${tagType}">${tag}</span>
    `
    )
    .join("");

  return `<div class="${className}">${tagsHtml}</div>`;
}

/**
 * Genera meta info standard (date create/update)
 */
export function generateMetaInfo(entity, options = {}) {
  const {
    showCreated = true,
    showUpdated = true,
    showId = false,
    className = "meta-info",
  } = options;

  const items = [];

  if (showId && entity.id) {
    items.push(`ID: ${entity.id}`);
  }

  if (showCreated && entity.createdAt) {
    const created = new Date(entity.createdAt).toLocaleDateString("it-IT");
    items.push(`Creato: ${created}`);
  }

  if (showUpdated && entity.updatedAt) {
    const updated = new Date(entity.updatedAt).toLocaleDateString("it-IT");
    items.push(`Aggiornato: ${updated}`);
  }

  if (items.length === 0) return "";

  return `<div class="${className}"><small>${items.join(" • ")}</small></div>`;
}

/**
 * Genera progress bar per livelli/avanzamento
 */
export function generateProgressBar(current, max, options = {}) {
  const {
    showNumbers = true,
    className = "progress-bar",
    label = "",
    color = "primary",
  } = options;

  const percentage = Math.min((current / max) * 100, 100);

  const numbersHtml = showNumbers
    ? `
      <div class="progress-numbers">
        <span>${current}</span>
        <span>/${max}</span>
      </div>
    `
    : "";

  const labelHtml = label ? `<div class="progress-label">${label}</div>` : "";

  return `
      <div class="progress-container">
        ${labelHtml}
        <div class="${className}">
          <div class="progress-fill progress-${color}" style="width: ${percentage}%"></div>
        </div>
        ${numbersHtml}
      </div>
    `;
}

/**
 * Genera empty state standardizzato
 */
export function generateEmptyState(options = {}) {
  const {
    title = "Nessun elemento presente",
    description = "",
    actionText = "",
    actionHandler = "",
    icon = "📭",
  } = options;

  const descriptionHtml = description
    ? `<p class="empty-description">${description}</p>`
    : "";
  const actionHtml =
    actionText && actionHandler
      ? `
      <button class="btn btn-primary" onclick="${actionHandler}">
        ${actionText}
      </button>
    `
      : "";

  return `
      <div class="empty-state">
        <div class="empty-icon">${icon}</div>
        <h3 class="empty-title">${title}</h3>
        ${descriptionHtml}
        ${actionHtml}
      </div>
    `;
}

export default {
  generateAvatarDisplay,
  generateCardHeader,
  generateBadge,
  generateDetailGrid,
  generateStatsGrid,
  generateActionList,
  generateSectionHeader,
  generateModalFooter,
  generateTagsContainer,
  generateMetaInfo,
  generateProgressBar,
  generateEmptyState,
};
