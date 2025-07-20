import {
  Campaign,
  CampaignSummary,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  CampaignStatus,
  DifficultyLevel,
  validateCampaignData,
  validateUpdateData,
  formatCampaignSummary,
  getSessionInfo,
  getCampaignProgress,
  isCampaignPlayable,
  canModifyCampaign,
  getCampaignHealthStatus,
  sortCampaignsByActivity,
  filterCampaignsByStatus,
  searchCampaigns,
  getCampaignStatusLabel,
  getDifficultyLabel,
} from "@/core/entities/Campaign";

/**
 * Business logic service for Campaign management
 * Handles validation, formatting, and complex operations
 */
export class CampaignService {
  /**
   * Validate campaign creation data
   */
  static validateCreateData(data: Partial<CreateCampaignRequest>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors = validateCampaignData(data);
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate campaign update data
   */
  static validateUpdateData(data: Partial<UpdateCampaignRequest>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors = validateUpdateData(data);
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format campaign display name with status
   */
  static getDisplayName(campaign: Campaign): string {
    return formatCampaignSummary(campaign);
  }

  /**
   * Get campaign session information
   */
  static getSessionInfo(campaign: Campaign): string {
    return getSessionInfo(campaign);
  }

  /**
   * Get campaign progress metrics
   */
  static getProgress(campaign: Campaign) {
    return getCampaignProgress(campaign);
  }

  /**
   * Check if campaign is playable
   */
  static isPlayable(campaign: Campaign): boolean {
    return isCampaignPlayable(campaign);
  }

  /**
   * Check if campaign can be modified
   */
  static canModify(campaign: Campaign): boolean {
    return canModifyCampaign(campaign);
  }

  /**
   * Get campaign health status and recommendations
   */
  static getHealthStatus(campaign: Campaign) {
    return getCampaignHealthStatus(campaign);
  }

  /**
   * Sort campaigns by activity and recency
   */
  static sortByActivity(campaigns: Campaign[]): Campaign[] {
    return sortCampaignsByActivity(campaigns);
  }

  /**
   * Filter campaigns by status
   */
  static filterByStatus(
    campaigns: Campaign[],
    status: CampaignStatus
  ): Campaign[] {
    return filterCampaignsByStatus(campaigns, status);
  }

  /**
   * Search campaigns by query
   */
  static search(campaigns: Campaign[], query: string): Campaign[] {
    return searchCampaigns(campaigns, query);
  }

  /**
   * Get active campaigns only
   */
  static getActiveCampaigns(campaigns: Campaign[]): Campaign[] {
    return campaigns.filter((campaign) => campaign.isActive);
  }

  /**
   * Get campaigns by difficulty level
   */
  static getByDifficulty(
    campaigns: Campaign[],
    difficulty: DifficultyLevel
  ): Campaign[] {
    return campaigns.filter(
      (campaign) => campaign.info.difficultyLevel === difficulty
    );
  }

  /**
   * Get recently updated campaigns (last 7 days)
   */
  static getRecentlyUpdated(campaigns: Campaign[]): Campaign[] {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return campaigns
      .filter((campaign) => new Date(campaign.updatedAt) > sevenDaysAgo)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }

  /**
   * Get campaigns that need attention
   */
  static getCampaignsNeedingAttention(campaigns: Campaign[]): Campaign[] {
    return campaigns.filter((campaign) => {
      const health = getCampaignHealthStatus(campaign);
      return health.status === "attention" || health.issues.length > 0;
    });
  }

  /**
   * Calculate overall statistics for multiple campaigns
   */
  static calculateOverallStats(campaigns: Campaign[]): {
    totalCampaigns: number;
    activeCampaigns: number;
    completedCampaigns: number;
    totalCharacters: number;
    totalSessions: number;
    averageSessionsPerCampaign: number;
    mostPopularSetting: string;
    averageCampaignLevel: number;
  } {
    const activeCampaigns = campaigns.filter((c) => c.isActive).length;
    const completedCampaigns = campaigns.filter(
      (c) => c.info.status === "Completed"
    ).length;

    const totalCharacters = campaigns.reduce(
      (sum, c) => sum + c.info.totalCharacters,
      0
    );

    const totalSessions = campaigns.reduce(
      (sum, c) => sum + c.info.totalSessions,
      0
    );

    const averageSessionsPerCampaign =
      campaigns.length > 0 ? Math.round(totalSessions / campaigns.length) : 0;

    // Find most popular setting
    const settingCounts = campaigns.reduce((acc, campaign) => {
      acc[campaign.setting] = (acc[campaign.setting] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostPopularSetting =
      Object.entries(settingCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "N/A";

    const averageLevels = campaigns
      .filter((c) => c.averageLevel > 0)
      .map((c) => c.averageLevel);

    const averageCampaignLevel =
      averageLevels.length > 0
        ? Math.round(
            averageLevels.reduce((a, b) => a + b, 0) / averageLevels.length
          )
        : 0;

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns,
      completedCampaigns,
      totalCharacters,
      totalSessions,
      averageSessionsPerCampaign,
      mostPopularSetting,
      averageCampaignLevel,
    };
  }

  /**
   * Generate campaign suggestions based on current campaigns
   */
  static generateCampaignSuggestions(campaigns: Campaign[]): Array<{
    type: "create" | "continue" | "archive" | "complete";
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }> {
    const suggestions = [];

    // No campaigns exist
    if (campaigns.length === 0) {
      suggestions.push({
        type: "create" as const,
        title: "Crea la tua prima campagna",
        description:
          "Inizia creando una nuova campagna per organizzare le tue sessioni D&D",
        priority: "high" as const,
      });
      return suggestions;
    }

    const activeCampaigns = campaigns.filter((c) => c.isActive);
    const onHoldCampaigns = filterCampaignsByStatus(campaigns, "OnHold");
    const planningCampaigns = filterCampaignsByStatus(campaigns, "Planning");

    // Too many active campaigns
    if (activeCampaigns.length > 3) {
      suggestions.push({
        type: "archive" as const,
        title: "Troppe campagne attive",
        description:
          "Considera di archiviare alcune campagne per migliorare l'organizzazione",
        priority: "medium" as const,
      });
    }

    // Campaigns on hold
    if (onHoldCampaigns.length > 0) {
      suggestions.push({
        type: "continue" as const,
        title: "Campagne in pausa da riprendere",
        description: `Hai ${onHoldCampaigns.length} campagne in pausa che potresti riprendere`,
        priority: "medium" as const,
      });
    }

    // Planning campaigns not started
    if (planningCampaigns.length > 0) {
      suggestions.push({
        type: "continue" as const,
        title: "Campagne da avviare",
        description: `Hai ${planningCampaigns.length} campagne in pianificazione pronte per iniziare`,
        priority: "high" as const,
      });
    }

    // No active campaigns
    if (activeCampaigns.length === 0 && campaigns.length > 0) {
      suggestions.push({
        type: "create" as const,
        title: "Nessuna campagna attiva",
        description: "Crea una nuova campagna o riattiva una esistente",
        priority: "high" as const,
      });
    }

    return suggestions;
  }

  /**
   * Format campaign for display lists
   */
  static formatForList(campaign: Campaign): {
    primary: string;
    secondary: string;
    status: string;
    badge: string;
    lastActivity: string;
  } {
    const lastActivity = campaign.lastSessionDate
      ? `Ultima sessione: ${new Date(
          campaign.lastSessionDate
        ).toLocaleDateString()}`
      : "Nessuna sessione";

    return {
      primary: campaign.name,
      secondary: campaign.description,
      status: getCampaignStatusLabel(campaign.info.status),
      badge: `${campaign.info.activeCharacters} PG attivi`,
      lastActivity,
    };
  }

  /**
   * Generate campaign creation suggestions
   */
  static getCreationSuggestions(): Array<{
    name: string;
    description: string;
    setting: string;
    difficulty: DifficultyLevel;
  }> {
    return [
      {
        name: "La Maledizione di Strahd",
        description: "Una campagna gotica di orrore ambientata a Barovia",
        setting: "Ravenloft",
        difficulty: "Hard",
      },
      {
        name: "Campagna Homebrew",
        description: "Una campagna personalizzata nel tuo mondo fantasy",
        setting: "Homebrew",
        difficulty: "Normal",
      },
      {
        name: "Gli Eroi di Waterdeep",
        description: "Avventure nella città più famosa dei Forgotten Realms",
        setting: "Forgotten Realms",
        difficulty: "Normal",
      },
      {
        name: "Esplorazione di Eberron",
        description: "Magia industriale e intrigue in un mondo di guerre",
        setting: "Eberron",
        difficulty: "Hard",
      },
      {
        name: "Campagna per Principianti",
        description: "Una campagna semplice per introdurre nuovi giocatori",
        setting: "Forgotten Realms",
        difficulty: "Casual",
      },
    ];
  }

  /**
   * Validate campaign name uniqueness
   */
  static isNameUnique(
    campaigns: Campaign[],
    name: string,
    excludeId?: string
  ): boolean {
    return !campaigns.some(
      (campaign) =>
        campaign.name.toLowerCase().trim() === name.toLowerCase().trim() &&
        campaign.id !== excludeId
    );
  }

  /**
   * Get next suggested session number
   */
  static getNextSessionNumber(campaign: Campaign): number {
    return campaign.currentSession + 1;
  }

  /**
   * Calculate estimated campaign duration
   */
  static estimateDuration(campaign: Campaign): {
    weeksActive: number;
    sessionsPerWeek: number;
    projectedEndDate?: Date;
  } {
    const createdDate = new Date(campaign.createdAt);
    const now = new Date();
    const weeksActive = Math.max(
      1,
      Math.ceil(
        (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
      )
    );

    const sessionsPerWeek =
      campaign.info.totalSessions > 0
        ? campaign.info.totalSessions / weeksActive
        : 0;

    // Estimate end date based on typical campaign length (20-30 sessions)
    let projectedEndDate: Date | undefined;
    if (sessionsPerWeek > 0) {
      const estimatedTotalSessions = 25; // Average campaign length
      const remainingSessions = Math.max(
        0,
        estimatedTotalSessions - campaign.info.totalSessions
      );
      const weeksRemaining = remainingSessions / sessionsPerWeek;

      projectedEndDate = new Date();
      projectedEndDate.setDate(projectedEndDate.getDate() + weeksRemaining * 7);
    }

    return {
      weeksActive,
      sessionsPerWeek: Math.round(sessionsPerWeek * 100) / 100,
      projectedEndDate,
    };
  }
}
