import React, { useEffect, useRef, forwardRef } from "react";

export type ModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: ModalSize;
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      children,
      size = "md",
      title,
      description,
      showCloseButton = true,
      closeOnBackdropClick = true,
      closeOnEscape = true,
      preventScroll = true,
      className = "",
      overlayClassName = "",
      contentClassName = "",
    },
    ref
  ) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    // Handle escape key
    useEffect(() => {
      if (!isOpen || !closeOnEscape) return;

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, closeOnEscape, onClose]);

    // Handle body scroll
    useEffect(() => {
      if (!preventScroll) return;

      if (isOpen) {
        const scrollbarWidth =
          window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = "hidden";
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      } else {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      }

      return () => {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      };
    }, [isOpen, preventScroll]);

    // Focus management
    useEffect(() => {
      if (!isOpen) return;

      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus the modal content
      const focusModal = () => {
        const focusableElements = contentRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements && focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus();
        } else {
          contentRef.current?.focus();
        }
      };

      // Small delay to ensure modal is rendered
      const timeoutId = setTimeout(focusModal, 10);

      return () => {
        clearTimeout(timeoutId);
        // Restore focus when modal closes
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }, [isOpen]);

    // Handle backdrop click
    const handleBackdropClick = (event: React.MouseEvent) => {
      if (closeOnBackdropClick && event.target === overlayRef.current) {
        onClose();
      }
    };

    // Handle focus trap
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusableElements = contentRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    };

    if (!isOpen) return null;

    return (
      <div
        ref={overlayRef}
        className={`modal-overlay dm-modal-overlay ${overlayClassName}`}
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-description" : undefined}
      >
        <div
          ref={ref || contentRef}
          className={`modal-content dm-modal-content dm-modal-${size} ${contentClassName} ${className}`}
          tabIndex={-1}
        >
          {/* Modal Header */}
          {(title || showCloseButton) && (
            <div className="dm-modal-header">
              <div className="dm-modal-header-content">
                {title && (
                  <h2 id="modal-title" className="dm-modal-title">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" className="dm-modal-description">
                    {description}
                  </p>
                )}
              </div>

              {showCloseButton && (
                <button
                  type="button"
                  className="dm-modal-close"
                  onClick={onClose}
                  aria-label="Close modal"
                >
                  <svg
                    className="dm-modal-close-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Modal Body */}
          <div className="dm-modal-body">{children}</div>
        </div>
      </div>
    );
  }
);

Modal.displayName = "Modal";

export default Modal;

// Modal components for specific use cases
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Conferma",
  cancelText = "Annulla",
  variant = "danger",
  loading = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
    if (!loading) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={title}
      closeOnBackdropClick={!loading}
      closeOnEscape={!loading}
    >
      <div className="dm-confirm-modal">
        <div className="dm-confirm-modal-message">{message}</div>

        <div className="dm-confirm-modal-actions">
          <button
            type="button"
            className={`button-base dm-button-md dm-button-${variant}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Caricamento..." : confirmText}
          </button>
          <button
            type="button"
            className="button-base dm-button-md dm-button-secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: ModalSize;
  description?: string;
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  description,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    size={size}
    title={title}
    description={description}
  >
    <div className="dm-form-modal">{children}</div>
  </Modal>
);

// D&D specific modals
export interface CharacterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  characterName?: string;
  children: React.ReactNode;
}

export const CharacterFormModal: React.FC<CharacterFormModalProps> = ({
  isOpen,
  onClose,
  mode,
  characterName,
  children,
}) => (
  <FormModal
    isOpen={isOpen}
    onClose={onClose}
    size="lg"
    title={
      mode === "create" ? "Crea Nuovo Personaggio" : `Modifica ${characterName}`
    }
    description={
      mode === "create"
        ? "Inserisci le informazioni base del personaggio"
        : "Modifica le informazioni del personaggio"
    }
  >
    {children}
  </FormModal>
);

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType?: string;
  loading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = "elemento",
  loading = false,
}) => (
  <ConfirmModal
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title={`Elimina ${itemType}`}
    message={`Sei sicuro di voler eliminare "${itemName}"? Questa azione non può essere annullata.`}
    confirmText="Elimina"
    cancelText="Annulla"
    variant="danger"
    loading={loading}
  />
);

export interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageAlt: string;
  title?: string;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageAlt,
  title,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} size="xl" title={title}>
    <div className="dm-image-modal">
      <img src={imageUrl} alt={imageAlt} className="dm-image-modal-img" />
    </div>
  </Modal>
);
