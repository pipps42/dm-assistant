import { invoke } from "@tauri-apps/api/core";
import {
  Campaign,
  CampaignSummary,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  AppSettings,
} from "@/core/entities/Campaign";

/**
 * Typed wrapper for Tauri campaign commands
 * Provides type safety and error handling for campaign operations
 */
export class CampaignApi {
  /**
   * Create a new campaign
   */
  static async create(request: CreateCampaignRequest): Promise<Campaign> {
    try {
      const result = await invoke<Campaign>("create_campaign", {
        req: request,
      });
      return result;
    } catch (error) {
      console.error("Failed to create campaign:", error);
      throw new Error(`Failed to create campaign: ${error}`);
    }
  }

  /**
   * Get campaign by ID
   */
  static async getById(campaignId: string): Promise<Campaign | null> {
    try {
      const result = await invoke<Campaign | null>("get_campaign", {
        campaignId,
      });
      return result;
    } catch (error) {
      console.error("Failed to get campaign:", error);
      throw new Error(`Failed to get campaign: ${error}`);
    }
  }

  /**
   * Get all campaigns
   */
  static async getAll(): Promise<Campaign[]> {
    try {
      const result = await invoke<Campaign[]>("get_all_campaigns");
      return result;
    } catch (error) {
      console.error("Failed to get all campaigns:", error);
      throw new Error(`Failed to get all campaigns: ${error}`);
    }
  }

  /**
   * Get only active campaigns
   */
  static async getActive(): Promise<Campaign[]> {
    try {
      const result = await invoke<Campaign[]>("get_active_campaigns");
      return result;
    } catch (error) {
      console.error("Failed to get active campaigns:", error);
      throw new Error(`Failed to get active campaigns: ${error}`);
    }
  }

  /**
   * Get campaign summaries for list views
   */
  static async getSummaries(): Promise<CampaignSummary[]> {
    try {
      const result = await invoke<CampaignSummary[]>("get_campaign_summaries");
      return result;
    } catch (error) {
      console.error("Failed to get campaign summaries:", error);
      throw new Error(`Failed to get campaign summaries: ${error}`);
    }
  }

  /**
   * Update campaign data
   */
  static async update(
    campaignId: string,
    request: UpdateCampaignRequest
  ): Promise<Campaign> {
    try {
      const result = await invoke<Campaign>("update_campaign", {
        campaignId,
        req: request,
      });
      return result;
    } catch (error) {
      console.error("Failed to update campaign:", error);
      throw new Error(`Failed to update campaign: ${error}`);
    }
  }

  /**
   * Delete campaign
   */
  static async delete(campaignId: string): Promise<boolean> {
    try {
      const result = await invoke<boolean>("delete_campaign", {
        campaignId,
      });
      return result;
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      throw new Error(`Failed to delete campaign: ${error}`);
    }
  }

  /**
   * Archive campaign (safer than delete)
   */
  static async archive(campaignId: string): Promise<Campaign> {
    try {
      const result = await invoke<Campaign>("archive_campaign", {
        campaignId,
      });
      return result;
    } catch (error) {
      console.error("Failed to archive campaign:", error);
      throw new Error(`Failed to archive campaign: ${error}`);
    }
  }

  /**
   * Set current active campaign
   */
  static async setCurrent(campaignId: string): Promise<Campaign> {
    try {
      const result = await invoke<Campaign>("set_current_campaign", {
        campaignId,
      });
      return result;
    } catch (error) {
      console.error("Failed to set current campaign:", error);
      throw new Error(`Failed to set current campaign: ${error}`);
    }
  }

  /**
   * Get current active campaign
   */
  static async getCurrent(): Promise<Campaign | null> {
    try {
      const result = await invoke<Campaign | null>("get_current_campaign");
      return result;
    } catch (error) {
      console.error("Failed to get current campaign:", error);
      throw new Error(`Failed to get current campaign: ${error}`);
    }
  }

  /**
   * Clear current campaign
   */
  static async clearCurrent(): Promise<void> {
    try {
      await invoke<void>("clear_current_campaign");
    } catch (error) {
      console.error("Failed to clear current campaign:", error);
      throw new Error(`Failed to clear current campaign: ${error}`);
    }
  }

  /**
   * Get recently accessed campaigns
   */
  static async getRecent(): Promise<Campaign[]> {
    try {
      const result = await invoke<Campaign[]>("get_recent_campaigns");
      return result;
    } catch (error) {
      console.error("Failed to get recent campaigns:", error);
      throw new Error(`Failed to get recent campaigns: ${error}`);
    }
  }

  /**
   * Start a new session in campaign
   */
  static async startSession(campaignId: string): Promise<Campaign> {
    try {
      const result = await invoke<Campaign>("start_campaign_session", {
        campaignId,
      });
      return result;
    } catch (error) {
      console.error("Failed to start campaign session:", error);
      throw new Error(`Failed to start campaign session: ${error}`);
    }
  }

  /**
   * Update campaign statistics
   */
  static async updateStats(
    campaignId: string,
    activeCharacters: number,
    totalCharacters: number,
    averageLevel: number
  ): Promise<Campaign> {
    try {
      const result = await invoke<Campaign>("update_campaign_stats", {
        campaignId,
        activeCharacters,
        totalCharacters,
        averageLevel,
      });
      return result;
    } catch (error) {
      console.error("Failed to update campaign stats:", error);
      throw new Error(`Failed to update campaign stats: ${error}`);
    }
  }

  /**
   * Complete campaign
   */
  static async complete(campaignId: string): Promise<Campaign> {
    try {
      const result = await invoke<Campaign>("complete_campaign", {
        campaignId,
      });
      return result;
    } catch (error) {
      console.error("Failed to complete campaign:", error);
      throw new Error(`Failed to complete campaign: ${error}`);
    }
  }

  /**
   * Pause campaign
   */
  static async pause(campaignId: string): Promise<Campaign> {
    try {
      const result = await invoke<Campaign>("pause_campaign", {
        campaignId,
      });
      return result;
    } catch (error) {
      console.error("Failed to pause campaign:", error);
      throw new Error(`Failed to pause campaign: ${error}`);
    }
  }

  /**
   * Resume campaign
   */
  static async resume(campaignId: string): Promise<Campaign> {
    try {
      const result = await invoke<Campaign>("resume_campaign", {
        campaignId,
      });
      return result;
    } catch (error) {
      console.error("Failed to resume campaign:", error);
      throw new Error(`Failed to resume campaign: ${error}`);
    }
  }

  /**
   * Duplicate campaign with new name
   */
  static async duplicate(
    campaignId: string,
    newName: string
  ): Promise<Campaign> {
    try {
      const result = await invoke<Campaign>("duplicate_campaign", {
        campaignId,
        newName,
      });
      return result;
    } catch (error) {
      console.error("Failed to duplicate campaign:", error);
      throw new Error(`Failed to duplicate campaign: ${error}`);
    }
  }

  /**
   * Export campaign to JSON
   */
  static async export(campaignId: string): Promise<string> {
    try {
      const result = await invoke<string>("export_campaign", {
        campaignId,
      });
      return result;
    } catch (error) {
      console.error("Failed to export campaign:", error);
      throw new Error(`Failed to export campaign: ${error}`);
    }
  }

  /**
   * Import campaign from JSON
   */
  static async import(jsonData: string): Promise<Campaign> {
    try {
      const result = await invoke<Campaign>("import_campaign", {
        jsonData,
      });
      return result;
    } catch (error) {
      console.error("Failed to import campaign:", error);
      throw new Error(`Failed to import campaign: ${error}`);
    }
  }

  /**
   * Backup all campaigns
   */
  static async backup(): Promise<string> {
    try {
      const result = await invoke<string>("backup_campaigns");
      return result;
    } catch (error) {
      console.error("Failed to backup campaigns:", error);
      throw new Error(`Failed to backup campaigns: ${error}`);
    }
  }

  /**
   * Get app settings
   */
  static async getSettings(): Promise<AppSettings> {
    try {
      const result = await invoke<AppSettings>("get_app_settings");
      return result;
    } catch (error) {
      console.error("Failed to get app settings:", error);
      throw new Error(`Failed to get app settings: ${error}`);
    }
  }

  /**
   * Update app theme
   */
  static async updateTheme(theme: string): Promise<AppSettings> {
    try {
      const result = await invoke<AppSettings>("update_app_theme", {
        theme,
      });
      return result;
    } catch (error) {
      console.error("Failed to update theme:", error);
      throw new Error(`Failed to update theme: ${error}`);
    }
  }

  /**
   * Update backup settings
   */
  static async updateBackupSettings(
    autoBackup: boolean,
    backupFrequencyHours: number
  ): Promise<AppSettings> {
    try {
      const result = await invoke<AppSettings>("update_backup_settings", {
        autoBackup,
        backupFrequencyHours,
      });
      return result;
    } catch (error) {
      console.error("Failed to update backup settings:", error);
      throw new Error(`Failed to update backup settings: ${error}`);
    }
  }

  /**
   * Validate campaign name for uniqueness
   */
  static async validateName(name: string): Promise<boolean> {
    try {
      const result = await invoke<boolean>("validate_campaign_name", {
        name,
      });
      return result;
    } catch (error) {
      console.error("Failed to validate campaign name:", error);
      throw new Error(`Failed to validate campaign name: ${error}`);
    }
  }

  /**
   * Get campaign count
   */
  static async getCount(): Promise<number> {
    try {
      const result = await invoke<number>("get_campaign_count");
      return result;
    } catch (error) {
      console.error("Failed to get campaign count:", error);
      throw new Error(`Failed to get campaign count: ${error}`);
    }
  }

  /**
   * Get active campaign count
   */
  static async getActiveCount(): Promise<number> {
    try {
      const result = await invoke<number>("get_active_campaign_count");
      return result;
    } catch (error) {
      console.error("Failed to get active campaign count:", error);
      throw new Error(`Failed to get active campaign count: ${error}`);
    }
  }

  /**
   * Check if campaigns file exists
   */
  static async fileExists(): Promise<boolean> {
    try {
      const result = await invoke<boolean>("campaigns_file_exists");
      return result;
    } catch (error) {
      console.error("Failed to check if campaigns file exists:", error);
      throw new Error(`Failed to check if campaigns file exists: ${error}`);
    }
  }

  /**
   * Initialize app (create default files if needed)
   */
  static async initializeApp(): Promise<string> {
    try {
      const result = await invoke<string>("initialize_app");
      return result;
    } catch (error) {
      console.error("Failed to initialize app:", error);
      throw new Error(`Failed to initialize app: ${error}`);
    }
  }
}

// Convenience functions for common operations
export const campaignsApi = {
  // CRUD operations
  create: CampaignApi.create,
  getById: CampaignApi.getById,
  getAll: CampaignApi.getAll,
  getActive: CampaignApi.getActive,
  getSummaries: CampaignApi.getSummaries,
  update: CampaignApi.update,
  delete: CampaignApi.delete,
  archive: CampaignApi.archive,

  // Current campaign management
  setCurrent: CampaignApi.setCurrent,
  getCurrent: CampaignApi.getCurrent,
  clearCurrent: CampaignApi.clearCurrent,
  getRecent: CampaignApi.getRecent,

  // Session management
  startSession: CampaignApi.startSession,
  updateStats: CampaignApi.updateStats,

  // Campaign lifecycle
  complete: CampaignApi.complete,
  pause: CampaignApi.pause,
  resume: CampaignApi.resume,
  duplicate: CampaignApi.duplicate,

  // Import/Export
  export: CampaignApi.export,
  import: CampaignApi.import,
  backup: CampaignApi.backup,

  // Settings
  getSettings: CampaignApi.getSettings,
  updateTheme: CampaignApi.updateTheme,
  updateBackupSettings: CampaignApi.updateBackupSettings,

  // Utilities
  validateName: CampaignApi.validateName,
  getCount: CampaignApi.getCount,
  getActiveCount: CampaignApi.getActiveCount,
  fileExists: CampaignApi.fileExists,
  initializeApp: CampaignApi.initializeApp,
};

export default campaignsApi;
