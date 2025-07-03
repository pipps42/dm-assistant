/**
 * Formatters - Funzioni per formattare dati per visualizzazione
 */

/**
 * Format date/time
 */
export function formatDate(date, options = {}) {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const defaults = {
    locale: "it-IT",
    timeZone: "Europe/Rome",
  };

  const config = { ...defaults, ...options };

  return d.toLocaleDateString(config.locale, {
    timeZone: config.timeZone,
    ...options,
  });
}

export function formatDateTime(date, options = {}) {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const defaults = {
    locale: "it-IT",
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };

  const config = { ...defaults, ...options };

  return d.toLocaleDateString(config.locale, config);
}

export function formatTime(date, options = {}) {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const defaults = {
    locale: "it-IT",
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
  };

  const config = { ...defaults, ...options };

  return d.toLocaleTimeString(config.locale, config);
}

export function formatRelativeTime(date) {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const diff = now - d;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "Adesso";
  if (minutes < 60) return `${minutes} minuti fa`;
  if (hours < 24) return `${hours} ore fa`;
  if (days < 7) return `${days} giorni fa`;
  if (weeks < 4) return `${weeks} settimane fa`;
  if (months < 12) return `${months} mesi fa`;
  return `${years} anni fa`;
}

/**
 * Format numbers
 */
export function formatNumber(num, options = {}) {
  if (num === null || num === undefined || isNaN(num)) return "";

  const defaults = {
    locale: "it-IT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  };

  const config = { ...defaults, ...options };

  return new Intl.NumberFormat(config.locale, config).format(num);
}

export function formatCurrency(amount, currency = "EUR", options = {}) {
  if (amount === null || amount === undefined || isNaN(amount)) return "";

  const defaults = {
    locale: "it-IT",
    style: "currency",
    currency,
  };

  const config = { ...defaults, ...options };

  return new Intl.NumberFormat(config.locale, config).format(amount);
}

export function formatPercentage(value, options = {}) {
  if (value === null || value === undefined || isNaN(value)) return "";

  const defaults = {
    locale: "it-IT",
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  };

  const config = { ...defaults, ...options };

  return new Intl.NumberFormat(config.locale, config).format(value / 100);
}

export function formatOrdinal(num) {
  if (isNaN(num)) return "";

  const n = parseInt(num);
  if (n <= 0) return "";

  // Italian ordinal suffixes
  if (n === 1) return "1°";
  return `${n}°`;
}

/**
 * Format text
 */
export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function titleCase(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

export function camelCase(str) {
  if (!str) return "";
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}

export function kebabCase(str) {
  if (!str) return "";
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

export function truncate(str, length = 100, suffix = "...") {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
}

export function stripHtml(str) {
  if (!str) return "";
  return str.replace(/<[^>]*>/g, "");
}

export function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Format D&D specific data
 */
export function formatModifier(score) {
  if (isNaN(score)) return "+0";
  const modifier = Math.floor((score - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

export function formatChallengeRating(cr) {
  if (!cr) return "0";
  if (cr === "0") return "0";
  if (cr.includes("/")) return cr;
  return cr.toString();
}

export function formatExperience(cr) {
  const xpTable = {
    0: 10,
    "1/8": 25,
    "1/4": 50,
    "1/2": 100,
    1: 200,
    2: 450,
    3: 700,
    4: 1100,
    5: 1800,
    6: 2300,
    7: 2900,
    8: 3900,
    9: 5000,
    10: 5900,
    11: 7200,
    12: 8400,
    13: 10000,
    14: 11500,
    15: 13000,
    16: 15000,
    17: 18000,
    18: 20000,
    19: 22000,
    20: 25000,
    21: 33000,
    22: 41000,
    23: 50000,
    24: 62000,
    30: 155000,
  };

  const xp = xpTable[cr] || 0;
  return formatNumber(xp) + " PE";
}

export function formatHitDice(hitDice, conModifier = 0) {
  if (!hitDice) return "";

  const match = hitDice.match(/(\d+)d(\d+)/);
  if (!match) return hitDice;

  const [, numDice, dieSize] = match;
  const average = Math.floor((parseInt(numDice) * (1 + parseInt(dieSize))) / 2);
  const totalModifier = parseInt(numDice) * conModifier;
  const total = average + totalModifier;

  if (totalModifier !== 0) {
    const sign = totalModifier >= 0 ? "+" : "";
    return `${total} (${hitDice}${sign}${totalModifier})`;
  }

  return `${total} (${hitDice})`;
}

export function formatSpeed(speed) {
  if (!speed) return "";

  if (typeof speed === "number") {
    return `${speed} piedi`;
  }

  if (typeof speed === "object") {
    const speeds = [];
    if (speed.walk) speeds.push(`${speed.walk} piedi`);
    if (speed.fly) speeds.push(`volo ${speed.fly} piedi`);
    if (speed.swim) speeds.push(`nuoto ${speed.swim} piedi`);
    if (speed.climb) speeds.push(`scalare ${speed.climb} piedi`);
    if (speed.burrow) speeds.push(`scavare ${speed.burrow} piedi`);

    return speeds.join(", ");
  }

  return speed.toString();
}

export function formatSenses(senses) {
  if (!senses) return "";

  if (typeof senses === "string") return senses;

  if (typeof senses === "object") {
    const senseList = [];
    if (senses.darkvision)
      senseList.push(`scurovisione ${senses.darkvision} piedi`);
    if (senses.blindsight)
      senseList.push(`vista cieca ${senses.blindsight} piedi`);
    if (senses.tremorsense)
      senseList.push(`percezione vibrazioni ${senses.tremorsense} piedi`);
    if (senses.truesight)
      senseList.push(`vista pura ${senses.truesight} piedi`);
    if (senses.passivePerception)
      senseList.push(`Percezione Passiva ${senses.passivePerception}`);

    return senseList.join(", ");
  }

  return "";
}

/**
 * Format arrays and lists
 */
export function formatList(items, options = {}) {
  if (!Array.isArray(items) || items.length === 0) return "";

  const {
    separator = ", ",
    lastSeparator = " e ",
    transform = (item) => item,
  } = options;

  const transformedItems = items.map(transform);

  if (transformedItems.length === 1) {
    return transformedItems[0];
  }

  if (transformedItems.length === 2) {
    return transformedItems.join(lastSeparator);
  }

  const allButLast = transformedItems.slice(0, -1);
  const last = transformedItems[transformedItems.length - 1];

  return allButLast.join(separator) + lastSeparator + last;
}

export function formatTags(tags, options = {}) {
  if (!Array.isArray(tags) || tags.length === 0) return "";

  const { className = "tag", transform = (tag) => tag } = options;

  return tags
    .map(
      (tag) => `<span class="${className}">${escapeHtml(transform(tag))}</span>`
    )
    .join(" ");
}

/**
 * Format file sizes
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Byte";

  const k = 1024;
  const sizes = ["Byte", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Format validation and error messages
 */
export function formatValidationError(error, fieldName = "") {
  if (!error) return "";

  if (typeof error === "string") {
    return fieldName ? `${fieldName}: ${error}` : error;
  }

  if (error.message) {
    return fieldName ? `${fieldName}: ${error.message}` : error.message;
  }

  return "Errore di validazione";
}

export function formatErrorList(errors) {
  if (!Array.isArray(errors) || errors.length === 0) return "";

  return errors.map((error) => `• ${formatValidationError(error)}`).join("\n");
}

/**
 * Utility formatters
 */
export function formatBoolean(value, options = {}) {
  const { trueText = "Sì", falseText = "No" } = options;
  return value ? trueText : falseText;
}

export function formatDefault(value, defaultText = "Non specificato") {
  return value || defaultText;
}

export function formatConditional(condition, trueValue, falseValue = "") {
  return condition ? trueValue : falseValue;
}

// Main formatter object
export default {
  // Date/Time
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,

  // Numbers
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatOrdinal,

  // Text
  capitalize,
  titleCase,
  camelCase,
  kebabCase,
  truncate,
  stripHtml,
  escapeHtml,

  // D&D specific
  formatModifier,
  formatChallengeRating,
  formatExperience,
  formatHitDice,
  formatSpeed,
  formatSenses,

  // Lists and arrays
  formatList,
  formatTags,

  // File sizes
  formatFileSize,

  // Validation
  formatValidationError,
  formatErrorList,

  // Utilities
  formatBoolean,
  formatDefault,
  formatConditional,
};
