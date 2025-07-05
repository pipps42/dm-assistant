/**
 * Modal Manager - Versione Ultra-Semplice con Stack Funzionante
 */
class ModalManager {
  constructor() {
    this.modalStack = [];
    this.isOpen = false;
    this.resolvers = new Map();
  }

  init() {
    this.modal = document.getElementById("modal");
    this.modalTitle = document.getElementById("modal-title");
    this.modalBody = document.getElementById("modal-body");
    this.closeButton = document.getElementById("modal-close");

    this.closeButton.addEventListener("click", () => this.close());
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) this.close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) this.close();
    });
  }

  open({ title, content, size = "medium" }) {
    const modalConfig = { title, content, size, id: this.generateId() };
    this.modalStack.push(modalConfig);
    this.render();
    return modalConfig.id;
  }

  render() {
    if (this.modalStack.length === 0) {
      this.hide();
      return;
    }

    const current = this.modalStack[this.modalStack.length - 1];
    this.modalTitle.textContent = current.title;
    this.modalBody.innerHTML = current.content;
    this.modal.className = `modal modal-${current.size}`;
    this.show();
  }

  close() {
    if (this.modalStack.length === 0) return;

    const closed = this.modalStack.pop();
    const resolver = this.resolvers.get(closed.id);
    if (resolver) {
      resolver(null);
      this.resolvers.delete(closed.id);
    }

    this.render();
  }

  closeAll() {
    this.resolvers.forEach((r) => r(null));
    this.resolvers.clear();
    this.modalStack = [];
    this.hide();
  }

  confirm({
    title,
    message,
    confirmText = "Conferma",
    cancelText = "Annulla",
  }) {
    const content = `
      <p>${message}</p>
      <div class="flex gap-1" style="justify-content: flex-end;">
        <button type="button" class="btn btn-secondary" onclick="modalManager.close()">${cancelText}</button>
        <button type="button" class="btn btn-danger" onclick="modalManager.resolveConfirm(true)">${confirmText}</button>
      </div>`;

    const id = this.open({ title, content, size: "small" });
    return new Promise((resolve) => this.resolvers.set(id, resolve));
  }

  input({ title, label, placeholder = "", inputType = "textarea" }) {
    const inputHtml =
      inputType === "textarea"
        ? `<textarea class="form-textarea" id="modal-input" placeholder="${placeholder}"></textarea>`
        : `<input type="${inputType}" class="form-input" id="modal-input" placeholder="${placeholder}">`;

    const content = `
      <div class="form-group">
        <label class="form-label">${label}</label>
        ${inputHtml}
      </div>
      <div class="flex gap-1 mt-2" style="justify-content: flex-end;">
        <button type="button" class="btn btn-secondary" onclick="modalManager.close()">Annulla</button>
        <button type="button" class="btn btn-primary" onclick="modalManager.resolveInput()">Conferma</button>
      </div>`;

    const id = this.open({ title, content, size: "medium" });
    setTimeout(() => document.getElementById("modal-input")?.focus(), 100);
    return new Promise((resolve) => this.resolvers.set(id, resolve));
  }

  resolveConfirm(result) {
    const current = this.modalStack[this.modalStack.length - 1];
    const resolver = this.resolvers.get(current.id);
    if (resolver) {
      resolver(result);
      this.resolvers.delete(current.id);
    }
    this.close();
  }

  resolveInput() {
    const input = document.getElementById("modal-input");
    const value = input ? input.value : null;
    this.resolveConfirm(value);
  }

  // Metodo specifico per refresh content
  updateCurrentContent(newContent) {
    if (this.modalStack.length > 0) {
      this.modalStack[this.modalStack.length - 1].content = newContent;
      this.render();
    }
  }

  show() {
    this.modal.style.display = "block";
    document.body.style.overflow = "hidden";
    this.isOpen = true;
  }

  hide() {
    this.modal.style.display = "none";
    document.body.style.overflow = "auto";
    this.isOpen = false;
  }

  generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 5);
  }
}

const modalManager = new ModalManager();
// Esponi globalmente per onclick inline
window.modalManager = modalManager;
export default modalManager;
