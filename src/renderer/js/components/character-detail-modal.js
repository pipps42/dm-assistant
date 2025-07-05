/**
 * Character Detail Modal Handler - Gestione modale dettaglio personaggio
 */
import { IDetailHandler } from "./manager-factory.js";
import modalManager from "../ui/modal-manager.js";

export default class CharacterDetailModal extends IDetailHandler {
  constructor(manager) {
    super(manager);
  }

  /**
   * Gestisce azioni specifiche del detail personaggi
   */
  async handleDetailAction(action, entity, button) {
    if (!entity) {
      console.warn("No entity provided for action:", action);
      return;
    }

    switch (action) {
      case "add-adventure":
        await this.addAdventure(entity);
        break;

      case "remove-adventure":
        const adventureId = button.dataset.adventureId;
        await this.removeAdventure(entity, adventureId);
        break;

      case "level-up":
        await this.levelUp(entity);
        break;

      case "update-hp":
        await this.updateHP(entity);
        break;

      case "add-note":
        await this.addNote(entity);
        break;

      case "remove-note":
        const noteId = button.dataset.noteId;
        await this.removeNote(entity, noteId);
        break;

      default:
        console.log(`Unhandled character action: ${action}`);
    }
  }

  /**
   * Aggiungi impresa al personaggio
   */
  async addAdventure(character) {
    const adventure = await modalManager.input({
      title: "Aggiungi Impresa",
      label: "Descrivi l'impresa:",
      placeholder: "Es. Ha sconfitto il drago rosso nelle Montagne del Nord...",
    });

    if (!adventure?.trim()) return;

    if (!character.adventures) character.adventures = [];

    character.adventures.push({
      id: Date.now(),
      description: adventure.trim(),
      date: new Date().toISOString(),
      session: this.getCurrentSessionNumber(),
    });

    await this.manager.update(character.id, character);
    this.refreshDetail(character.id);
  }

  /**
   * Rimuovi impresa dal personaggio
   */
  async removeAdventure(character, adventureId) {
    if (!character.adventures) return;

    const confirmed = await modalManager.confirm({
      title: "Rimuovi Impresa",
      message: "Sei sicuro di voler rimuovere questa impresa?",
    });

    if (!confirmed) return;

    // Handle both ID and index for legacy data
    const id = parseInt(adventureId);
    if (!isNaN(id) && id < character.adventures.length) {
      character.adventures.splice(id, 1);
    } else {
      character.adventures = character.adventures.filter(
        (adv) => adv.id != adventureId
      );
    }

    await this.manager.update(character.id, character);
    this.refreshDetail(character.id);
  }

  /**
   * Level up del personaggio
   */
  async levelUp(character) {
    if (character.level >= 20) {
      this.manager.showError(
        "Il personaggio ha già raggiunto il livello massimo (20)"
      );
      return;
    }

    const confirmed = await modalManager.confirm({
      title: "Avanzamento di Livello",
      message: `Fare avanzare ${character.name} dal livello ${
        character.level
      } al livello ${character.level + 1}?`,
      confirmText: "Avanza",
    });

    if (!confirmed) return;

    // Calculate HP increase (could be random or average)
    const hpIncrease = await modalManager.input({
      title: "Aumento Punti Ferita",
      label: `HP guadagnati al livello ${character.level + 1}:`,
      placeholder: "Inserisci i punti ferita guadagnati",
      inputType: "number",
    });

    const hpGain = parseInt(hpIncrease) || 0;

    character.level += 1;
    if (character.hitPoints && hpGain > 0) {
      character.hitPoints += hpGain;
    }

    // Add level up adventure
    if (!character.adventures) character.adventures = [];
    character.adventures.push({
      id: Date.now(),
      description: `Avanzamento al livello ${character.level}${
        hpGain > 0 ? ` (+${hpGain} HP)` : ""
      }`,
      date: new Date().toISOString(),
      type: "level-up",
      session: this.getCurrentSessionNumber(),
    });

    await this.manager.update(character.id, character);
    this.refreshDetail(character.id);
    this.manager.showSuccess(
      `${character.name} è avanzato al livello ${character.level}!`
    );
  }

  /**
   * Aggiorna HP del personaggio
   */
  async updateHP(character) {
    const currentHP = character.hitPoints || 0;

    const newHP = await modalManager.input({
      title: "Aggiorna Punti Ferita",
      label: `HP attuali: ${currentHP}. Nuovi HP massimi:`,
      placeholder: currentHP.toString(),
      inputType: "number",
    });

    if (!newHP || isNaN(parseInt(newHP))) return;

    const hp = parseInt(newHP);
    if (hp < 1 || hp > 999) {
      this.manager.showError("I punti ferita devono essere tra 1 e 999");
      return;
    }

    character.hitPoints = hp;
    await this.manager.update(character.id, character);
    this.refreshDetail(character.id);
    this.manager.showSuccess("Punti ferita aggiornati!");
  }

  /**
   * Aggiungi nota al personaggio
   */
  async addNote(character) {
    const note = await modalManager.input({
      title: "Aggiungi Nota",
      label: "Nota sul personaggio:",
      placeholder: "Es. Ha paura dei ragni, preferisce le armi a distanza...",
    });

    if (!note?.trim()) return;

    if (!character.notes) character.notes = [];

    character.notes.push({
      id: Date.now(),
      text: note.trim(),
      date: new Date().toISOString(),
      session: this.getCurrentSessionNumber(),
    });

    await this.manager.update(character.id, character);
    this.refreshDetail(character.id);
  }

  /**
   * Rimuovi nota dal personaggio
   */
  async removeNote(character, noteId) {
    if (!character.notes) return;

    const confirmed = await modalManager.confirm({
      title: "Rimuovi Nota",
      message: "Sei sicuro di voler rimuovere questa nota?",
    });

    if (!confirmed) return;

    character.notes = character.notes.filter((note) => note.id != noteId);

    await this.manager.update(character.id, character);
    this.refreshDetail(character.id);
  }

  /**
   * Refresh del contenuto della modale
   */
  refreshDetail(characterId) {
    const character = this.manager.getById(characterId);
    if (!character) return;

    const newContent = this.manager.templates.generateDetail(character);
    modalManager.updateCurrentContent(newContent);
  }

  /**
   * Get current session number (could be enhanced with session tracking)
   */
  getCurrentSessionNumber() {
    // This could be enhanced to track actual session numbers
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")}`;
  }

  /**
   * Generate character sheet export
   */
  async exportCharacterSheet(character) {
    const adventures = character.adventures || [];
    const notes = character.notes || [];

    const sheetData = {
      name: character.name,
      playerName: character.playerName,
      race: character.race,
      class: character.class,
      level: character.level,
      alignment: character.alignment,
      hitPoints: character.hitPoints,
      background: character.background,
      adventures: adventures.map((adv) => ({
        description: typeof adv === "string" ? adv : adv.description,
        date: typeof adv === "object" ? adv.date : null,
        session: typeof adv === "object" ? adv.session : null,
      })),
      notes: notes.map((note) => ({
        text: note.text,
        date: note.date,
        session: note.session,
      })),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(sheetData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${character.name.replace(/[^a-zA-Z0-9]/g, "_")}_sheet.json`;
    a.click();

    URL.revokeObjectURL(url);
    this.manager.showSuccess("Scheda personaggio esportata!");
  }

  /**
   * Create character backup
   */
  async createCharacterBackup(character) {
    const backup = {
      ...character,
      backupDate: new Date().toISOString(),
      backupReason: "Manual backup",
    };

    // Store in a hypothetical backup system
    // For now, just export as file
    this.exportCharacterSheet(backup);
  }

  /**
   * Cleanup
   */
  destroy() {
    // Cleanup any character-specific resources
    console.log("Character detail modal handler destroyed");
  }
}
