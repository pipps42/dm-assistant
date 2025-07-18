import { invoke } from "@tauri-apps/api/core";
import {
  Character,
  CharacterData,
  CharacterFormData,
  CharacterStats,
} from "../types/character";

export class CharacterManager {
  private characters: Character[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadCharacters();
  }

  // ========== CORE CRUD OPERATIONS ==========

  async loadCharacters(): Promise<Character[]> {
    try {
      this.characters = await invoke("load_characters");
      this.notifyListeners();
      return this.characters;
    } catch (error) {
      console.error("Failed to load characters:", error);
      throw new Error("Impossibile caricare i personaggi");
    }
  }

  async createCharacter(data: CharacterFormData): Promise<Character> {
    try {
      const characterData: CharacterData = {
        name: data.name,
        race: data.race,
        class: data.class,
        level: data.level || 1,
        background: data.background || "",

        // Game Stats with computed defaults
        hitPoints: data.hitPoints || this.calculateHitPoints(data.level),
        maxHitPoints: data.maxHitPoints || this.calculateHitPoints(data.level),
      };

      const character = await invoke<Character>("create_character", {
        data: characterData,
      });
      this.characters.push(character);
      this.notifyListeners();

      return character;
    } catch (error) {
      console.error("Failed to create character:", error);
      throw new Error("Impossibile creare il personaggio");
    }
  }

  async updateCharacter(
    id: string,
    data: Partial<CharacterData>
  ): Promise<Character> {
    try {
      const character = await invoke<Character>("update_character", {
        id,
        data,
      });
      const index = this.characters.findIndex((c) => c.id === id);
      if (index !== -1) {
        this.characters[index] = character;
        this.notifyListeners();
      }
      return character;
    } catch (error) {
      console.error("Failed to update character:", error);
      throw new Error("Impossibile aggiornare il personaggio");
    }
  }

  async deleteCharacter(id: string): Promise<void> {
    try {
      await invoke("delete_character", { id });
      this.characters = this.characters.filter((c) => c.id !== id);
      this.notifyListeners();
    } catch (error) {
      console.error("Failed to delete character:", error);
      throw new Error("Impossibile eliminare il personaggio");
    }
  }

  // ========== GETTERS ==========

  getCharacter(id: string): Character | undefined {
    return this.characters.find((c) => c.id === id);
  }

  getAllCharacters(): Character[] {
    return [...this.characters];
  }

  getCharactersByLevel(level: number): Character[] {
    return this.characters.filter((c) => c.level === level);
  }

  getCharactersByClass(characterClass: string): Character[] {
    return this.characters.filter((c) => c.class === characterClass);
  }

  // ========== SEARCH & FILTER ==========

  searchCharacters(query: string): Character[] {
    const searchTerm = query.toLowerCase();
    return this.characters.filter(
      (character) =>
        character.name.toLowerCase().includes(searchTerm) ||
        character.class.toLowerCase().includes(searchTerm) ||
        character.race.toLowerCase().includes(searchTerm) ||
        character.background.toLowerCase().includes(searchTerm)
    );
  }

  filterCharacters(filters: { class?: string; race?: string }): Character[] {
    return this.characters.filter((character) => {
      if (filters.class && character.class !== filters.class) return false;
      if (filters.race && character.race !== filters.race) return false;
      return true;
    });
  }

  // ========== STATISTICS ==========

  getCharacterStats(): CharacterStats {
    const stats: CharacterStats = {
      totalCharacters: this.characters.length,
      classDistribution: this.getClassDistribution(),
      raceDistribution: this.getRaceDistribution(),
    };
    return stats;
  }

  private getClassDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    this.characters.forEach((char) => {
      distribution[char.class] = (distribution[char.class] || 0) + 1;
    });
    return distribution;
  }

  private getRaceDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    this.characters.forEach((char) => {
      distribution[char.race] = (distribution[char.race] || 0) + 1;
    });
    return distribution;
  }

  // ========== UTILITY METHODS ==========

  private calculateHitPoints(level: number): number {
    return Math.max(1, 8 + (level - 1) * 5);
  }

  // ========== LISTENER SYSTEM ==========

  addListener(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback());
  }

  // ========== EXPORT/IMPORT ==========

  async exportCharacters(): Promise<string> {
    try {
      return await invoke("export_characters");
    } catch (error) {
      console.error("Failed to export characters:", error);
      throw new Error("Impossibile esportare i personaggi");
    }
  }

  async importCharacters(data: string): Promise<void> {
    try {
      await invoke("import_characters", { data });
      await this.loadCharacters();
    } catch (error) {
      console.error("Failed to import characters:", error);
      throw new Error("Impossibile importare i personaggi");
    }
  }
}

// Singleton instance
export const characterManager = new CharacterManager();
