export interface PlayerCharacter {
  id: string;
  campaignId: string;
  name: string;
  race: string;
  class: string;
  level: number;
  maxHp: number;
  background: string; // Custom description
  achievements: Achievement[];
  relationships: CharacterRelationship[];
  notes: string; // DM private notes
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  questId?: string; // Link to quest if related
  sessionDate?: string;
  achievementType: AchievementType;
  createdAt: string;
}

export type AchievementType =
  | "QuestCompleted"
  | "PuzzleSolved"
  | "SocialInteraction"
  | "CombatVictory"
  | "Discovery"
  | "Roleplay"
  | { Custom: string };

export interface CharacterRelationship {
  id: string;
  characterId: string;
  npcId: string;
  relationshipType: RelationshipType;
  notes: string;
  lastInteraction?: string;
  createdAt: string;
  updatedAt: string;
}

export type RelationshipType =
  | "Neutral"
  | "Friendly"
  | "Hostile"
  | "Suspicious"
  | "Romantic"
  | "Ally"
  | "Enemy"
  | "Respected"
  | "Feared";

// Request types for API calls
export interface CreateCharacterRequest {
  campaignId: string;
  name: string;
  race: string;
  class: string;
  level: number;
  maxHp: number;
  background: string;
  notes?: string;
}

export interface UpdateCharacterRequest {
  name?: string;
  race?: string;
  class?: string;
  level?: number;
  maxHp?: number;
  background?: string;
  notes?: string;
  isActive?: boolean;
}

export interface AddAchievementRequest {
  characterId: string;
  title: string;
  description: string;
  questId?: string;
  sessionDate?: string;
  achievementType: AchievementType;
}

export interface UpdateRelationshipRequest {
  characterId: string;
  npcId: string;
  relationshipType: RelationshipType;
  notes?: string;
}

// Utility types and constants
export const RELATIONSHIP_TYPES: RelationshipType[] = [
  "Neutral",
  "Friendly",
  "Hostile",
  "Suspicious",
  "Romantic",
  "Ally",
  "Enemy",
  "Respected",
  "Feared",
];

export const ACHIEVEMENT_TYPES: AchievementType[] = [
  "QuestCompleted",
  "PuzzleSolved",
  "SocialInteraction",
  "CombatVictory",
  "Discovery",
  "Roleplay",
];

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  Neutral: "Neutrale",
  Friendly: "Amichevole",
  Hostile: "Ostile",
  Suspicious: "Diffidente",
  Romantic: "Romantico",
  Ally: "Alleato",
  Enemy: "Nemico",
  Respected: "Rispettato",
  Feared: "Temuto",
};

export const ACHIEVEMENT_LABELS: Record<string, string> = {
  QuestCompleted: "Quest Completata",
  PuzzleSolved: "Enigma Risolto",
  SocialInteraction: "Interazione Sociale",
  CombatVictory: "Vittoria in Combattimento",
  Discovery: "Scoperta",
  Roleplay: "Interpretazione",
};

// Helper functions
export function getRelationshipLabel(type: RelationshipType): string {
  return RELATIONSHIP_LABELS[type];
}

export function getAchievementLabel(type: AchievementType): string {
  if (typeof type === "string") {
    return ACHIEVEMENT_LABELS[type] || type;
  }
  return type.Custom;
}

export function isAchievementQuestRelated(achievement: Achievement): boolean {
  return achievement.questId !== undefined;
}

export function sortAchievementsByDate(
  achievements: Achievement[]
): Achievement[] {
  return [...achievements].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getCharacterRelationship(
  character: PlayerCharacter,
  npcId: string
): CharacterRelationship | undefined {
  return character.relationships.find((rel) => rel.npcId === npcId);
}

export function getCharacterLevel(character: PlayerCharacter): string {
  return `Livello ${character.level}`;
}

export function getCharacterSummary(character: PlayerCharacter): string {
  return `${character.name} - ${character.race} ${
    character.class
  } (${getCharacterLevel(character)})`;
}

// Validation helpers
export function validateCharacterData(
  data: Partial<CreateCharacterRequest>
): string[] {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push("Il nome è obbligatorio");
  }

  if (!data.race?.trim()) {
    errors.push("La razza è obbligatoria");
  }

  if (!data.class?.trim()) {
    errors.push("La classe è obbligatoria");
  }

  if (!data.level || data.level < 1 || data.level > 20) {
    errors.push("Il livello deve essere tra 1 e 20");
  }

  if (!data.maxHp || data.maxHp < 1) {
    errors.push("Gli HP massimi devono essere maggiori di 0");
  }

  return errors;
}

export function validateAchievementData(
  data: Partial<AddAchievementRequest>
): string[] {
  const errors: string[] = [];

  if (!data.title?.trim()) {
    errors.push("Il titolo è obbligatorio");
  }

  if (!data.description?.trim()) {
    errors.push("La descrizione è obbligatoria");
  }

  return errors;
}
