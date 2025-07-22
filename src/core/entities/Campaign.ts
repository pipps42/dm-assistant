export interface Campaign {
  id: string;
  name: string;
  description: string;
  setting: string;
  dmNotes: string;
  currentSession: number;
  isActive: boolean;
  info: CampaignInfo;
  status: CampaignStatus;
  playerCount: number;
  activeCharacters: number;
  averageLevel: number;
  createdAt: string;
  updatedAt: string;
  lastSessionDate?: string;
}

export interface CampaignInfo {
  totalSessions: number;
  totalCharacters: number;
  // activeCharacters: number;
  totalNpcs: number;
  totalLocations: number;
  totalQuests: number;
  completedQuests: number;
  totalEncounters: number;
  difficultyLevel: DifficultyLevel;
}

export type CampaignStatus =
  | "Planning"
  | "Active"
  | "OnHold"
  | "Completed"
  | "Archived";

export type DifficultyLevel = "Casual" | "Normal" | "Hard" | "Deadly";

export interface CampaignSummary {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  currentSession: number;
  activeCharacters: number;
  averageLevel: number;
  lastSessionDate?: string;
  createdAt: string;
  isActive: boolean;
}

export interface AppSettings {
  currentCampaignId?: string;
  recentCampaigns: string[];
  autoBackup: boolean;
  backupFrequencyHours: number;
  theme: string;
  createdAt: string;
  updatedAt: string;
}

// Request types for API calls
export interface CreateCampaignRequest {
  name: string;
  description: string;
  setting: string;
  dmNotes?: string;
  difficultyLevel: DifficultyLevel;
  playerCount?: number;
}

export interface UpdateCampaignRequest {
  name?: string;
  description?: string;
  setting?: string;
  dmNotes?: string;
  difficultyLevel?: DifficultyLevel;
  playerCount?: number;
  isActive?: boolean;
}

// Constants and utilities
export const CAMPAIGN_STATUSES: CampaignStatus[] = [
  "Planning",
  "Active",
  "OnHold",
  "Completed",
  "Archived",
];

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  "Casual",
  "Normal",
  "Hard",
  "Deadly",
];

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  Planning: "In Pianificazione",
  Active: "Attiva",
  OnHold: "In Pausa",
  Completed: "Completata",
  Archived: "Archiviata",
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  Casual: "Casual",
  Normal: "Normale",
  Hard: "Difficile",
  Deadly: "Letale",
};

export const COMMON_SETTINGS = [
  "Forgotten Realms",
  "Eberron",
  "Ravenloft",
  "Spelljammer",
  "Planescape",
  "Dark Sun",
  "Dragonlance",
  "Homebrew",
  "Critical Role",
  "Custom",
];

// Helper functions
export function getCampaignStatusLabel(status: CampaignStatus): string {
  return CAMPAIGN_STATUS_LABELS[status];
}

export function getDifficultyLabel(difficulty: DifficultyLevel): string {
  return DIFFICULTY_LABELS[difficulty];
}

export function formatCampaignSummary(campaign: Campaign): string {
  return `${campaign.name} - ${getCampaignStatusLabel(campaign.status)}`;
}

export function getSessionInfo(campaign: Campaign): string {
  return `Sessione ${campaign.currentSession} di ${campaign.info.totalSessions}`;
}

export function getCampaignProgress(campaign: Campaign): {
  questCompletion: number;
  sessionProgress: number;
  characterGrowth: number;
} {
  const questCompletion =
    campaign.info.totalQuests > 0
      ? (campaign.info.completedQuests / campaign.info.totalQuests) * 100
      : 0;

  const sessionProgress =
    campaign.info.totalSessions > 0
      ? (campaign.currentSession / campaign.info.totalSessions) * 100
      : 0;

  const characterGrowth =
    campaign.averageLevel > 1 ? ((campaign.averageLevel - 1) / 19) * 100 : 0;

  return {
    questCompletion: Math.round(questCompletion),
    sessionProgress: Math.round(sessionProgress),
    characterGrowth: Math.round(characterGrowth),
  };
}

export function isCampaignPlayable(campaign: Campaign): boolean {
  return (
    campaign.isActive &&
    (campaign.status === "Active" || campaign.status === "Planning")
  );
}

export function canModifyCampaign(campaign: Campaign): boolean {
  return campaign.status !== "Completed" && campaign.status !== "Archived";
}

export function getCampaignHealthStatus(campaign: Campaign): {
  status: "healthy" | "warning" | "attention";
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check for common issues
  if (campaign.activeCharacters === 0) {
    issues.push("Nessun personaggio attivo");
    suggestions.push("Aggiungi personaggi per iniziare la campagna");
  }

  if (campaign.info.totalQuests === 0) {
    issues.push("Nessuna quest definita");
    suggestions.push("Crea alcune quest per guidare la storia");
  }

  if (campaign.info.totalNpcs === 0) {
    issues.push("Nessun NPC creato");
    suggestions.push("Aggiungi NPCs per arricchire il mondo");
  }

  if (campaign.lastSessionDate) {
    const daysSinceLastSession = Math.floor(
      (Date.now() - new Date(campaign.lastSessionDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastSession > 30) {
      issues.push("Ultima sessione oltre 30 giorni fa");
      suggestions.push("Considera di programmare una nuova sessione");
    }
  }

  const status =
    issues.length === 0
      ? "healthy"
      : issues.length <= 2
      ? "warning"
      : "attention";

  return { status, issues, suggestions };
}

export function sortCampaignsByActivity(campaigns: Campaign[]): Campaign[] {
  return [...campaigns].sort((a, b) => {
    // Active campaigns first
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1;
    }

    // Then by last session date
    if (a.lastSessionDate && b.lastSessionDate) {
      return (
        new Date(b.lastSessionDate).getTime() -
        new Date(a.lastSessionDate).getTime()
      );
    }

    if (a.lastSessionDate && !b.lastSessionDate) return -1;
    if (!a.lastSessionDate && b.lastSessionDate) return 1;

    // Finally by creation date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function filterCampaignsByStatus(
  campaigns: Campaign[],
  status: CampaignStatus
): Campaign[] {
  return campaigns.filter((campaign) => campaign.status === status);
}

export function searchCampaigns(
  campaigns: Campaign[],
  query: string
): Campaign[] {
  const lowercaseQuery = query.toLowerCase().trim();

  if (!lowercaseQuery) return campaigns;

  return campaigns.filter(
    (campaign) =>
      campaign.name.toLowerCase().includes(lowercaseQuery) ||
      campaign.description.toLowerCase().includes(lowercaseQuery) ||
      campaign.setting.toLowerCase().includes(lowercaseQuery) ||
      campaign.dmNotes.toLowerCase().includes(lowercaseQuery)
  );
}

// Validation helpers
export function validateCampaignData(
  data: Partial<CreateCampaignRequest>
): string[] {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push("Il nome della campagna è obbligatorio");
  } else if (data.name.length > 100) {
    errors.push("Il nome della campagna non può superare 100 caratteri");
  }

  if (!data.description?.trim()) {
    errors.push("La descrizione è obbligatoria");
  } else if (data.description.length > 500) {
    errors.push("La descrizione non può superare 500 caratteri");
  }

  if (!data.setting?.trim()) {
    errors.push("L'ambientazione è obbligatoria");
  }

  if (data.playerCount && (data.playerCount < 1 || data.playerCount > 10)) {
    errors.push("Il numero di giocatori deve essere tra 1 e 10");
  }

  return errors;
}

export function validateUpdateData(
  data: Partial<UpdateCampaignRequest>
): string[] {
  const errors: string[] = [];

  if (data.name !== undefined) {
    if (!data.name.trim()) {
      errors.push("Il nome della campagna non può essere vuoto");
    } else if (data.name.length > 100) {
      errors.push("Il nome della campagna non può superare 100 caratteri");
    }
  }

  if (data.description !== undefined && data.description.length > 500) {
    errors.push("La descrizione non può superare 500 caratteri");
  }

  if (
    data.playerCount !== undefined &&
    (data.playerCount < 1 || data.playerCount > 10)
  ) {
    errors.push("Il numero di giocatori deve essere tra 1 e 10");
  }

  return errors;
}
