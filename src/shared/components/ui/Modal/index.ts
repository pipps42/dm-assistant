// Import CSS styles
import "./Modal.css";

export { default as Modal } from "./Modal";
export type { ModalProps, ModalSize } from "./Modal";

// Specialized modal components
export {
  ConfirmModal,
  FormModal,
  CharacterFormModal,
  DeleteConfirmModal,
  ImagePreviewModal,
} from "./Modal";

export type {
  ConfirmModalProps,
  FormModalProps,
  CharacterFormModalProps,
  DeleteConfirmModalProps,
  ImagePreviewModalProps,
} from "./Modal";
