/**
 * Environment Utils - Utilities, statistiche, export per Environment Manager
 */

export default class EnvironmentUtils {
  constructor(manager) {
    this.manager = manager;
  }

  /**
   * Get environment statistics
   */
  getEnvironmentStats() {
    const environments = this.manager.getAll();

    const stats = {
      total: environments.length,
      byType: {},
      byClimate: {},
      bySize: {},
      byChallengeLevel: {},
      recent: 0,
      totalMaps: 0,
      totalNPCs: 0,
    };

    environments.forEach((env) => {
      // Count by type
      if (env.type) {
        stats.byType[env.type] = (stats.byType[env.type] || 0) + 1;
      }

      // Count by climate
      if (env.climate) {
        stats.byClimate[env.climate] = (stats.byClimate[env.climate] || 0) + 1;
      }

      // Count by size
      if (env.size) {
        stats.bySize[env.size] = (stats.bySize[env.size] || 0) + 1;
      }

      // Count by challenge level
      if (env.challengeLevel) {
        stats.byChallengeLevel[env.challengeLevel] =
          (stats.byChallengeLevel[env.challengeLevel] || 0) + 1;
      }

      // Count recent (last week)
      const created = new Date(env.createdAt || 0);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (created > weekAgo) {
        stats.recent++;
      }

      // Count maps
      stats.totalMaps += env.maps ? env.maps.length : 0;

      // Count NPCs
      stats.totalNPCs += this.manager.getNPCsInEnvironment(env.id).length;
    });

    return stats;
  }

  /**
   * Export environments data
   */
  exportEnvironments() {
    const environments = this.manager.getAll();
    const exportData = {
      environments,
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dnd-environments-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();

    URL.revokeObjectURL(url);
    this.manager.showSuccess("Ambientazioni esportate!");
  }

  /**
   * Search environments by name, type, or description
   */
  searchEnvironments(query) {
    const searchTerm = query.toLowerCase();
    return this.manager
      .getAll()
      .filter(
        (env) =>
          env.name.toLowerCase().includes(searchTerm) ||
          (env.type && env.type.toLowerCase().includes(searchTerm)) ||
          (env.description &&
            env.description.toLowerCase().includes(searchTerm)) ||
          (env.climate && env.climate.toLowerCase().includes(searchTerm))
      );
  }

  /**
   * Get environments by type
   */
  getEnvironmentsByType(type) {
    return this.manager.getAll().filter((env) => env.type === type);
  }

  /**
   * Get environments by climate
   */
  getEnvironmentsByClimate(climate) {
    return this.manager.getAll().filter((env) => env.climate === climate);
  }

  /**
   * Get environments by challenge level
   */
  getEnvironmentsByChallengeLevel(challengeLevel) {
    return this.manager
      .getAll()
      .filter((env) => env.challengeLevel === challengeLevel);
  }

  /**
   * Get environments with maps (useful for encounters)
   */
  getEnvironmentsWithMaps() {
    return this.manager
      .getAll()
      .filter((env) => env.maps && env.maps.length > 0);
  }

  /**
   * Get environments with NPCs (populated areas)
   */
  getPopulatedEnvironments() {
    return this.manager
      .getAll()
      .filter((env) => this.manager.getNPCsInEnvironment(env.id).length > 0);
  }

  /**
   * Get dangerous environments (for encounters)
   */
  getDangerousEnvironments() {
    return this.manager
      .getAll()
      .filter(
        (env) =>
          env.dangers &&
          env.dangers.length > 0 &&
          (env.challengeLevel === "Difficile" ||
            env.challengeLevel === "Molto Difficile")
      );
  }

  /**
   * Get safe environments (for rest/recovery)
   */
  getSafeEnvironments() {
    return this.manager
      .getAll()
      .filter(
        (env) =>
          (!env.dangers || env.dangers.length === 0) &&
          (env.challengeLevel === "Molto Facile" ||
            env.challengeLevel === "Facile")
      );
  }

  /**
   * Get environments suitable for trading/commerce
   */
  getTradingEnvironments() {
    return this.manager
      .getAll()
      .filter(
        (env) =>
          env.type &&
          ["Città", "Villaggio", "Mercato", "Porto"].includes(env.type)
      );
  }

  /**
   * Get most mapped environments (top environments by map count)
   */
  getMostMappedEnvironments(limit = 10) {
    return this.manager
      .getAll()
      .sort((a, b) => (b.maps?.length || 0) - (a.maps?.length || 0))
      .slice(0, limit);
  }

  /**
   * Get environments with most NPCs (top populated areas)
   */
  getMostPopulatedEnvironments(limit = 10) {
    return this.manager
      .getAll()
      .map((env) => ({
        ...env,
        npcCount: this.manager.getNPCsInEnvironment(env.id).length,
      }))
      .sort((a, b) => b.npcCount - a.npcCount)
      .slice(0, limit);
  }

  /**
   * Get environments suitable for specific party levels
   */
  getEnvironmentsForPartyLevel(partyLevel) {
    const levelRanges = {
      1: ["Molto Facile", "Facile"],
      2: ["Molto Facile", "Facile"],
      3: ["Facile", "Medio"],
      4: ["Facile", "Medio"],
      5: ["Medio"],
      6: ["Medio"],
      7: ["Medio"],
      8: ["Medio"],
      9: ["Medio"],
      10: ["Medio"],
      11: ["Medio", "Difficile"],
      12: ["Medio", "Difficile"],
      13: ["Medio", "Difficile"],
      14: ["Medio", "Difficile"],
      15: ["Medio", "Difficile"],
      16: ["Difficile", "Molto Difficile"],
      17: ["Difficile", "Molto Difficile"],
      18: ["Difficile", "Molto Difficile"],
      19: ["Difficile", "Molto Difficile"],
      20: ["Difficile", "Molto Difficile"],
    };

    const appropriateLevels = levelRanges[partyLevel] || ["Medio"];

    return this.manager
      .getAll()
      .filter((env) => appropriateLevels.includes(env.challengeLevel));
  }

  /**
   * Get random environment by criteria
   */
  getRandomEnvironment(criteria = {}) {
    let environments = this.manager.getAll();

    // Apply filters
    if (criteria.type) {
      environments = environments.filter((env) => env.type === criteria.type);
    }

    if (criteria.climate) {
      environments = environments.filter(
        (env) => env.climate === criteria.climate
      );
    }

    if (criteria.challengeLevel) {
      environments = environments.filter(
        (env) => env.challengeLevel === criteria.challengeLevel
      );
    }

    if (criteria.hasNPCs) {
      environments = environments.filter(
        (env) => this.manager.getNPCsInEnvironment(env.id).length > 0
      );
    }

    if (criteria.hasMaps) {
      environments = environments.filter(
        (env) => env.maps && env.maps.length > 0
      );
    }

    if (environments.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * environments.length);
    return environments[randomIndex];
  }

  /**
   * Generate quick reference for environment
   */
  generateQuickReference(environmentId) {
    const environment = this.manager.getById(environmentId);
    if (!environment) return null;

    const npcs = this.manager.getNPCsInEnvironment(environmentId);
    const maps = environment.maps || [];

    return {
      name: environment.name,
      type: environment.type,
      climate: environment.climate,
      challengeLevel: environment.challengeLevel,
      dangers: environment.dangers || [],
      resources: environment.resources || [],
      npcCount: npcs.length,
      mapCount: maps.length,
      keyNPCs: npcs.slice(0, 3).map((npc) => ({
        name: npc.name,
        attitude: npc.attitude,
        profession: npc.profession,
      })),
      conditions: environment.conditions,
      lodgingCost: environment.lodgingCost,
      currency: environment.currency,
    };
  }

  /**
   * Get environment recommendations based on current session
   */
  getRecommendations(currentEnvironmentId, partyLevel = 5) {
    const current = this.manager.getById(currentEnvironmentId);
    if (!current) return [];

    const recommendations = [];

    // Similar climate
    const similarClimate = this.getEnvironmentsByClimate(current.climate)
      .filter((env) => env.id !== currentEnvironmentId)
      .slice(0, 2);

    if (similarClimate.length > 0) {
      recommendations.push({
        category: "Clima Simile",
        environments: similarClimate,
      });
    }

    // Connected by NPCs (environments with NPCs that mentioned this place)
    const connectedByNPCs = this.manager
      .getAll()
      .filter((env) => {
        const envNPCs = this.manager.getNPCsInEnvironment(env.id);
        return envNPCs.some(
          (npc) =>
            npc.description &&
            npc.description.toLowerCase().includes(current.name.toLowerCase())
        );
      })
      .slice(0, 2);

    if (connectedByNPCs.length > 0) {
      recommendations.push({
        category: "Collegati da NPC",
        environments: connectedByNPCs,
      });
    }

    // Appropriate challenge level
    const appropriateLevel = this.getEnvironmentsForPartyLevel(partyLevel)
      .filter((env) => env.id !== currentEnvironmentId)
      .slice(0, 3);

    if (appropriateLevel.length > 0) {
      recommendations.push({
        category: `Adatti al Livello ${partyLevel}`,
        environments: appropriateLevel,
      });
    }

    return recommendations;
  }

  /**
   * Validate environment data
   */
  validateEnvironment(environmentData) {
    const errors = [];

    if (!environmentData.name || environmentData.name.trim().length < 2) {
      errors.push("Nome deve essere almeno 2 caratteri");
    }

    if (environmentData.name && environmentData.name.length > 100) {
      errors.push("Nome non può superare 100 caratteri");
    }

    if (
      environmentData.description &&
      environmentData.description.length > 2000
    ) {
      errors.push("Descrizione non può superare 2000 caratteri");
    }

    // Check for duplicate names
    const existing = this.manager
      .getAll()
      .find(
        (env) =>
          env.name.toLowerCase() === environmentData.name?.toLowerCase() &&
          env.id !== environmentData.id
      );

    if (existing) {
      errors.push("Esiste già un'ambientazione con questo nome");
    }

    return errors;
  }
}
