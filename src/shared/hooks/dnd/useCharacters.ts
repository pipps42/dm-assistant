// src/shared/hooks/dnd/useCharacters.ts

import { useState, useEffect, useCallback } from "react";
import {
  PlayerCharacter,
  CreateCharacterRequest,
  UpdateCharacterRequest,
  AddAchievementRequest,
  UpdateRelationshipRequest,
} from "@/core/entities/Character";
import { CharacterService } from "@/core/services/CharacterService";
import { charactersApi } from "@/tauri/commands/characters";
import { useCampaign } from "./useCampaign";

interface UseCharactersState {
  characters: PlayerCharacter[];
  currentCharacter: PlayerCharacter | null;
  loading: boolean;
  error: string | null;
}

interface UseCharactersActions {
  // CRUD operations
  createCharacter: (
    request: CreateCharacterRequest
  ) => Promise<PlayerCharacter>;
  getCharacter: (characterId: string) => Promise<PlayerCharacter | null>;
  updateCharacter: (
    characterId: string,
    request: UpdateCharacterRequest
  ) => Promise<PlayerCharacter>;
  deleteCharacter: (characterId: string) => Promise<boolean>;

  // Campaign operations
  loadCharactersByCampaign: (
    campaignId: string,
    activeOnly?: boolean
  ) => Promise<void>;
  refreshCharacters: () => Promise<void>;

  // Character progression
  levelUpCharacter: (characterId: string) => Promise<PlayerCharacter>;
  toggleCharacterActive: (characterId: string) => Promise<PlayerCharacter>;

  // Achievement management
  addAchievement: (request: AddAchievementRequest) => Promise<PlayerCharacter>;
  removeAchievement: (
    characterId: string,
    achievementId: string
  ) => Promise<PlayerCharacter>;

  // Relationship management
  updateRelationship: (
    request: UpdateRelationshipRequest
  ) => Promise<PlayerCharacter>;
  removeRelationship: (
    characterId: string,
    npcId: string
  ) => Promise<PlayerCharacter>;

  // Utility functions
  setCurrentCharacter: (character: PlayerCharacter | null) => void;
  clearError: () => void;
}

interface UseCharactersReturn extends UseCharactersState, UseCharactersActions {
  // Computed values
  activeCharacters: PlayerCharacter[];
  inactiveCharacters: PlayerCharacter[];
  partySummary: ReturnType<typeof CharacterService.getPartySummary>;
  sortedByLevel: PlayerCharacter[];
  sortedByName: PlayerCharacter[];
}

/**
 * Custom hook for managing player characters
 * Provides complete character management functionality with state management
 */
export function useCharacters(campaignId?: string): UseCharactersReturn {
  const { currentCampaign } = useCampaign();

  // Use provided campaignId or fall back to current campaign
  const activeCampaignId = campaignId || currentCampaign?.id;

  const [state, setState] = useState<UseCharactersState>({
    campaigns: [],
    currentCharacter: null,
    loading: false,
    error: null,
  });

  // Helper function to update state
  const updateState = useCallback((updates: Partial<UseCharactersState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Helper function to handle errors
  const handleError = useCallback(
    (error: unknown, context: string) => {
      const errorMessage =
        error instanceof Error ? error.message : `Unknown error in ${context}`;
      console.error(`Character operation failed - ${context}:`, error);
      updateState({ error: errorMessage, loading: false });
    },
    [updateState]
  );

  // Auto-load characters when campaign changes
  useEffect(() => {
    if (activeCampaignId) {
      loadCharactersByCampaign(activeCampaignId);
    } else {
      // Clear characters if no campaign
      updateState({ characters: [] });
    }
  }, [activeCampaignId]);

  // CRUD Operations
  const createCharacter = useCallback(
    async (request: CreateCharacterRequest): Promise<PlayerCharacter> => {
      updateState({ loading: true, error: null });
      try {
        const newCharacter = await charactersApi.create(request);
        setState((prev) => ({
          ...prev,
          characters: [...prev.characters, newCharacter],
          loading: false,
        }));
        return newCharacter;
      } catch (error) {
        handleError(error, "create character");
        throw error;
      }
    },
    [updateState, handleError]
  );

  const getCharacter = useCallback(
    async (characterId: string): Promise<PlayerCharacter | null> => {
      if (!campaignId) {
        console.warn("Cannot get character without campaign context");
        return null;
      }

      updateState({ loading: true, error: null });
      try {
        const character = await charactersApi.getById(campaignId, characterId);
        updateState({ loading: false });
        return character;
      } catch (error) {
        handleError(error, "get character");
        return null;
      }
    },
    [campaignId, updateState, handleError]
  );

  const updateCharacter = useCallback(
    async (
      characterId: string,
      request: UpdateCharacterRequest
    ): Promise<PlayerCharacter> => {
      if (!campaignId) {
        throw new Error("Cannot update character without campaign context");
      }

      updateState({ loading: true, error: null });
      try {
        const updatedCharacter = await charactersApi.update(
          campaignId,
          characterId,
          request
        );
        setState((prev) => ({
          ...prev,
          characters: prev.characters.map((c) =>
            c.id === characterId ? updatedCharacter : c
          ),
          currentCharacter:
            prev.currentCharacter?.id === characterId
              ? updatedCharacter
              : prev.currentCharacter,
          loading: false,
        }));
        return updatedCharacter;
      } catch (error) {
        handleError(error, "update character");
        throw error;
      }
    },
    [campaignId, updateState, handleError]
  );

  const deleteCharacter = useCallback(
    async (characterId: string): Promise<boolean> => {
      if (!campaignId) {
        throw new Error("Cannot delete character without campaign context");
      }

      updateState({ loading: true, error: null });
      try {
        const success = await charactersApi.delete(campaignId, characterId);
        if (success) {
          setState((prev) => ({
            ...prev,
            characters: prev.characters.filter((c) => c.id !== characterId),
            currentCharacter:
              prev.currentCharacter?.id === characterId
                ? null
                : prev.currentCharacter,
            loading: false,
          }));
        } else {
          updateState({ loading: false });
        }
        return success;
      } catch (error) {
        handleError(error, "delete character");
        return false;
      }
    },
    [campaignId, updateState, handleError]
  );

  // Campaign operations
  const loadCharactersByCampaign = useCallback(
    async (campaignId: string, activeOnly: boolean = false): Promise<void> => {
      updateState({ loading: true, error: null });
      try {
        const characters = activeOnly
          ? await charactersApi.getActive(campaignId)
          : await charactersApi.getByCampaign(campaignId);
        updateState({ characters, loading: false });
      } catch (error) {
        handleError(error, "load characters by campaign");
      }
    },
    [updateState, handleError]
  );

  const refreshCharacters = useCallback(async (): Promise<void> => {
    if (campaignId) {
      await loadCharactersByCampaign(campaignId);
    }
  }, [campaignId, loadCharactersByCampaign]);

  // Character progression
  const levelUpCharacter = useCallback(
    async (characterId: string): Promise<PlayerCharacter> => {
      if (!campaignId) {
        throw new Error("Cannot level up character without campaign context");
      }

      updateState({ loading: true, error: null });
      try {
        const updatedCharacter = await charactersApi.levelUp(
          campaignId,
          characterId
        );
        setState((prev) => ({
          ...prev,
          characters: prev.characters.map((c) =>
            c.id === characterId ? updatedCharacter : c
          ),
          currentCharacter:
            prev.currentCharacter?.id === characterId
              ? updatedCharacter
              : prev.currentCharacter,
          loading: false,
        }));
        return updatedCharacter;
      } catch (error) {
        handleError(error, "level up character");
        throw error;
      }
    },
    [campaignId, updateState, handleError]
  );

  const toggleCharacterActive = useCallback(
    async (characterId: string): Promise<PlayerCharacter> => {
      if (!campaignId) {
        throw new Error(
          "Cannot toggle character active without campaign context"
        );
      }

      updateState({ loading: true, error: null });
      try {
        const updatedCharacter = await charactersApi.toggleActive(
          campaignId,
          characterId
        );
        setState((prev) => ({
          ...prev,
          characters: prev.characters.map((c) =>
            c.id === characterId ? updatedCharacter : c
          ),
          currentCharacter:
            prev.currentCharacter?.id === characterId
              ? updatedCharacter
              : prev.currentCharacter,
          loading: false,
        }));
        return updatedCharacter;
      } catch (error) {
        handleError(error, "toggle character active");
        throw error;
      }
    },
    [campaignId, updateState, handleError]
  );

  // Achievement management
  const addAchievement = useCallback(
    async (request: AddAchievementRequest): Promise<PlayerCharacter> => {
      if (!campaignId) {
        throw new Error("Cannot add achievement without campaign context");
      }

      updateState({ loading: true, error: null });
      try {
        const updatedCharacter = await charactersApi.addAchievement(
          campaignId,
          request
        );
        setState((prev) => ({
          ...prev,
          characters: prev.characters.map((c) =>
            c.id === request.characterId ? updatedCharacter : c
          ),
          currentCharacter:
            prev.currentCharacter?.id === request.characterId
              ? updatedCharacter
              : prev.currentCharacter,
          loading: false,
        }));
        return updatedCharacter;
      } catch (error) {
        handleError(error, "add achievement");
        throw error;
      }
    },
    [campaignId, updateState, handleError]
  );

  const removeAchievement = useCallback(
    async (
      characterId: string,
      achievementId: string
    ): Promise<PlayerCharacter> => {
      if (!campaignId) {
        throw new Error("Cannot remove achievement without campaign context");
      }

      updateState({ loading: true, error: null });
      try {
        const updatedCharacter = await charactersApi.removeAchievement(
          campaignId,
          characterId,
          achievementId
        );
        setState((prev) => ({
          ...prev,
          characters: prev.characters.map((c) =>
            c.id === characterId ? updatedCharacter : c
          ),
          currentCharacter:
            prev.currentCharacter?.id === characterId
              ? updatedCharacter
              : prev.currentCharacter,
          loading: false,
        }));
        return updatedCharacter;
      } catch (error) {
        handleError(error, "remove achievement");
        throw error;
      }
    },
    [campaignId, updateState, handleError]
  );

  // Relationship management
  const updateRelationship = useCallback(
    async (request: UpdateRelationshipRequest): Promise<PlayerCharacter> => {
      if (!campaignId) {
        throw new Error("Cannot update relationship without campaign context");
      }

      updateState({ loading: true, error: null });
      try {
        const updatedCharacter = await charactersApi.updateRelationship(
          campaignId,
          request
        );
        setState((prev) => ({
          ...prev,
          characters: prev.characters.map((c) =>
            c.id === request.characterId ? updatedCharacter : c
          ),
          currentCharacter:
            prev.currentCharacter?.id === request.characterId
              ? updatedCharacter
              : prev.currentCharacter,
          loading: false,
        }));
        return updatedCharacter;
      } catch (error) {
        handleError(error, "update relationship");
        throw error;
      }
    },
    [campaignId, updateState, handleError]
  );

  const removeRelationship = useCallback(
    async (characterId: string, npcId: string): Promise<PlayerCharacter> => {
      if (!campaignId) {
        throw new Error("Cannot remove relationship without campaign context");
      }

      updateState({ loading: true, error: null });
      try {
        const updatedCharacter = await charactersApi.removeRelationship(
          campaignId,
          characterId,
          npcId
        );
        setState((prev) => ({
          ...prev,
          characters: prev.characters.map((c) =>
            c.id === characterId ? updatedCharacter : c
          ),
          currentCharacter:
            prev.currentCharacter?.id === characterId
              ? updatedCharacter
              : prev.currentCharacter,
          loading: false,
        }));
        return updatedCharacter;
      } catch (error) {
        handleError(error, "remove relationship");
        throw error;
      }
    },
    [campaignId, updateState, handleError]
  );

  // Utility functions
  const setCurrentCharacter = useCallback(
    (character: PlayerCharacter | null) => {
      updateState({ currentCharacter: character });
    },
    [updateState]
  );

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Auto-load characters when campaign changes
  useEffect(() => {
    if (campaignId) {
      loadCharactersByCampaign(campaignId);
    }
  }, [campaignId, loadCharactersByCampaign]);

  // Computed values
  const activeCharacters = CharacterService.filterByActivity(
    state.characters,
    true
  );
  const inactiveCharacters = CharacterService.filterByActivity(
    state.characters,
    false
  );
  const partySummary = CharacterService.getPartySummary(state.characters);
  const sortedByLevel = CharacterService.sortByLevel(state.characters);
  const sortedByName = CharacterService.sortByName(state.characters);

  return {
    // State
    ...state,

    // Current campaign info
    activeCampaignId,
    hasActiveCampaign: !!activeCampaignId,

    // Actions (all existing methods)
    createCharacter,
    getCharacter,
    updateCharacter,
    deleteCharacter,
    loadCharactersByCampaign,
    refreshCharacters,
    levelUpCharacter,
    toggleCharacterActive,
    addAchievement,
    removeAchievement,
    updateRelationship,
    removeRelationship,
    setCurrentCharacter,
    clearError,

    // Computed values
    activeCharacters,
    inactiveCharacters,
    partySummary,
    sortedByLevel,
    sortedByName,
  };
}
