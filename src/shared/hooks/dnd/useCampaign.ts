// src/shared/hooks/dnd/useCampaign.ts

import { useState, useEffect, useCallback } from "react";
import {
  Campaign,
  CampaignSummary,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  AppSettings,
  CampaignStatus,
  DifficultyLevel,
} from "@/core/entities/Campaign";
import { CampaignService } from "@/core/services/CampaignService";
import { campaignsApi } from "@/tauri/commands/campaigns";

interface UseCampaignState {
  campaigns: Campaign[];
  currentCampaign: Campaign | null;
  campaignSummaries: CampaignSummary[];
  recentCampaigns: Campaign[];
  appSettings: AppSettings | null;
  loading: boolean;
  error: string | null;
}

interface UseCampaignActions {
  // CRUD operations
  createCampaign: (request: CreateCampaignRequest) => Promise<Campaign>;
  getCampaign: (campaignId: string) => Promise<Campaign | null>;
  updateCampaign: (
    campaignId: string,
    request: UpdateCampaignRequest
  ) => Promise<Campaign>;
  deleteCampaign: (campaignId: string) => Promise<boolean>;
  archiveCampaign: (campaignId: string) => Promise<Campaign>;

  // Campaign management
  loadAllCampaigns: () => Promise<void>;
  loadActiveCampaigns: () => Promise<void>;
  loadCampaignSummaries: () => Promise<void>;
  refreshCampaigns: () => Promise<void>;

  // Current campaign management
  setCurrentCampaign: (campaignId: string) => Promise<Campaign>;
  clearCurrentCampaign: () => Promise<void>;
  loadCurrentCampaign: () => Promise<void>;
  loadRecentCampaigns: () => Promise<void>;

  // Session management
  startSession: (campaignId: string) => Promise<Campaign>;
  updateCampaignStats: (
    campaignId: string,
    activeChars: number,
    totalChars: number,
    avgLevel: number
  ) => Promise<Campaign>;

  // Campaign lifecycle
  completeCampaign: (campaignId: string) => Promise<Campaign>;
  pauseCampaign: (campaignId: string) => Promise<Campaign>;
  resumeCampaign: (campaignId: string) => Promise<Campaign>;
  duplicateCampaign: (campaignId: string, newName: string) => Promise<Campaign>;

  // Import/Export
  exportCampaign: (campaignId: string) => Promise<string>;
  importCampaign: (jsonData: string) => Promise<Campaign>;
  backupCampaigns: () => Promise<string>;

  // Settings management
  loadAppSettings: () => Promise<void>;
  updateTheme: (theme: string) => Promise<AppSettings>;
  updateBackupSettings: (
    autoBackup: boolean,
    frequencyHours: number
  ) => Promise<AppSettings>;

  // Utility functions
  validateCampaignName: (name: string) => Promise<boolean>;
  clearError: () => void;
}

interface UseCampaignReturn extends UseCampaignState, UseCampaignActions {
  // Computed values
  activeCampaigns: Campaign[];
  completedCampaigns: Campaign[];
  archivedCampaigns: Campaign[];
  campaignsNeedingAttention: Campaign[];
  overallStats: ReturnType<typeof CampaignService.calculateOverallStats>;
  campaignSuggestions: ReturnType<
    typeof CampaignService.generateCampaignSuggestions
  >;
  recentlyUpdated: Campaign[];
}

/**
 * Custom hook for managing campaigns
 * Provides complete campaign management functionality with state management
 */
export function useCampaign(): UseCampaignReturn {
  const [state, setState] = useState<UseCampaignState>({
    campaigns: [],
    currentCampaign: null,
    campaignSummaries: [],
    recentCampaigns: [],
    appSettings: null,
    loading: false,
    error: null,
  });

  // Helper function to update state
  const updateState = useCallback((updates: Partial<UseCampaignState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Helper function to handle errors
  const handleError = useCallback(
    (error: unknown, context: string) => {
      const errorMessage =
        error instanceof Error ? error.message : `Unknown error in ${context}`;
      console.error(`Campaign operation failed - ${context}:`, error);
      updateState({ error: errorMessage, loading: false });
    },
    [updateState]
  );

  // CRUD Operations
  const createCampaign = useCallback(
    async (request: CreateCampaignRequest): Promise<Campaign> => {
      updateState({ loading: true, error: null });
      try {
        const newCampaign = await campaignsApi.create(request);
        setState((prev) => ({
          ...prev,
          campaigns: [...prev.campaigns, newCampaign],
          loading: false,
        }));
        return newCampaign;
      } catch (error) {
        handleError(error, "create campaign");
        throw error;
      }
    },
    [updateState, handleError]
  );

  const getCampaign = useCallback(
    async (campaignId: string): Promise<Campaign | null> => {
      updateState({ loading: true, error: null });
      try {
        const campaign = await campaignsApi.getById(campaignId);
        updateState({ loading: false });
        return campaign;
      } catch (error) {
        handleError(error, "get campaign");
        return null;
      }
    },
    [updateState, handleError]
  );

  const updateCampaign = useCallback(
    async (
      campaignId: string,
      request: UpdateCampaignRequest
    ): Promise<Campaign> => {
      updateState({ loading: true, error: null });
      try {
        const updatedCampaign = await campaignsApi.update(campaignId, request);
        setState((prev) => ({
          ...prev,
          campaigns: prev.campaigns.map((c) =>
            c.id === campaignId ? updatedCampaign : c
          ),
          currentCampaign:
            prev.currentCampaign?.id === campaignId
              ? updatedCampaign
              : prev.currentCampaign,
          loading: false,
        }));
        return updatedCampaign;
      } catch (error) {
        handleError(error, "update campaign");
        throw error;
      }
    },
    [updateState, handleError]
  );

  const deleteCampaign = useCallback(
    async (campaignId: string): Promise<boolean> => {
      updateState({ loading: true, error: null });
      try {
        const success = await campaignsApi.delete(campaignId);
        if (success) {
          setState((prev) => ({
            ...prev,
            campaigns: prev.campaigns.filter((c) => c.id !== campaignId),
            currentCampaign:
              prev.currentCampaign?.id === campaignId
                ? null
                : prev.currentCampaign,
            loading: false,
          }));
        } else {
          updateState({ loading: false });
        }
        return success;
      } catch (error) {
        handleError(error, "delete campaign");
        return false;
      }
    },
    [updateState, handleError]
  );

  const archiveCampaign = useCallback(
    async (campaignId: string): Promise<Campaign> => {
      updateState({ loading: true, error: null });
      try {
        const archivedCampaign = await campaignsApi.archive(campaignId);
        setState((prev) => ({
          ...prev,
          campaigns: prev.campaigns.map((c) =>
            c.id === campaignId ? archivedCampaign : c
          ),
          currentCampaign:
            prev.currentCampaign?.id === campaignId
              ? null
              : prev.currentCampaign,
          loading: false,
        }));
        return archivedCampaign;
      } catch (error) {
        handleError(error, "archive campaign");
        throw error;
      }
    },
    [updateState, handleError]
  );

  // Campaign management
  const loadAllCampaigns = useCallback(async (): Promise<void> => {
    updateState({ loading: true, error: null });
    try {
      const campaigns = await campaignsApi.getAll();
      updateState({ campaigns, loading: false });
    } catch (error) {
      handleError(error, "load all campaigns");
    }
  }, [updateState, handleError]);

  const loadActiveCampaigns = useCallback(async (): Promise<void> => {
    updateState({ loading: true, error: null });
    try {
      const campaigns = await campaignsApi.getActive();
      updateState({ campaigns, loading: false });
    } catch (error) {
      handleError(error, "load active campaigns");
    }
  }, [updateState, handleError]);

  const loadCampaignSummaries = useCallback(async (): Promise<void> => {
    updateState({ loading: true, error: null });
    try {
      const summaries = await campaignsApi.getSummaries();
      updateState({ campaignSummaries: summaries, loading: false });
    } catch (error) {
      handleError(error, "load campaign summaries");
    }
  }, [updateState, handleError]);

  const refreshCampaigns = useCallback(async (): Promise<void> => {
    await Promise.all([
      loadAllCampaigns(),
      loadCampaignSummaries(),
      loadCurrentCampaign(),
      loadRecentCampaigns(),
    ]);
  }, [loadAllCampaigns, loadCampaignSummaries]);

  // Current campaign management
  const setCurrentCampaign = useCallback(
    async (campaignId: string): Promise<Campaign> => {
      updateState({ loading: true, error: null });
      try {
        const campaign = await campaignsApi.setCurrent(campaignId);
        updateState({ currentCampaign: campaign, loading: false });
        return campaign;
      } catch (error) {
        handleError(error, "set current campaign");
        throw error;
      }
    },
    [updateState, handleError]
  );

  const clearCurrentCampaign = useCallback(async (): Promise<void> => {
    updateState({ loading: true, error: null });
    try {
      await campaignsApi.clearCurrent();
      updateState({ currentCampaign: null, loading: false });
    } catch (error) {
      handleError(error, "clear current campaign");
    }
  }, [updateState, handleError]);

  const loadCurrentCampaign = useCallback(async (): Promise<void> => {
    updateState({ loading: true, error: null });
    try {
      const campaign = await campaignsApi.getCurrent();
      updateState({ currentCampaign: campaign, loading: false });
    } catch (error) {
      handleError(error, "load current campaign");
    }
  }, [updateState, handleError]);

  const loadRecentCampaigns = useCallback(async (): Promise<void> => {
    updateState({ loading: true, error: null });
    try {
      const campaigns = await campaignsApi.getRecent();
      updateState({ recentCampaigns: campaigns, loading: false });
    } catch (error) {
      handleError(error, "load recent campaigns");
    }
  }, [updateState, handleError]);

  // Session management
  const startSession = useCallback(
    async (campaignId: string): Promise<Campaign> => {
      updateState({ loading: true, error: null });
      try {
        const campaign = await campaignsApi.startSession(campaignId);
        setState((prev) => ({
          ...prev,
          campaigns: prev.campaigns.map((c) =>
            c.id === campaignId ? campaign : c
          ),
          currentCampaign:
            prev.currentCampaign?.id === campaignId
              ? campaign
              : prev.currentCampaign,
          loading: false,
        }));
        return campaign;
      } catch (error) {
        handleError(error, "start session");
        throw error;
      }
    },
    [updateState, handleError]
  );

  const updateCampaignStats = useCallback(
    async (
      campaignId: string,
      activeChars: number,
      totalChars: number,
      avgLevel: number
    ): Promise<Campaign> => {
      updateState({ loading: true, error: null });
      try {
        const campaign = await campaignsApi.updateStats(
          campaignId,
          activeChars,
          totalChars,
          avgLevel
        );
        setState((prev) => ({
          ...prev,
          campaigns: prev.campaigns.map((c) =>
            c.id === campaignId ? campaign : c
          ),
          currentCampaign:
            prev.currentCampaign?.id === campaignId
              ? campaign
              : prev.currentCampaign,
          loading: false,
        }));
        return campaign;
      } catch (error) {
        handleError(error, "update campaign stats");
        throw error;
      }
    },
    [updateState, handleError]
  );

  // Campaign lifecycle
  const completeCampaign = useCallback(
    async (campaignId: string): Promise<Campaign> => {
      updateState({ loading: true, error: null });
      try {
        const campaign = await campaignsApi.complete(campaignId);
        setState((prev) => ({
          ...prev,
          campaigns: prev.campaigns.map((c) =>
            c.id === campaignId ? campaign : c
          ),
          loading: false,
        }));
        return campaign;
      } catch (error) {
        handleError(error, "complete campaign");
        throw error;
      }
    },
    [updateState, handleError]
  );

  const pauseCampaign = useCallback(
    async (campaignId: string): Promise<Campaign> => {
      updateState({ loading: true, error: null });
      try {
        const campaign = await campaignsApi.pause(campaignId);
        setState((prev) => ({
          ...prev,
          campaigns: prev.campaigns.map((c) =>
            c.id === campaignId ? campaign : c
          ),
          loading: false,
        }));
        return campaign;
      } catch (error) {
        handleError(error, "pause campaign");
        throw error;
      }
    },
    [updateState, handleError]
  );

  const resumeCampaign = useCallback(
    async (campaignId: string): Promise<Campaign> => {
      updateState({ loading: true, error: null });
      try {
        const campaign = await campaignsApi.resume(campaignId);
        setState((prev) => ({
          ...prev,
          campaigns: prev.campaigns.map((c) =>
            c.id === campaignId ? campaign : c
          ),
          loading: false,
        }));
        return campaign;
      } catch (error) {
        handleError(error, "resume campaign");
        throw error;
      }
    },
    [updateState, handleError]
  );

  const duplicateCampaign = useCallback(
    async (campaignId: string, newName: string): Promise<Campaign> => {
      updateState({ loading: true, error: null });
      try {
        const newCampaign = await campaignsApi.duplicate(campaignId, newName);
        setState((prev) => ({
          ...prev,
          campaigns: [...prev.campaigns, newCampaign],
          loading: false,
        }));
        return newCampaign;
      } catch (error) {
        handleError(error, "duplicate campaign");
        throw error;
      }
    },
    [updateState, handleError]
  );

  // Import/Export
  const exportCampaign = useCallback(
    async (campaignId: string): Promise<string> => {
      updateState({ loading: true, error: null });
      try {
        const jsonData = await campaignsApi.export(campaignId);
        updateState({ loading: false });
        return jsonData;
      } catch (error) {
        handleError(error, "export campaign");
        throw error;
      }
    },
    [updateState, handleError]
  );

  const importCampaign = useCallback(
    async (jsonData: string): Promise<Campaign> => {
      updateState({ loading: true, error: null });
      try {
        const campaign = await campaignsApi.import(jsonData);
        setState((prev) => ({
          ...prev,
          campaigns: [...prev.campaigns, campaign],
          loading: false,
        }));
        return campaign;
      } catch (error) {
        handleError(error, "import campaign");
        throw error;
      }
    },
    [updateState, handleError]
  );

  const backupCampaigns = useCallback(async (): Promise<string> => {
    updateState({ loading: true, error: null });
    try {
      const result = await campaignsApi.backup();
      updateState({ loading: false });
      return result;
    } catch (error) {
      handleError(error, "backup campaigns");
      throw error;
    }
  }, [updateState, handleError]);

  // Settings management
  const loadAppSettings = useCallback(async (): Promise<void> => {
    updateState({ loading: true, error: null });
    try {
      const settings = await campaignsApi.getSettings();
      updateState({ appSettings: settings, loading: false });
    } catch (error) {
      handleError(error, "load app settings");
    }
  }, [updateState, handleError]);

  const updateTheme = useCallback(
    async (theme: string): Promise<AppSettings> => {
      updateState({ loading: true, error: null });
      try {
        const settings = await campaignsApi.updateTheme(theme);
        updateState({ appSettings: settings, loading: false });
        return settings;
      } catch (error) {
        handleError(error, "update theme");
        throw error;
      }
    },
    [updateState, handleError]
  );

  const updateBackupSettings = useCallback(
    async (
      autoBackup: boolean,
      frequencyHours: number
    ): Promise<AppSettings> => {
      updateState({ loading: true, error: null });
      try {
        const settings = await campaignsApi.updateBackupSettings(
          autoBackup,
          frequencyHours
        );
        updateState({ appSettings: settings, loading: false });
        return settings;
      } catch (error) {
        handleError(error, "update backup settings");
        throw error;
      }
    },
    [updateState, handleError]
  );

  // Utility functions
  const validateCampaignName = useCallback(
    async (name: string): Promise<boolean> => {
      updateState({ loading: true, error: null });
      try {
        const isValid = await campaignsApi.validateName(name);
        updateState({ loading: false });
        return isValid;
      } catch (error) {
        handleError(error, "validate campaign name");
        return false;
      }
    },
    [updateState, handleError]
  );

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Auto-load data on mount
  useEffect(() => {
    Promise.all([
      loadAllCampaigns(),
      loadCampaignSummaries(),
      loadCurrentCampaign(),
      loadRecentCampaigns(),
      loadAppSettings(),
    ]);
  }, []);

  // Computed values
  const activeCampaigns = CampaignService.getActiveCampaigns(state.campaigns);
  const completedCampaigns = CampaignService.filterByStatus(
    state.campaigns,
    "Completed"
  );
  const archivedCampaigns = CampaignService.filterByStatus(
    state.campaigns,
    "Archived"
  );
  const campaignsNeedingAttention =
    CampaignService.getCampaignsNeedingAttention(state.campaigns);
  const overallStats = CampaignService.calculateOverallStats(state.campaigns);
  const campaignSuggestions = CampaignService.generateCampaignSuggestions(
    state.campaigns
  );
  const recentlyUpdated = CampaignService.getRecentlyUpdated(state.campaigns);

  return {
    // State
    ...state,

    // Actions
    createCampaign,
    getCampaign,
    updateCampaign,
    deleteCampaign,
    archiveCampaign,
    loadAllCampaigns,
    loadActiveCampaigns,
    loadCampaignSummaries,
    refreshCampaigns,
    setCurrentCampaign,
    clearCurrentCampaign,
    loadCurrentCampaign,
    loadRecentCampaigns,
    startSession,
    updateCampaignStats,
    completeCampaign,
    pauseCampaign,
    resumeCampaign,
    duplicateCampaign,
    exportCampaign,
    importCampaign,
    backupCampaigns,
    loadAppSettings,
    updateTheme,
    updateBackupSettings,
    validateCampaignName,
    clearError,

    // Computed values
    activeCampaigns,
    completedCampaigns,
    archivedCampaigns,
    campaignsNeedingAttention,
    overallStats,
    campaignSuggestions,
    recentlyUpdated,
  };
}
