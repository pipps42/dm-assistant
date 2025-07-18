// src/types/character.ts
export interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  background: string;

  // Game Stats
  hitPoints: number;
  maxHitPoints: number;

  // Details
  avatar?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface CharacterData
  extends Omit<Character, "id" | "createdAt" | "updatedAt"> {}

export interface CharacterFormData {
  name: string;
  race: string;
  class: string;
  level: number;
  background?: string;

  // Game Stats
  hitPoints?: number;
  maxHitPoints?: number;
}

export interface CharacterStats {
  totalCharacters: number;
  classDistribution: Record<string, number>;
  raceDistribution: Record<string, number>;
}

// Enums per le dropdown
export enum CharacterClass {
  BARBARIAN = "Barbarian",
  BARD = "Bard",
  CLERIC = "Cleric",
  DRUID = "Druid",
  FIGHTER = "Fighter",
  MONK = "Monk",
  PALADIN = "Paladin",
  RANGER = "Ranger",
  ROGUE = "Rogue",
  SORCERER = "Sorcerer",
  WARLOCK = "Warlock",
  WIZARD = "Wizard",
}

export enum CharacterRace {
  HUMAN = "Human",
  ELF = "Elf",
  DWARF = "Dwarf",
  HALFLING = "Halfling",
  DRAGONBORN = "Dragonborn",
  GNOME = "Gnome",
  HALF_ELF = "Half-Elf",
  HALF_ORC = "Half-Orc",
  TIEFLING = "Tiefling",
}
