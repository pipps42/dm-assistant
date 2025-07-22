// src-tauri/src/services/character_storage.rs

use crate::core::models::character::PlayerCharacter;
use crate::utils::error::{DmAssistantError, DmResult};
use crate::utils::file_system::{get_campaign_dir, save_json, load_json, file_exists};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use uuid::Uuid;

/// Character collection for a campaign
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CharacterCollection {
    pub campaign_id: Uuid,
    pub characters: HashMap<Uuid, PlayerCharacter>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl CharacterCollection {
    pub fn new(campaign_id: Uuid) -> Self {
        let now = chrono::Utc::now();
        Self {
            campaign_id,
            characters: HashMap::new(),
            created_at: now,
            updated_at: now,
        }
    }
    
    pub fn add_character(&mut self, character: PlayerCharacter) {
        self.characters.insert(character.id, character);
        self.updated_at = chrono::Utc::now();
    }
    
    pub fn update_character(&mut self, character: PlayerCharacter) -> bool {
        if self.characters.contains_key(&character.id) {
            self.characters.insert(character.id, character);
            self.updated_at = chrono::Utc::now();
            true
        } else {
            false
        }
    }
    
    pub fn remove_character(&mut self, character_id: &Uuid) -> bool {
        if self.characters.remove(character_id).is_some() {
            self.updated_at = chrono::Utc::now();
            true
        } else {
            false
        }
    }
    
    pub fn get_character(&self, character_id: &Uuid) -> Option<&PlayerCharacter> {
        self.characters.get(character_id)
    }
    
    pub fn get_character_mut(&mut self, character_id: &Uuid) -> Option<&mut PlayerCharacter> {
        self.characters.get_mut(character_id)
    }
    
    pub fn get_all_characters(&self) -> Vec<&PlayerCharacter> {
        self.characters.values().collect()
    }
    
    pub fn get_active_characters(&self) -> Vec<&PlayerCharacter> {
        self.characters.values().filter(|c| c.is_active).collect()
    }
}

/// File-based character storage service
pub struct CharacterStorageService;

impl CharacterStorageService {
    /// Get file path for campaign characters
    fn get_characters_file_path(campaign_id: &Uuid) -> DmResult<PathBuf> {
        let campaign_dir = get_campaign_dir(&campaign_id.to_string())?;
        Ok(campaign_dir.join("characters.json"))
    }
    
    /// Load characters for a campaign
    pub fn load_characters(campaign_id: &Uuid) -> DmResult<CharacterCollection> {
        let file_path = Self::get_characters_file_path(campaign_id)?;
        
        if file_exists(&file_path) {
            load_json(&file_path)
        } else {
            // Create new collection if file doesn't exist
            let collection = CharacterCollection::new(*campaign_id);
            Self::save_characters(&collection)?;
            Ok(collection)
        }
    }
    
    /// Save characters for a campaign
    pub fn save_characters(collection: &CharacterCollection) -> DmResult<()> {
        let file_path = Self::get_characters_file_path(&collection.campaign_id)?;
        save_json(collection, &file_path)
    }
    
    /// Create a new character
    pub fn create_character(character: PlayerCharacter) -> DmResult<PlayerCharacter> {
        let mut collection = Self::load_characters(&character.campaign_id)?;
        
        // Check if character already exists
        if collection.characters.contains_key(&character.id) {
            return Err(DmAssistantError::character(&format!("Character with ID {} already exists", character.id)));
        }
        
        collection.add_character(character.clone());
        Self::save_characters(&collection)?;
        
        Ok(character)
    }
    
    /// Get character by ID
    pub fn get_character(campaign_id: &Uuid, character_id: &Uuid) -> DmResult<Option<PlayerCharacter>> {
        let collection = Self::load_characters(campaign_id)?;
        Ok(collection.get_character(character_id).cloned())
    }
    
    /// Get all characters for campaign
    pub fn get_characters_by_campaign(campaign_id: &Uuid) -> DmResult<Vec<PlayerCharacter>> {
        let collection = Self::load_characters(campaign_id)?;
        Ok(collection.get_all_characters().into_iter().cloned().collect())
    }
    
    /// Get active characters for campaign
    pub fn get_active_characters_by_campaign(campaign_id: &Uuid) -> DmResult<Vec<PlayerCharacter>> {
        let collection = Self::load_characters(campaign_id)?;
        Ok(collection.get_active_characters().into_iter().cloned().collect())
    }
    
    /// Update character
    pub fn update_character(character: PlayerCharacter) -> DmResult<PlayerCharacter> {
        let mut collection = Self::load_characters(&character.campaign_id)?;
        
        if !collection.update_character(character.clone()) {
            return Err(DmAssistantError::not_found("Character", &character.id.to_string()));
        }
        
        Self::save_characters(&collection)?;
        Ok(character)
    }
    
    /// Delete character
    pub fn delete_character(campaign_id: &Uuid, character_id: &Uuid) -> DmResult<bool> {
        let mut collection = Self::load_characters(campaign_id)?;
        
        let removed = collection.remove_character(character_id);
        if removed {
            Self::save_characters(&collection)?;
        }
        
        Ok(removed)
    }
    
    /// Modify character in place (for operations like add achievement, update relationship)
    pub fn modify_character<F>(campaign_id: &Uuid, character_id: &Uuid, modifier: F) -> DmResult<PlayerCharacter>
    where
        F: FnOnce(&mut PlayerCharacter) -> DmResult<()>,
    {
        let mut collection = Self::load_characters(campaign_id)?;
        
        let character = collection.get_character_mut(character_id)
            .ok_or_else(|| DmAssistantError::not_found("Character", &character_id.to_string()))?;
        
        modifier(character)?;
        character.updated_at = chrono::Utc::now();
        
        let result = character.clone();
        Self::save_characters(&collection)?;
        
        Ok(result)
    }
    
    /// Get characters that have relationship with specific NPC
    pub fn get_characters_by_npc_relationship(npc_id: &Uuid) -> DmResult<Vec<PlayerCharacter>> {
        // This is more complex as we need to search across all campaigns
        // For now, we'll search in a specific campaign
        // TODO: Implement cross-campaign search or require campaign_id parameter
        Err(DmAssistantError::internal("Cross-campaign NPC relationship search not implemented yet"))
    }
    
    /// Backup characters file
    pub fn backup_characters(campaign_id: &Uuid) -> DmResult<PathBuf> {
        let file_path = Self::get_characters_file_path(campaign_id)?;
        crate::utils::file_system::backup_file(&file_path)
    }
    
    /// Check if characters file exists for campaign
    pub fn characters_file_exists(campaign_id: &Uuid) -> bool {
        if let Ok(file_path) = Self::get_characters_file_path(campaign_id) {
            file_exists(&file_path)
        } else {
            false
        }
    }
}