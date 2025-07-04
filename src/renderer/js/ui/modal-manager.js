/**
 * Modal Manager - Versione semplice e funzionale
 * Una modale alla volta, gestione diretta, niente stack complessi
 */
class ModalManager {
  constructor() {
    this.currentModal = null;
    this.isOpen = false;
    this.resolver = null;
  }

  init() {
    this.modal = document.getElementById("modal");
    this.modalTitle = document.getElementById("modal-title");
    this.modalBody = document.getElementById("modal-body");
    this.closeButton = document.getElementById("modal-close");

    // Setup event listeners
    this.closeButton.addEventListener("click", () => this.close());

    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) this.close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) this.close();
    });
  }

  /**
   * Apri modale con contenuto
   */
  open({ title, content, size = "medium" }) {
    // Chiudi eventuali modali esistenti
    this.close();

    this.modalTitle.textContent = title;
    this.modalBody.innerHTML = content;
    this.modal.className = `modal modal-${size}`;

    this.show();
    this.currentModal = { title, content, size };

    return this;
  }

  /**
   * Mostra modale di conferma
   */
  confirm({
    title,
    message,
    confirmText = "Conferma",
    cancelText = "Annulla",
  }) {
    const content = `
      <p style="margin-bottom: 20px;">${message}</p>
      <div class="flex gap-1" style="justify-content: flex-end;">
        <button type="button" class="btn btn-secondary" data-action="cancel">${cancelText}</button>
        <button type="button" class="btn btn-danger" data-action="confirm">${confirmText}</button>
      </div>
    `;

    this.open({ title, content, size: "small" });

    return new Promise((resolve) => {
      this.resolver = resolve;
      this.modalBody.addEventListener(
        "click",
        this.handleConfirmClick.bind(this),
        { once: true }
      );
    });
  }

  /**
   * Mostra modale di input
   */
  input({ title, label, placeholder = "", inputType = "textarea" }) {
    const inputHtml =
      inputType === "textarea"
        ? `<textarea class="form-textarea" id="modal-input" placeholder="${placeholder}" style="min-height: 80px;"></textarea>`
        : `<input type="${inputType}" class="form-input" id="modal-input" placeholder="${placeholder}">`;

    const content = `
      <div class="form-group">
        <label class="form-label">${label}</label>
        ${inputHtml}
      </div>
      <div class="flex gap-1 mt-2" style="justify-content: flex-end;">
        <button type="button" class="btn btn-secondary" data-action="cancel">Annulla</button>
        <button type="button" class="btn btn-primary" data-action="confirm">Conferma</button>
      </div>
    `;

    this.open({ title, content, size: "medium" });

    return new Promise((resolve) => {
      this.resolver = resolve;
      this.modalBody.addEventListener(
        "click",
        this.handleInputClick.bind(this),
        { once: true }
      );
      setTimeout(() => document.getElementById("modal-input")?.focus(), 100);
    });
  }

  /**
   * Handler per click nelle modali di conferma
   */
  handleConfirmClick(e) {
    const action = e.target.dataset.action;
    if (!action) return;

    const result = action === "confirm";
    this.resolver?.(result);
    this.close();
  }

  /**
   * Handler per click nelle modali di input
   */
  handleInputClick(e) {
    const action = e.target.dataset.action;
    if (!action) return;

    let result = null;
    if (action === "confirm") {
      const input = document.getElementById("modal-input");
      result = input?.value || null;
    }

    this.resolver?.(result);
    this.close();
  }

  /**
   * Mostra la modale
   */
  show() {
    this.modal.style.display = "block";
    document.body.style.overflow = "hidden";
    this.isOpen = true;
  }

  /**
   * Chiudi modale
   */
  close() {
    if (!this.isOpen) return;

    this.modal.style.display = "none";
    document.body.style.overflow = "auto";
    this.isOpen = false;
    this.currentModal = null;

    // Risolvi promise pending con null
    if (this.resolver) {
      this.resolver(null);
      this.resolver = null;
    }
  }
}

// Singleton
const modalManager = new ModalManager();
export default modalManager;
