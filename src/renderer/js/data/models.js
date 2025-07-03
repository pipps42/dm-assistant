/**
 * Data Models - Modelli dati con validazione per D&D DM Assistant
 */

/**
 * Base Model class con funzionalità comuni
 */
class BaseModel {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();

    this.populate(data);
  }

  generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  }

  populate(data) {
    // Override in subclasses
  }

  toObject() {
    return { ...this };
  }

  validate() {
    return []; // Override in subclasses to return validation errors
  }
}

/**
 * Character Model - Personaggio giocatore
 */
export class Character extends BaseModel {
  constructor(data = {}) {
    super(data);
  }

  populate(data) {
    this.name = data.name || "";
    this.playerName = data.playerName || "";
    this.race = data.race || "";
    this.class = data.class || "";
    this.level = parseInt(data.level) || 1;
    this.alignment = data.alignment || "";
    this.hitPoints = data.hitPoints ? parseInt(data.hitPoints) : null;
    this.avatar = data.avatar || "🧙";
    this.background = data.background || "";
    this.adventures = data.adventures || [];
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length < 2) {
      errors.push("Nome personaggio deve essere almeno 2 caratteri");
    }

    if (!this.playerName || this.playerName.trim().length < 2) {
      errors.push("Nome giocatore deve essere almeno 2 caratteri");
    }

    if (!this.race) {
      errors.push("Razza è richiesta");
    }

    if (!this.class) {
      errors.push("Classe è richiesta");
    }

    if (!this.alignment) {
      errors.push("Allineamento è richiesto");
    }

    if (this.level < 1 || this.level > 20) {
      errors.push("Livello deve essere tra 1 e 20");
    }

    if (
      this.hitPoints !== null &&
      (this.hitPoints < 1 || this.hitPoints > 999)
    ) {
      errors.push("HP deve essere tra 1 e 999");
    }

    return errors;
  }
}

/**
 * NPC Model - Non-Player Character
 */
export class NPC extends BaseModel {
  constructor(data = {}) {
    super(data);
  }

  populate(data) {
    this.name = data.name || "";
    this.race = data.race || "";
    this.profession = data.profession || "";
    this.alignment = data.alignment || "";
    this.attitude = data.attitude || "";
    this.environmentId = data.environmentId || null;
    this.avatar = data.avatar || "🧙";
    this.description = data.description || "";
    this.motivations = data.motivations || "";
    this.secrets = data.secrets || "";
    this.interactions = data.interactions || [];
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length < 2) {
      errors.push("Nome NPC deve essere almeno 2 caratteri");
    }

    if (!this.alignment) {
      errors.push("Allineamento è richiesto");
    }

    if (!this.attitude) {
      errors.push("Atteggiamento è richiesto");
    }

    return errors;
  }
}

/**
 * Environment Model - Ambientazione/Località
 */
export class Environment extends BaseModel {
  constructor(data = {}) {
    super(data);
  }

  populate(data) {
    this.name = data.name || "";
    this.type = data.type || "";
    this.climate = data.climate || "";
    this.size = data.size || "";
    this.description = data.description || "";
    this.image = data.image || null;
    this.dangers = data.dangers || [];
    this.resources = data.resources || [];
    this.challengeLevel = data.challengeLevel || "";
    this.conditions = data.conditions || "";
    this.currency = data.currency || "";
    this.lodgingCost = data.lodgingCost || "";
    this.maps = data.maps || [];
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length < 2) {
      errors.push("Nome ambientazione deve essere almeno 2 caratteri");
    }

    if (this.name.length > 100) {
      errors.push("Nome ambientazione non può superare 100 caratteri");
    }

    return errors;
  }
}

/**
 * Monster Model - Mostro/Creatura
 */
export class Monster extends BaseModel {
  constructor(data = {}) {
    super(data);
  }

  populate(data) {
    this.name = data.name || "";
    this.size = data.size || "Medium";
    this.type = data.type || "";
    this.subtype = data.subtype || "";
    this.alignment = data.alignment || "";
    this.armorClass = parseInt(data.armorClass) || 10;
    this.hitPoints = parseInt(data.hitPoints) || 1;
    this.hitDice = data.hitDice || "1d8";
    this.speed = data.speed || {};
    this.stats = data.stats || {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    };
    this.savingThrows = data.savingThrows || {};
    this.skills = data.skills || {};
    this.damageResistances = data.damageResistances || [];
    this.damageImmunities = data.damageImmunities || [];
    this.damageVulnerabilities = data.damageVulnerabilities || [];
    this.conditionImmunities = data.conditionImmunities || [];
    this.senses = data.senses || {};
    this.languages = data.languages || [];
    this.challengeRating = data.challengeRating || "0";
    this.proficiencyBonus = parseInt(data.proficiencyBonus) || 2;
    this.traits = data.traits || [];
    this.actions = data.actions || [];
    this.reactions = data.reactions || [];
    this.legendaryActions = data.legendaryActions || [];
    this.description = data.description || "";
    this.environment = data.environment || [];
    this.source = data.source || "";
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length < 2) {
      errors.push("Nome mostro deve essere almeno 2 caratteri");
    }

    if (!this.type) {
      errors.push("Tipo è richiesto");
    }

    if (this.armorClass < 1 || this.armorClass > 30) {
      errors.push("Classe Armatura deve essere tra 1 e 30");
    }

    if (this.hitPoints < 1) {
      errors.push("Punti Ferita devono essere almeno 1");
    }

    // Validate stats
    for (const [stat, value] of Object.entries(this.stats)) {
      if (value < 1 || value > 30) {
        errors.push(`${stat} deve essere tra 1 e 30`);
      }
    }

    return errors;
  }

  // Helper methods
  getModifier(stat) {
    return Math.floor((this.stats[stat] - 10) / 2);
  }

  getProficiencyBonus() {
    const cr = parseFloat(this.challengeRating);
    if (cr < 0.25) return 2;
    if (cr < 5) return 2;
    if (cr < 9) return 3;
    if (cr < 13) return 4;
    if (cr < 17) return 5;
    if (cr < 21) return 6;
    if (cr < 25) return 7;
    if (cr < 29) return 8;
    return 9;
  }
}

/**
 * Encounter Model - Incontro di combattimento
 */
export class Encounter extends BaseModel {
  constructor(data = {}) {
    super(data);
  }

  populate(data) {
    this.name = data.name || "";
    this.description = data.description || "";
    this.environmentId = data.environmentId || null;
    this.difficulty = data.difficulty || "Medium";
    this.participants = data.participants || [];
    this.round = parseInt(data.round) || 0;
    this.initiative = data.initiative || [];
    this.currentParticipant = data.currentParticipant || null;
    this.status = data.status || "planned"; // planned, active, completed
    this.notes = data.notes || "";
    this.rewards = data.rewards || {
      experience: 0,
      treasure: "",
      items: [],
    };
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length < 2) {
      errors.push("Nome incontro deve essere almeno 2 caratteri");
    }

    const validDifficulties = ["Easy", "Medium", "Hard", "Deadly"];
    if (!validDifficulties.includes(this.difficulty)) {
      errors.push(
        "Difficoltà deve essere una di: " + validDifficulties.join(", ")
      );
    }

    const validStatuses = ["planned", "active", "completed"];
    if (!validStatuses.includes(this.status)) {
      errors.push("Status deve essere uno di: " + validStatuses.join(", "));
    }

    return errors;
  }

  // Helper methods
  addParticipant(participant) {
    this.participants.push({
      id: this.generateId(),
      ...participant,
      currentHP: participant.maxHP || participant.hitPoints || 1,
      initiative: 0,
      conditions: [],
    });
  }

  removeParticipant(participantId) {
    this.participants = this.participants.filter((p) => p.id !== participantId);
    this.initiative = this.initiative.filter(
      (i) => i.participantId !== participantId
    );
  }

  rollInitiative() {
    this.initiative = this.participants
      .map((participant) => ({
        participantId: participant.id,
        initiative:
          Math.floor(Math.random() * 20) +
          1 +
          (participant.dexterityModifier || 0),
        hasActed: false,
      }))
      .sort((a, b) => b.initiative - a.initiative);
  }

  nextTurn() {
    if (this.initiative.length === 0) return null;

    let currentIndex = this.initiative.findIndex(
      (i) => i.participantId === this.currentParticipant
    );

    // Mark current participant as acted
    if (currentIndex !== -1) {
      this.initiative[currentIndex].hasActed = true;
    }

    // Find next participant
    currentIndex = (currentIndex + 1) % this.initiative.length;

    // If we're back to the start and everyone has acted, start new round
    if (currentIndex === 0 && this.initiative.every((i) => i.hasActed)) {
      this.round++;
      this.initiative.forEach((i) => (i.hasActed = false));
    }

    this.currentParticipant = this.initiative[currentIndex].participantId;
    return this.currentParticipant;
  }
}

/**
 * Model Factory - Creazione e validazione centralizzata
 */
export class ModelFactory {
  static models = {
    Character,
    NPC,
    Environment,
    Monster,
    Encounter,
  };

  static create(type, data = {}) {
    const ModelClass = this.models[type];
    if (!ModelClass) {
      throw new Error(`Unknown model type: ${type}`);
    }
    return new ModelClass(data);
  }

  static validate(type, data) {
    try {
      const model = this.create(type, data);
      return model.validate();
    } catch (error) {
      return [`Errore di validazione: ${error.message}`];
    }
  }

  static getModelTypes() {
    return Object.keys(this.models);
  }
}

/**
 * Data validation utilities
 */
export const ValidationRules = {
  required: (value, fieldName) => {
    if (!value || (typeof value === "string" && value.trim().length === 0)) {
      return `${fieldName} è richiesto`;
    }
    return null;
  },

  minLength: (value, min, fieldName) => {
    if (value && value.length < min) {
      return `${fieldName} deve essere almeno ${min} caratteri`;
    }
    return null;
  },

  maxLength: (value, max, fieldName) => {
    if (value && value.length > max) {
      return `${fieldName} non può superare ${max} caratteri`;
    }
    return null;
  },

  range: (value, min, max, fieldName) => {
    const num = parseInt(value);
    if (isNaN(num) || num < min || num > max) {
      return `${fieldName} deve essere tra ${min} e ${max}`;
    }
    return null;
  },

  enum: (value, validValues, fieldName) => {
    if (value && !validValues.includes(value)) {
      return `${fieldName} deve essere uno di: ${validValues.join(", ")}`;
    }
    return null;
  },

  email: (value, fieldName) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return `${fieldName} deve essere un email valido`;
    }
    return null;
  },
};

/**
 * D&D 5e specific data constants
 */
export const DND5E_DATA = {
  SIZES: ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"],

  CREATURE_TYPES: [
    "Aberration",
    "Beast",
    "Celestial",
    "Construct",
    "Dragon",
    "Elemental",
    "Fey",
    "Fiend",
    "Giant",
    "Humanoid",
    "Monstrosity",
    "Ooze",
    "Plant",
    "Undead",
  ],

  ALIGNMENTS: [
    "Legale Buono",
    "Neutrale Buono",
    "Caotico Buono",
    "Legale Neutrale",
    "Neutrale Puro",
    "Caotico Neutrale",
    "Legale Malvagio",
    "Neutrale Malvagio",
    "Caotico Malvagio",
    "Non Allineato",
  ],

  CLASSES: [
    "Barbaro",
    "Bardo",
    "Chierico",
    "Druido",
    "Guerriero",
    "Monaco",
    "Paladino",
    "Ranger",
    "Ladro",
    "Stregone",
    "Warlock",
    "Mago",
  ],

  RACES: [
    "Umano",
    "Elfo",
    "Nano",
    "Halfling",
    "Dragonide",
    "Gnomo",
    "Mezzelfo",
    "Mezzorco",
    "Tiefling",
    "Aarakocra",
    "Genasi",
    "Goliath",
    "Tabaxi",
    "Tritone",
    "Firbolg",
    "Kenku",
    "Lizardfolk",
  ],

  CHALLENGE_RATINGS: [
    "0",
    "1/8",
    "1/4",
    "1/2",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "30",
  ],

  DIFFICULTIES: ["Easy", "Medium", "Hard", "Deadly"],

  CONDITIONS: [
    "Blinded",
    "Charmed",
    "Deafened",
    "Frightened",
    "Grappled",
    "Incapacitated",
    "Invisible",
    "Paralyzed",
    "Petrified",
    "Poisoned",
    "Prone",
    "Restrained",
    "Stunned",
    "Unconscious",
  ],

  DAMAGE_TYPES: [
    "Acid",
    "Bludgeoning",
    "Cold",
    "Fire",
    "Force",
    "Lightning",
    "Necrotic",
    "Piercing",
    "Poison",
    "Psychic",
    "Radiant",
    "Slashing",
    "Thunder",
  ],
};

export default {
  BaseModel,
  Character,
  NPC,
  Environment,
  Monster,
  Encounter,
  ModelFactory,
  ValidationRules,
  DND5E_DATA,
};
