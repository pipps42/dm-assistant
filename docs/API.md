# D&D Dungeon Master Assistant - API Documentation

## 📋 Overview del Progetto

**D&D Dungeon Master Assistant** è un'applicazione Electron per la gestione di campagne D&D 5e con architettura modulare avanzata. L'applicazione gestisce personaggi, NPC, ambientazioni e fornisce strumenti di supporto per Dungeon Master.

### Tecnologie Principali

- **Frontend**: Vanilla JavaScript ES6+ con moduli
- **Backend**: Electron (Node.js)
- **Persistenza**: File JSON tramite Electron API
- **Architettura**: Pattern modulare con Factory e componenti riutilizzabili

---

## 🏗️ Architettura del Sistema

### Core Architecture Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  app.js  │  Manager Registry  │  System Utilities              │
├─────────────────────────────────────────────────────────────────┤
│                        MANAGER LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│ BaseManager │ CharacterManager │ NPCManager │ EnvironmentManager│
├─────────────────────────────────────────────────────────────────┤
│                      COMPONENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│ DetailHandlers │ Utils │ FormHandlers │ Templates              │
├─────────────────────────────────────────────────────────────────┤
│                         CORE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  DataStore  │  EventBus  │  ModalManager  │  ImageUpload       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 API dei Manager Principali

### BaseManager (base-manager.js)

**Classe base per tutti i manager con CRUD completo e architettura modulare.**

```javascript
class BaseManager {
  constructor(entityType, templates, options = {})

  // CRUD Operations
  getAll()                          // Ottiene tutte le entità
  getById(id)                       // Ottiene entità per ID
  async create(data)                // Crea nuova entità
  async update(id, data)            // Aggiorna entità
  async delete(id)                  // Elimina entità

  // Rendering & UI
  async render()                    // Renderizza la vista
  attachEvents()                    // Attacca event listeners
  openForm(entity = null)           // Apre form create/edit
  openDetail(id)                    // Apre vista dettaglio

  // Search & Filter
  search(query)                     // Ricerca entità
  filter(criteria)                  // Filtra per criteri

  // Statistics & Export
  getStats()                        // Statistiche entità
  export()                          // Esporta dati

  // Utilities
  getDisplayName()                  // Nome entità per UI
  showSuccess(message)              // Mostra notifica successo
  showError(message)                // Mostra notifica errore
}
```

### ManagerFactory (manager-factory.js)

**Factory pattern per creare e gestire manager uniformemente.**

```javascript
class ManagerFactory {
  // Registration
  static register(entityType, config)
  static registerComponent(name, ComponentClass)

  // Creation
  static create(entityType)
  static createAll()
  static createValidated(entityType)

  // Validation
  static validateManager(manager)
}

// Configuration Builder
class ManagerConfigBuilder {
  setManagerClass(ManagerClass)
  setTemplates(templates)
  addUtilsClass(UtilsClass)
  addDetailHandler(DetailHandlerClass)
  addFormHandler(FormHandlerClass)
  build()
}
```

### ManagerRegistry (manager-setup-bootstrap.js)

**Registry centralizzato per accesso ai manager.**

```javascript
class ManagerRegistry {
  static init(managers)
  static getManager(entityType)
  static getAllManagers()
  static async executeOnAll(methodName, ...args)
  static getSystemStats()
  static cleanup()
}
```

---

## 📊 Manager Specifici

### CharacterManager

```javascript
class CharacterManager extends BaseManager {
  // Character-specific methods
  async bulkLevelUp(characterIds, levels = 1)
  async addNoteToMultiple(characterIds, note)
  generateSessionReport(characterIds, sessionNotes)
  analyzePartyComposition(characterIds)

  // Delegation to utils
  getCharactersByLevel(minLevel, maxLevel)
  getCharactersByClass(className)
  getMostActiveCharacters(limit = 10)
}
```

### NPCManager

```javascript
class NPCManager extends BaseManager {
  // NPC-specific methods
  openFormWithEnvironment(environmentId)
  async bulkChangeAttitude(npcIds, newAttitude)
  async bulkTransferEnvironment(npcIds, newEnvironmentId)
  generateRandomNPC(environmentId = null)

  // Delegation to utils
  getNPCsByEnvironment(environmentId)
  getFriendlyNPCs()
  getNPCsWithSecrets()
  getQuestGivers()
}
```

### EnvironmentManager

```javascript
class EnvironmentManager extends BaseManager {
  // Environment-specific methods
  openEditModal(environment)

  // Delegation to utils and detail view
  getEnvironmentsByType(type)
  getPopulatedEnvironments()
  getDangerousEnvironments()
  getMostMappedEnvironments(limit = 10)
}
```

---

## 🎨 Sistema di Template

### Template Structure

Ogni entità ha il proprio modulo template con funzioni standard:

```javascript
// Esempio: character-templates.js
export function generateForm(character = null, mode = "create")
export function generateDetail(character)
export function generateCard(character)
export function generateListItem(character)
export const CHARACTER_DATA = { /* costanti D&D */ }
```

### Template Functions

- **`generateForm(entity, mode)`**: Form per create/edit
- **`generateDetail(entity)`**: Vista dettaglio completa
- **`generateCard(entity)`**: Card nella griglia principale
- **`generateListItem(entity)`**: Item compatto per liste

---

## 💾 DataStore API

### Core DataStore (data-store.js)

```javascript
class DataStore {
  async init()

  // Collections Management
  get(collection)
  findById(collection, id)
  find(collection, criteria = {})

  // CRUD Operations
  async add(collection, data)
  async update(collection, id, updates)
  async remove(collection, id)
  async clear(collection)

  // Settings
  getSetting(key, defaultValue = null)
  async setSetting(key, value)

  // Import/Export
  export(collections = null)
  async import(importData, options = {})
  async backup()
}
```

### Collections

- **`characters`**: Personaggi giocatori
- **`npcs`**: Non-Player Characters
- **`environments`**: Ambientazioni e mappe
- **`monsters`**: Creature (future)
- **`encounters`**: Incontri di combattimento (future)
- **`settings`**: Impostazioni applicazione

---

## 🎯 Sistema di Eventi

### EventBus (event-bus.js)

```javascript
class EventBus {
  on(eventName, callback)           // Ascolta evento
  once(eventName, callback)         // Ascolta una volta
  off(eventName, callback)          // Rimuovi listener
  emit(eventName, data = null)      // Emetti evento
  clear(eventName = null)           // Pulisci listeners
}
```

### Eventi Standard

```javascript
// DataStore Events
"dataStore:initialized";
"dataStore:${collection}:added";
"dataStore:${collection}:updated";
"dataStore:${collection}:removed";

// Form Events
"form:initialized";
"form:submit";
"form:validated";
"form:fieldChanged";

// Image Upload Events
"imageUpload:initialized";
"imageUpload:imageSet";
"imageUpload:emojiSet";
```

---

## 🖼️ Componenti UI

### ImageUpload (image-upload.js)

```javascript
class ImageUpload {
  constructor(container, options = {})

  // Core Methods
  setValue(value)                   // Imposta valore
  getValue()                        // Ottiene valore
  setImage(base64Data)              // Imposta immagine
  setEmoji(emoji)                   // Imposta emoji
  removeImage()                     // Rimuove immagine

  // File Processing
  async processFile(file)           // Elabora file
  compressImage(file)               // Comprimi immagine
  validateFile(file)                // Valida file
}
```

### ModalManager (modal-manager.js)

```javascript
class ModalManager {
  init()
  open({ title, content, size = "medium" })
  close()
  closeAll()

  // Helper Modals
  async confirm({ title, message, confirmText, cancelText })
  async input({ title, label, placeholder, inputType })

  updateCurrentContent(newContent)
}
```

---

## 🛠️ Utility Classes

### SystemUtilities

```javascript
class SystemUtilities {
  static async globalSearch(query)
  static async exportAllData(options = {})
  static async importAllData(fileData)
  static performHealthCheck()
}
```

### Entity Utils Pattern

Ogni manager ha una classe Utils dedicata che implementa `IEntityUtils`:

```javascript
class EntityUtils extends IEntityUtils {
  getEntityStats()                  // Statistiche entità
  searchEntities(query)             // Ricerca avanzata
  validateEntity(data)              // Validazione dati
  exportEntities(options = {})      // Export personalizzato
  filterEntities(criteria)          // Filtri avanzati
}
```

---

## 🎮 Form Handling System

### IFormHandler Interface

```javascript
class FormHandler extends IFormHandler {
  processFormData(data)             // Elabora dati form
  setupFormComponents(entity, mode) // Setup componenti (upload, etc.)
  destroy()                         // Cleanup
}
```

### FormHandler Implementations

- **CharacterFormHandler**: Calcolo HP, template background
- **NPCFormHandler**: Suggerimenti ambientazione, dialoghi
- **EnvironmentFormHandler**: Gestione immagini copertina

---

## 📋 Detail Handler System

### IDetailHandler Interface

```javascript
class DetailHandler extends IDetailHandler {
  async handleDetailAction(action, entity, button)
  refreshDetail(entityId)
  destroy()
}
```

### Azioni Standard

```javascript
// Common Actions
"edit"; // Modifica entità
"delete"; // Elimina entità
"close"; // Chiudi vista

// Character Actions
"add-adventure", "remove-adventure";
"level-up", "update-hp";
"add-note", "remove-note";

// NPC Actions
"add-interaction", "remove-interaction";
"change-attitude", "reveal-secret";
"add-relationship", "add-quest";

// Environment Actions
"add-map", "remove-map";
"add-npc", "view-npc";
```

---

## 🔍 Search & Filter API

### Search Interface

```javascript
// Global Search
const results = await SystemUtilities.globalSearch("query");
// Returns: { characters: [...], npcs: [...], environments: [...] }

// Manager Search
const characters = characterManager.search("Gandalf");
const npcs = npcManager.searchEntities("mercante");
```

### Filter Criteria Examples

```javascript
// Character Filters
characterManager.filter({
  minLevel: 5,
  maxLevel: 10,
  class: "Guerriero",
  hasAdventures: true,
});

// NPC Filters
npcManager.filter({
  attitudeType: "friendly",
  inEnvironment: environmentId,
  hasSecrets: true,
  recentlyInteracted: 7, // days
});

// Environment Filters
environmentManager.filter({
  type: "Città",
  challengeLevel: "Medio",
  hasNPCs: true,
});
```

---

## 📊 Statistics API

### System Stats

```javascript
const stats = ManagerRegistry.getSystemStats();
/* Returns:
{
  totalEntities: number,
  managerStats: {
    character: { total: number, recent: number },
    npc: { total: number, recent: number },
    environment: { total: number, recent: number }
  },
  systemHealth: "healthy" | "degraded" | "unhealthy"
}
*/
```

### Entity-Specific Stats

```javascript
// Character Stats
const charStats = characterManager.getStats();
/* Returns:
{
  total, levelCounts, classCounts, raceCounts,
  averageLevel, highestLevel, experiencedPlayers, ...
}
*/

// NPC Stats
const npcStats = npcManager.getStats();
/* Returns: 
{
  total, byAttitude, byRace, byProfession,
  totalInteractions, withSecrets, mostInteractive, ...
}
*/
```

---

## 💾 Export/Import API

### Export Options

```javascript
// Single Entity Type
characterManager.export({
  includeStats: true,
  includeAdventures: true,
  includeNotes: false,
  format: "json", // or "csv"
});

// System-wide Export
await SystemUtilities.exportAllData({
  includeMetadata: true,
  compressionLevel: "high",
});
```

### Import Handling

```javascript
// System Import
await SystemUtilities.importAllData(fileData);

// DataStore Import
await dataStore.import(importData, {
  merge: true,
  collections: ["characters", "npcs"],
});
```

---

## 🚀 Development Utilities

### DevUtilities

```javascript
class DevUtilities {
  static async generateTestData(options = {})
  static async clearAllData() // Development only
}
```

### Health Check

```javascript
const health = SystemUtilities.performHealthCheck();
/* Returns:
{
  timestamp: string,
  status: "healthy" | "degraded" | "unhealthy",
  checks: { [component]: { initialized: boolean, ... } },
  issues: string[]
}
*/
```

---

## 🎯 Validation System

### Data Models (models.js)

```javascript
class Character extends BaseModel {
  validate()                        // Returns validation errors array
  toObject()                        // Serializza per storage
}

// ModelFactory
ModelFactory.create(type, data)
ModelFactory.validate(type, data)
```

### Validation Rules

```javascript
const ValidationRules = {
  required: (value, fieldName),
  minLength: (value, min, fieldName),
  maxLength: (value, max, fieldName),
  range: (value, min, max, fieldName),
  enum: (value, validValues, fieldName),
};
```

---

## 🔄 Lifecycle Events

### Manager Lifecycle

```javascript
// Initialization
manager.initializeComponents();

// Form Lifecycle
manager.setupFormComponents(entity, mode);
manager.processFormData(data);

// Cleanup
manager.cleanup();
manager.destroy();
```

### Component Lifecycle

```javascript
// Detail Handlers
detailHandler.handleDetailAction(action, entity, button);
detailHandler.refreshDetail(entityId);

// Form Handlers
formHandler.setupFormComponents(entity, mode);
formHandler.processFormData(data);
```

---

## 🎨 UI Patterns

### Card System

```javascript
// Grid Layout
<div class="cards-grid">
  ${entities.map((entity) => templates.generateCard(entity)).join("")}
</div>
```

### Modal Patterns

```javascript
// Standard Modal
modalManager.open({
  title: "Titolo",
  content: htmlContent,
  size: "small" | "medium" | "large" | "xl",
});

// Confirmation Modal
const confirmed = await modalManager.confirm({
  title: "Conferma",
  message: "Sei sicuro?",
  confirmText: "Conferma",
  cancelText: "Annulla",
});
```

### Detail View Patterns

```javascript
// Modal Detail (Characters, NPCs)
manager.openDetail(id); // Opens modal

// Dedicated View (Environments)
manager.detailView.viewDetail(id); // Full page view
```

---

## 🔧 Configuration

### App Configuration (config.js)

```javascript
const APP_CONFIG = {
  name: "D&D Dungeon Master Assistant",
  version: "1.0.0",
  debugMode: false,
  maxBackups: 10,
  autoSaveInterval: 30000
};

const DND_CONFIG = {
  maxLevel: 20,
  challengeRatings: [...],
  experienceThresholds: {...}
};
```

---

## 🔐 Error Handling

### Error Patterns

```javascript
try {
  await manager.create(data);
} catch (error) {
  manager.showError(error.message);
  console.error("Creation failed:", error);
}
```

### Validation Errors

```javascript
const errors = manager.utils.validateEntity(data);
if (errors.length > 0) {
  throw new Error(errors.join("\n"));
}
```

---

## 🎯 Best Practices

### Manager Development

1. **Extend BaseManager** per funzionalità CRUD standard
2. **Implement Utils** per logica business specifica
3. **Use Templates** per rendering consistente
4. **Delegate Actions** ai component handler appropriati

### Component Development

1. **Implement Interfaces** (`IDetailHandler`, `IEntityUtils`, `IFormHandler`)
2. **Handle Cleanup** nel metodo `destroy()`
3. **Emit Events** per integrazione sistema
4. **Validate Input** prima dell'elaborazione

### Data Management

1. **Use DataStore** per persistenza
2. **Validate** sempre prima di creare/aggiornare
3. **Emit Events** per sincronizzazione UI
4. **Handle Errors** gracefully

---

Questa documentazione API copre tutti i principali pattern e interfacce del sistema. Per dettagli implementativi specifici, consultare il file DEVELOPMENT.md complementare.
