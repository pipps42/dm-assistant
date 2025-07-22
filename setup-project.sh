#!/bin/bash

# DM Assistant - Project Structure Creation Script
# Creates the complete directory structure and essential files

echo "🎲 Creating DM Assistant project structure..."

# Create root directories
mkdir -p scripts
mkdir -p tests/{unit,integration,e2e}


echo "📁 Creating Rust backend structure..."

# ===== RUST BACKEND STRUCTURE =====

# Core directories
mkdir -p src-tauri/src/{commands,core,services,utils}
mkdir -p src-tauri/src/core/{models,rules,validation}

# Create Rust main files
cat > src-tauri/src/main.rs << 'EOF'
// DM Assistant - Main entry point
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod core;
mod services;
mod utils;

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // Commands will be registered here
        ])
        .setup(|app| {
            // App setup logic
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
EOF

cat > src-tauri/src/lib.rs << 'EOF'
//! DM Assistant Library
//! Core functionality for D&D campaign management

pub mod commands;
pub mod core;
pub mod services;
pub mod utils;
EOF

# Rust module files
echo "pub mod campaigns;" > src-tauri/src/commands/mod.rs
echo "pub mod characters;" >> src-tauri/src/commands/mod.rs
echo "pub mod npcs;" >> src-tauri/src/commands/mod.rs
echo "pub mod environments;" >> src-tauri/src/commands/mod.rs
echo "pub mod items;" >> src-tauri/src/commands/mod.rs
echo "pub mod inventory;" >> src-tauri/src/commands/mod.rs
echo "pub mod quests;" >> src-tauri/src/commands/mod.rs
echo "pub mod monsters;" >> src-tauri/src/commands/mod.rs
echo "pub mod encounters;" >> src-tauri/src/commands/mod.rs
echo "pub mod combat;" >> src-tauri/src/commands/mod.rs
echo "pub mod maps;" >> src-tauri/src/commands/mod.rs
echo "pub mod dice;" >> src-tauri/src/commands/mod.rs
echo "pub mod system;" >> src-tauri/src/commands/mod.rs

echo "pub mod models;" > src-tauri/src/core/mod.rs
echo "pub mod rules;" >> src-tauri/src/core/mod.rs
echo "pub mod validation;" >> src-tauri/src/core/mod.rs

echo "pub mod campaign;" > src-tauri/src/core/models/mod.rs
echo "pub mod character;" >> src-tauri/src/core/models/mod.rs
echo "pub mod npc;" >> src-tauri/src/core/models/mod.rs
echo "pub mod environment;" >> src-tauri/src/core/models/mod.rs
echo "pub mod map;" >> src-tauri/src/core/models/mod.rs
echo "pub mod item;" >> src-tauri/src/core/models/mod.rs
echo "pub mod inventory;" >> src-tauri/src/core/models/mod.rs
echo "pub mod quest;" >> src-tauri/src/core/models/mod.rs
echo "pub mod monster;" >> src-tauri/src/core/models/mod.rs
echo "pub mod participant;" >> src-tauri/src/core/models/mod.rs
echo "pub mod encounter;" >> src-tauri/src/core/models/mod.rs
echo "pub mod combat;" >> src-tauri/src/core/models/mod.rs
echo "pub mod common;" >> src-tauri/src/core/models/mod.rs

echo "pub mod storage;" > src-tauri/src/services/mod.rs
echo "pub mod backup;" >> src-tauri/src/services/mod.rs
echo "pub mod import_export;" >> src-tauri/src/services/mod.rs
echo "pub mod templates;" >> src-tauri/src/services/mod.rs

echo "pub mod id_generator;" > src-tauri/src/utils/mod.rs
echo "pub mod file_system;" >> src-tauri/src/utils/mod.rs
echo "pub mod error;" >> src-tauri/src/utils/mod.rs

# Create empty Rust command files
touch src-tauri/src/commands/{campaigns,characters,npcs,environments,items,inventory,quests,monsters,encounters,combat,maps,dice,system}.rs

# Create empty Rust model files
touch src-tauri/src/core/models/{campaign,character,npc,environment,map,item,inventory,quest,monster,participant,encounter,combat,common}.rs

# Create empty Rust service files
touch src-tauri/src/services/{storage,backup,import_export,templates}.rs

# Create empty Rust utility files
touch src-tauri/src/utils/{id_generator,file_system,error}.rs

echo "⚛️ Creating React frontend structure..."

# ===== REACT FRONTEND STRUCTURE =====

# Core directories
mkdir -p src/{core,shared,tools,pages,tauri,assets}
mkdir -p src/core/{entities,rules,services,constants}
mkdir -p src/shared/{components,hooks,utils,stores}
mkdir -p src/shared/components/{ui,dnd,layout}
mkdir -p src/shared/hooks/{core,dnd,ui}
mkdir -p src/shared/utils/{dnd,data,ui}

# Tools directories
mkdir -p src/tools/{CampaignManager,CharacterManager,NPCManager,EnvironmentManager,MapManager,ItemCatalog,InventoryTracker,QuestTracker,Bestiary,EncounterBuilder,CombatTracker,DiceRoller}

# Create component subdirectories for each tool
for tool in CampaignManager CharacterManager NPCManager EnvironmentManager MapManager ItemCatalog InventoryTracker QuestTracker Bestiary EncounterBuilder CombatTracker DiceRoller; do
    mkdir -p src/tools/$tool/{components,hooks,services}
done

# Tauri integration
mkdir -p src/tauri/{commands,events,types}

# Assets
mkdir -p src/assets/{images,icons,fonts,styles}
mkdir -p src/assets/styles/themes

# Create TypeScript index files with proper exports

# Core entities
cat > src/core/entities/index.ts << 'EOF'
// Core D&D entity types and interfaces
export * from './Campaign'
export * from './Character'
export * from './NPC'
export * from './Environment'
export * from './Map'
export * from './Item'
export * from './Inventory'
export * from './Quest'
export * from './Monster'
export * from './Participant'
export * from './Encounter'
export * from './Combat'
export * from './Common'
EOF

# Core services
cat > src/core/services/index.ts << 'EOF'
// Business logic services
export * from './CampaignService'
export * from './CharacterService'
export * from './NPCService'
export * from './EnvironmentService'
export * from './ItemService'
export * from './InventoryService'
export * from './QuestService'
export * from './MonsterService'
export * from './CombatService'
export * from './EncounterService'
export * from './MapService'
export * from './DiceService'
export * from './StatCalculator'
export * from './ValidationService'
EOF

# Shared components
cat > src/shared/components/index.ts << 'EOF'
// Shared UI components
export * from './ui'
export * from './dnd'
export * from './layout'
EOF

cat > src/shared/components/ui/index.ts << 'EOF'
// Primitive UI components
// export * from './Button'
// export * from './Modal'
// export * from './Form'
// export * from './Table'
// export * from './Card'
// export * from './Layout'
// export * from './Navigation'
// export * from './Feedback'
EOF

cat > src/shared/components/dnd/index.ts << 'EOF'
// D&D specific components
// export * from './MonsterStatBlock'
// export * from './CharacterCard'
// export * from './NPCCard'
// export * from './EnvironmentCard'
// export * from './ItemCard'
// export * from './QuestTracker'
// export * from './InventoryGrid'
// export * from './MapViewer'
// export * from './DiceRoller'
// export * from './AbilityScore'
// export * from './HealthTracker'
// export * from './ConditionTracker'
// export * from './InitiativeTracker'
// export * from './CRCalculator'
// export * from './ActionBlock'
// export * from './ParticipantCard'
// export * from './RelationshipGraph'
EOF

# Shared hooks
cat > src/shared/hooks/index.ts << 'EOF'
// Shared React hooks
export * from './core'
export * from './dnd'
export * from './ui'
EOF

cat > src/shared/hooks/dnd/index.ts << 'EOF'
// D&D specific hooks
// export * from './useCampaign'
// export * from './useCharacters'
// export * from './useNPCs'
// export * from './useEnvironments'
// export * from './useItems'
// export * from './useInventory'
// export * from './useQuests'
// export * from './useMaps'
// export * from './useDiceRoll'
// export * from './useMonster'
// export * from './useCombat'
// export * from './useInitiative'
// export * from './useHealthTracking'
// export * from './useConditions'
// export * from './useCRCalculator'
// export * from './useParticipants'
// export * from './useRelationships'
EOF

# Tools index files
for tool in CampaignManager CharacterManager NPCManager EnvironmentManager MapManager ItemCatalog InventoryTracker QuestTracker Bestiary EncounterBuilder CombatTracker DiceRoller; do
    cat > src/tools/$tool/index.ts << EOF
// $tool exports
export { default as ${tool}Tool } from './${tool}Tool'
// export * from './components'
// export * from './hooks'
// export * from './services'
EOF
done

# Tauri commands
cat > src/tauri/commands/index.ts << 'EOF'
// Tauri command wrappers
export * from './campaigns'
export * from './characters'
export * from './npcs'
export * from './environments'
export * from './items'
export * from './inventory'
export * from './quests'
export * from './maps'
export * from './monsters'
export * from './encounters'
export * from './combat'
export * from './dice'
export * from './system'
EOF

# Create empty TypeScript files
touch src/core/entities/{Campaign,Character,NPC,Environment,Map,Item,Inventory,Quest,Monster,Participant,Encounter,Combat,Common}.ts
touch src/core/services/{CampaignService,CharacterService,NPCService,EnvironmentService,ItemService,InventoryService,QuestService,MonsterService,CombatService,EncounterService,MapService,DiceService,StatCalculator,ValidationService}.ts
touch src/core/constants/{creature_types,sizes,alignments,damage_types,conditions,environments,cr_guidelines}.ts
touch src/shared/hooks/core/{useTauri,useLocalStorage,useDebounce,useAsync,useForm}.ts
touch src/shared/hooks/ui/{useModal,useToast,useTable,useSearchFilter}.ts
touch src/shared/utils/dnd/{dice,monster,combat,cr_calculation,formatting}.ts
touch src/tauri/commands/{campaigns,characters,npcs,environments,items,inventory,quests,maps,monsters,encounters,combat,dice,system}.ts

# Create tool main component files
for tool in CampaignManager CharacterManager NPCManager EnvironmentManager MapManager ItemCatalog InventoryTracker QuestTracker Bestiary EncounterBuilder CombatTracker DiceRoller; do
    cat > src/tools/$tool/${tool}Tool.tsx << EOF
import React from 'react'

interface ${tool}ToolProps {
  // Props will be defined here
}

const ${tool}Tool: React.FC<${tool}ToolProps> = () => {
  return (
    <div className="${tool,,}-tool">
      <h1>$tool</h1>
      <p>$tool implementation will go here</p>
    </div>
  )
}

export default ${tool}Tool
EOF
done

# Create pages
touch src/pages/{HomePage,CampaignDashboard,ToolsOverview,ManagementPage,CombatPage,SettingsPage}.tsx

# Create core index files
echo "export * from './entities'" > src/core/index.ts
echo "export * from './rules'" >> src/core/index.ts
echo "export * from './services'" >> src/core/index.ts
echo "export * from './constants'" >> src/core/index.ts

echo "export * from './components'" > src/shared/index.ts
echo "export * from './hooks'" >> src/shared/index.ts
echo "export * from './utils'" >> src/shared/index.ts
echo "export * from './stores'" >> src/shared/index.ts

echo "export * from './CampaignManager'" > src/tools/index.ts
echo "export * from './CharacterManager'" >> src/tools/index.ts
echo "export * from './NPCManager'" >> src/tools/index.ts
echo "export * from './EnvironmentManager'" >> src/tools/index.ts
echo "export * from './MapManager'" >> src/tools/index.ts
echo "export * from './ItemCatalog'" >> src/tools/index.ts
echo "export * from './InventoryTracker'" >> src/tools/index.ts
echo "export * from './QuestTracker'" >> src/tools/index.ts
echo "export * from './Bestiary'" >> src/tools/index.ts
echo "export * from './EncounterBuilder'" >> src/tools/index.ts
echo "export * from './CombatTracker'" >> src/tools/index.ts
echo "export * from './DiceRoller'" >> src/tools/index.ts

# Create basic CSS files
cat > src/assets/styles/globals.css << 'EOF'
/* DM Assistant Global Styles */
:root {
  --color-primary: #d20000;
  --color-secondary: #8b0000;
  --color-background: #1a1a1a;
  --color-surface: #2d2d2d;
  --color-text: #ffffff;
  --color-text-secondary: #cccccc;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--color-background);
  color: var(--color-text);
  line-height: 1.6;
}

.App {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
EOF

touch src/assets/styles/variables.css
touch src/assets/styles/themes/{dark,light}.css

# Create documentation files
cat > docs/README.md << 'EOF'
# DM Assistant Documentation

This directory contains all project documentation.

## Files
- `PROJECT_OVERVIEW.md` - Complete project overview and development guidelines
- `ARCHITECTURE.md` - Technical architecture details
- `API.md` - API documentation
- `DEVELOPMENT.md` - Development setup and guidelines
EOF

touch docs/{ARCHITECTURE,API,DEVELOPMENT}.md

# Create basic README
cat > README.md << 'EOF'
# DM Assistant

A desktop application for Dungeon Masters to manage D&D 5e campaigns.

## Features

- **Campaign Management**: Switch between multiple campaigns
- **Entity Management**: Characters, NPCs, environments, items, quests
- **Combat Tools**: Initiative tracking, HP management, condition tracking
- **Bestiary**: Complete monster management with custom stat blocks
- **Encounter Builder**: Balanced encounter creation with CR calculations
- **Map Management**: Map annotations, secrets, and fog of war support

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Rust + Tauri
- **State Management**: Zustand
- **Storage**: Local JSON files

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run tauri dev

# Build for production
npm run tauri build
```

## Project Structure

See `docs/PROJECT_OVERVIEW.md` for complete project documentation.
EOF

echo "✅ Project structure created successfully!"
echo ""
echo "📋 Summary:"
echo "  • Rust backend structure in src-tauri/src/"
echo "  • React frontend structure in src/"
echo "  • 12 DM tools with component directories"
echo "  • Shared components and hooks structure"
echo "  • Core entities and services structure"
echo "  • Configuration files (package.json, tsconfig.json, etc.)"
echo "  • Documentation structure in docs/"
echo ""
echo "🚀 Next steps:"
echo "  1. Run 'npm install' to install dependencies"
echo "  2. Run 'npm run tauri dev' to start development"
echo "  3. Begin implementing tools starting with core entities"
echo ""
echo "📚 See docs/PROJECT_OVERVIEW.md for development guidelines"