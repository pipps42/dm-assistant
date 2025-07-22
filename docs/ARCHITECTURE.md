# DM Assistant - Struttura Ottimizzata per Riutilizzabilità

## 🦀 BACKEND RUST (src-tauri/src/)

```
src-tauri/src/
├── main.rs                    # Entry point
├── lib.rs                     # Library exports
│
├── 📁 commands/              # Tauri commands organizzati per dominio
│   ├── mod.rs
│   ├── campaigns.rs          # Campaign CRUD + switching
│   ├── characters.rs         # Player Character management per DM
│   ├── npcs.rs               # NPC management
│   ├── environments.rs       # Environment/location management
│   ├── items.rs              # Item catalog management
│   ├── inventory.rs          # Party inventory tracking
│   ├── quests.rs             # Quest tracking + management
│   ├── monsters.rs           # Monster/Creature CRUD operations
│   ├── encounters.rs         # Encounter & exploration
│   ├── combat.rs             # Active combat state, initiative, HP tracking
│   ├── maps.rs               # Map management + fog of war
│   ├── dice.rs               # Dice rolling commands
│   └── system.rs             # App settings, backup/restore
│
├── 📁 core/                  # Core D&D domain logic
│   ├── mod.rs
│   ├── 📁 models/            # Rust structs per D&D entities
│   │   ├── mod.rs
│   │   ├── campaign.rs       # Campaign, CampaignInfo, CampaignSwitching
│   │   ├── character.rs      # PlayerCharacter (DM view), Background, Achievements
│   │   ├── npc.rs            # NPC, Attitude, Interactions, NPCQuests
│   │   ├── environment.rs    # Environment, Location, Services, Dangers
│   │   ├── map.rs            # Map, MapData, SecretPassages, Treasures, Puzzles
│   │   ├── item.rs           # Item, ItemType, Equipment, Consumables, Relics
│   │   ├── inventory.rs      # PartyInventory, Currency, Resources
│   │   ├── quest.rs          # Quest, QuestStatus, QuestDecisions, Objectives
│   │   ├── monster.rs        # Monster, StatBlock, Abilities, Actions
│   │   ├── participant.rs    # CombatParticipant (PG basic + Monster full)
│   │   ├── encounter.rs      # Encounter, Initiative, Combat state
│   │   ├── combat.rs         # HP tracking, conditions, turn management
│   │   └── common.rs         # Shared types (DiceRoll, Modifier, Condition, etc.)
│   │
│   ├── 📁 rules/             # D&D 5e rules engine (riutilizzabile)
│   │   ├── mod.rs
│   │   ├── ability_scores.rs # Modifier calculations, saving throws
│   │   ├── combat.rs         # AC, HP, initiative rules
│   │   ├── dice.rs           # Dice notation parser, advantage/disadvantage
│   │   ├── spells.rs         # Spell slot calculation, spell rules
│   │   └── leveling.rs       # XP, proficiency bonus, level progression
│   │
│   └── 📁 validation/        # Shared validation logic
│       ├── mod.rs
│       ├── character.rs      # Character creation rules
│       ├── dice.rs           # Dice notation validation
│       └── campaign.rs       # Campaign structure validation
│
├── 📁 services/              # Business logic services
│   ├── mod.rs
│   ├── storage.rs            # File I/O operations, JSON serialization
│   ├── backup.rs             # Backup/restore functionality
│   ├── import_export.rs      # Data import/export (D&D Beyond, etc.)
│   └── templates.rs          # Campaign/character templates
│
└── 📁 utils/                 # Shared utilities
    ├── mod.rs
    ├── id_generator.rs       # UUID generation
    ├── file_system.rs        # File operations helpers
    └── error.rs              # Custom error types
```

## ⚛️ FRONTEND REACT (src/)

```
src/
├── main.tsx                  # Entry point
├── App.tsx                   # Main app component
│
├── 📁 core/                  # Core D&D business logic (riutilizzabile)
│   ├── index.ts
│   │
│   ├── 📁 entities/          # D&D domain models TypeScript
│   │   ├── index.ts          # Re-exports tutti i tipi
│   │   ├── Campaign.ts       # Campaign interfaces, switching logic
│   │   ├── Character.ts      # PlayerCharacter (DM perspective), backgrounds
│   │   ├── NPC.ts            # NPC interfaces, attitudes, interactions
│   │   ├── Environment.ts    # Environment, locations, services, dangers
│   │   ├── Map.ts            # Map data, secrets, treasures, puzzles
│   │   ├── Item.ts           # Item types, equipment, consumables
│   │   ├── Inventory.ts      # Party inventory, currency, resources
│   │   ├── Quest.ts          # Quest tracking, decisions, objectives
│   │   ├── Monster.ts        # Monster interfaces, stat blocks, abilities
│   │   ├── Participant.ts    # CombatParticipant (Player basic + Monster full)
│   │   ├── Encounter.ts      # Encounter setup, monster selection
│   │   ├── Combat.ts         # Active combat state, initiative, HP, conditions
│   │   └── Common.ts         # Shared types, utility types
│   │
│   ├── 📁 rules/             # D&D 5e rules engine frontend
│   │   ├── index.ts
│   │   ├── AbilityScores.ts  # Modifier calc, proficiency, saves
│   │   ├── Combat.ts         # AC calculation, HP, damage
│   │   ├── Dice.ts           # Dice rolling, advantage, notation
│   │   ├── Spells.ts         # Spell slots, preparation, casting
│   │   └── Leveling.ts       # XP calculation, level progression
│   │
│   ├── 📁 services/          # Business logic services (riutilizzabili)
│   │   ├── index.ts
│   │   ├── CampaignService.ts     # Campaign switching, management
│   │   ├── CharacterService.ts    # Player character operations (DM view)
│   │   ├── NPCService.ts          # NPC management, relationship tracking
│   │   ├── EnvironmentService.ts  # Environment management, location logic
│   │   ├── ItemService.ts         # Item catalog management
│   │   ├── InventoryService.ts    # Party inventory operations
│   │   ├── QuestService.ts        # Quest tracking, progress management
│   │   ├── MonsterService.ts      # Monster business operations, stat calculations
│   │   ├── CombatService.ts       # Initiative, turns, HP tracking, conditions
│   │   ├── EncounterService.ts    # Encounter building, CR balancing
│   │   ├── MapService.ts          # Map management, fog of war logic
│   │   ├── DiceService.ts         # Advanced dice operations
│   │   ├── StatCalculator.ts      # Monster stat derivation, CR calculation
│   │   └── ValidationService.ts   # Frontend validation rules
│   │
│   └── 📁 constants/         # D&D reference data (riutilizzabile)
│       ├── index.ts
│       ├── creature_types.ts     # Beast, Humanoid, Dragon, etc.
│       ├── sizes.ts              # Tiny, Small, Medium, Large, etc.
│       ├── alignments.ts         # LG, LE, CN, etc.
│       ├── damage_types.ts       # Fire, Cold, Slashing, etc.
│       ├── conditions.ts         # Blinded, Charmed, Frightened, etc.
│       ├── environments.ts       # Arctic, Desert, Forest, etc.
│       └── cr_guidelines.ts      # CR calculation guidelines
│
├── 📁 shared/                # Componenti e utilities riutilizzabili
│   ├── index.ts
│   │
│   ├── 📁 components/        # UI components riutilizzabili
│   │   ├── index.ts
│   │   │
│   │   ├── 📁 ui/            # Primitivi UI base (massima riutilizzabilità)
│   │   │   ├── index.ts
│   │   │   ├── Button/       # Button variants, sizes, states
│   │   │   ├── Modal/        # Modal, Dialog, Drawer
│   │   │   ├── Form/         # Input, Select, Checkbox, Radio
│   │   │   ├── Table/        # DataTable, sorting, filtering
│   │   │   ├── Card/         # Card layouts, variants
│   │   │   ├── Layout/       # Grid, Flex helpers, spacing
│   │   │   ├── Navigation/   # Tabs, Breadcrumbs, Menu
│   │   │   └── Feedback/     # Loading, Error, Toast, Alert
│   │   │
│   │   ├── 📁 dnd/           # D&D specific components (riutilizzabili)
│   │   │   ├── index.ts
│   │   │   ├── MonsterStatBlock/ # Complete monster stat block display
│   │   │   ├── CharacterCard/    # Player character card (DM view)
│   │   │   ├── NPCCard/          # NPC info card + relationship status
│   │   │   ├── EnvironmentCard/  # Environment/location card
│   │   │   ├── ItemCard/         # Item display card
│   │   │   ├── QuestTracker/     # Quest progress display
│   │   │   ├── InventoryGrid/    # Party inventory display
│   │   │   ├── MapViewer/        # Map display + annotations
│   │   │   ├── DiceRoller/       # Dice input + roll display
│   │   │   ├── AbilityScore/     # Ability score display + modifier
│   │   │   ├── HealthTracker/    # HP bar, temp HP, damage tracking
│   │   │   ├── ConditionTracker/ # Status conditions display & management
│   │   │   ├── InitiativeTracker/ # Initiative list component
│   │   │   ├── CRCalculator/     # Challenge Rating calculator
│   │   │   ├── ActionBlock/      # Action/Bonus Action/Reaction display
│   │   │   ├── ParticipantCard/  # Generic combat participant card
│   │   │   └── RelationshipGraph/ # NPC-Character relationship display
│   │   │
│   │   └── 📁 layout/        # Layout components (riutilizzabili)
│   │       ├── index.ts
│   │       ├── AppShell/     # Main app layout
│   │       ├── Sidebar/      # Navigation sidebar
│   │       ├── Header/       # App header, breadcrumbs
│   │       ├── PageContainer/ # Standard page wrapper
│   │       └── ToolPanel/    # Collapsible tool panel
│   │
│   ├── 📁 hooks/             # Custom hooks riutilizzabili
│   │   ├── index.ts
│   │   │
│   │   ├── 📁 core/          # Core React hooks
│   │   │   ├── useTauri.ts       # Tauri command wrapper
│   │   │   ├── useLocalStorage.ts # Persistent local state
│   │   │   ├── useDebounce.ts    # Debounced values
│   │   │   ├── useAsync.ts       # Async operations state
│   │   │   └── useForm.ts        # Form state management
│   │   │
│   │   ├── 📁 dnd/           # D&D specific hooks (riutilizzabili)
│   │   │   ├── useCampaign.ts        # Campaign switching, management
│   │   │   ├── useCharacters.ts      # Player characters (DM perspective)
│   │   │   ├── useNPCs.ts            # NPC management, relationships
│   │   │   ├── useEnvironments.ts    # Environment/location management
│   │   │   ├── useItems.ts           # Item catalog management
│   │   │   ├── useInventory.ts       # Party inventory tracking
│   │   │   ├── useQuests.ts          # Quest tracking, progress
│   │   │   ├── useMaps.ts            # Map management, annotations
│   │   │   ├── useDiceRoll.ts        # Dice rolling with history
│   │   │   ├── useMonster.ts         # Monster state + operations
│   │   │   ├── useCombat.ts          # Combat state management
│   │   │   ├── useInitiative.ts      # Initiative order management
│   │   │   ├── useHealthTracking.ts  # HP and damage tracking
│   │   │   ├── useConditions.ts      # Condition tracking and effects
│   │   │   ├── useCRCalculator.ts    # Challenge rating calculation
│   │   │   ├── useParticipants.ts    # Combat participants management
│   │   │   └── useRelationships.ts   # NPC-Character relationship tracking
│   │   │
│   │   └── 📁 ui/            # UI interaction hooks
│   │       ├── useModal.ts       # Modal state management
│   │       ├── useToast.ts       # Toast notifications
│   │       ├── useTable.ts       # Table sorting, filtering
│   │       └── useSearchFilter.ts # Search + filter logic
│   │
│   ├── 📁 utils/             # Pure utility functions (altamente riutilizzabili)
│   │   ├── index.ts
│   │   ├── 📁 dnd/           # D&D specific utilities
│   │   │   ├── dice.ts           # Dice notation parsing, rolling
│   │   │   ├── monster.ts        # Monster utility functions
│   │   │   ├── combat.ts         # Combat calculations, initiative
│   │   │   ├── cr_calculation.ts # Challenge Rating algorithms
│   │   │   └── formatting.ts     # D&D specific formatting
│   │   │
│   │   ├── 📁 data/          # Data manipulation utilities
│   │   │   ├── array.ts          # Array helpers, grouping
│   │   │   ├── object.ts         # Object transformation
│   │   │   ├── validation.ts     # Validation helpers
│   │   │   └── serialization.ts  # JSON, localStorage helpers
│   │   │
│   │   └── 📁 ui/            # UI utility functions
│   │       ├── color.ts          # Color manipulation
│   │       ├── animation.ts      # Animation helpers
│   │       ├── responsive.ts     # Responsive design utilities
│   │       └── accessibility.ts  # A11y helpers
│   │
│   └── 📁 stores/            # Global state management
│       ├── index.ts
│       ├── campaignStore.ts      # Current campaign state
│       ├── settingsStore.ts      # App settings, preferences
│       ├── uiStore.ts            # UI state (sidebar, modals)
│       └── combatStore.ts        # Active combat state
│
├── 📁 tools/                 # DM Tools modulari (composable)
│   ├── index.ts
│   │
│   ├── 📁 CampaignManager/   # Campaign selection & management
│   │   ├── index.ts
│   │   ├── CampaignManagerTool.tsx
│   │   ├── 📁 components/
│   │   │   ├── CampaignSelector.tsx  # Campaign switching interface
│   │   │   ├── CampaignList.tsx      # Lista campagne esistenti
│   │   │   ├── CampaignForm.tsx      # Creazione/modifica campagna
│   │   │   ├── CampaignCard.tsx      # Card campagna con info base
│   │   │   └── CampaignSettings.tsx  # Impostazioni campagna
│   │   └── 📁 hooks/
│   │       ├── useCampaignManager.ts # Gestione campagne
│   │       └── useCampaignSwitcher.ts # Switching logic
│   │
│   ├── 📁 CharacterManager/  # Player Character management (DM view)
│   │   ├── index.ts
│   │   ├── CharacterManagerTool.tsx
│   │   ├── 📁 components/
│   │   │   ├── CharacterList.tsx     # Lista PG della campagna
│   │   │   ├── CharacterDetail.tsx   # Dettaglio PG (DM perspective)
│   │   │   ├── CharacterForm.tsx     # Modifica info base PG
│   │   │   ├── CharacterBackground.tsx # Background, imprese, sidequests
│   │   │   ├── CharacterRelations.tsx  # Relazioni con NPCs
│   │   │   └── CharacterProgress.tsx   # Progressi, achievements
│   │   └── 📁 hooks/
│   │       ├── useCharacterManager.ts # Gestione PG campagna
│   │       └── useCharacterProgress.ts # Tracking progressi
│   │
│   ├── 📁 NPCManager/        # NPC management
│   │   ├── index.ts
│   │   ├── NPCManagerTool.tsx
│   │   ├── 📁 components/
│   │   │   ├── NPCList.tsx           # Lista NPCs campagna
│   │   │   ├── NPCDetail.tsx         # Dettaglio NPC completo
│   │   │   ├── NPCForm.tsx           # Creazione/modifica NPC
│   │   │   ├── NPCRelations.tsx      # Relazioni con party/PG
│   │   │   ├── NPCInteractions.tsx   # Storia interazioni
│   │   │   ├── NPCQuests.tsx         # Quest associate all'NPC
│   │   │   └── AttitudeTracker.tsx   # Attitude verso party
│   │   └── 📁 hooks/
│   │       ├── useNPCManager.ts      # Gestione NPCs
│   │       ├── useNPCRelations.ts    # Relationship tracking
│   │       └── useNPCInteractions.ts # Interaction history
│   │
│   ├── 📁 EnvironmentManager/ # Environment/location management
│   │   ├── index.ts
│   │   ├── EnvironmentManagerTool.tsx
│   │   ├── 📁 components/
│   │   │   ├── EnvironmentList.tsx   # Lista ambientazioni
│   │   │   ├── EnvironmentDetail.tsx # Dettaglio ambientazione
│   │   │   ├── EnvironmentForm.tsx   # Creazione/modifica ambiente
│   │   │   ├── ServicesManager.tsx   # Servizi offerti
│   │   │   ├── DangersManager.tsx    # Pericoli ambientali
│   │   │   ├── LocationNPCs.tsx      # NPCs collegati
│   │   │   └── EnvironmentMaps.tsx   # Mappe associate
│   │   └── 📁 hooks/
│   │       ├── useEnvironments.ts    # Gestione ambientazioni
│   │       └── useLocationServices.ts # Servizi e pericoli
│   │
│   ├── 📁 MapManager/        # Map management & annotations
│   │   ├── index.ts
│   │   ├── MapManagerTool.tsx
│   │   ├── 📁 components/
│   │   │   ├── MapList.tsx           # Lista mappe disponibili
│   │   │   ├── MapEditor.tsx         # Editor mappe + annotazioni
│   │   │   ├── MapViewer.tsx         # Visualizzatore mappe
│   │   │   ├── MapAnnotations.tsx    # Descrizioni, segreti
│   │   │   ├── TreasureManager.tsx   # Gestione tesori
│   │   │   ├── SecretPassages.tsx    # Passaggi segreti
│   │   │   ├── PuzzleManager.tsx     # Enigmi ambientali
│   │   │   └── FogOfWar.tsx          # Fog of war (futuro)
│   │   └── 📁 hooks/
│   │       ├── useMapManager.ts      # Gestione mappe
│   │       ├── useMapAnnotations.ts  # Annotazioni
│   │       └── useFogOfWar.ts        # Fog of war logic
│   │
│   ├── 📁 ItemCatalog/       # Item management
│   │   ├── index.ts
│   │   ├── ItemCatalogTool.tsx
│   │   ├── 📁 components/
│   │   │   ├── ItemList.tsx          # Lista items campagna
│   │   │   ├── ItemDetail.tsx        # Dettaglio item
│   │   │   ├── ItemForm.tsx          # Creazione/modifica item
│   │   │   ├── ItemCategories.tsx    # Organizzazione per categorie
│   │   │   ├── EquipmentManager.tsx  # Equipaggiamento
│   │   │   ├── ConsumablesManager.tsx # Consumabili
│   │   │   └── RelicsManager.tsx     # Reliquie/artefatti
│   │   └── 📁 hooks/
│   │       ├── useItemCatalog.ts     # Gestione catalog items
│   │       └── useItemCategories.ts  # Categorizzazione
│   │
│   ├── 📁 InventoryTracker/  # Party inventory tracking
│   │   ├── index.ts
│   │   ├── InventoryTrackerTool.tsx
│   │   ├── 📁 components/
│   │   │   ├── InventoryOverview.tsx # Overview inventario party
│   │   │   ├── ItemDistribution.tsx  # Chi ha cosa
│   │   │   ├── CurrencyTracker.tsx   # Monete oro/argento/etc
│   │   │   ├── ResourceTracker.tsx   # Altre risorse
│   │   │   ├── InventoryHistory.tsx  # Storia cambiamenti
│   │   │   └── LootDistribution.tsx  # Distribuzione loot
│   │   └── 📁 hooks/
│   │       ├── usePartyInventory.ts  # Inventario party
│   │       └── useInventoryHistory.ts # Storia modifiche
│   │
│   ├── 📁 QuestTracker/      # Quest tracking & management
│   │   ├── index.ts
│   │   ├── QuestTrackerTool.tsx
│   │   ├── 📁 components/
│   │   │   ├── QuestOverview.tsx     # Overview quests attive
│   │   │   ├── QuestDetail.tsx       # Dettaglio quest
│   │   │   ├── QuestForm.tsx         # Creazione/modifica quest
│   │   │   ├── QuestTimeline.tsx     # Timeline quest completate
│   │   │   ├── PartyDecisions.tsx    # Decisioni importanti party
│   │   │   ├── FutureQuests.tsx      # Quest pianificate
│   │   │   └── QuestObjectives.tsx   # Obiettivi quest
│   │   └── 📁 hooks/
│   │       ├── useQuestTracker.ts    # Gestione quest
│   │       ├── useQuestProgress.ts   # Progresso quest
│   │       └── usePartyDecisions.ts  # Decision tracking
│   │
│   ├── 📁 Bestiary/          # Monster creation & management (CORE TOOL)
│   │   ├── index.ts
│   │   ├── BestiaryTool.tsx      # Main monster management tool
│   │   ├── 📁 components/
│   │   │   ├── MonsterList.tsx       # Lista mostri con filtri
│   │   │   ├── MonsterDetail.tsx     # Scheda dettaglio mostro
│   │   │   ├── MonsterEditor.tsx     # Editor completo mostro
│   │   │   ├── StatBlockEditor.tsx   # Editor stat block
│   │   │   ├── ActionsEditor.tsx     # Editor azioni/bonus/reazioni
│   │   │   ├── SpellsEditor.tsx      # Editor incantesimi mostro
│   │   │   ├── CRCalculator.tsx      # Calcolatore CR automatico
│   │   │   └── MonsterImporter.tsx   # Import da SRD/homebrew
│   │   ├── 📁 hooks/
│   │   │   ├── useMonsterLibrary.ts  # Gestione libreria mostri
│   │   │   ├── useMonsterEditor.ts   # Form validation + save
│   │   │   ├── useCRCalculation.ts   # CR calculation logic
│   │   │   └── useMonsterSearch.ts   # Search + filter logic
│   │   └── 📁 services/
│   │       └── monsterApi.ts         # API calls specifiche
│   │
│   ├── 📁 EncounterBuilder/  # Encounter creation & balancing
│   │   ├── index.ts
│   │   ├── EncounterBuilderTool.tsx
│   │   ├── 📁 components/
│   │   │   ├── EncounterList.tsx     # Lista incontri salvati
│   │   │   ├── EncounterEditor.tsx   # Editor incontro
│   │   │   ├── MonsterSelector.tsx   # Selezione mostri dal bestiario
│   │   │   ├── MapSelector.tsx       # Selezione mappa per incontro
│   │   │   ├── DifficultyCalculator.tsx # CR calculation per gruppo
│   │   │   ├── PartyConfiguration.tsx    # Setup basic PG (livelli, numero)
│   │   │   ├── EnvironmentSelector.tsx   # Ambiente di combattimento
│   │   │   └── EncounterPreview.tsx      # Preview incontro completo
│   │   └── 📁 hooks/
│   │       ├── useEncounterBalance.ts    # Difficulty balancing logic
│   │       ├── useMonsterSelection.ts    # Monster search/selection
│   │       └── usePartyBalance.ts        # Party level balancing
│   │
│   ├── 📁 CombatTracker/     # Combat management (CORE TOOL)
│   │   ├── index.ts
│   │   ├── CombatTrackerTool.tsx
│   │   ├── 📁 components/
│   │   │   ├── InitiativeList.tsx    # Lista ordine iniziativa
│   │   │   ├── ParticipantManager.tsx # Gestione PG + mostri
│   │   │   ├── PlayerEntry.tsx       # Entry basilare per PG (nome, AC, HP)
│   │   │   ├── MonsterEntry.tsx      # Entry completa per mostri
│   │   │   ├── MapIntegration.tsx    # Integrazione con mappe
│   │   │   ├── CombatControls.tsx    # Next turn, end combat, round counter
│   │   │   ├── ConditionManager.tsx  # Gestione condizioni
│   │   │   ├── HealthTracker.tsx     # HP tracking con damage log
│   │   │   ├── QuickActions.tsx      # Azioni rapide (attack, save, check)
│   │   │   └── CombatLog.tsx         # Log delle azioni di combattimento
│   │   └── 📁 hooks/
│   │       ├── useCombatFlow.ts      # Combat state machine
│   │       ├── useInitiativeOrder.ts # Initiative sorting + management
│   │       ├── useParticipants.ts    # Add/remove participants
│   │       ├── useHealthTracking.ts  # HP/damage tracking
│   │       ├── useCombatLog.ts       # Action logging
│   │       └── useMapIntegration.ts  # Map + combat integration
│   │
│   └── 📁 DiceRoller/        # Advanced dice rolling
│       ├── index.ts
│       ├── DiceRollerTool.tsx
│       ├── 📁 components/
│       │   ├── DiceInput.tsx         # Dice notation input
│       │   ├── RollHistory.tsx       # Roll history display
│       │   ├── QuickRolls.tsx        # Common roll buttons
│       │   ├── MonsterRolls.tsx      # Monster-specific quick rolls
│       │   ├── AdvantageControls.tsx # Advantage/disadvantage
│       │   └── CustomRollSets.tsx    # Save custom roll combinations
│       └── 📁 hooks/
│           ├── useRollHistory.ts     # History management
│           ├── useDiceNotation.ts    # Notation parsing
│           └── useQuickRolls.ts      # Quick roll management
│
├── 📁 pages/                 # Top-level routing
│   ├── index.ts
│   ├── HomePage.tsx              # Dashboard overview + campaign selection
│   ├── CampaignDashboard.tsx     # Dashboard campagna attiva
│   ├── ToolsOverview.tsx         # Grid overview di tutti i tools
│   ├── ManagementPage.tsx        # Page per tool di gestione (Characters, NPCs, etc.)
│   ├── CombatPage.tsx            # Page per combat tools (Bestiary, Combat, Encounters)
│   └── SettingsPage.tsx          # App settings
│
├── 📁 tauri/                 # Tauri integration layer
│   ├── index.ts
│   ├── 📁 commands/          # Typed Tauri command wrappers
│   │   ├── index.ts
│   │   ├── campaigns.ts          # Campaign commands wrapper
│   │   ├── characters.ts         # Player characters commands wrapper
│   │   ├── npcs.ts               # NPC commands wrapper
│   │   ├── environments.ts       # Environment commands wrapper
│   │   ├── items.ts              # Item catalog commands wrapper
│   │   ├── inventory.ts          # Party inventory commands wrapper
│   │   ├── quests.ts             # Quest tracking commands wrapper
│   │   ├── maps.ts               # Map management commands wrapper
│   │   ├── monsters.ts           # Monster commands wrapper
│   │   ├── encounters.ts         # Encounter commands wrapper
│   │   ├── combat.ts             # Combat tracking commands wrapper
│   │   ├── dice.ts               # Dice commands wrapper
│   │   └── system.ts             # System commands wrapper
│   │
│   ├── 📁 events/            # Tauri event handling
│   │   ├── index.ts
│   │   ├── fileWatcher.ts        # File change notifications
│   │   └── systemEvents.ts       # System-level events
│   │
│   └── 📁 types/             # Tauri-specific types
│       ├── index.ts
│       ├── commands.ts           # Command input/output types
│       └── events.ts             # Event payload types
│
└── 📁 assets/                # Static assets
    ├── 📁 images/
    ├── 📁 icons/
    ├── 📁 fonts/
    └── 📁 styles/
        ├── globals.css
        ├── variables.css
        └── 📁 themes/
            ├── dark.css
            └── light.css
```

## 🔑 Principi di Riutilizzabilità Implementati

### **1. Layered Architecture**

- **Core Layer**: Logica D&D pura, riutilizzabile in qualsiasi frontend
- **Shared Layer**: Componenti e utilities trasversali
- **Tools Layer**: Funzionalità specifiche che compongono i shared components

### **2. Composizione vs Ereditarietà**

```typescript
// Shared components riutilizzabili
import { StatBlock, DiceRoller, HealthBar } from "@/shared/components/dnd";

// Composizione nei tools
const CharacterSheet = () => (
  <div>
    <StatBlock character={character} />
    <HealthBar current={hp} max={maxHp} />
    <DiceRoller onRoll={handleRoll} />
  </div>
);
```

### **3. Hook Pattern per Logic Reuse**

```typescript
// Riutilizzabile in qualsiasi tool
const { rollDice, history } = useDiceRoll();
const { character, updateStat } = useCharacter(id);
const { initiative, nextTurn } = useCombat();
```

### **4. Service Layer per Business Logic**

```typescript
// Services riutilizzabili tra tools
import { CharacterService, CombatService } from "@/core/services";

// Calcoli consistenti ovunque
const ac = CharacterService.calculateAC(character);
const damage = CombatService.calculateDamage(attack, target);
```

### **5. Typed API Layer**

```typescript
// Wrapper tipizzati per Tauri commands
import { charactersApi, combatApi } from "@/tauri/commands";

// Type safety + autocomplete
const character = await charactersApi.create(characterData);
const initiative = await combatApi.rollInitiative(creatures);
```

### **6. Constants & Reference Data**

```typescript
// Dati D&D centralizzati e riutilizzabili
import { CLASSES, RACES, SPELLS } from "@/core/constants";

// Consistenza dei dati in tutta l'app
const spellcastingClasses = CLASSES.filter((c) => c.spellcasting);
```

## 🚀 Vantaggi di Questa Struttura

✅ **Rapid Tool Development**: Componi tools da shared components
✅ **Consistent D&D Logic**: Rules engine centralizzato
✅ **Type Safety**: End-to-end typing da Tauri a React
✅ **Easy Testing**: Logic separata da UI
✅ **Future Scaling**: Aggiungi tools senza refactoring
✅ **Code Reuse**: Massima riutilizzabilità senza over-engineering
