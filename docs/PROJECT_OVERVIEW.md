# DM Assistant - Project Overview & Development Guidelines

## 📋 Project Overview

### **Mission Statement**

Sviluppare un'app desktop che fornisce strumenti di supporto completi al Dungeon Master per gestire campagne D&D 5e, con focus su workflow ottimizzato, riutilizzabilità del codice e user experience seamless.

### **Target User**

Dungeon Master di D&D 5e che necessitano di strumenti digitali per:

- Gestire campagne multi-sessione
- Tracciare entità di gioco (NPCs, mostri, ambientazioni, quest)
- Condurre combat tracker avanzato
- Mantenere consistenza narrativa e meccanica

### **Core Principles**

- **DM-Centric**: Progettato specificamente per le esigenze del DM, non dei giocatori
- **Campaign-Focused**: Ogni dato è organizzato per campagna
- **Combat-Optimized**: Tools ottimizzati per gestione combat live
- **Reusability-First**: Massima riutilizzabilità di componenti e logica

---

## 🏗️ Architecture Overview

### **Stack Tecnologico**

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Rust + Tauri (desktop app)
- **State Management**: Zustand per state globale
- **Storage**: File JSON locali (per campaign data)
- **UI Framework**: Custom component library riutilizzabile

### **Architectural Patterns**

- **Layered Architecture**: Core → Shared → Tools → Pages
- **Component Composition**: Riuso tramite composizione, non ereditarietà
- **Hook-Based Logic**: Custom hooks per business logic riutilizzabile
- **Service Layer**: Business logic centralizzata e testabile
- **Typed Integration**: End-to-end type safety tra Rust e TypeScript

---

## 📁 Project Structure Principles

### **Layer Organization**

```
src-tauri/src/          # 🦀 Rust Backend
├── commands/           # Tauri commands per dominio
├── core/              # D&D domain logic + models
├── services/          # Business services
└── utils/             # Shared utilities

src/                   # ⚛️ React Frontend
├── core/              # D&D business logic riutilizzabile
├── shared/            # Componenti + hooks + utilities trasversali
├── tools/             # Tool DM modulari e composable
├── pages/             # Top-level routing
└── tauri/             # Tauri integration layer
```

### **Domain-Driven Structure**

Ogni entità D&D ha la sua struttura consistente:

```
entity/
├── models/           # Rust structs + TypeScript interfaces
├── services/         # Business logic layer
├── components/       # UI components riutilizzabili
├── hooks/            # Custom hooks per logic
└── api/             # Tauri command wrappers
```

---

## 🎯 App Functionality Scope

### **Entity Management (DM Perspective)**

1. **Campaigns**: Switching, creazione, info base
2. **Characters**: PG dal punto di vista DM (no schede complete)
3. **NPCs**: Gestione completa + relazioni + quest
4. **Environments**: Ambientazioni + servizi + pericoli + NPCs
5. **Maps**: Mappe + annotazioni + segreti + tesori
6. **Items**: Catalog items + party inventory tracking
7. **Quests**: Timeline + decisioni party + obiettivi
8. **Monsters**: Bestiario completo + stat block customizzabili

### **Combat & Encounter Tools**

- **Combat Tracker**: Gestione mista PG (basic) + Mostri (full stats)
- **Initiative Tracking**: Ordine iniziativa + turn management
- **Health & Conditions**: HP tracking + status effects
- **Encounter Builder**: Bilanciamento CR + selezione mostri/mappe
- **Dice Roller**: Advanced dice notation + history

### **What We DON'T Manage**

- ❌ **Player Character Sheets**: I giocatori gestiscono le proprie schede
- ❌ **Spell Tracking per PG**: Solo per mostri nel bestiario
- ❌ **Player Inventory**: Solo party inventory aggregate
- ❌ **Character Progression**: Solo level tracking basic

---

## 🔄 Development Guidelines

### **Code Reusability Rules**

#### **1. Shared Components First**

Prima di creare un nuovo componente, verifica se esiste già in `shared/components/`:

```typescript
// ✅ Riusa shared components
import {
  MonsterStatBlock,
  HealthTracker,
  DiceRoller,
} from "@/shared/components/dnd";

// ❌ Non duplicare logica esistente
const MyCustomHealthBar = () => {
  /* ... */
};
```

#### **2. Hook-Based Logic Extraction**

Logica riutilizzabile deve essere estratta in custom hooks:

```typescript
// ✅ Logic in custom hook
const { participants, addPlayer, addMonster } = useParticipants();
const { initiative, nextTurn, endCombat } = useCombat();

// ❌ Logic inline nei componenti
const [participants, setParticipants] = useState([]);
```

#### **3. Service Layer Centralization**

Business logic deve essere centralizzata nei services:

```typescript
// ✅ Business logic nei services
const cr = MonsterService.calculateCR(monster);
const damage = CombatService.calculateDamage(attack, target);

// ❌ Calcoli duplicati nei componenti
const cr = (monster.hp + monster.ac) / 2; // Logic scattered
```

#### **4. Component Composition Pattern**

Tool devono comporre shared components, non reimplementarli:

```typescript
// ✅ Composition pattern
const BestiaryTool = () => (
  <div>
    <MonsterStatBlock monster={monster} />
    <HealthTracker hp={monster.hp} />
    <DiceRoller onRoll={handleRoll} />
  </div>
);

// ❌ Monolithic components
const BestiaryTool = () => {
  // 500 lines of mixed UI + logic
};
```

### **Naming Conventions**

#### **Files & Directories**

- **PascalCase**: Component files (`MonsterCard.tsx`)
- **camelCase**: Hook files (`useMonster.ts`), service files (`monsterService.ts`)
- **kebab-case**: Directory names (`monster-editor/`)

#### **TypeScript Interfaces**

- **Entities**: `Monster`, `Campaign`, `PlayerCharacter`
- **Props**: `MonsterCardProps`, `HealthTrackerProps`
- **API Types**: `CreateMonsterRequest`, `CombatStateResponse`

#### **Hook Naming**

- **Entity Management**: `useMonster`, `useNPCs`, `useCampaign`
- **Business Logic**: `useCombat`, `useDiceRoll`, `useInitiative`
- **UI State**: `useModal`, `useForm`, `useTable`

---

## 🔗 Entity Relationships

### **Core Relationships**

```
Campaign (1) → (*) Characters, NPCs, Environments, Monsters, Quests, Items
Environment (1) → (*) NPCs, Maps
NPC (1) → (*) Quests, Interactions
Quest (*) → (*) NPCs, Characters
Map (1) → (*) Encounters
Encounter (*) → (*) Monsters, Maps
Item (*) → (1) PartyInventory
```

### **Combat Relationships**

```
Combat Session:
├── Players (basic info only)
│   ├── name, AC, HP, initiative
│   └── conditions, temp effects
└── Monsters (full stat access)
    ├── complete stat block
    ├── actions, spells, abilities
    └── HP tracking, conditions
```

---

## 🚀 DM Workflow Support

### **Pre-Session Workflow**

1. **Campaign Setup**: `CampaignManager` → create/switch campaigns
2. **Entity Management**: `CharacterManager`, `NPCManager`, `EnvironmentManager`
3. **Content Creation**: `Bestiary` → custom monsters, `ItemCatalog` → items
4. **Map Preparation**: `MapManager` → upload maps, add annotations
5. **Encounter Planning**: `EncounterBuilder` → balance encounters, select maps

### **Live Session Workflow**

1. **Session Start**: Load campaign, review notes
2. **Exploration**: `MapManager` → reveal areas, track discoveries
3. **Social Encounters**: `NPCManager` → track interactions, update relationships
4. **Combat**: `CombatTracker` → initiative, HP, conditions, turn management
5. **Loot & Progress**: `InventoryTracker`, `QuestTracker` → update progress

### **Post-Session Workflow**

1. **Progress Update**: Update quest status, character progress
2. **Relationship Tracking**: Update NPC attitudes, new interactions
3. **Inventory Management**: Distribute loot, update party resources
4. **Session Notes**: Record important decisions, plot developments

---

## 🛠️ Technical Implementation Guidelines

### **State Management Strategy**

- **Global State**: Campaign data, app settings, combat state
- **Local State**: Form data, UI interactions, temporary data
- **Persistent State**: Campaign files, user preferences

### **Error Handling**

- **Rust Layer**: Return `Result<T, E>` for all operations
- **TypeScript Layer**: Wrap Tauri calls in try-catch, show user-friendly errors
- **UI Layer**: Error boundaries, toast notifications, fallback states

### **Performance Considerations**

- **Lazy Loading**: Load tools only when accessed
- **Data Chunking**: Paginate large lists (monsters, items, NPCs)
- **Memo Optimization**: Memoize expensive calculations (CR, stats)
- **Virtual Scrolling**: For large data sets in tables

### **Testing Strategy**

- **Unit Tests**: Services, utilities, pure functions
- **Integration Tests**: Tauri commands, API layer
- **Component Tests**: Isolated component behavior
- **E2E Tests**: Critical user workflows (combat, encounter creation)

---

## 🎲 D&D 5e Integration

### **Rules Engine**

- **Core Rules**: Ability scores, modifiers, proficiency bonus
- **Combat Rules**: AC calculation, initiative, advantage/disadvantage
- **CR System**: Challenge rating calculation for homebrew monsters
- **Dice System**: Full dice notation support (1d20+5, 3d6kh2, etc.)

### **SRD Compliance**

- **Base Content**: Include SRD monsters, spells, items as starting templates
- **Homebrew Support**: Full customization for all entities
- **Import/Export**: Support for popular formats (JSON, CSV)

### **Future Integrations**

- **D&D Beyond**: Import character/monster data
- **Roll20**: Export encounters, maps
- **Foundry VTT**: Integration possibilities

---

## 📈 Scalability Considerations

### **Adding New Tools**

1. Create tool directory in `src/tools/`
2. Implement using existing shared components
3. Add business logic to appropriate service
4. Create custom hooks for tool-specific logic
5. Register tool in navigation system

### **Adding New Entities**

1. Define Rust model in `src-tauri/src/core/models/`
2. Create TypeScript interface in `src/core/entities/`
3. Implement service layer for business logic
4. Create shared components for entity display
5. Add Tauri commands for CRUD operations

### **Feature Expansion**

- **Modular Design**: Each tool is self-contained
- **Plugin Architecture**: Potential for third-party tools
- **API-First**: Internal API can be exposed for integrations
- **Cross-Platform**: Tauri supports multiple desktop platforms

---

## 🏁 Success Metrics

### **User Experience**

- **Session Prep Time**: < 30 minutes for complex encounters
- **Combat Management**: Smooth turn progression, < 5 seconds per action
- **Data Consistency**: No lost data, reliable state management
- **Learning Curve**: New users productive within 2 sessions

### **Technical Excellence**

- **Code Reuse**: > 80% component reusability across tools
- **Type Safety**: 100% TypeScript coverage, no `any` types
- **Performance**: < 3 second load times, responsive UI
- **Maintainability**: Easy to add new features, minimal refactoring

---

_This document serves as the single source of truth for project direction, architectural decisions, and development standards. Update this document when making significant changes to project scope or technical approach._
