// src/shared/components/ui/TextArea/index.ts

// Import CSS styles
import "./TextArea.css";

export { default as TextArea } from "./TextArea";
export type {
  TextAreaProps,
  TextAreaVariant,
  TextAreaSize,
  TextAreaState,
  TextAreaResize,
} from "./TextArea";

// D&D specific preset components
export {
  CharacterBackgroundTextArea,
  DMNotesTextArea,
  QuestDescriptionTextArea,
  EnvironmentDescriptionTextArea,
  NPCPersonalityTextArea,
} from "./TextArea";
