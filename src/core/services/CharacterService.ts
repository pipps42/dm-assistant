import {
  PlayerCharacter,
  CreateCharacterRequest,
  UpdateCharacterRequest,
  AddAchievementRequest,
  UpdateRelationshipRequest,
  Achievement,
  CharacterRelationship,
  RelationshipType,
  AchievementType,
  validateCharacterData,
  validateAchievementData,
  sortAchievementsByDate,
  getCharacterSummary,
  getRelationshipLabel,
} from "@/core/entities/Character";

/**
 * Business logic service for Player Character management
 * Handles validation, formatting, and complex operations
 */
export class CharacterService {
  /**
   * Validate character creation data
   */
  static validateCreateData(data: Partial<CreateCharacterRequest>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors = validateCharacterData(data);
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate achievement data
   */
  static validateAchievementData(data: Partial<AddAchievementRequest>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors = validateAchievementData(data);
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format character display name with class and level
   */
  static getDisplayName(character: PlayerCharacter): string {
    return getCharacterSummary(character);
  }

  /**
   * Get character's recent achievements (last N)
   */
  static getRecentAchievements(
    character: PlayerCharacter,
    limit: number = 5
  ): Achievement[] {
    const sorted = sortAchievementsByDate(character.achievements);
    return sorted.slice(0, limit);
  }

  /**
   * Get achievements by type
   */
  static getAchievementsByType(
    character: PlayerCharacter,
    type: AchievementType
  ): Achievement[] {
    return character.achievements.filter((achievement) => {
      if (
        typeof type === "string" &&
        typeof achievement.achievementType === "string"
      ) {
        return achievement.achievementType === type;
      }
      if (
        typeof type === "object" &&
        typeof achievement.achievementType === "object"
      ) {
        return achievement.achievementType.Custom === type.Custom;
      }
      return false;
    });
  }

  /**
   * Get quest-related achievements
   */
  static getQuestAchievements(character: PlayerCharacter): Achievement[] {
    return character.achievements.filter((achievement) => achievement.questId);
  }

  /**
   * Get character's relationships by type
   */
  static getRelationshipsByType(
    character: PlayerCharacter,
    type: RelationshipType
  ): CharacterRelationship[] {
    return character.relationships.filter(
      (rel) => rel.relationshipType === type
    );
  }

  /**
   * Get positive relationships (Friendly, Ally, Respected, Romantic)
   */
  static getPositiveRelationships(
    character: PlayerCharacter
  ): CharacterRelationship[] {
    const positiveTypes: RelationshipType[] = [
      "Friendly",
      "Ally",
      "Respected",
      "Romantic",
    ];
    return character.relationships.filter((rel) =>
      positiveTypes.includes(rel.relationshipType)
    );
  }

  /**
   * Get negative relationships (Hostile, Enemy, Feared, Suspicious)
   */
  static getNegativeRelationships(
    character: PlayerCharacter
  ): CharacterRelationship[] {
    const negativeTypes: RelationshipType[] = [
      "Hostile",
      "Enemy",
      "Feared",
      "Suspicious",
    ];
    return character.relationships.filter((rel) =>
      negativeTypes.includes(rel.relationshipType)
    );
  }

  /**
   * Get relationship summary for character
   */
  static getRelationshipSummary(character: PlayerCharacter): {
    positive: number;
    negative: number;
    neutral: number;
    total: number;
  } {
    const positive = this.getPositiveRelationships(character).length;
    const negative = this.getNegativeRelationships(character).length;
    const neutral = this.getRelationshipsByType(character, "Neutral").length;

    return {
      positive,
      negative,
      neutral,
      total: character.relationships.length,
    };
  }

  /**
   * Check if character has relationship with NPC
   */
  static hasRelationshipWithNPC(
    character: PlayerCharacter,
    npcId: string
  ): boolean {
    return character.relationships.some((rel) => rel.npcId === npcId);
  }

  /**
   * Get character's current HP for combat (returns maxHp as starting point)
   */
  static getCurrentHP(character: PlayerCharacter): number {
    // In combat, current HP will be managed separately
    // This returns max HP as starting point
    return character.maxHp;
  }

  /**
   * Format character stats for display
   */
  static formatStats(character: PlayerCharacter): {
    basic: string;
    hp: string;
    level: string;
  } {
    return {
      basic: `${character.race} ${character.class}`,
      hp: `${character.maxHp} HP`,
      level: `Livello ${character.level}`,
    };
  }

  /**
   * Check if character can level up (basic validation)
   */
  static canLevelUp(character: PlayerCharacter): boolean {
    return character.level < 20 && character.isActive;
  }

  /**
   * Suggest level up (increment by 1)
   */
  static suggestLevelUp(character: PlayerCharacter): UpdateCharacterRequest {
    return {
      level: Math.min(character.level + 1, 20),
    };
  }

  /**
   * Generate achievement suggestions based on common D&D moments
   */
  static getAchievementSuggestions(): Array<{
    title: string;
    type: AchievementType;
    description: string;
  }> {
    return [
      {
        title: "Primo Combattimento",
        type: "CombatVictory",
        description: "Ha partecipato al suo primo combattimento",
      },
      {
        title: "Diplomazia Riuscita",
        type: "SocialInteraction",
        description: "Ha risolto un conflitto con la diplomazia",
      },
      {
        title: "Enigma Brillante",
        type: "PuzzleSolved",
        description: "Ha risolto un enigma complesso",
      },
      {
        title: "Scoperta Importante",
        type: "Discovery",
        description: "Ha fatto una scoperta significativa",
      },
      {
        title: "Momento Eroico",
        type: "Roleplay",
        description: "Ha avuto un momento di grande interpretazione",
      },
    ];
  }

  /**
   * Format relationship for display
   */
  static formatRelationship(relationship: CharacterRelationship): string {
    const typeLabel = getRelationshipLabel(relationship.relationshipType);
    return relationship.notes
      ? `${typeLabel}: ${relationship.notes}`
      : typeLabel;
  }

  /**
   * Get character activity status
   */
  static getActivityStatus(character: PlayerCharacter): {
    status: "active" | "inactive";
    label: string;
    description: string;
  } {
    if (character.isActive) {
      return {
        status: "active",
        label: "Attivo",
        description: "Il personaggio partecipa attivamente alla campagna",
      };
    } else {
      return {
        status: "inactive",
        label: "Inattivo",
        description: "Il personaggio non partecipa più alla campagna",
      };
    }
  }

  /**
   * Filter characters by activity status
   */
  static filterByActivity(
    characters: PlayerCharacter[],
    activeOnly: boolean = true
  ): PlayerCharacter[] {
    return characters.filter((char) =>
      activeOnly ? char.isActive : !char.isActive
    );
  }

  /**
   * Sort characters by level (descending) then by name
   */
  static sortByLevel(characters: PlayerCharacter[]): PlayerCharacter[] {
    return [...characters].sort((a, b) => {
      if (a.level !== b.level) {
        return b.level - a.level; // Higher level first
      }
      return a.name.localeCompare(b.name); // Then alphabetical
    });
  }

  /**
   * Sort characters by name
   */
  static sortByName(characters: PlayerCharacter[]): PlayerCharacter[] {
    return [...characters].sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get campaign party summary
   */
  static getPartySummary(characters: PlayerCharacter[]): {
    totalCharacters: number;
    activeCharacters: number;
    averageLevel: number;
    totalAchievements: number;
    levelRange: string;
  } {
    const activeChars = this.filterByActivity(characters, true);
    const levels = activeChars.map((c) => c.level);
    const totalAchievements = characters.reduce(
      (sum, c) => sum + c.achievements.length,
      0
    );

    return {
      totalCharacters: characters.length,
      activeCharacters: activeChars.length,
      averageLevel:
        levels.length > 0
          ? Math.round(levels.reduce((a, b) => a + b, 0) / levels.length)
          : 0,
      totalAchievements,
      levelRange:
        levels.length > 0
          ? `${Math.min(...levels)}-${Math.max(...levels)}`
          : "0",
    };
  }
}
