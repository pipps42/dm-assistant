/**
 * Environment Manager - Core CRUD Operations
 */
import BaseManager from "../core/base-manager.js";
import * as EnvironmentTemplates from "../templates/environment-templates.js";
import ImageUpload from "../ui/image-upload.js";
import modalManager from "../ui/modal-manager.js";
import EnvironmentDetailView from "./environment-detail-view.js";
import EnvironmentUtils from "./environment-utils.js";

class EnvironmentManager extends BaseManager {
  constructor() {
    super("environments", EnvironmentTemplates);
    this.imageUpload = null;
    this.detailView = new EnvironmentDetailView(this);
    this.utils = new EnvironmentUtils(this);
  }

  /**
   * Apre la modale di modifica per un environment (edit)
   */
  openEditModal(environment) {
    const mode = "edit";
    const title = `Modifica Ambientazione`;
    const content = this.templates.generateForm(environment, mode);

    modalManager.open({ title, content, size: "large" });

    // Setup image upload
    const uploadContainer = document.getElementById("environment-image-upload");
    if (uploadContainer) {
      if (this.imageUpload) this.imageUpload.destroy();
      this.imageUpload = new ImageUpload(uploadContainer, {
        type: "cover",
        allowEmoji: true,
        defaultEmoji: "🏰",
        name: "image",
      });
      if (environment?.image) {
        this.imageUpload.setValue(environment.image);
      }
    }

    // Gestione submit e annulla
    const form = document.getElementById("environment-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Conversione dangers/resources
      if (data.dangers && typeof data.dangers === "string") {
        data.dangers = data.dangers
          .split(",")
          .map((d) => d.trim())
          .filter((d) => d);
      }
      if (data.resources && typeof data.resources === "string") {
        data.resources = data.resources
          .split("\n")
          .map((r) => r.trim())
          .filter((r) => r);
      }
      // Trim campi testo
      ["name", "description", "conditions", "currency", "lodgingCost"].forEach(
        (field) => {
          if (data[field]) data[field] = data[field].trim();
        }
      );
      // Immagine
      if (this.imageUpload) {
        data.image = this.imageUpload.getValue();
      }

      // Mantieni SEMPRE le mappe e altri dati non presenti nel form
      data.maps = environment.maps || [];
      data.id = environment.id;

      await this.update(environment.id, { ...environment, ...data });
      modalManager.close();
      setTimeout(() => this.detailView.viewDetail(environment.id), 100);
    });

    // Bottone annulla
    form
      .querySelectorAll(
        '.btn-cancel, [data-action="cancel"], [data-dismiss="modal"]'
      )
      .forEach((cancelBtn) => {
        cancelBtn.addEventListener("click", (e) => {
          e.preventDefault();
          modalManager.close();
        });
      });
  }

  /**
   * Override attachEvents per usare viewDetail
   */
  attachEvents() {
    const selector = `[data-environment-id]`;

    document.querySelectorAll(selector).forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;

        const id = card.getAttribute("data-environment-id");
        this.detailView.viewDetail(id);
      });
    });
  }

  /**
   * Override openForm per usare openEditModal in edit
   */
  openForm(entity = null) {
    if (entity) {
      this.openEditModal(entity);
    } else {
      // Crea nuovo environment
      const mode = "create";
      const title = "Nuova Ambientazione";
      const content = this.templates.generateForm(null, mode);

      modalManager.open({ title, content, size: "large" });

      // Setup image upload
      const uploadContainer = document.getElementById(
        "environment-image-upload"
      );
      if (uploadContainer) {
        if (this.imageUpload) this.imageUpload.destroy();
        this.imageUpload = new ImageUpload(uploadContainer, {
          type: "cover",
          allowEmoji: true,
          defaultEmoji: "🏰",
          name: "image",
        });
      }

      // Gestione submit e annulla
      const form = document.getElementById("environment-form");
      if (!form) return;

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (data.dangers && typeof data.dangers === "string") {
          data.dangers = data.dangers
            .split(",")
            .map((d) => d.trim())
            .filter((d) => d);
        }
        if (data.resources && typeof data.resources === "string") {
          data.resources = data.resources
            .split("\n")
            .map((r) => r.trim())
            .filter((r) => r);
        }
        [
          "name",
          "description",
          "conditions",
          "currency",
          "lodgingCost",
        ].forEach((field) => {
          if (data[field]) data[field] = data[field].trim();
        });
        if (this.imageUpload) {
          data.image = this.imageUpload.getValue();
        }
        data.maps = [];
        await this.create(data);
        modalManager.close();
        this.render();
      });

      form
        .querySelectorAll(
          '.btn-cancel, [data-action="cancel"], [data-dismiss="modal"]'
        )
        .forEach((cancelBtn) => {
          cancelBtn.addEventListener("click", (e) => {
            e.preventDefault();
            modalManager.close();
          });
        });
    }
  }

  // ========== DELEGATE TO UTILS ==========

  /**
   * Get environment statistics
   */
  getEnvironmentStats() {
    return this.utils.getEnvironmentStats();
  }

  /**
   * Export environments data
   */
  exportEnvironments() {
    return this.utils.exportEnvironments();
  }

  /**
   * Search environments by name, type, or description
   */
  searchEnvironments(query) {
    return this.utils.searchEnvironments(query);
  }

  /**
   * Get environments by various criteria
   */
  getEnvironmentsByType(type) {
    return this.utils.getEnvironmentsByType(type);
  }

  getEnvironmentsByClimate(climate) {
    return this.utils.getEnvironmentsByClimate(climate);
  }

  getEnvironmentsByChallengeLevel(challengeLevel) {
    return this.utils.getEnvironmentsByChallengeLevel(challengeLevel);
  }

  getEnvironmentsWithMaps() {
    return this.utils.getEnvironmentsWithMaps();
  }

  getPopulatedEnvironments() {
    return this.utils.getPopulatedEnvironments();
  }

  getDangerousEnvironments() {
    return this.utils.getDangerousEnvironments();
  }

  getSafeEnvironments() {
    return this.utils.getSafeEnvironments();
  }

  getTradingEnvironments() {
    return this.utils.getTradingEnvironments();
  }

  getMostMappedEnvironments(limit = 10) {
    return this.utils.getMostMappedEnvironments(limit);
  }

  getMostPopulatedEnvironments(limit = 10) {
    return this.utils.getMostPopulatedEnvironments(limit);
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

  /**
   * Destroy manager - cleanup
   */
  destroy() {
    this.cleanup();
    console.log("Environment manager destroyed");
  }
}

// Create and export singleton instance
const environmentManager = new EnvironmentManager();
export default environmentManager;
