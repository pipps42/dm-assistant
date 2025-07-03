/**
 * Image Upload Component - Componente riutilizzabile per upload immagini
 * Supporta drag & drop, preview, validazione, compressione
 */
import EventBus from "../core/event-bus.js";

class ImageUpload {
  constructor(container, options = {}) {
    this.container =
      typeof container === "string"
        ? document.getElementById(container)
        : container;

    this.options = {
      acceptedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      maxSize: 5 * 1024 * 1024, // 5MB
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.8,
      placeholder: "Trascina un'immagine qui o seleziona file",
      subtext: "Formati supportati: JPG, PNG, GIF, WebP",
      allowEmoji: true,
      defaultEmoji: "🖼️",
      type: "avatar", // avatar, cover, general
      ...options,
    };

    this.eventBus = EventBus;
    this.currentImage = null;
    this.isInitialized = false;

    if (this.container) {
      this.init();
    }
  }

  /**
   * Initialize the upload component
   */
  init() {
    if (this.isInitialized) return;

    this.render();
    this.setupEventListeners();
    this.isInitialized = true;

    this.eventBus.emit("imageUpload:initialized", {
      container: this.container,
      options: this.options,
    });
  }

  /**
   * Render the upload component
   */
  render() {
    const typeClass = `image-upload-${this.options.type}`;

    this.container.className = `image-upload-container ${typeClass}`;
    this.container.innerHTML = `
            <div class="image-upload-content">
                <div class="image-preview-container" style="display: none;">
                    <img class="image-preview" alt="Preview">
                    <button type="button" class="image-remove-btn" title="Rimuovi immagine">×</button>
                </div>
                
                <div class="image-placeholder">
                    <div class="placeholder-icon">${
                      this.options.defaultEmoji
                    }</div>
                    <div class="placeholder-text">
                        <p>${this.options.placeholder}</p>
                        <button type="button" class="btn-link image-select-btn">seleziona file</button>
                    </div>
                    <small class="placeholder-subtext">${
                      this.options.subtext
                    }</small>
                </div>
                
                ${this.options.allowEmoji ? this.renderEmojiSection() : ""}
            </div>
            
            <input type="file" class="image-file-input" accept="${this.options.acceptedTypes.join(
              ","
            )}" style="display: none;">
            <input type="hidden" class="image-data-input" name="${
              this.options.name || "image"
            }">
        `;

    this.cacheElements();
  }

  /**
   * Render emoji selection section
   */
  renderEmojiSection() {
    if (this.options.type !== "avatar") return "";

    return `
            <div class="emoji-selection">
                <p>Oppure scegli un emoji:</p>
                <div class="emoji-options">
                    ${this.getEmojiOptions()
                      .map(
                        (emoji) =>
                          `<button type="button" class="emoji-btn" data-emoji="${emoji}">${emoji}</button>`
                      )
                      .join("")}
                </div>
            </div>
        `;
  }

  /**
   * Get emoji options based on type
   */
  getEmojiOptions() {
    const emojiSets = {
      avatar: [
        "🧙",
        "⚔️",
        "🛡️",
        "🏹",
        "🗡️",
        "🔮",
        "📜",
        "🎲",
        "👑",
        "🦸",
        "🧝",
        "🧚",
      ],
      cover: [
        "🏰",
        "🗺️",
        "🌲",
        "⛰️",
        "🏔️",
        "🏜️",
        "🌊",
        "🔥",
        "❄️",
        "⚡",
        "🌟",
        "🌙",
      ],
      general: [
        "📁",
        "📊",
        "📈",
        "📋",
        "📝",
        "💡",
        "🔍",
        "⚙️",
        "🎯",
        "🚀",
        "⭐",
        "🔥",
      ],
    };

    return emojiSets[this.options.type] || emojiSets.general;
  }

  /**
   * Cache DOM elements
   */
  cacheElements() {
    this.fileInput = this.container.querySelector(".image-file-input");
    this.dataInput = this.container.querySelector(".image-data-input");
    this.preview = this.container.querySelector(".image-preview");
    this.previewContainer = this.container.querySelector(
      ".image-preview-container"
    );
    this.placeholder = this.container.querySelector(".image-placeholder");
    this.selectBtn = this.container.querySelector(".image-select-btn");
    this.removeBtn = this.container.querySelector(".image-remove-btn");
    this.emojiSection = this.container.querySelector(".emoji-selection");
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // File input change
    this.fileInput.addEventListener("change", (e) => this.handleFileSelect(e));

    // Select button click
    this.selectBtn.addEventListener("click", () => this.fileInput.click());

    // Remove button click
    if (this.removeBtn) {
      this.removeBtn.addEventListener("click", () => this.removeImage());
    }

    // Drag and drop
    this.container.addEventListener("dragover", (e) => this.handleDragOver(e));
    this.container.addEventListener("dragleave", (e) =>
      this.handleDragLeave(e)
    );
    this.container.addEventListener("drop", (e) => this.handleDrop(e));

    // Emoji selection
    if (this.emojiSection) {
      this.emojiSection.addEventListener("click", (e) =>
        this.handleEmojiSelect(e)
      );
    }
  }

  /**
   * Handle file selection
   */
  async handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      await this.processFile(file);
    }
  }

  /**
   * Handle drag over
   */
  handleDragOver(event) {
    event.preventDefault();
    this.container.classList.add("drag-over");
  }

  /**
   * Handle drag leave
   */
  handleDragLeave(event) {
    event.preventDefault();
    if (!this.container.contains(event.relatedTarget)) {
      this.container.classList.remove("drag-over");
    }
  }

  /**
   * Handle drop
   */
  async handleDrop(event) {
    event.preventDefault();
    this.container.classList.remove("drag-over");

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (this.validateFile(file)) {
        await this.processFile(file);
      }
    }
  }

  /**
   * Handle emoji selection
   */
  handleEmojiSelect(event) {
    const emojiBtn = event.target.closest(".emoji-btn");
    if (!emojiBtn) return;

    const emoji = emojiBtn.dataset.emoji;
    this.setEmoji(emoji);
  }

  /**
   * Process uploaded file
   */
  async processFile(file) {
    try {
      // Validate file
      if (!this.validateFile(file)) return;

      // Show loading state
      this.showLoading();

      // Process and compress image
      const processedImage = await this.compressImage(file);

      // Set the image
      this.setImage(processedImage);

      this.eventBus.emit("imageUpload:fileProcessed", {
        originalFile: file,
        processedImage,
        container: this.container,
      });
    } catch (error) {
      console.error("Error processing image:", error);
      this.showError("Errore durante l'elaborazione dell'immagine");
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Validate file
   */
  validateFile(file) {
    // Check file type
    if (!this.options.acceptedTypes.includes(file.type)) {
      this.showError(
        `Formato file non supportato. Usa: ${this.options.acceptedTypes.join(
          ", "
        )}`
      );
      return false;
    }

    // Check file size
    if (file.size > this.options.maxSize) {
      const maxSizeMB = (this.options.maxSize / (1024 * 1024)).toFixed(1);
      this.showError(`File troppo grande. Massimo ${maxSizeMB}MB`);
      return false;
    }

    return true;
  }

  /**
   * Compress image
   */
  compressImage(file) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = this.calculateDimensions(
          img.width,
          img.height,
          this.options.maxWidth,
          this.options.maxHeight
        );

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          },
          "image/jpeg",
          this.options.quality
        );
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calculate optimal dimensions
   */
  calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    let width = originalWidth;
    let height = originalHeight;

    // Calculate scale factor
    const scaleX = maxWidth / width;
    const scaleY = maxHeight / height;
    const scale = Math.min(scaleX, scaleY, 1); // Don't upscale

    width = Math.round(width * scale);
    height = Math.round(height * scale);

    return { width, height };
  }

  /**
   * Set image from base64 data
   */
  setImage(base64Data) {
    this.currentImage = base64Data;
    this.dataInput.value = base64Data;

    this.preview.src = base64Data;
    this.previewContainer.style.display = "block";
    this.placeholder.style.display = "none";

    if (this.emojiSection) {
      this.emojiSection.style.display = "none";
    }

    this.eventBus.emit("imageUpload:imageSet", {
      image: base64Data,
      container: this.container,
    });
  }

  /**
   * Set emoji
   */
  setEmoji(emoji) {
    this.currentImage = emoji;
    this.dataInput.value = emoji;

    this.previewContainer.style.display = "none";
    this.placeholder.style.display = "block";
    this.placeholder.querySelector(".placeholder-icon").textContent = emoji;

    // Update emoji buttons
    if (this.emojiSection) {
      this.emojiSection.querySelectorAll(".emoji-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.emoji === emoji);
      });
    }

    this.eventBus.emit("imageUpload:emojiSet", {
      emoji,
      container: this.container,
    });
  }

  /**
   * Remove image
   */
  removeImage() {
    this.currentImage = null;
    this.dataInput.value = this.options.defaultEmoji || "";

    this.previewContainer.style.display = "none";
    this.placeholder.style.display = "block";
    this.placeholder.querySelector(".placeholder-icon").textContent =
      this.options.defaultEmoji;

    if (this.emojiSection) {
      this.emojiSection.style.display = "block";
      this.emojiSection.querySelectorAll(".emoji-btn").forEach((btn) => {
        btn.classList.remove("active");
      });
    }

    // Reset file input
    this.fileInput.value = "";

    this.eventBus.emit("imageUpload:imageRemoved", {
      container: this.container,
    });
  }

  /**
   * Get current value
   */
  getValue() {
    return (
      this.currentImage || this.dataInput.value || this.options.defaultEmoji
    );
  }

  /**
   * Set value programmatically
   */
  setValue(value) {
    if (!value) {
      this.removeImage();
      return;
    }

    if (value.startsWith("data:image")) {
      this.setImage(value);
    } else {
      this.setEmoji(value);
    }
  }

  /**
   * Show loading state
   */
  showLoading() {
    this.container.classList.add("loading");
    const icon = this.placeholder.querySelector(".placeholder-icon");
    if (icon) {
      icon.innerHTML = '<div class="loading-spinner-small"></div>';
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    this.container.classList.remove("loading");
    const icon = this.placeholder.querySelector(".placeholder-icon");
    if (icon) {
      icon.textContent = this.options.defaultEmoji;
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    window.app?.showError(message);
    this.eventBus.emit("imageUpload:error", {
      message,
      container: this.container,
    });
  }

  /**
   * Destroy the component
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = "";
      this.container.className = "";
    }

    this.isInitialized = false;
    this.currentImage = null;
  }
}

/**
 * Factory function for creating image upload components
 */
export function createImageUpload(container, options) {
  return new ImageUpload(container, options);
}

export default ImageUpload;
