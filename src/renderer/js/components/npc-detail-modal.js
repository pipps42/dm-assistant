/**
 * NPC Detail Modal Handler - Gestione modale dettaglio NPC
 * FIXED: Data attributes per compatibilità con shared-templates
 */
import { IDetailHandler } from "./manager-factory.js";
import modalManager from "../ui/modal-manager.js";

export default class NPCDetailModal extends IDetailHandler {
  constructor(manager) {
    super(manager);
  }

  /**
   * Gestisce azioni specifiche del detail NPC
   */
  async handleDetailAction(action, entity, button) {
    if (!entity) {
      console.warn("No entity provided for action:", action);
      return;
    }

    switch (action) {
      case "add-interaction":
        await this.addInteraction(entity);
        break;

      case "remove-interaction":
        const interactionId = button.dataset.itemId;
        await this.removeInteraction(entity, interactionId);
        break;

      case "change-attitude":
        await this.changeAttitude(entity);
        break;

      case "add-relationship":
        await this.addRelationship(entity);
        break;

      case "remove-relationship":
        const relationshipId = button.dataset.itemId;
        await this.removeRelationship(entity, relationshipId);
        break;

      case "add-quest":
        await this.addQuest(entity);
        break;

      case "remove-quest":
        const questId = button.dataset.itemId;
        await this.removeQuest(entity, questId);
        break;

      case "reveal-secret":
        await this.revealSecret(entity);
        break;

      case "add-dialogue":
        await this.addDialogue(entity);
        break;

      case "remove-dialogue":
        const dialogueId = button.dataset.itemId;
        await this.removeDialogue(entity, dialogueId);
        break;

      case "change-environment":
        await this.changeEnvironment(entity);
        break;

      default:
        console.log(`Unhandled NPC action: ${action}`);
    }
  }

  /**
   * Aggiungi interazione all'NPC
   */
  async addInteraction(npc) {
    const interaction = await modalManager.input({
      title: "Aggiungi Interazione",
      label: "Descrivi l'interazione con i giocatori:",
      placeholder:
        "Es. Ha fornito informazioni sulla taverna locale, si è mostrato diffidente verso il party...",
    });

    if (!interaction?.trim()) return;

    if (!npc.interactions) npc.interactions = [];

    const newInteraction = {
      id: Date.now(),
      description: interaction.trim(),
      date: new Date().toISOString(),
      session: this.getCurrentSessionNumber(),
      type: "interaction",
    };

    npc.interactions.push(newInteraction);

    await this.manager.update(npc.id, npc);
    this.refreshDetail(npc.id);
    this.manager.showSuccess("Interazione aggiunta!");
  }

  /**
   * Rimuovi interazione dall'NPC
   */
  async removeInteraction(npc, interactionId) {
    if (!npc.interactions || !interactionId) return;

    const confirmed = await modalManager.confirm({
      title: "Rimuovi Interazione",
      message: "Sei sicuro di voler rimuovere questa interazione?",
    });

    if (!confirmed) return;

    // Convert to number for index-based removal
    const id = parseInt(interactionId);

    // First try ID-based removal (for object interactions)
    const initialLength = npc.interactions.length;
    npc.interactions = npc.interactions.filter((interaction) => {
      // Handle object interactions with ID
      if (typeof interaction === "object" && interaction.id) {
        return interaction.id != interactionId;
      }
      return true;
    });

    // If no removal happened and we have a valid index, try index-based removal
    if (
      npc.interactions.length === initialLength &&
      !isNaN(id) &&
      id >= 0 &&
      id < npc.interactions.length
    ) {
      npc.interactions.splice(id, 1);
    }

    await this.manager.update(npc.id, npc);
    this.refreshDetail(npc.id);
    this.manager.showSuccess("Interazione rimossa!");
  }

  /**
   * Cambia atteggiamento dell'NPC
   */
  async changeAttitude(npc) {
    const attitudes = [
      "Amichevole",
      "Neutrale",
      "Diffidente",
      "Ostile",
      "Indifferente",
      "Curioso",
      "Protettivo",
      "Servile",
      "Arrogante",
      "Timido",
      "Sospettoso",
      "Entusiasta",
      "Cauto",
      "Coraggioso",
      "Pauroso",
    ];

    const attitudeOptions = attitudes
      .map(
        (att) =>
          `<option value="${att}" ${
            npc.attitude === att ? "selected" : ""
          }>${att}</option>`
      )
      .join("");

    const newAttitude = await modalManager.input({
      title: "Cambia Atteggiamento",
      label: "Nuovo atteggiamento:",
      inputType: "select",
      placeholder: `
        <select class="form-select" id="modal-input">
          ${attitudeOptions}
        </select>
      `,
    });

    if (!newAttitude || newAttitude === npc.attitude) return;

    const oldAttitude = npc.attitude;
    npc.attitude = newAttitude;

    // Add interaction entry for attitude change
    if (!npc.interactions) npc.interactions = [];
    npc.interactions.push({
      id: Date.now(),
      description: `Atteggiamento cambiato da "${oldAttitude}" a "${newAttitude}"`,
      date: new Date().toISOString(),
      session: this.getCurrentSessionNumber(),
      type: "attitude-change",
    });

    await this.manager.update(npc.id, npc);
    this.refreshDetail(npc.id);
    this.manager.showSuccess(`Atteggiamento cambiato in "${newAttitude}"`);
  }

  /**
   * Aggiungi relazione con altro NPC/personaggio
   */
  async addRelationship(npc) {
    const relationshipDesc = await modalManager.input({
      title: "Aggiungi Relazione",
      label: "Descrivi la relazione:",
      placeholder:
        "Es. Fratello di Marco, rivale di Elena, alleato della Gilda dei Mercanti...",
    });

    if (!relationshipDesc?.trim()) return;

    if (!npc.relationships) npc.relationships = [];

    npc.relationships.push({
      id: Date.now(),
      description: relationshipDesc.trim(),
      date: new Date().toISOString(),
      type: "relationship",
    });

    await this.manager.update(npc.id, npc);
    this.refreshDetail(npc.id);
    this.manager.showSuccess("Relazione aggiunta!");
  }

  /**
   * Rimuovi relazione
   */
  async removeRelationship(npc, relationshipId) {
    if (!npc.relationships || !relationshipId) return;

    const confirmed = await modalManager.confirm({
      title: "Rimuovi Relazione",
      message: "Sei sicuro di voler rimuovere questa relazione?",
    });

    if (!confirmed) return;

    // Convert to number for index-based removal
    const id = parseInt(relationshipId);

    // First try ID-based removal
    const initialLength = npc.relationships.length;
    npc.relationships = npc.relationships.filter((rel) => {
      if (typeof rel === "object" && rel.id) {
        return rel.id != relationshipId;
      }
      return true;
    });

    // If no removal happened and we have a valid index, try index-based removal
    if (
      npc.relationships.length === initialLength &&
      !isNaN(id) &&
      id >= 0 &&
      id < npc.relationships.length
    ) {
      npc.relationships.splice(id, 1);
    }

    await this.manager.update(npc.id, npc);
    this.refreshDetail(npc.id);
    this.manager.showSuccess("Relazione rimossa!");
  }

  /**
   * Aggiungi quest collegata all'NPC
   */
  async addQuest(npc) {
    const questDesc = await modalManager.input({
      title: "Aggiungi Quest",
      label: "Descrivi la quest:",
      placeholder:
        "Es. Cerca la spada perduta, elimina i banditi sulla strada per il villaggio...",
    });

    if (!questDesc?.trim()) return;

    if (!npc.quests) npc.quests = [];

    npc.quests.push({
      id: Date.now(),
      description: questDesc.trim(),
      status: "available", // available, in-progress, completed, failed
      date: new Date().toISOString(),
      session: this.getCurrentSessionNumber(),
    });

    await this.manager.update(npc.id, npc);
    this.refreshDetail(npc.id);
    this.manager.showSuccess("Quest aggiunta!");
  }

  /**
   * Rimuovi quest
   */
  async removeQuest(npc, questId) {
    if (!npc.quests || !questId) return;

    const confirmed = await modalManager.confirm({
      title: "Rimuovi Quest",
      message: "Sei sicuro di voler rimuovere questa quest?",
    });

    if (!confirmed) return;

    // Convert to number for index-based removal
    const id = parseInt(questId);

    // First try ID-based removal
    const initialLength = npc.quests.length;
    npc.quests = npc.quests.filter((quest) => {
      if (typeof quest === "object" && quest.id) {
        return quest.id != questId;
      }
      return true;
    });

    // If no removal happened and we have a valid index, try index-based removal
    if (
      npc.quests.length === initialLength &&
      !isNaN(id) &&
      id >= 0 &&
      id < npc.quests.length
    ) {
      npc.quests.splice(id, 1);
    }

    await this.manager.update(npc.id, npc);
    this.refreshDetail(npc.id);
    this.manager.showSuccess("Quest rimossa!");
  }

  /**
   * Rivela un segreto
   */
  async revealSecret(npc) {
    if (!npc.secrets?.trim()) {
      this.manager.showError("Questo NPC non ha segreti da rivelare");
      return;
    }

    const confirmed = await modalManager.confirm({
      title: "Rivela Segreto",
      message: `Rivelare il segreto di ${npc.name} ai giocatori?\n\nSegreto: "${npc.secrets}"`,
      confirmText: "Rivela",
    });

    if (!confirmed) return;

    // Add interaction for secret reveal
    if (!npc.interactions) npc.interactions = [];
    npc.interactions.push({
      id: Date.now(),
      description: `Ha rivelato il suo segreto: "${npc.secrets}"`,
      date: new Date().toISOString(),
      session: this.getCurrentSessionNumber(),
      type: "secret-reveal",
    });

    // Mark secret as revealed
    npc.secretRevealed = true;
    npc.secretRevealDate = new Date().toISOString();

    await this.manager.update(npc.id, npc);
    this.refreshDetail(npc.id);
    this.manager.showSuccess("Segreto rivelato!");
  }

  /**
   * Aggiungi dialogo tipico
   */
  async addDialogue(npc) {
    const dialogue = await modalManager.input({
      title: "Aggiungi Dialogo",
      label: "Dialogo tipico o frase caratteristica:",
      placeholder:
        "Es. 'Benvenuti alla mia taverna, viaggiatori!', 'Non mi fido degli stranieri...'",
    });

    if (!dialogue?.trim()) return;

    if (!npc.dialogues) npc.dialogues = [];

    npc.dialogues.push({
      id: Date.now(),
      text: dialogue.trim(),
      context: "", // greeting, quest, combat, etc.
      date: new Date().toISOString(),
    });

    await this.manager.update(npc.id, npc);
    this.refreshDetail(npc.id);
    this.manager.showSuccess("Dialogo aggiunto!");
  }

  /**
   * Rimuovi dialogo
   */
  async removeDialogue(npc, dialogueId) {
    if (!npc.dialogues || !dialogueId) return;

    const confirmed = await modalManager.confirm({
      title: "Rimuovi Dialogo",
      message: "Sei sicuro di voler rimuovere questo dialogo?",
    });

    if (!confirmed) return;

    // Convert to number for index-based removal
    const id = parseInt(dialogueId);

    // First try ID-based removal
    const initialLength = npc.dialogues.length;
    npc.dialogues = npc.dialogues.filter((dialogue) => {
      if (typeof dialogue === "object" && dialogue.id) {
        return dialogue.id != dialogueId;
      }
      return true;
    });

    // If no removal happened and we have a valid index, try index-based removal
    if (
      npc.dialogues.length === initialLength &&
      !isNaN(id) &&
      id >= 0 &&
      id < npc.dialogues.length
    ) {
      npc.dialogues.splice(id, 1);
    }

    await this.manager.update(npc.id, npc);
    this.refreshDetail(npc.id);
    this.manager.showSuccess("Dialogo rimosso!");
  }

  /**
   * Cambia ambientazione dell'NPC
   */
  async changeEnvironment(npc) {
    const environments = window.dataStore?.get("environments") || [];

    if (environments.length === 0) {
      this.manager.showError("Nessuna ambientazione disponibile");
      return;
    }

    const environmentOptions = [
      '<option value="">Nessuna ambientazione specifica</option>',
      ...environments.map(
        (env) =>
          `<option value="${env.id}" ${
            npc.environmentId == env.id ? "selected" : ""
          }>${env.name}</option>`
      ),
    ].join("");

    const newEnvironmentId = await modalManager.input({
      title: "Cambia Ambientazione",
      label: "Nuova ambientazione:",
      inputType: "select",
      placeholder: `
        <select class="form-select" id="modal-input">
          ${environmentOptions}
        </select>
      `,
    });

    if (newEnvironmentId === null) return; // User cancelled

    const oldEnvironmentId = npc.environmentId;
    npc.environmentId = newEnvironmentId || null;

    const oldEnv = environments.find((env) => env.id == oldEnvironmentId);
    const newEnv = environments.find((env) => env.id == newEnvironmentId);

    const changeDesc = `Spostato da "${oldEnv?.name || "Libera"}" a "${
      newEnv?.name || "Libera"
    }"`;

    // Add interaction for environment change
    if (!npc.interactions) npc.interactions = [];
    npc.interactions.push({
      id: Date.now(),
      description: changeDesc,
      date: new Date().toISOString(),
      session: this.getCurrentSessionNumber(),
      type: "environment-change",
    });

    await this.manager.update(npc.id, npc);
    this.refreshDetail(npc.id);
    this.manager.showSuccess(`Ambientazione cambiata: ${changeDesc}`);
  }

  /**
   * Ottieni numero sessione corrente (placeholder)
   */
  getCurrentSessionNumber() {
    // TODO: Implementare sistema di tracking sessioni
    return new Date().toLocaleDateString("it-IT");
  }
}
