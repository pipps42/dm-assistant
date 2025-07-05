# D&D Dungeon Master Assistant - Development Guide

## 🎯 Visione del Progetto

**D&D Dungeon Master Assistant** è stato progettato come un'applicazione modulare e scalabile per supportare Dungeon Master nella gestione di campagne D&D 5e. L'architettura è stata completamente refactorizzata per supportare un sistema modulare avanzato con pattern factory e componenti riutilizzabili.

---

## 🏗️ Decisioni Architetturali Principali

### 1. Architettura Modulare Stratificata

**Motivazione**: Separazione delle responsabilità, riusabilità, manutenibilità
**Implementazione**: Sistema a layer con dipendenze ben definite

```
Application Layer (app.js, ManagerRegistry)
    ↓
Manager Layer (BaseManager, Specific Managers)
    ↓
Component Layer (DetailHandlers, Utils, FormHandlers)
    ↓
Core Layer (DataStore, EventBus, UI Components)
```

### 2. Factory Pattern per Manager

**Motivazione**: Creazione uniforme, configurazione centralizzata, validazione
**File**: `manager-factory.js`, `manager-setup-bootstrap.js`

```javascript
// Registrazione configurazione
createManagerSetup("characters", {
  ManagerClass: CharacterManager,
  templates: CharacterTemplates,
  UtilsClass: CharacterUtils,
  DetailHandlerClass: CharacterDetailModal,
  FormHandlerClass: CharacterFormHandler,
});

// Creazione automatica
const managers = ManagerFactory.createAll();
```

### 3. Interface-Based Components

**Motivazione**: Standardizzazione, intercambiabilità, type safety
**Pattern**: Interfacce TypeScript-like con classi base

```javascript
// Interfaces definite
class IDetailHandler {
  /* interface methods */
}
class IEntityUtils {
  /* interface methods */
}
class IFormHandler {
  /* interface methods */
}

// Implementazioni specifiche
class CharacterDetailModal extends IDetailHandler {
  /* ... */
}
```

---

## 🔄 Storia del Refactoring

### Fase 1: Monolitico → Modulare (Completato)

**Prima**:

```javascript
// Tutto in file singoli, logica dispersa
characterManager.js - 800 + righe;
// Duplicazione codice tra manager
// Coupling forte tra componenti
```

**Dopo**:

```javascript
// Separazione responsabilità
base - manager.js; // Logica comune CRUD
character - manager.js; // Logica specifica characters
character - utils.js; // Business logic e statistiche
character - detail - modal.js; // UI detail handling
character - templates.js; // Rendering templates
```

### Fase 2: Factory Pattern Implementation (Completato)

**Aggiunto**:

- `ManagerFactory` per creazione uniforme
- `ManagerConfigBuilder` per configurazione fluente
- `ManagerRegistry` per accesso centralizzato
- Validazione automatica interfacce

### Fase 3: System Utilities (Completato)

**Aggiunto**:

- `SystemUtilities` per operazioni cross-manager
- `DevUtilities` per sviluppo e testing
- Health check del sistema
- Global search e export

---

## 🎨 Pattern di Design Implementati

### 1. **Template Method Pattern**

**BaseManager** definisce il flusso, sottoclassi implementano dettagli

```javascript
class BaseManager {
  async render() {
    // Template method
    const entities = this.getAll();
    if (entities.length === 0) {
      return this.renderEmpty(); // Hook method
    }
    // ... standard flow
    this.attachEvents(); // Hook method
  }
}
```

### 2. **Strategy Pattern**

**DetailHandler** strategies per diversi tipi di vista

```javascript
// Modal strategy (Characters, NPCs)
class CharacterDetailModal extends IDetailHandler {
  openDetail(id) { modalManager.open({...}); }
}

// Full-page strategy (Environments)
class EnvironmentDetailView extends IDetailHandler {
  openDetail(id) { this.viewDetail(id); /* full page */ }
}
```

### 3. **Observer Pattern**

**EventBus** per comunicazione loosely-coupled

```javascript
// Publisher
eventBus.emit("dataStore:characters:added", newCharacter);

// Subscribers
eventBus.on("dataStore:characters:added", (character) => {
  this.updateUI();
  this.logActivity();
});
```

### 4. **Factory Pattern**

**ManagerFactory** per creazione gestita

```javascript
// Abstract factory
ManagerFactory.register("characters", config);
const manager = ManagerFactory.create("characters");

// Validation inclusa
ManagerFactory.validateManager(manager);
```

### 5. **Command Pattern**

**Action handling** nel sistema di dettagli

```javascript
async handleDetailAction(action, entity, button) {
  switch(action) {
    case "level-up": return this.levelUp(entity);
    case "add-note": return this.addNote(entity);
    // ... Command objects impliciti
  }
}
```

### 6. **Builder Pattern**

**ManagerConfigBuilder** per configurazione fluente

```javascript
new ManagerConfigBuilder("characters")
  .setManagerClass(CharacterManager)
  .setTemplates(CharacterTemplates)
  .addUtilsClass(CharacterUtils)
  .addDetailHandler(CharacterDetailModal)
  .build();
```

---

## 📁 Struttura File e Responsabilità

### Core Layer (`/core/`)

```
event-bus.js           // Singleton EventBus, comunicazione disaccoppiata
base-manager.js        // Abstract base per tutti i manager
config.js             // Configurazioni centralizzate
```

### Data Layer (`/data/`)

```
data-store.js         // Singleton DataStore, persistenza JSON
models.js            // Data models con validazione
```

### Manager Layer (`/components/`)

```
manager-factory.js           // Factory pattern per manager
*-manager.js                // Manager specifici (Character, NPC, Environment)
*-utils.js                  // Business logic e statistiche
*-detail-modal.js           // Modal detail handlers
```

### Template Layer (`/templates/`)

```
*-templates.js              // Rendering templates per ogni entità
shared-templates.js         // Template riutilizzabili
```

### UI Layer (`/ui/`)

```
modal-manager.js           // Gestione modal stack
image-upload.js           // Componente upload immagini
card-renderer.js          // Renderer per card grid
form-handler.js           // Gestione form generica
```

### Bootstrap Layer

```
manager-setup-bootstrap.js  // Setup completo sistema modulare
app.js                     // Entry point e orchestrazione
```

---

## 🔧 Convenzioni di Sviluppo

### Naming Conventions

```javascript
// Manager Classes
CharacterManager, NPCManager, EnvironmentManager;

// Component Classes
CharacterUtils, CharacterDetailModal, CharacterFormHandler;

// Template Functions
generateForm(), generateDetail(), generateCard();

// Event Names
("dataStore:${collection}:${action}");
("form:${action}");
("imageUpload:${action}");

// File Names
character - manager.js, character - utils.js;
npc - templates.js, environment - detail - view.js;
```

### Code Organization

```javascript
// Manager Structure
class SomeManager extends BaseManager {
  constructor() {
    /* setup */
  }
  initializeComponents() {
    /* modular setup */
  }

  // Core overrides
  processFormData(data) {
    /* ... */
  }
  setupFormComponents(entity, mode) {
    /* ... */
  }

  // Delegation methods
  getSpecificEntities() {
    return this.utils.method();
  }

  // Specific functionality
  specificManagerMethod() {
    /* ... */
  }

  // Cleanup
  cleanup() {
    /* ... */
  }
}
```

### Error Handling Patterns

```javascript
// Validation errors
const errors = this.utils.validateEntity(data);
if (errors.length > 0) {
  throw new Error(errors.join("\n"));
}

// Async operations
try {
  await this.dataStore.create(data);
  this.showSuccess("Success message");
} catch (error) {
  console.error("Operation failed:", error);
  this.showError(error.message);
}
```

---

## 🚀 Guida all'Aggiunta di Nuove Entità

### 1. Definire Data Model

```javascript
// data/models.js
export class NewEntity extends BaseModel {
  populate(data) {
    this.name = data.name || "";
    this.description = data.description || "";
    // ... other fields
  }

  validate() {
    const errors = [];
    if (!this.name) errors.push("Nome richiesto");
    return errors;
  }
}
```

### 2. Creare Templates

```javascript
// templates/newentity-templates.js
export function generateForm(entity = null, mode = "create") {
  return `<form>...</form>`;
}

export function generateDetail(entity) {
  return `<div class="detail">...</div>`;
}

export function generateCard(entity) {
  return `<div class="card">...</div>`;
}

export const NEWENTITY_DATA = {
  // Costanti specifiche
};
```

### 3. Implementare Utils

```javascript
// components/newentity-utils.js
export default class NewEntityUtils extends IEntityUtils {
  getEntityStats() {
    /* ... */
  }
  searchEntities(query) {
    /* ... */
  }
  validateEntity(data) {
    /* ... */
  }
  exportEntities(options = {}) {
    /* ... */
  }
}
```

### 4. Implementare DetailHandler

```javascript
// components/newentity-detail-modal.js
export default class NewEntityDetailModal extends IDetailHandler {
  async handleDetailAction(action, entity, button) {
    switch (action) {
      case "custom-action":
        return this.customAction(entity);
      // ...
    }
  }
}
```

### 5. Creare Manager

```javascript
// components/newentity-manager.js
class NewEntityManager extends BaseManager {
  constructor() {
    super("newentities", NewEntityTemplates, {
      hasDetailView: false, // true per dedicated view
      hasUtils: true,
      hasFormComponents: true,
    });
    this.initializeComponents();
  }

  initializeComponents() {
    this.detailHandler = new NewEntityDetailModal(this);
    this.utils = new NewEntityUtils(this);
    // this.formHandler = new NewEntityFormHandler(this); // se necessario
  }
}
```

### 6. Registrare nel Bootstrap

```javascript
// manager-setup-bootstrap.js
function registerManagerConfigurations() {
  // ... existing registrations

  createManagerSetup("newentities", {
    ManagerClass: NewEntityManager,
    templates: NewEntityTemplates,
    UtilsClass: NewEntityUtils,
    DetailHandlerClass: NewEntityDetailModal,
    options: {
      hasDetailView: false,
      hasUtils: true,
      hasFormComponents: true,
      entityDisplayName: "NewEntity",
      pluralDisplayName: "NewEntities",
    },
  });
}
```

### 7. Aggiornare Navigation

```javascript
// app.js
this.navigationItems = [
  // ... existing items
  {
    id: "newentities",
    icon: "🆕",
    label: "New Entities",
    title: "New Entities Management",
    buttonText: "+ New Entity",
  },
];
```

---

## 🔄 Refactoring Roadmap

### Prossimi Refactoring Pianificati

#### Fase 4: Enhanced Component System (Futuro)

**Obiettivo**: Sistema di componenti UI più avanzato

```javascript
// Planned: UI Component Library
class UIComponent {
  constructor(element, options) {
    /* ... */
  }
  render() {
    /* ... */
  }
  destroy() {
    /* ... */
  }
}

// Planned: Specific Components
class DataGrid extends UIComponent {
  /* ... */
}
class SearchBox extends UIComponent {
  /* ... */
}
class StatusIndicator extends UIComponent {
  /* ... */
}
```

#### Fase 5: Plugin Architecture (Futuro)

**Obiettivo**: Sistema di plugin per estensibilità

```javascript
// Planned: Plugin System
class PluginManager {
  static register(plugin) {
    /* ... */
  }
  static load(pluginName) {
    /* ... */
  }
  static unload(pluginName) {
    /* ... */
  }
}

// Planned: Plugin Interface
class IPlugin {
  activate() {
    /* ... */
  }
  deactivate() {
    /* ... */
  }
  getInfo() {
    /* ... */
  }
}
```

#### Fase 6: Advanced Data Layer (Futuro)

**Obiettivo**: Database relazionale, migrations, relationships

```javascript
// Planned: Database Layer
class DatabaseManager {
  async migrate() {
    /* ... */
  }
  async backup() {
    /* ... */
  }
  async optimize() {
    /* ... */
  }
}

// Planned: Relationships
class Relationship {
  constructor(from, to, type) {
    /* ... */
  }
  validate() {
    /* ... */
  }
  resolve() {
    /* ... */
  }
}
```

---

## 🧪 Testing Strategy

### Current Testing Approach

- **Manual Testing**: Console utilities e DevUtilities
- **Data Validation**: Built-in validation nel model layer
- **Health Checks**: SystemUtilities.performHealthCheck()

### Planned Testing Enhancements

```javascript
// Planned: Unit Testing Framework
class TestRunner {
  static async runAll() {
    /* ... */
  }
  static async runSuite(suiteName) {
    /* ... */
  }
}

// Planned: Manager Tests
class ManagerTestSuite {
  async testCRUD() {
    /* ... */
  }
  async testValidation() {
    /* ... */
  }
  async testEventEmission() {
    /* ... */
  }
}

// Planned: Integration Tests
class IntegrationTestSuite {
  async testManagerInteraction() {
    /* ... */
  }
  async testDataFlowIntegrity() {
    /* ... */
  }
}
```

---

## 🔧 Development Tools

### Built-in Dev Utilities

```javascript
// Global access in console
window.ManagerRegistry; // Access to all managers
window.SystemUtilities; // System operations
window.DevUtilities; // Development helpers

// Development helpers
DevUtilities.generateTestData();
DevUtilities.clearAllData(); // Development only
SystemUtilities.performHealthCheck();
```

### Debug Features

```javascript
// Manager debugging
manager.getStats();
manager.search("debug");
manager.export();

// System debugging
ManagerRegistry.getSystemStats();
SystemUtilities.globalSearch("test");
```

### Console Commands

```javascript
// Quick access patterns
const cm = window.characterManager;
const nm = window.npcManager;
const em = window.environmentManager;

// Quick stats
ManagerRegistry.getSystemStats();

// Quick export
SystemUtilities.exportAllData();

// Health check
SystemUtilities.performHealthCheck();
```

---

## 📊 Performance Considerations

### Current Optimizations

1. **Lazy Component Loading**: Componenti caricati on-demand
2. **Event Delegation**: Event listener centrali vs multipli
3. **Template Caching**: Template generati e cached
4. **Batch Operations**: Bulk update per multiple entities

### Performance Monitoring

```javascript
// Built-in performance tracking
const stats = ManagerRegistry.getSystemStats();
console.log(`Total entities: ${stats.totalEntities}`);
console.log(`System health: ${stats.systemHealth}`);
```

### Planned Optimizations

- **Virtual Scrolling**: Per grandi collezioni
- **Progressive Loading**: Caricamento incrementale
- **IndexedDB Migration**: Da JSON a database browser
- **Web Workers**: Per elaborazioni pesanti

---

## 🚨 Troubleshooting Guide

### Common Issues

#### Manager Not Found

```javascript
// Problem: Manager not accessible
// Solution: Check registration in bootstrap
const managers = ManagerRegistry.getAllManagers();
console.log(Object.keys(managers));
```

#### Validation Errors

```javascript
// Problem: Data validation failures
// Solution: Check entity utils validation
const errors = manager.utils.validateEntity(data);
console.log("Validation errors:", errors);
```

#### Component Not Loading

```javascript
// Problem: Detail handler or utils not working
// Solution: Check component initialization
console.log("Detail Handler:", manager.detailHandler);
console.log("Utils:", manager.utils);
```

#### Event Not Firing

```javascript
// Problem: Events not being emitted/received
// Solution: Check EventBus listeners
console.log(
  "Listeners for entity:added",
  EventBus.getListenerCount("dataStore:entities:added")
);
```

### Health Check Debugging

```javascript
const health = SystemUtilities.performHealthCheck();
if (health.status !== "healthy") {
  console.log("System issues:", health.issues);
  console.log("Component status:", health.checks);
}
```

---

## 🎯 Best Practices per Sviluppatori

### 1. Manager Development

```javascript
// DO: Extend BaseManager
class NewManager extends BaseManager {
  constructor() {
    super("entities", templates, options);
    this.initializeComponents();
  }
}

// DON'T: Create from scratch
class NewManager {
  // Missing standard functionality
}
```

### 2. Component Integration

```javascript
// DO: Implement interfaces
class NewUtils extends IEntityUtils {
  getEntityStats() {
    /* required implementation */
  }
}

// DON'T: Ad-hoc methods
class NewUtils {
  customMethod() {
    /* non-standard */
  }
}
```

### 3. Event Handling

```javascript
// DO: Use EventBus for decoupling
this.eventBus.emit("entity:created", entity);

// DON'T: Direct method calls
otherManager.updateSomething(); // Creates coupling
```

### 4. Error Management

```javascript
// DO: Comprehensive error handling
try {
  await this.create(data);
  this.showSuccess("Created successfully");
} catch (error) {
  console.error("Creation failed:", error);
  this.showError(error.message);
}

// DON'T: Silent failures
await this.create(data); // May fail silently
```

### 5. Template Organization

```javascript
// DO: Separate template functions
export function generateForm(entity, mode) {
  /* ... */
}
export function generateDetail(entity) {
  /* ... */
}
export function generateCard(entity) {
  /* ... */
}

// DON'T: Monolithic template functions
export function generateAll(entity, type) {
  if (type === "form") {
    /* 100 lines */
  }
  if (type === "detail") {
    /* 100 lines */
  }
  // ... unmaintainable
}
```

---

## 🎓 Onboarding per Nuovi Sviluppatori

### 1. Understanding the Architecture

1. **Start with BaseManager**: Comprendi CRUD operations e rendering
2. **Study ManagerFactory**: Capire il sistema di registrazione
3. **Explore Templates**: Vedere come viene generato l'HTML
4. **Follow Data Flow**: Da UI a DataStore e ritorno

### 2. First Task Suggestions

1. **Add Field to Existing Entity**: Semplice modifiche a template e form
2. **Implement New Action**: Aggiungi azione a DetailHandler esistente
3. **Create Utility Function**: Aggiungi metodo a Utils esistente
4. **Enhance Template**: Migliora rendering di card o detail

### 3. Code Reading Path

```
1. app.js (entry point)
2. manager-setup-bootstrap.js (system setup)
3. base-manager.js (core functionality)
4. character-manager.js (example implementation)
5. character-templates.js (rendering)
6. character-utils.js (business logic)
```

### 4. Development Environment Setup

```javascript
// Enable debug mode
APP_CONFIG.debugMode = true;

// Access dev utilities
window.DevUtilities.generateTestData();

// Monitor system health
setInterval(() => {
  const health = SystemUtilities.performHealthCheck();
  if (health.status !== "healthy") {
    console.warn("System health degraded:", health.issues);
  }
}, 30000);
```

---

## 📚 Riferimenti e Risorse

### Pattern References

- **Factory Pattern**: manager-factory.js, manager-setup-bootstrap.js
- **Template Method**: base-manager.js
- **Strategy Pattern**: detail handlers
- **Observer Pattern**: event-bus.js
- **Command Pattern**: detail action handling

### Key Files for Understanding

- `base-manager.js`: Core del sistema
- `manager-factory.js`: Pattern factory implementation
- `manager-setup-bootstrap.js`: Sistema di bootstrap
- `data-store.js`: Persistenza dati
- `event-bus.js`: Sistema di eventi

### External Resources

- [D&D 5e SRD](https://dnd.wizards.com/resources/systems-reference-document): Per dati game
- [Electron Documentation](https://www.electronjs.org/docs): Per features platform
- [JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules): Per architettura modulare

---

Questa guida di sviluppo fornisce tutto il contesto necessario per comprendere, mantenere ed estendere il sistema modulare del D&D Dungeon Master Assistant.
