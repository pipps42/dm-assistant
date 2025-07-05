/**
 * Character Utils - Utilities, statistiche, validazione ed export per Character Manager
 */
import { IEntityUtils } from "./manager-factory.js";

export default class CharacterUtils extends IEntityUtils {
  constructor(manager) {
    super(manager);
  }

  /**
   * Get character statistics
   */
  getEntityStats() {
    const characters = this.manager.getAll();

    const stats = {
      total: characters.length,
      levelCounts: {},
      classCounts: {},
      raceCounts: {},
      alignmentCounts: {},
      recent: 0,
      totalAdventures: 0,
      totalNotes: 0,
      averageLevel: 0,
      highestLevel: 0,
      lowestLevel: 20,
      experiencedPlayers: 0, // Characters with 5+ adventures
    };

    if (characters.length === 0) return stats;

    let totalLevels = 0;

    characters.forEach((character) => {
      // Count by level
      stats.levelCounts[character.level] =
        (stats.levelCounts[character.level] || 0) + 1;
      totalLevels += character.level;

      // Track highest/lowest level
      if (character.level > stats.highestLevel)
        stats.highestLevel = character.level;
      if (character.level < stats.lowestLevel)
        stats.lowestLevel = character.level;

      // Count by class
      if (character.class) {
        stats.classCounts[character.class] =
          (stats.classCounts[character.class] || 0) + 1;
      }

      // Count by race
      if (character.race) {
        stats.raceCounts[character.race] =
          (stats.raceCounts[character.race] || 0) + 1;
      }

      // Count by alignment
      if (character.alignment) {
        stats.alignmentCounts[character.alignment] =
          (stats.alignmentCounts[character.alignment] || 0) + 1;
      }

      // Count recent (last week)
      const created = new Date(character.createdAt || 0);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (created > weekAgo) {
        stats.recent++;
      }

      // Count adventures
      const adventureCount = character.adventures
        ? character.adventures.length
        : 0;
      stats.totalAdventures += adventureCount;

      if (adventureCount >= 5) {
        stats.experiencedPlayers++;
      }

      // Count notes
      stats.totalNotes += character.notes ? character.notes.length : 0;
    });

    // Calculate average level
    stats.averageLevel = totalLevels / characters.length;

    return stats;
  }

  /**
   * Search characters by multiple criteria
   */
  searchEntities(query) {
    const searchTerm = query.toLowerCase();
    return this.manager
      .getAll()
      .filter(
        (char) =>
          char.name.toLowerCase().includes(searchTerm) ||
          char.class.toLowerCase().includes(searchTerm) ||
          (char.race && char.race.toLowerCase().includes(searchTerm)) ||
          (char.playerName &&
            char.playerName.toLowerCase().includes(searchTerm)) ||
          (char.alignment &&
            char.alignment.toLowerCase().includes(searchTerm)) ||
          (char.background &&
            char.background.toLowerCase().includes(searchTerm))
      );
  }

  /**
   * Advanced character filtering
   */
  filterEntities(criteria) {
    return this.manager.getAll().filter((character) => {
      return Object.entries(criteria).every(([key, value]) => {
        switch (key) {
          case "minLevel":
            return character.level >= value;
          case "maxLevel":
            return character.level <= value;
          case "hasAdventures":
            return value
              ? character.adventures && character.adventures.length > 0
              : true;
          case "minAdventures":
            return (
              (character.adventures ? character.adventures.length : 0) >= value
            );
          case "hasNotes":
            return value ? character.notes && character.notes.length > 0 : true;
          case "recentlyCreated":
            if (!value) return true;
            const created = new Date(character.createdAt || 0);
            const cutoff = new Date(Date.now() - value * 24 * 60 * 60 * 1000);
            return created > cutoff;
          default:
            if (typeof value === "function") {
              return value(character[key]);
            }
            return character[key] === value;
        }
      });
    });
  }

  /**
   * Validate character data
   */
  validateEntity(data) {
    const errors = [];

    // Basic validation
    if (!data.name || data.name.trim().length < 2) {
      errors.push("Nome personaggio deve essere almeno 2 caratteri");
    }

    if (data.name && data.name.length > 100) {
      errors.push("Nome personaggio non può superare 100 caratteri");
    }

    if (!data.playerName || data.playerName.trim().length < 2) {
      errors.push("Nome giocatore deve essere almeno 2 caratteri");
    }

    if (!data.race) {
      errors.push("Razza è richiesta");
    }

    if (!data.class) {
      errors.push("Classe è richiesta");
    }

    if (!data.alignment) {
      errors.push("Allineamento è richiesto");
    }

    if (!data.level || data.level < 1 || data.level > 20) {
      errors.push("Livello deve essere tra 1 e 20");
    }

    if (data.hitPoints !== null && data.hitPoints !== undefined) {
      const hp = parseInt(data.hitPoints);
      if (isNaN(hp) || hp < 1 || hp > 999) {
        errors.push("HP deve essere tra 1 e 999");
      }
    }

    // Check for duplicate names within the same player
    if (data.name && data.playerName) {
      const existing = this.manager
        .getAll()
        .find(
          (char) =>
            char.name.toLowerCase() === data.name.toLowerCase() &&
            char.playerName.toLowerCase() === data.playerName.toLowerCase() &&
            char.id !== data.id
        );

      if (existing) {
        errors.push(
          `${data.playerName} ha già un personaggio chiamato "${data.name}"`
        );
      }
    }

    return errors;
  }

  /**
   * Export characters with enhanced options
   */
  exportEntities(options = {}) {
    const characters = this.manager.getAll();
    const {
      includeStats = true,
      includeAdventures = true,
      includeNotes = true,
      format = "json",
    } = options;

    const exportData = {
      characters: characters.map((char) => {
        const exported = { ...char };

        if (!includeAdventures) delete exported.adventures;
        if (!includeNotes) delete exported.notes;

        return exported;
      }),
      exportDate: new Date().toISOString(),
      version: "1.0",
      exportOptions: options,
    };

    if (includeStats) {
      exportData.statistics = this.getEntityStats();
    }

    if (format === "csv") {
      return this.exportAsCSV(exportData.characters);
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dnd-characters-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();

    URL.revokeObjectURL(url);
    this.manager.showSuccess("Personaggi esportati!");
  }

  /**
   * Export as CSV
   */
  exportAsCSV(characters) {
    const headers = [
      "Nome",
      "Giocatore",
      "Razza",
      "Classe",
      "Livello",
      "Allineamento",
      "HP",
      "Avventure",
      "Note",
      "Creato",
    ];

    const csvData = characters.map((char) => [
      char.name,
      char.playerName,
      char.race || "",
      char.class,
      char.level,
      char.alignment,
      char.hitPoints || "",
      char.adventures ? char.adventures.length : 0,
      char.notes ? char.notes.length : 0,
      new Date(char.createdAt || "").toLocaleDateString("it-IT"),
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dnd-characters-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Get characters for encounter selection
   */
  getCharactersForEncounter() {
    return this.manager.getAll().map((character) => ({
      id: character.id,
      name: character.name,
      type: "character",
      avatar: character.avatar,
      playerName: character.playerName,
      level: character.level,
      class: character.class,
      race: character.race,
      hitPoints: character.hitPoints,
      armorClass:
        character.armorClass ||
        10 + this.getAbilityModifier(character.dexterity || 10),
    }));
  }

  /**
   * Calculate ability modifier
   */
  getAbilityModifier(score) {
    return Math.floor((score - 10) / 2);
  }

  /**
   * Get characters by level range
   */
  getCharactersByLevel(minLevel, maxLevel) {
    return this.filterEntities({ minLevel, maxLevel });
  }

  /**
   * Get characters by class
   */
  getCharactersByClass(className) {
    return this.filterEntities({ class: className });
  }

  /**
   * Get characters by race
   */
  getCharactersByRace(race) {
    return this.filterEntities({ race });
  }

  /**
   * Get characters by player
   */
  getCharactersByPlayer(playerName) {
    return this.filterEntities({ playerName });
  }

  /**
   * Get most active characters (by adventure count)
   */
  getMostActiveCharacters(limit = 10) {
    return this.manager
      .getAll()
      .sort((a, b) => (b.adventures?.length || 0) - (a.adventures?.length || 0))
      .slice(0, limit);
  }

  /**
   * Get characters needing attention (low activity)
   */
  getCharactersNeedingAttention() {
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    return this.manager.getAll().filter((character) => {
      const lastActivity = this.getLastActivityDate(character);
      return !lastActivity || lastActivity < oneMonthAgo;
    });
  }

  /**
   * Get last activity date for a character
   */
  getLastActivityDate(character) {
    const dates = [];

    if (character.updatedAt) {
      dates.push(new Date(character.updatedAt));
    }

    if (character.adventures) {
      character.adventures.forEach((adv) => {
        if (typeof adv === "object" && adv.date) {
          dates.push(new Date(adv.date));
        }
      });
    }

    if (character.notes) {
      character.notes.forEach((note) => {
        if (note.date) {
          dates.push(new Date(note.date));
        }
      });
    }

    return dates.length > 0 ? new Date(Math.max(...dates)) : null;
  }

  /**
   * Generate party composition analysis
   */
  analyzePartyComposition(characterIds) {
    const party = characterIds
      .map((id) => this.manager.getById(id))
      .filter(Boolean);

    if (party.length === 0) return null;

    const analysis = {
      size: party.length,
      averageLevel:
        party.reduce((sum, char) => sum + char.level, 0) / party.length,
      levelRange: {
        min: Math.min(...party.map((char) => char.level)),
        max: Math.max(...party.map((char) => char.level)),
      },
      classes: {},
      races: {},
      alignments: {},
      roles: {
        frontline: 0,
        support: 0,
        damage: 0,
        utility: 0,
      },
    };

    party.forEach((character) => {
      // Count classes
      analysis.classes[character.class] =
        (analysis.classes[character.class] || 0) + 1;

      // Count races
      if (character.race) {
        analysis.races[character.race] =
          (analysis.races[character.race] || 0) + 1;
      }

      // Count alignments
      if (character.alignment) {
        analysis.alignments[character.alignment] =
          (analysis.alignments[character.alignment] || 0) + 1;
      }

      // Analyze roles (simplified)
      const characterClass = character.class.toLowerCase();
      if (["guerriero", "paladino", "barbaro"].includes(characterClass)) {
        analysis.roles.frontline++;
      } else if (["chierico", "druido", "bardo"].includes(characterClass)) {
        analysis.roles.support++;
      } else if (
        ["ladro", "ranger", "stregone", "warlock"].includes(characterClass)
      ) {
        analysis.roles.damage++;
      } else if (["mago", "monaco"].includes(characterClass)) {
        analysis.roles.utility++;
      }
    });

    return analysis;
  }

  /**
   * Get random character by criteria
   */
  getRandomCharacter(criteria = {}) {
    const filtered = this.filterEntities(criteria);
    if (filtered.length === 0) return null;

    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  /**
   * Cleanup
   */
  destroy() {
    console.log("Character utils destroyed");
  }
}
