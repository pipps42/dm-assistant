/**
 * Application Configuration - Configurazioni centrali dell'app
 */

export const APP_CONFIG = {
  name: "D&D Dungeon Master Assistant",
  version: "1.0.0",
  author: "DM Assistant Team",

  // Development settings
  isDevelopment: process.env.NODE_ENV === "development",
  debugMode: false,

  // Data settings
  maxBackups: 10,
  autoSaveInterval: 30000, // 30 seconds

  // UI settings
  defaultTheme: "dark",
  animationDuration: 300,
  notificationDuration: 4000,

  // File upload settings
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],

  // Form validation settings
  minNameLength: 2,
  maxNameLength: 100,
  maxDescriptionLength: 2000,
};

export const DND_CONFIG = {
  // D&D 5e specific settings
  maxLevel: 20,
  maxHitPoints: 999,
  maxArmorClass: 30,

  // Challenge ratings
  challengeRatings: [
    "0",
    "1/8",
    "1/4",
    "1/2",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "30",
  ],

  // Ability scores
  minAbilityScore: 1,
  maxAbilityScore: 30,
  averageAbilityScore: 10,

  // Experience thresholds by level
  experienceThresholds: {
    easy: [
      25, 50, 75, 125, 250, 300, 350, 450, 550, 600, 800, 1000, 1100, 1250,
      1400, 1600, 2000, 2100, 2400, 2800,
    ],
    medium: [
      50, 100, 150, 250, 500, 600, 750, 900, 1100, 1200, 1600, 2000, 2200, 2500,
      2800, 3200, 3900, 4200, 4900, 5700,
    ],
    hard: [
      75, 150, 225, 375, 750, 900, 1100, 1400, 1600, 1900, 2400, 3000, 3400,
      3800, 4300, 4800, 5900, 6300, 7300, 8500,
    ],
    deadly: [
      100, 200, 400, 500, 1100, 1400, 1700, 2100, 2400, 2800, 3600, 4500, 5100,
      5700, 6400, 7200, 8800, 9500, 10900, 12700,
    ],
  },
};

export const UI_CONFIG = {
  // Layout settings
  sidebarWidth: 250,
  sidebarCollapsedWidth: 70,
  headerHeight: 80,

  // Grid settings
  cardsPerRow: 3,
  cardMinWidth: 300,
  gridGap: 20,

  // Modal settings
  modalSizes: {
    small: 400,
    medium: 600,
    large: 800,
    xl: 1000,
  },

  // Animation settings
  transitions: {
    fast: 150,
    normal: 300,
    slow: 500,
  },

  // Responsive breakpoints
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    wide: 1280,
  },
};

export const STORAGE_CONFIG = {
  // Data file names
  collections: {
    characters: "characters.json",
    npcs: "npcs.json",
    environments: "environments.json",
    monsters: "monsters.json",
    encounters: "encounters.json",
    settings: "settings.json",
  },

  // Backup settings
  backupInterval: 24 * 60 * 60 * 1000, // 24 hours
  maxBackupFiles: 10,

  // Cache settings
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  maxCacheSize: 100,
};

export const VALIDATION_CONFIG = {
  // Field validation rules
  rules: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
    },
    description: {
      maxLength: 2000,
    },
    level: {
      min: 1,
      max: 20,
    },
    hitPoints: {
      min: 1,
      max: 999,
    },
    armorClass: {
      min: 1,
      max: 30,
    },
    abilityScore: {
      min: 1,
      max: 30,
    },
  },

  // Error messages
  messages: {
    required: "Questo campo è richiesto",
    minLength: "Deve essere almeno {min} caratteri",
    maxLength: "Non può superare {max} caratteri",
    min: "Deve essere almeno {min}",
    max: "Non può superare {max}",
    integer: "Deve essere un numero intero",
    email: "Deve essere un email valido",
  },
};

export const ERROR_CONFIG = {
  // Error handling settings
  showStackTrace: process.env.NODE_ENV === "development",
  logErrors: true,

  // Error types
  types: {
    VALIDATION: "validation",
    STORAGE: "storage",
    NETWORK: "network",
    PERMISSION: "permission",
    UNKNOWN: "unknown",
  },

  // Retry settings
  maxRetries: 3,
  retryDelay: 1000,
};

// Environment-specific overrides
if (typeof window !== "undefined" && window.electronAPI) {
  // We're in the Electron renderer process
  APP_CONFIG.debugMode = window.location.hostname === "localhost";
}

// Default configuration object
export default {
  APP_CONFIG,
  DND_CONFIG,
  UI_CONFIG,
  STORAGE_CONFIG,
  VALIDATION_CONFIG,
  ERROR_CONFIG,
};
