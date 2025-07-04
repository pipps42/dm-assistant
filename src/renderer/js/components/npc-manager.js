/**
 * NPC Manager - Versione semplice che estende BaseManager
 * Gestisce solo le specificità degli NPC
 */
import BaseManager from "../core/base-manager.js";
import * as NPCTemplates from "../templates/npc-templates.js";
import ImageUpload from "../ui/image-upload.js";
import modalManager from "../ui/modal-manager.js";

class NPCManager extends BaseManager {
  constructor() {
    super("npcs", NPCTemplates);
    this.imageUpload = null;
  }

  /**
   * Process form data specifico per gli NPC
   */
  processFormData(data) {
    // Convert environmentId to number or null
    data.environmentId = data.environmentId
      ? parseInt(data.environmentId)
      : null;

    // Get avatar from image upload
    if (this.imageUpload) {
      data.avatar = this.imageUpload.getValue();
    }

    // Trim text fields
    ["name", "description", "motivations", "secrets"].forEach((field) => {
      if (data[field]) data[field] = data[field].trim();
    });

    // Ensure interactions array exists
    if (!data.interactions) data.interactions = [];
  }

  /**
   * Setup componenti specifici del form NPC
   */
  setupFormComponents(entity, mode) {
    // Setup image upload
    const uploadContainer = document.getElementById("npc-avatar-upload");
    if (uploadContainer) {
      this.imageUpload = new ImageUpload(uploadContainer, {
        type: "avatar",
        allowEmoji: true,
        defaultEmoji: "🧙",
        name: "avatar",
      });

      if (entity?.avatar) {
        this.imageUpload.setValue(entity.avatar);
      }
    }
  }

  /**
   * Gestisce azioni specifiche del detail NPC
   */
  async handleDetailAction(action, entity, button) {
    switch (action) {
      case "add-interaction":
        await this.addInteraction(entity);
        break;

      case "remove-interaction":
        const interactionId = button.dataset.interactionId;
        await this.removeInteraction(entity, interactionId);
        break;

      case "view-npc":
        const npcId = button.dataset.npcId;
        await this.openDetail(npcId);
        break;
    }
  }

  /**
   * Aggiungi interazione all'NPC
   */
  async addInteraction(npc) {
    const interaction = await modalManager.input({
      title: "Aggiungi Interazione",
      label: "Descrivi l'interazione con i giocatori:",
      placeholder: "Es. Ha fornito informazioni sulla taverna locale...",
    });

    if (!interaction?.trim()) return;

    if (!npc.interactions) npc.interactions = [];

    npc.interactions.push({
      id: Date.now(),
      description: interaction.trim(),
      date: new Date().toISOString(),
    });

    await this.update(npc.id, npc);

    // Riapri il detail aggiornato
    setTimeout(() => this.openDetail(npc.id), 100);
  }

  /**
   * Rimuovi interazione dall'NPC
   */
  async removeInteraction(npc, interactionId) {
    if (!npc.interactions) return;

    // Handle both ID and index for legacy data
    const id = parseInt(interactionId);
    if (!isNaN(id) && id < npc.interactions.length) {
      npc.interactions.splice(id, 1);
    } else {
      npc.interactions = npc.interactions.filter(
        (int) => int.id != interactionId
      );
    }

    await this.update(npc.id, npc);

    // Riapri il detail aggiornato
    setTimeout(() => this.openDetail(npc.id), 100);
  }

  /**
   * Apri form con ambiente preselezionato
   */
  openFormWithEnvironment(environmentId) {
    const entity = { environmentId: parseInt(environmentId) };
    this.openForm(entity);
  }

  /**
   * Get NPCs by environment
   */
  getNPCsByEnvironment(environmentId) {
    return this.getAll().filter((npc) => npc.environmentId == environmentId);
  }

  /**
   * Get NPCs for encounter selection
   */
  getNPCsForEncounter() {
    return this.getAll().map((npc) => ({
      id: npc.id,
      name: npc.name,
      type: "npc",
      avatar: npc.avatar,
      attitude: npc.attitude,
      race: npc.race,
      profession: npc.profession,
    }));
  }

  /**
   * Generate selection options HTML
   */
  generateSelectionList() {
    return this.getAll()
      .map((npc) => this.templates.generateSelectionOption(npc))
      .join("");
  }

  /**
   * Export NPCs data
   */
  exportNPCs() {
    const npcs = this.getAll();
    const exportData = {
      npcs,
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dnd-npcs-${new Date().toISOString().split("T")[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
    this.showSuccess("NPCs esportati!");
  }

  /**
   * Get NPC statistics
   */
  getNPCStats() {
    const npcs = this.getAll();

    const stats = {
      total: npcs.length,
      byAttitude: {},
      byRace: {},
      byEnvironment: {},
      totalInteractions: 0,
    };

    npcs.forEach((npc) => {
      // Count by attitude
      stats.byAttitude[npc.attitude] =
        (stats.byAttitude[npc.attitude] || 0) + 1;

      // Count by race
      if (npc.race) {
        stats.byRace[npc.race] = (stats.byRace[npc.race] || 0) + 1;
      }

      // Count by environment
      if (npc.environmentId) {
        stats.byEnvironment[npc.environmentId] =
          (stats.byEnvironment[npc.environmentId] || 0) + 1;
      }

      // Count interactions
      stats.totalInteractions += npc.interactions ? npc.interactions.length : 0;
    });

    return stats;
  }

  /**
   * Cleanup quando necessario
   */
  cleanup() {
    if (this.imageUpload) {
      this.imageUpload.destroy();
      this.imageUpload = null;
    }
  }
}

// Singleton
const npcManager = new NPCManager();
export default npcManager;
