import { invoke } from "@tauri-apps/api/core";
import {
  PlayerCharacter,
  CreateCharacterRequest,
  UpdateCharacterRequest,
  AddAchievementRequest,
  UpdateRelationshipRequest,
} from "@/core/entities/Character";

/**
 * Typed wrapper for Tauri character commands
 * Provides type safety and error handling for character operations
 */
export class CharacterApi {
  /**
   * Create a new character
   */
  static async create(
    request: CreateCharacterRequest
  ): Promise<PlayerCharacter> {
    try {
      const result = await invoke<PlayerCharacter>("create_character", {
        req: request,
      });
      return result;
    } catch (error) {
      console.error("Failed to create character:", error);
      throw new Error(`Failed to create character: ${error}`);
    }
  }

  /**
   * Get character by ID (requires campaign context)
   */
  static async getById(
    campaignId: string,
    characterId: string
  ): Promise<PlayerCharacter | null> {
    try {
      const result = await invoke<PlayerCharacter | null>(
        "get_character_with_campaign",
        {
          campaignId,
          characterId,
        }
      );
      return result;
    } catch (error) {
      console.error("Failed to get character:", error);
      throw new Error(`Failed to get character: ${error}`);
    }
  }

  /**
   * Get all characters for a campaign
   */
  static async getByCampaign(campaignId: string): Promise<PlayerCharacter[]> {
    try {
      const result = await invoke<PlayerCharacter[]>(
        "get_characters_by_campaign",
        {
          campaignId,
        }
      );
      return result;
    } catch (error) {
      console.error("Failed to get characters by campaign:", error);
      throw new Error(`Failed to get characters by campaign: ${error}`);
    }
  }

  /**
   * Get only active characters for a campaign
   */
  static async getActiveByCampaign(
    campaignId: string
  ): Promise<PlayerCharacter[]> {
    try {
      const result = await invoke<PlayerCharacter[]>(
        "get_active_characters_by_campaign",
        {
          campaignId,
        }
      );
      return result;
    } catch (error) {
      console.error("Failed to get active characters:", error);
      throw new Error(`Failed to get active characters: ${error}`);
    }
  }

  /**
   * Update character data
   */
  static async update(
    campaignId: string,
    characterId: string,
    request: UpdateCharacterRequest
  ): Promise<PlayerCharacter> {
    try {
      const result = await invoke<PlayerCharacter>(
        "update_character_with_campaign",
        {
          campaignId,
          characterId,
          req: request,
        }
      );
      return result;
    } catch (error) {
      console.error("Failed to update character:", error);
      throw new Error(`Failed to update character: ${error}`);
    }
  }

  /**
   * Delete character
   */
  static async delete(
    campaignId: string,
    characterId: string
  ): Promise<boolean> {
    try {
      const result = await invoke<boolean>("delete_character", {
        campaignId,
        characterId,
      });
      return result;
    } catch (error) {
      console.error("Failed to delete character:", error);
      throw new Error(`Failed to delete character: ${error}`);
    }
  }

  /**
   * Add achievement to character
   */
  static async addAchievement(
    campaignId: string,
    request: AddAchievementRequest
  ): Promise<PlayerCharacter> {
    try {
      const result = await invoke<PlayerCharacter>(
        "add_character_achievement",
        {
          campaignId,
          req: request,
        }
      );
      return result;
    } catch (error) {
      console.error("Failed to add achievement:", error);
      throw new Error(`Failed to add achievement: ${error}`);
    }
  }

  /**
   * Remove achievement from character
   */
  static async removeAchievement(
    campaignId: string,
    characterId: string,
    achievementId: string
  ): Promise<PlayerCharacter> {
    try {
      const result = await invoke<PlayerCharacter>(
        "remove_character_achievement",
        {
          campaignId,
          characterId,
          achievementId,
        }
      );
      return result;
    } catch (error) {
      console.error("Failed to remove achievement:", error);
      throw new Error(`Failed to remove achievement: ${error}`);
    }
  }

  /**
   * Update or create relationship with NPC
   */
  static async updateRelationship(
    campaignId: string,
    request: UpdateRelationshipRequest
  ): Promise<PlayerCharacter> {
    try {
      const result = await invoke<PlayerCharacter>(
        "update_character_relationship",
        {
          campaignId,
          req: request,
        }
      );
      return result;
    } catch (error) {
      console.error("Failed to update relationship:", error);
      throw new Error(`Failed to update relationship: ${error}`);
    }
  }

  /**
   * Remove relationship with NPC
   */
  static async removeRelationship(
    campaignId: string,
    characterId: string,
    npcId: string
  ): Promise<PlayerCharacter> {
    try {
      const result = await invoke<PlayerCharacter>(
        "remove_character_relationship",
        {
          campaignId,
          characterId,
          npcId,
        }
      );
      return result;
    } catch (error) {
      console.error("Failed to remove relationship:", error);
      throw new Error(`Failed to remove relationship: ${error}`);
    }
  }

  /**
   * Get characters that have relationships with specific NPC
   */
  static async getByNpcRelationship(npcId: string): Promise<PlayerCharacter[]> {
    try {
      const result = await invoke<PlayerCharacter[]>(
        "get_characters_by_npc_relationship",
        {
          npcId,
        }
      );
      return result;
    } catch (error) {
      console.error("Failed to get characters by NPC relationship:", error);
      throw new Error(`Failed to get characters by NPC relationship: ${error}`);
    }
  }

  /**
   * Level up character by one level
   */
  static async levelUp(
    campaignId: string,
    characterId: string
  ): Promise<PlayerCharacter> {
    try {
      const result = await invoke<PlayerCharacter>("level_up_character", {
        campaignId,
        characterId,
      });
      return result;
    } catch (error) {
      console.error("Failed to level up character:", error);
      throw new Error(`Failed to level up character: ${error}`);
    }
  }

  /**
   * Toggle character active status
   */
  static async toggleActive(
    campaignId: string,
    characterId: string
  ): Promise<PlayerCharacter> {
    try {
      const result = await invoke<PlayerCharacter>("toggle_character_active", {
        campaignId,
        characterId,
      });
      return result;
    } catch (error) {
      console.error("Failed to toggle character active status:", error);
      throw new Error(`Failed to toggle character active status: ${error}`);
    }
  }

  /**
   * Save characters to file (placeholder)
   */
  static async saveToFile(campaignId: string): Promise<string> {
    try {
      const result = await invoke<string>("save_characters_to_file", {
        campaignId,
      });
      return result;
    } catch (error) {
      console.error("Failed to save characters to file:", error);
      throw new Error(`Failed to save characters to file: ${error}`);
    }
  }

  /**
   * Load characters from file (placeholder)
   */
  static async loadFromFile(campaignId: string): Promise<PlayerCharacter[]> {
    try {
      const result = await invoke<PlayerCharacter[]>(
        "load_characters_from_file",
        { campaignId }
      );
      return result;
    } catch (error) {
      console.error("Failed to load characters from file:", error);
      throw new Error(`Failed to load characters from file: ${error}`);
    }
  }

  /**
   * Check if characters file exists for campaign
   */
  static async fileExists(campaignId: string): Promise<boolean> {
    try {
      const result = await invoke<boolean>("characters_file_exists", {
        campaignId,
      });
      return result;
    } catch (error) {
      console.error("Failed to check if characters file exists:", error);
      throw new Error(`Failed to check if characters file exists: ${error}`);
    }
  }
}

// Convenience functions for common operations
export const charactersApi = {
  // CRUD operations
  create: CharacterApi.create,
  getById: (campaignId: string, characterId: string) =>
    CharacterApi.getById(campaignId, characterId),
  getByCampaign: CharacterApi.getByCampaign,
  getActive: CharacterApi.getActiveByCampaign,
  update: (
    campaignId: string,
    characterId: string,
    request: UpdateCharacterRequest
  ) => CharacterApi.update(campaignId, characterId, request),
  delete: (campaignId: string, characterId: string) =>
    CharacterApi.delete(campaignId, characterId),

  // Achievement operations
  addAchievement: (campaignId: string, request: AddAchievementRequest) =>
    CharacterApi.addAchievement(campaignId, request),
  removeAchievement: (
    campaignId: string,
    characterId: string,
    achievementId: string
  ) => CharacterApi.removeAchievement(campaignId, characterId, achievementId),

  // Relationship operations
  updateRelationship: (
    campaignId: string,
    request: UpdateRelationshipRequest
  ) => CharacterApi.updateRelationship(campaignId, request),
  removeRelationship: (
    campaignId: string,
    characterId: string,
    npcId: string
  ) => CharacterApi.removeRelationship(campaignId, characterId, npcId),
  getByNpcRelationship: CharacterApi.getByNpcRelationship,

  // Character progression
  levelUp: (campaignId: string, characterId: string) =>
    CharacterApi.levelUp(campaignId, characterId),
  toggleActive: (campaignId: string, characterId: string) =>
    CharacterApi.toggleActive(campaignId, characterId),

  // File operations
  saveToFile: CharacterApi.saveToFile,
  loadFromFile: CharacterApi.loadFromFile,
  fileExists: CharacterApi.fileExists,
};

export default charactersApi;
