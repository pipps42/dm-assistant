/**
 * NPC Detail Modal Handler - Gestione modale dettaglio NPC
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
        const interactionId = button.dataset.interactionId;
        await this.removeInteraction(entity, interactionId);
        break;

      case "change-attitude":
        await this.changeAttitude(entity);
        break;

      case "add-relationship":
        await this.addRelationship(entity);
        break;

      case "remove-relationship":
        const relationshipId = button.dataset.relationshipId;
        await this.removeRelationship(entity, relationshipId);
        break;

      case "add-quest":
        await this.addQuest(entity);
        break;

      case "remove-quest":
        const questId = button.dataset.questId;
        await this.removeQuest(entity, questId);
        break;

      case "reveal-secret":
        await this.revealSecret(entity);
        break;

      case "add-dialogue":
        await this.addDialogue(entity);
        break;

      case "remove-dialogue":
        const dialogueId = button.dataset.dialogueId;
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

    npc.interactions.push({
      id: Date.now(),
      description: interaction.trim(),
      date: new Date().toISOString(),
      session: this.getCurrentSessionNumber(),
      type: "interaction",
    });

    await this.manager.update(npc.id, npc);
    this.refreshDetail(npc.id);
    this.manager.showSuccess("Interazione aggiunta!");
  }

  /**
   * Rimuovi interazione dall'NPC
   */
  async removeInteraction(npc, interactionId) {
    if (!npc.interactions) return;

    const confirmed = await modalManager.confirm({
      title: "Rimuovi Interazione",
      message: "Sei sicuro di voler rimuovere questa interazione?",
    });

    if (!confirmed) return;

    // Handle both ID and index for legacy data
    const id = parseInt(interactionId);
    if (!isNaN(id) && id < npc.interactions.length) {
      npc.interactions.splice(id, 1);
    } else {
      npc.interactions = npc.interactions.filter(
        (int) => int.id != interactionId
      );
    }

    await this.manager.update(npc.id, npc);
    this.refreshDetail(npc.id);
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
    if (!npc.relationships) return;

    const confirmed = await modalManager.confirm({
      title: "Rimuovi Relazione",
      message: "Sei sicuro di voler rimuovere questa relazione?",
    });

    if (!confirmed) return;

    npc.relationships = npc.relationships.filter(
      (rel) => rel.id != relationshipId
    );

    await this.manager.update(npc.id, npc);
    this.refreshDetail(npc.id);
  }

  /**
   * Aggiungi quest/missione
   */
  async addQuest(npc) {
    const questDesc = await modalManager.input({
      title: "Aggiungi Quest",
      label: "Descrivi la quest che può offrire:",
      placeholder:
        "Es. Recuperare l'anello perduto della nonna, scortare un carico verso la città...",
    });

    if (!questDesc?.trim()) return;

    if (!npc.quests) npc.quests = [];

    npc.quests.push({
      id: Date.now(),
      description: questDesc.trim(),
      status: "available", // available, active, completed
      date: new Date().toISOString(),
      reward: "",
      difficulty: "medium",
    });

    await this.manager.update(npc.id, npc);
    this.refreshDetail(npc.id);
    this.manager.showSuccess("Quest aggiunta!");
  }

  /**
   * Rimuovi quest
   */
  async removeQuest(npc, questId) {
    if (!npc.quests) return;

    const confirmed = await modalManager.confirm({
      title: "Rimuovi Quest",
      message: "Sei sicuro di voler rimuovere questa quest?",
    });

    if (!confirmed) return;

    npc.quests = npc.quests.filter((quest) => quest.id != questId);

    await this.manager.update(npc.id, npc);
    this.refreshDetail(npc.id);
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
    if (!npc.dialogues) return;

    const confirmed = await modalManager.confirm({
      title: "Rimuovi Dialogo",
      message: "Sei sicuro di voler rimuovere questo dialogo?",
    });

    if (!confirmed) return;

    npc.dialogues = npc.dialogues.filter(
      (dialogue) => dialogue.id != dialogueId
    );

    await this.manager.update(npc.id, npc);
    this.refreshDetail(npc.id);
  }

  /**
   * Cambia ambientazione dell'NPC
   */
  async changeEnvironment(npc) {
    const environments = window.dataStore?.get("environments") || [];

    const environmentOptions = [
      '<option value="">Nessuna ambientazione specifica</option>',
      ...environments.map(
        (env) =>
          `<option value="${env.id}" ${
            npc.environmentId == env.id ? "selected" : ""
          }>${env.name}</option>`
      ),
    ].join("");

    // This would need a custom modal for select - simplified for now
    const environmentName = await modalManager.input({
      title: "Cambia Ambientazione",
      label: "Seleziona nuova ambientazione:",
      placeholder: "Nome dell'ambientazione (o vuoto per rimuovere)",
    });

    if (environmentName === null) return; // User cancelled

    let newEnvironmentId = null;
    if (environmentName?.trim()) {
      const foundEnv = environments.find((env) =>
        env.name.toLowerCase().includes(environmentName.toLowerCase())
      );
      if (foundEnv) {
        newEnvironmentId = foundEnv.id;
      } else {
        this.manager.showError("Ambientazione non trovata");
        return;
      }
    }

    const oldEnvironment = environments.find(
      (env) => env.id == npc.environmentId
    );
    const newEnvironment = environments.find(
      (env) => env.id == newEnvironmentId
    );

    npc.environmentId = newEnvironmentId;

    // Add interaction for environment change
    if (!npc.interactions) npc.interactions = [];
    npc.interactions.push({
      id: Date.now(),
      description: `Spostato da "${
        oldEnvironment?.name || "nessuna ambientazione"
      }" a "${newEnvironment?.name || "nessuna ambientazione"}"`,
      date: new Date().toISOString(),
      session: this.getCurrentSessionNumber(),
      type: "location-change",
    });

    await this.manager.update(npc.id, npc);
    this.refreshDetail(npc.id);
    this.manager.showSuccess("Ambientazione cambiata!");
  }

  /**
   * Refresh del contenuto della modale
   */
  refreshDetail(npcId) {
    const npc = this.manager.getById(npcId);
    if (!npc) return;

    const newContent = this.manager.templates.generateDetail(npc);
    modalManager.updateCurrentContent(newContent);
  }

  /**
   * Get current session number
   */
  getCurrentSessionNumber() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")}`;
  }

  /**
   * Generate NPC session report
   */
  generateNPCReport(npc) {
    const interactions = npc.interactions || [];
    const recentInteractions = interactions.filter((int) => {
      const intDate = new Date(int.date);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return intDate > weekAgo;
    });

    return {
      name: npc.name,
      attitude: npc.attitude,
      profession: npc.profession,
      environment: npc.environmentId,
      totalInteractions: interactions.length,
      recentInteractions: recentInteractions.length,
      hasSecrets: !!npc.secrets && !npc.secretRevealed,
      lastInteraction:
        interactions.length > 0
          ? interactions[interactions.length - 1].date
          : null,
      quests: npc.quests || [],
      relationships: npc.relationships || [],
    };
  }

  /**
   * Cleanup
   */
  destroy() {
    console.log("NPC detail modal handler destroyed");
  }
}
