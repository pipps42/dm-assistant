/**
 * NPC Utils - Utilities, statistiche, validazione ed export per NPC Manager
 */
import { IEntityUtils } from "./manager-factory.js";

export default class NPCUtils extends IEntityUtils {
  constructor(manager) {
    super(manager);
  }

  /**
   * Get NPC statistics
   */
  getEntityStats() {
    const npcs = this.manager.getAll();

    const stats = {
      total: npcs.length,
      byAttitude: {},
      byRace: {},
      byProfession: {},
      byEnvironment: {},
      recent: 0,
      totalInteractions: 0,
      totalRelationships: 0,
      totalQuests: 0,
      withSecrets: 0,
      secretsRevealed: 0,
      mostInteractive: null,
      leastInteractive: null,
      popularEnvironments: {},
    };

    if (npcs.length === 0) return stats;

    let maxInteractions = 0;
    let minInteractions = Infinity;

    npcs.forEach((npc) => {
      // Count by attitude
      if (npc.attitude) {
        stats.byAttitude[npc.attitude] =
          (stats.byAttitude[npc.attitude] || 0) + 1;
      }

      // Count by race
      if (npc.race) {
        stats.byRace[npc.race] = (stats.byRace[npc.race] || 0) + 1;
      }

      // Count by profession
      if (npc.profession) {
        stats.byProfession[npc.profession] =
          (stats.byProfession[npc.profession] || 0) + 1;
      }

      // Count by environment
      if (npc.environmentId) {
        stats.byEnvironment[npc.environmentId] =
          (stats.byEnvironment[npc.environmentId] || 0) + 1;
      }

      // Count recent (last week)
      const created = new Date(npc.createdAt || 0);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (created > weekAgo) {
        stats.recent++;
      }

      // Count interactions
      const interactionCount = npc.interactions ? npc.interactions.length : 0;
      stats.totalInteractions += interactionCount;

      if (interactionCount > maxInteractions) {
        maxInteractions = interactionCount;
        stats.mostInteractive = npc.name;
      }
      if (interactionCount < minInteractions) {
        minInteractions = interactionCount;
        stats.leastInteractive = npc.name;
      }

      // Count relationships
      stats.totalRelationships += npc.relationships
        ? npc.relationships.length
        : 0;

      // Count quests
      stats.totalQuests += npc.quests ? npc.quests.length : 0;

      // Count secrets
      if (npc.secrets && npc.secrets.trim()) {
        stats.withSecrets++;
        if (npc.secretRevealed) {
          stats.secretsRevealed++;
        }
      }
    });

    // Calculate environment popularity
    const environments = window.dataStore?.get("environments") || [];
    Object.entries(stats.byEnvironment).forEach(([envId, count]) => {
      const env = environments.find((e) => e.id == envId);
      if (env) {
        stats.popularEnvironments[env.name] = count;
      }
    });

    return stats;
  }

  /**
   * Search NPCs by multiple criteria
   */
  searchEntities(query) {
    const searchTerm = query.toLowerCase();
    return this.manager
      .getAll()
      .filter(
        (npc) =>
          npc.name.toLowerCase().includes(searchTerm) ||
          (npc.race && npc.race.toLowerCase().includes(searchTerm)) ||
          (npc.profession &&
            npc.profession.toLowerCase().includes(searchTerm)) ||
          npc.attitude.toLowerCase().includes(searchTerm) ||
          (npc.description &&
            npc.description.toLowerCase().includes(searchTerm)) ||
          (npc.motivations &&
            npc.motivations.toLowerCase().includes(searchTerm)) ||
          (npc.secrets && npc.secrets.toLowerCase().includes(searchTerm))
      );
  }

  /**
   * Advanced NPC filtering
   */
  filterEntities(criteria) {
    return this.manager.getAll().filter((npc) => {
      return Object.entries(criteria).every(([key, value]) => {
        switch (key) {
          case "hasInteractions":
            return value
              ? npc.interactions && npc.interactions.length > 0
              : true;
          case "minInteractions":
            return (npc.interactions ? npc.interactions.length : 0) >= value;
          case "hasSecrets":
            return value
              ? npc.secrets && npc.secrets.trim() && !npc.secretRevealed
              : true;
          case "secretsRevealed":
            return value ? npc.secretRevealed : !npc.secretRevealed;
          case "hasQuests":
            return value ? npc.quests && npc.quests.length > 0 : true;
          case "questStatus":
            if (!npc.quests) return !value;
            return npc.quests.some((quest) => quest.status === value);
          case "hasRelationships":
            return value
              ? npc.relationships && npc.relationships.length > 0
              : true;
          case "inEnvironment":
            return npc.environmentId == value;
          case "recentlyInteracted":
            if (!value || !npc.interactions) return true;
            const cutoff = new Date(Date.now() - value * 24 * 60 * 60 * 1000);
            return npc.interactions.some((int) => new Date(int.date) > cutoff);
          case "attitudeType":
            const friendlyAttitudes = [
              "Amichevole",
              "Neutrale",
              "Protettivo",
              "Entusiasta",
            ];
            const hostileAttitudes = [
              "Ostile",
              "Diffidente",
              "Sospettoso",
              "Arrogante",
            ];
            if (value === "friendly")
              return friendlyAttitudes.includes(npc.attitude);
            if (value === "hostile")
              return hostileAttitudes.includes(npc.attitude);
            return true;
          default:
            if (typeof value === "function") {
              return value(npc[key]);
            }
            return npc[key] === value;
        }
      });
    });
  }

  /**
   * Validate NPC data
   */
  validateEntity(data) {
    const errors = [];

    // Basic validation
    if (!data.name || data.name.trim().length < 2) {
      errors.push("Nome NPC deve essere almeno 2 caratteri");
    }

    if (data.name && data.name.length > 100) {
      errors.push("Nome NPC non può superare 100 caratteri");
    }

    if (!data.alignment) {
      errors.push("Allineamento è richiesto");
    }

    if (!data.attitude) {
      errors.push("Atteggiamento è richiesto");
    }

    // Validate environment exists if specified
    if (data.environmentId) {
      const environments = window.dataStore?.get("environments") || [];
      const envExists = environments.some(
        (env) => env.id == data.environmentId
      );
      if (!envExists) {
        errors.push("Ambientazione specificata non esiste");
      }
    }

    // Check for duplicate names in the same environment
    if (data.name && data.environmentId) {
      const existing = this.manager
        .getAll()
        .find(
          (npc) =>
            npc.name.toLowerCase() === data.name.toLowerCase() &&
            npc.environmentId == data.environmentId &&
            npc.id !== data.id
        );

      if (existing) {
        errors.push(
          `Esiste già un NPC con questo nome in questa ambientazione`
        );
      }
    }

    return errors;
  }

  /**
   * Export NPCs with enhanced options
   */
  exportEntities(options = {}) {
    const npcs = this.manager.getAll();
    const {
      includeStats = true,
      includeInteractions = true,
      includeSecrets = false, // Don't export secrets by default for privacy
      includeQuests = true,
      includeRelationships = true,
      format = "json",
      environmentId = null,
    } = options;

    let exportNpcs = npcs;

    // Filter by environment if specified
    if (environmentId) {
      exportNpcs = npcs.filter((npc) => npc.environmentId == environmentId);
    }

    const exportData = {
      npcs: exportNpcs.map((npc) => {
        const exported = { ...npc };

        if (!includeInteractions) delete exported.interactions;
        if (!includeSecrets) delete exported.secrets;
        if (!includeQuests) delete exported.quests;
        if (!includeRelationships) delete exported.relationships;

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
      return this.exportAsCSV(exportData.npcs);
    }

    const filename = environmentId
      ? `dnd-npcs-env-${environmentId}-${
          new Date().toISOString().split("T")[0]
        }.json`
      : `dnd-npcs-${new Date().toISOString().split("T")[0]}.json`;

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
    this.manager.showSuccess("NPCs esportati!");
  }

  /**
   * Export as CSV
   */
  exportAsCSV(npcs) {
    const headers = [
      "Nome",
      "Razza",
      "Professione",
      "Allineamento",
      "Atteggiamento",
      "Ambientazione",
      "Interazioni",
      "Ha Segreti",
      "Quest",
      "Creato",
    ];

    const environments = window.dataStore?.get("environments") || [];

    const csvData = npcs.map((npc) => {
      const environment = environments.find(
        (env) => env.id == npc.environmentId
      );

      return [
        npc.name,
        npc.race || "",
        npc.profession || "",
        npc.alignment,
        npc.attitude,
        environment ? environment.name : "Libera",
        npc.interactions ? npc.interactions.length : 0,
        npc.secrets && npc.secrets.trim() ? "Sì" : "No",
        npc.quests ? npc.quests.length : 0,
        new Date(npc.createdAt || "").toLocaleDateString("it-IT"),
      ];
    });

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dnd-npcs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Get NPCs by environment
   */
  getNPCsByEnvironment(environmentId) {
    return this.filterEntities({ environmentId: parseInt(environmentId) });
  }

  /**
   * Get NPCs for encounter selection
   */
  getNPCsForEncounter() {
    return this.manager.getAll().map((npc) => ({
      id: npc.id,
      name: npc.name,
      type: "npc",
      avatar: npc.avatar,
      attitude: npc.attitude,
      race: npc.race,
      profession: npc.profession,
      alignment: npc.alignment,
    }));
  }

  /**
   * Get NPCs by attitude type
   */
  getFriendlyNPCs() {
    return this.filterEntities({ attitudeType: "friendly" });
  }

  getHostileNPCs() {
    return this.filterEntities({ attitudeType: "hostile" });
  }

  /**
   * Get NPCs with secrets
   */
  getNPCsWithSecrets() {
    return this.filterEntities({ hasSecrets: true });
  }

  /**
   * Get NPCs with unrevealed secrets
   */
  getNPCsWithUnrevealedSecrets() {
    return this.filterEntities({ hasSecrets: true, secretsRevealed: false });
  }

  /**
   * Get most interacted NPCs
   */
  getMostInteractedNPCs(limit = 10) {
    return this.manager
      .getAll()
      .sort(
        (a, b) => (b.interactions?.length || 0) - (a.interactions?.length || 0)
      )
      .slice(0, limit);
  }

  /**
   * Get NPCs needing attention (no recent interactions)
   */
  getNPCsNeedingAttention() {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    return this.manager.getAll().filter((npc) => {
      if (!npc.interactions || npc.interactions.length === 0) return true;

      const lastInteraction = npc.interactions
        .map((int) => new Date(int.date))
        .sort((a, b) => b - a)[0];

      return lastInteraction < twoWeeksAgo;
    });
  }

  /**
   * Get quest givers
   */
  getQuestGivers() {
    return this.filterEntities({ hasQuests: true });
  }

  /**
   * Get available quests
   */
  getAvailableQuests() {
    const questGivers = this.getQuestGivers();
    const quests = [];

    questGivers.forEach((npc) => {
      if (npc.quests) {
        npc.quests
          .filter((quest) => quest.status === "available")
          .forEach((quest) => {
            quests.push({
              ...quest,
              giver: npc.name,
              giverId: npc.id,
              giverAttitude: npc.attitude,
            });
          });
      }
    });

    return quests;
  }

  /**
   * Generate relationship map
   */
  generateRelationshipMap() {
    const npcs = this.manager.getAll();
    const relationships = [];

    npcs.forEach((npc) => {
      if (npc.relationships) {
        npc.relationships.forEach((rel) => {
          relationships.push({
            from: npc.name,
            fromId: npc.id,
            relationship: rel.description,
            date: rel.date,
          });
        });
      }
    });

    return relationships;
  }

  /**
   * Get random NPC by criteria
   */
  getRandomNPC(criteria = {}) {
    const filtered = this.filterEntities(criteria);
    if (filtered.length === 0) return null;

    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  /**
   * Generate encounter suggestions based on NPCs
   */
  generateEncounterSuggestions(environmentId = null, partyLevel = 5) {
    let npcs = this.manager.getAll();

    if (environmentId) {
      npcs = npcs.filter((npc) => npc.environmentId == environmentId);
    }

    const suggestions = {
      social: [],
      combat: [],
      investigation: [],
      exploration: [],
    };

    npcs.forEach((npc) => {
      // Social encounters
      if (npc.attitude === "Amichevole" || npc.quests) {
        suggestions.social.push({
          type: "social",
          npc: npc.name,
          description: `Incontro sociale con ${npc.name}`,
          difficulty: "Easy",
        });
      }

      // Combat encounters
      if (npc.attitude === "Ostile" || npc.attitude === "Diffidente") {
        suggestions.combat.push({
          type: "combat",
          npc: npc.name,
          description: `Conflitto con ${npc.name}`,
          difficulty: "Medium",
        });
      }

      // Investigation encounters
      if (npc.secrets && !npc.secretRevealed) {
        suggestions.investigation.push({
          type: "investigation",
          npc: npc.name,
          description: `Investigare i segreti di ${npc.name}`,
          difficulty: "Hard",
        });
      }
    });

    return suggestions;
  }

  /**
   * Cleanup
   */
  destroy() {
    console.log("NPC utils destroyed");
  }
}
