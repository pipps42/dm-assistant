/**
 * Modular Character Manager - Versione completamente modulare
 */
import BaseManager from "../core/base-manager.js";
import * as CharacterTemplates from "../templates/character-templates.js";
import ImageUpload from "../ui/image-upload.js";
import CharacterDetailModal from "./character-detail-modal.js";
import CharacterUtils from "./character-utils.js";
import { IFormHandler } from "./manager-factory.js";

/**
 * Character Form Handler - Gestione specifica dei form personaggi
 */
class CharacterFormHandler extends IFormHandler {
  constructor(manager) {
    super(manager);
    this.imageUpload = null;
  }

  processFormData(data) {
    // Convert strings to numbers
    data.level = parseInt(data.level) || 1;
    data.hitPoints = data.hitPoints ? parseInt(data.hitPoints) : null;

    // Get avatar from image upload
    if (this.imageUpload) {
      data.avatar = this.imageUpload.getValue();
    }

    // Trim strings
    ["name", "playerName", "background"].forEach((field) => {
      if (data[field]) data[field] = data[field].trim();
    });

    // Ensure arrays exist
    if (!data.adventures) data.adventures = [];
    if (!data.notes) data.notes = [];

    // Convert equipment if present
    if (data.equipment && typeof data.equipment === "string") {
      data.equipment = data.equipment
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item);
    }
  }

  setupFormComponents(entity, mode) {
    // Setup image upload
    const uploadContainer = document.getElementById("character-avatar-upload");
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

    // Setup level-based HP suggestion
    this.setupHPSuggestion(entity);

    // Setup background templates
    this.setupBackgroundTemplates();
  }

  setupHPSuggestion(entity) {
    const levelInput = document.querySelector('input[name="level"]');
    const hpInput = document.querySelector('input[name="hitPoints"]');
    const classSelect = document.querySelector('select[name="class"]');

    if (!levelInput || !hpInput || !classSelect) return;

    const updateHPSuggestion = () => {
      const level = parseInt(levelInput.value) || 1;
      const characterClass = classSelect.value;

      if (characterClass && !hpInput.value) {
        const suggestedHP = this.calculateSuggestedHP(characterClass, level);
        hpInput.placeholder = `Suggerito: ${suggestedHP}`;
      }
    };

    levelInput.addEventListener("change", updateHPSuggestion);
    classSelect.addEventListener("change", updateHPSuggestion);

    // Initial calculation
    updateHPSuggestion();
  }

  calculateSuggestedHP(characterClass, level) {
    const hitDice = {
      Barbaro: 12,
      Guerriero: 10,
      Paladino: 10,
      Ranger: 10,
      Bardo: 8,
      Chierico: 8,
      Druido: 8,
      Monaco: 8,
      Ladro: 8,
      Warlock: 8,
      Stregone: 6,
      Mago: 6,
    };

    const hitDie = hitDice[characterClass] || 8;
    const averageRoll = hitDie / 2 + 1;

    // First level gets max hit die + subsequent levels get average
    return hitDie + Math.floor(averageRoll * (level - 1));
  }

  setupBackgroundTemplates() {
    const backgroundTextarea = document.querySelector(
      'textarea[name="background"]'
    );
    if (!backgroundTextarea) return;

    // Add background template suggestions
    const templatesContainer = document.createElement("div");
    templatesContainer.className = "background-templates";
    templatesContainer.innerHTML = `
      <small class="form-help">
        <strong>Template suggeriti:</strong>
        <button type="button" class="btn-link template-btn" data-template="hero">Eroe Classico</button>
        <button type="button" class="btn-link template-btn" data-template="mysterious">Passato Misterioso</button>
        <button type="button" class="btn-link template-btn" data-template="noble">Nobile Decaduto</button>
        <button type="button" class="btn-link template-btn" data-template="scholar">Studioso</button>
      </small>
    `;

    backgroundTextarea.parentNode.appendChild(templatesContainer);

    // Handle template clicks
    templatesContainer.addEventListener("click", (e) => {
      const templateBtn = e.target.closest(".template-btn");
      if (!templateBtn) return;

      const template = this.getBackgroundTemplate(templateBtn.dataset.template);
      if (template && !backgroundTextarea.value.trim()) {
        backgroundTextarea.value = template;
      }
    });
  }

  getBackgroundTemplate(type) {
    const templates = {
      hero: "Nato in un piccolo villaggio, ha sempre sentito il richiamo dell'avventura. Un evento tragico lo ha spinto a intraprendere il cammino dell'eroe per proteggere gli innocenti e fare giustizia.",
      mysterious:
        "Il suo passato è avvolto nel mistero. Pochi ricordi frammentari e cicatrici raccontano di una vita precedente che preferisce tenere nascosta. Solo il tempo rivelerà la verità.",
      noble:
        "Un tempo membro di una famiglia nobile, ha perso tutto a causa di intrighi politici. Ora cerca di ricostruire il proprio onore e di vendicare i torti subiti.",
      scholar:
        "Dedicato allo studio delle arti arcane e dei misteri del mondo, ha lasciato la sua torre d'avorio per mettere alla prova le sue conoscenze nel mondo reale.",
    };

    return templates[type] || "";
  }

  destroy() {
    if (this.imageUpload) {
      this.imageUpload.destroy();
      this.imageUpload = null;
    }
  }
}

/**
 * Main Character Manager Class
 */
class CharacterManager extends BaseManager {
  constructor() {
    super("characters", CharacterTemplates, {
      hasDetailView: false, // Uses modal
      hasUtils: true,
      hasFormComponents: true,
    });

    this.initializeComponents();
  }

  initializeComponents() {
    // Initialize modular components
    this.detailHandler = new CharacterDetailModal(this);
    this.utils = new CharacterUtils(this);
    this.formHandler = new CharacterFormHandler(this);
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
   * Get characters for encounter selection
   */
  getCharactersForEncounter() {
    return this.utils.getCharactersForEncounter();
  }

  /**
   * Generate character selection list
   */
  generateSelectionList() {
    const characters = this.getAll();
    return characters
      .map((character) => this.templates.generateSelectionOption(character))
      .join("");
  }

  /**
   * Get character statistics
   */
  getCharacterStats() {
    return this.utils.getEntityStats();
  }

  /**
   * Export characters with options
   */
  exportCharacters(options = {}) {
    return this.utils.exportEntities(options);
  }

  /**
   * Search characters
   */
  searchCharacters(query) {
    return this.utils.searchEntities(query);
  }

  /**
   * Get characters by various criteria
   */
  getCharactersByLevel(minLevel, maxLevel) {
    return this.utils.getCharactersByLevel(minLevel, maxLevel);
  }

  getCharactersByClass(className) {
    return this.utils.getCharactersByClass(className);
  }

  getCharactersByRace(race) {
    return this.utils.getCharactersByRace(race);
  }

  getCharactersByPlayer(playerName) {
    return this.utils.getCharactersByPlayer(playerName);
  }

  getMostActiveCharacters(limit = 10) {
    return this.utils.getMostActiveCharacters(limit);
  }

  getCharactersNeedingAttention() {
    return this.utils.getCharactersNeedingAttention();
  }

  /**
   * Party analysis
   */
  analyzePartyComposition(characterIds) {
    return this.utils.analyzePartyComposition(characterIds);
  }

  getRandomCharacter(criteria = {}) {
    return this.utils.getRandomCharacter(criteria);
  }

  // ========== QUICK ACTIONS ==========

  /**
   * Quick level up for multiple characters
   */
  async bulkLevelUp(characterIds, levels = 1) {
    const characters = characterIds
      .map((id) => this.getById(id))
      .filter(Boolean);

    if (characters.length === 0) {
      this.showError("Nessun personaggio selezionato");
      return;
    }

    const confirmed = await modalManager.confirm({
      title: "Avanzamento di Livello Multiplo",
      message: `Fare avanzare ${characters.length} personaggi di ${levels} livello/i?`,
      confirmText: "Avanza Tutti",
    });

    if (!confirmed) return;

    let updated = 0;
    for (const character of characters) {
      if (character.level + levels <= 20) {
        character.level += levels;

        // Add adventure entry
        if (!character.adventures) character.adventures = [];
        character.adventures.push({
          id: Date.now() + Math.random(),
          description: `Avanzamento di ${levels} livello/i (bulk operation)`,
          date: new Date().toISOString(),
          type: "level-up",
          session: new Date().toISOString().split("T")[0],
        });

        await this.update(character.id, character);
        updated++;
      }
    }

    this.showSuccess(
      `${updated} personaggi hanno guadagnato ${levels} livello/i!`
    );
  }

  /**
   * Quick note addition to multiple characters
   */
  async addNoteToMultiple(characterIds, note) {
    const characters = characterIds
      .map((id) => this.getById(id))
      .filter(Boolean);

    if (characters.length === 0 || !note?.trim()) return;

    for (const character of characters) {
      if (!character.notes) character.notes = [];

      character.notes.push({
        id: Date.now() + Math.random(),
        text: note.trim(),
        date: new Date().toISOString(),
        session: new Date().toISOString().split("T")[0],
      });

      await this.update(character.id, character);
    }

    this.showSuccess(`Nota aggiunta a ${characters.length} personaggi!`);
  }

  // ========== CAMPAIGN INTEGRATION ==========

  /**
   * Create session report for characters
   */
  generateSessionReport(characterIds, sessionNotes = "") {
    const characters = characterIds
      .map((id) => this.getById(id))
      .filter(Boolean);
    const sessionDate = new Date().toISOString().split("T")[0];

    const report = {
      date: sessionDate,
      characters: characters.map((char) => ({
        name: char.name,
        player: char.playerName,
        level: char.level,
        class: char.class,
        race: char.race,
        recentAdventures: (char.adventures || [])
          .filter(
            (adv) => typeof adv === "object" && adv.session === sessionDate
          )
          .map((adv) => adv.description),
      })),
      notes: sessionNotes,
      partyAnalysis: this.analyzePartyComposition(characterIds),
    };

    return report;
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
export default CharacterManager;
export const characterManager = new CharacterManager();
