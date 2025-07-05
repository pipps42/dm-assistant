/**
 * Modular NPC Manager - Versione completamente modulare
 */
import BaseManager from "../core/base-manager.js";
import * as NPCTemplates from "../templates/npc-templates.js";
import ImageUpload from "../ui/image-upload.js";
import NPCDetailModal from "./npc-detail-modal.js";
import NPCUtils from "./npc-utils.js";
import { IFormHandler } from "./manager-factory.js";

/**
 * NPC Form Handler - Gestione specifica dei form NPC
 */
class NPCFormHandler extends IFormHandler {
  constructor(manager) {
    super(manager);
    this.imageUpload = null;
  }

  processFormData(data) {
    // Convert environmentId to number or null
    if (data.environmentId === "" || data.environmentId === "null") {
      data.environmentId = null;
    } else if (data.environmentId) {
      data.environmentId = parseInt(data.environmentId);
    }

    // Get avatar from image upload
    if (this.imageUpload) {
      data.avatar = this.imageUpload.getValue();
    }

    // Trim text fields
    ["name", "description", "motivations", "secrets"].forEach((field) => {
      if (data[field]) data[field] = data[field].trim();
    });

    // Process dialogue field if present
    if (data.dialogue && typeof data.dialogue === "string") {
      const dialogues = data.dialogue
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line)
        .map((line) => ({
          id: Date.now() + Math.random(),
          text: line,
          context: "general",
          date: new Date().toISOString(),
        }));

      data.dialogues = [...(data.dialogues || []), ...dialogues];
      delete data.dialogue;
    }
  }

  setupFormComponents(entity, mode) {
    // Setup image upload
    const uploadContainer = document.getElementById("npc-avatar-upload");
    if (uploadContainer) {
      // Cleanup existing upload component
      if (this.imageUpload) {
        this.imageUpload.destroy();
      }

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

    // Setup environment suggestions
    this.setupEnvironmentSuggestions(entity);

    // Setup profession-based suggestions
    this.setupProfessionSuggestions();

    // Setup dialogue helpers
    this.setupDialogueHelpers();
  }

  setupEnvironmentSuggestions(entity) {
    const environmentSelect = document.querySelector(
      'select[name="environmentId"]'
    );
    const professionSelect = document.querySelector(
      'select[name="profession"]'
    );

    if (!environmentSelect || !professionSelect) return;

    // When profession changes, suggest appropriate environments
    professionSelect.addEventListener("change", () => {
      const profession = professionSelect.value;
      this.highlightSuggestedEnvironments(profession, environmentSelect);
    });

    // Initial setup
    if (entity?.profession) {
      this.highlightSuggestedEnvironments(entity.profession, environmentSelect);
    }
  }

  highlightSuggestedEnvironments(profession, selectElement) {
    const suggestions = {
      Mercante: ["Città", "Villaggio", "Mercato", "Porto"],
      Guardia: ["Città", "Villaggio", "Fortezza", "Castello"],
      Taverniere: ["Città", "Villaggio", "Taverna"],
      Fabbro: ["Città", "Villaggio", "Fortezza"],
      Agricoltore: ["Villaggio", "Pianura"],
      Soldato: ["Fortezza", "Castello", "Città"],
      Chierico: ["Tempio", "Città", "Villaggio"],
      Studioso: ["Biblioteca", "Accademia", "Torre", "Città"],
      Ladro: ["Città", "Porto", "Rovine"],
      Bardo: ["Taverna", "Città", "Castello"],
      Cacciatore: ["Foresta", "Montagna", "Villaggio"],
      Pescatore: ["Costa", "Porto", "Villaggio"],
      Nobile: ["Castello", "Città", "Fortezza"],
      Mago: ["Torre", "Biblioteca", "Accademia"],
      Druido: ["Foresta", "Montagna", "Palude"],
    };

    const suggested = suggestions[profession] || [];

    // Reset all options
    Array.from(selectElement.options).forEach((option) => {
      option.style.fontWeight = "normal";
      option.style.backgroundColor = "";
    });

    // Highlight suggested options
    if (suggested.length > 0) {
      Array.from(selectElement.options).forEach((option) => {
        const environments = window.dataStore?.get("environments") || [];
        const env = environments.find((e) => e.id == option.value);
        if (env && suggested.includes(env.type)) {
          option.style.fontWeight = "bold";
          option.style.backgroundColor = "var(--accent-color, #e3f2fd)";
        }
      });
    }
  }

  setupProfessionSuggestions() {
    const professionSelect = document.querySelector(
      'select[name="profession"]'
    );
    const motivationsInput = document.querySelector(
      'input[name="motivations"]'
    );

    if (!professionSelect || !motivationsInput) return;

    professionSelect.addEventListener("change", () => {
      const profession = professionSelect.value;
      if (profession && !motivationsInput.value.trim()) {
        const suggestion = this.getMotivationSuggestion(profession);
        motivationsInput.placeholder = suggestion;
      }
    });
  }

  getMotivationSuggestion(profession) {
    const motivations = {
      Mercante: "Accumulare ricchezze, espandere il commercio",
      Guardia: "Mantenere ordine e sicurezza, proteggere i cittadini",
      Taverniere: "Offrire ospitalità, raccogliere informazioni",
      Fabbro: "Creare oggetti di qualità, servire la comunità",
      Agricoltore: "Nutrire la famiglia, proteggere i raccolti",
      Soldato: "Servire con onore, proteggere la patria",
      Chierico: "Diffondere la fede, aiutare i bisognosi",
      Studioso: "Acquisire conoscenza, svelare misteri",
      Ladro: "Sopravvivere, accumulare tesori",
      Bardo: "Intrattenere, preservare storie e leggende",
      Cacciatore: "Vivere in armonia con la natura, procacciare cibo",
      Pescatore: "Mantenere la famiglia, rispettare il mare",
      Nobile: "Mantenere status sociale, influenzare politica",
      Mago: "Padroneggiare la magia, scoprire segreti arcani",
      Druido: "Proteggere la natura, mantenere equilibrio",
    };

    return (
      motivations[profession] || "Raggiungere i propri obiettivi personali"
    );
  }

  setupDialogueHelpers() {
    const dialogueSection = document.querySelector(".dialogue-section");
    if (!dialogueSection) return;

    // Add dialogue quick-add buttons
    const quickDialogueContainer = document.createElement("div");
    quickDialogueContainer.className = "quick-dialogue-container";
    quickDialogueContainer.innerHTML = `
      <small class="form-help">
        <strong>Dialoghi rapidi:</strong>
        <button type="button" class="btn-link dialogue-btn" data-type="greeting">Saluto</button>
        <button type="button" class="btn-link dialogue-btn" data-type="suspicious">Sospettoso</button>
        <button type="button" class="btn-link dialogue-btn" data-type="helpful">Disponibile</button>
        <button type="button" class="btn-link dialogue-btn" data-type="dismissive">Scortese</button>
      </small>
    `;

    const dialogueTextarea = document.querySelector(
      'textarea[name="dialogue"]'
    );
    if (dialogueTextarea) {
      dialogueTextarea.parentNode.appendChild(quickDialogueContainer);

      quickDialogueContainer.addEventListener("click", (e) => {
        const dialogueBtn = e.target.closest(".dialogue-btn");
        if (!dialogueBtn) return;

        const suggestion = this.getDialogueSuggestion(dialogueBtn.dataset.type);
        if (suggestion) {
          const currentValue = dialogueTextarea.value.trim();
          const newValue = currentValue
            ? `${currentValue}\n${suggestion}`
            : suggestion;
          dialogueTextarea.value = newValue;
        }
      });
    }
  }

  getDialogueSuggestion(type) {
    const suggestions = {
      greeting: "Benvenuto, viaggiatore. Cosa ti porta qui?",
      suspicious:
        "Non mi fido degli stranieri... state attenti ai vostri passi.",
      helpful: "Sarò felice di aiutarvi! Cosa posso fare per voi?",
      dismissive: "Non ho tempo per chiacchiere. Sbrigatevi.",
    };

    return suggestions[type] || "";
  }

  destroy() {
    if (this.imageUpload) {
      this.imageUpload.destroy();
      this.imageUpload = null;
    }
  }
}

/**
 * Main NPC Manager Class
 */
class NPCManager extends BaseManager {
  constructor() {
    super("npcs", NPCTemplates, {
      hasDetailView: false, // Uses modal
      hasUtils: true,
      hasFormComponents: true,
    });

    this.initializeComponents();
  }

  initializeComponents() {
    // Initialize modular components
    this.detailHandler = new NPCDetailModal(this);
    this.utils = new NPCUtils(this);
    this.formHandler = new NPCFormHandler(this);
  }

  /**
   * Process form data - delegate to form handler
   */
  processFormData(data) {
    if (this.formHandler) {
      this.formHandler.processFormData(data);
    }
  }

  /**
   * Setup form components - delegate to form handler
   */
  setupFormComponents(entity, mode) {
    if (this.formHandler) {
      this.formHandler.setupFormComponents(entity, mode);
    }
  }

  // ========== DELEGATE METHODS TO UTILS ==========

  /**
   * Get NPCs by environment
   */
  getNPCsByEnvironment(environmentId) {
    return this.utils.getNPCsByEnvironment(environmentId);
  }

  /**
   * Get NPCs for encounter selection
   */
  getNPCsForEncounter() {
    return this.utils.getNPCsForEncounter();
  }

  /**
   * Generate NPC selection list
   */
  generateSelectionList() {
    const npcs = this.getAll();
    return npcs
      .map((npc) => this.templates.generateSelectionOption(npc))
      .join("");
  }

  /**
   * Get NPC statistics
   */
  getNPCStats() {
    return this.utils.getEntityStats();
  }

  /**
   * Export NPCs with options
   */
  exportNPCs(options = {}) {
    return this.utils.exportEntities(options);
  }

  /**
   * Search NPCs
   */
  searchNPCs(query) {
    return this.utils.searchEntities(query);
  }

  /**
   * Get NPCs by various criteria
   */
  getNPCsByAttitude(attitude) {
    return this.utils.filterEntities({ attitude });
  }

  getNPCsByRace(race) {
    return this.utils.filterEntities({ race });
  }

  getNPCsByProfession(profession) {
    return this.utils.filterEntities({ profession });
  }

  getFriendlyNPCs() {
    return this.utils.getFriendlyNPCs();
  }

  getHostileNPCs() {
    return this.utils.getHostileNPCs();
  }

  getNPCsWithSecrets() {
    return this.utils.getNPCsWithSecrets();
  }

  getNPCsWithUnrevealedSecrets() {
    return this.utils.getNPCsWithUnrevealedSecrets();
  }

  getMostInteractedNPCs(limit = 10) {
    return this.utils.getMostInteractedNPCs(limit);
  }

  getNPCsNeedingAttention() {
    return this.utils.getNPCsNeedingAttention();
  }

  getQuestGivers() {
    return this.utils.getQuestGivers();
  }

  getAvailableQuests() {
    return this.utils.getAvailableQuests();
  }

  // ========== SPECIALIZED NPC METHODS ==========

  /**
   * Open form with preselected environment
   */
  openFormWithEnvironment(environmentId) {
    const entity = { environmentId: parseInt(environmentId) };
    this.openForm(entity);
  }

  /**
   * Bulk attitude change
   */
  async bulkChangeAttitude(npcIds, newAttitude) {
    const npcs = npcIds.map((id) => this.getById(id)).filter(Boolean);

    if (npcs.length === 0) {
      this.showError("Nessun NPC selezionato");
      return;
    }

    const confirmed = await modalManager.confirm({
      title: "Cambio Atteggiamento Multiplo",
      message: `Cambiare l'atteggiamento di ${npcs.length} NPCs in "${newAttitude}"?`,
      confirmText: "Cambia",
    });

    if (!confirmed) return;

    let updated = 0;
    for (const npc of npcs) {
      const oldAttitude = npc.attitude;
      npc.attitude = newAttitude;

      // Add interaction entry
      if (!npc.interactions) npc.interactions = [];
      npc.interactions.push({
        id: Date.now() + Math.random(),
        description: `Atteggiamento cambiato da "${oldAttitude}" a "${newAttitude}" (operazione multipla)`,
        date: new Date().toISOString(),
        session: new Date().toISOString().split("T")[0],
        type: "attitude-change",
      });

      await this.update(npc.id, npc);
      updated++;
    }

    this.showSuccess(
      `Atteggiamento di ${updated} NPCs cambiato in "${newAttitude}"!`
    );
  }

  /**
   * Bulk environment transfer
   */
  async bulkTransferEnvironment(npcIds, newEnvironmentId) {
    const npcs = npcIds.map((id) => this.getById(id)).filter(Boolean);
    const environments = window.dataStore?.get("environments") || [];
    const newEnvironment = environments.find(
      (env) => env.id == newEnvironmentId
    );

    if (npcs.length === 0) {
      this.showError("Nessun NPC selezionato");
      return;
    }

    const envName = newEnvironment
      ? newEnvironment.name
      : "nessuna ambientazione";
    const confirmed = await modalManager.confirm({
      title: "Trasferimento Multiplo",
      message: `Trasferire ${npcs.length} NPCs in "${envName}"?`,
      confirmText: "Trasferisci",
    });

    if (!confirmed) return;

    let updated = 0;
    for (const npc of npcs) {
      const oldEnvironment = environments.find(
        (env) => env.id == npc.environmentId
      );
      npc.environmentId = newEnvironmentId;

      // Add interaction entry
      if (!npc.interactions) npc.interactions = [];
      npc.interactions.push({
        id: Date.now() + Math.random(),
        description: `Trasferito da "${
          oldEnvironment?.name || "nessuna ambientazione"
        }" a "${envName}" (operazione multipla)`,
        date: new Date().toISOString(),
        session: new Date().toISOString().split("T")[0],
        type: "location-change",
      });

      await this.update(npc.id, npc);
      updated++;
    }

    this.showSuccess(`${updated} NPCs trasferiti in "${envName}"!`);
  }

  /**
   * Generate random NPC
   */
  generateRandomNPC(environmentId = null) {
    const races = this.templates.NPC_DATA.races;
    const professions = this.templates.NPC_DATA.professions;
    const alignments = this.templates.NPC_DATA.alignments;
    const attitudes = this.templates.NPC_DATA.attitudes;

    const randomNPC = {
      name: this.generateRandomName(),
      race: races[Math.floor(Math.random() * races.length)],
      profession: professions[Math.floor(Math.random() * professions.length)],
      alignment: alignments[Math.floor(Math.random() * alignments.length)],
      attitude: attitudes[Math.floor(Math.random() * attitudes.length)],
      environmentId: environmentId,
      description: "NPC generato casualmente",
      avatar: "🧙",
      interactions: [],
      relationships: [],
      quests: [],
    };

    return randomNPC;
  }

  /**
   * Generate random name
   */
  generateRandomName() {
    const firstNames = [
      "Aldric",
      "Brenna",
      "Caius",
      "Delara",
      "Ewan",
      "Fiora",
      "Gareth",
      "Hilda",
      "Ivan",
      "Jora",
      "Kael",
      "Lyra",
      "Magnus",
      "Nora",
      "Orin",
      "Petra",
      "Quinn",
      "Rosa",
      "Soren",
      "Thea",
      "Ulric",
      "Vera",
      "Willem",
      "Xara",
      "Yorick",
      "Zara",
    ];

    const lastNames = [
      "Forgiavento",
      "Pietraferma",
      "Lunachiara",
      "Tempesta",
      "Fogliadoro",
      "Martellonero",
      "Fiammarossa",
      "Ghiaccio",
      "Stellaverde",
      "Ombraluna",
      "Corlame",
      "Cantavento",
      "Pioggiasera",
      "Solealto",
      "Nebbiascura",
      "Fulmine",
    ];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
  }

  /**
   * Generate relationship map for environment
   */
  generateEnvironmentRelationshipMap(environmentId) {
    const npcs = this.getNPCsByEnvironment(environmentId);
    return this.utils
      .generateRelationshipMap()
      .filter((rel) => npcs.some((npc) => npc.id === rel.fromId));
  }

  /**
   * Generate encounter suggestions
   */
  generateEncounterSuggestions(environmentId = null, partyLevel = 5) {
    return this.utils.generateEncounterSuggestions(environmentId, partyLevel);
  }

  /**
   * Cleanup quando necessario
   */
  cleanup() {
    if (this.formHandler) {
      this.formHandler.destroy();
    }
  }

  /**
   * Destroy manager - cleanup
   */
  destroy() {
    this.cleanup();
    super.destroy();
  }
}

// Create and export singleton instance
export default NPCManager;
export const npcManager = new NPCManager();
