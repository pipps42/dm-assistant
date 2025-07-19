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
