use crate::core::models::character::{
    PlayerCharacter, 
    CreateCharacterRequest, 
    UpdateCharacterRequest,
    AddAchievementRequest,
    UpdateRelationshipRequest
};
use crate::services::character_storage::CharacterStorageService;
use crate::utils::error::{DmAssistantError, DmResult, validate_uuid};
use uuid::Uuid;

#[tauri::command]
pub async fn create_character(req: CreateCharacterRequest) -> DmResult<PlayerCharacter> {
    // Validate campaign ID format
    validate_uuid(&req.campaign_id.to_string(), "Campaign")?;
    
    let character = PlayerCharacter::new(req);
    CharacterStorageService::create_character(character)
}

#[tauri::command]
pub async fn get_character(character_id: String) -> DmResult<Option<PlayerCharacter>> {
    let id = validate_uuid(&character_id, "Character")?;
    
    // We need campaign_id to load from file, but for now we'll return an error
    // This will be fixed when we implement proper campaign management
    Err(DmAssistantError::internal("get_character requires campaign context - use get_character_with_campaign instead"))
}

#[tauri::command]
pub async fn get_character_with_campaign(
    campaign_id: String,
    character_id: String
) -> DmResult<Option<PlayerCharacter>> {
    let campaign_uuid = validate_uuid(&campaign_id, "Campaign")?;
    let char_uuid = validate_uuid(&character_id, "Character")?;
    
    CharacterStorageService::get_character(&campaign_uuid, &char_uuid)
}

#[tauri::command]
pub async fn get_characters_by_campaign(campaign_id: String) -> DmResult<Vec<PlayerCharacter>> {
    let campaign_uuid = validate_uuid(&campaign_id, "Campaign")?;
    CharacterStorageService::get_characters_by_campaign(&campaign_uuid)
}

#[tauri::command]
pub async fn get_active_characters_by_campaign(campaign_id: String) -> DmResult<Vec<PlayerCharacter>> {
    let campaign_uuid = validate_uuid(&campaign_id, "Campaign")?;
    CharacterStorageService::get_active_characters_by_campaign(&campaign_uuid)
}

#[tauri::command]
pub async fn update_character(
    character_id: String,
    req: UpdateCharacterRequest,
) -> DmResult<PlayerCharacter> {
    let id = validate_uuid(&character_id, "Character")?;
    
    // Get current character to find campaign_id
    // For now, we'll need campaign_id as parameter
    Err(DmAssistantError::internal("update_character requires campaign context - use update_character_with_campaign instead"))
}

#[tauri::command]
pub async fn update_character_with_campaign(
    campaign_id: String,
    character_id: String,
    req: UpdateCharacterRequest,
) -> DmResult<PlayerCharacter> {
    let campaign_uuid = validate_uuid(&campaign_id, "Campaign")?;
    let char_uuid = validate_uuid(&character_id, "Character")?;
    
    CharacterStorageService::modify_character(&campaign_uuid, &char_uuid, |character| {
        character.update(req);
        Ok(())
    })
}

#[tauri::command]
pub async fn delete_character(
    campaign_id: String,
    character_id: String,
) -> DmResult<bool> {
    let campaign_uuid = validate_uuid(&campaign_id, "Campaign")?;
    let char_uuid = validate_uuid(&character_id, "Character")?;
    
    CharacterStorageService::delete_character(&campaign_uuid, &char_uuid)
}

#[tauri::command]
pub async fn add_character_achievement(
    campaign_id: String,
    req: AddAchievementRequest,
) -> DmResult<PlayerCharacter> {
    let campaign_uuid = validate_uuid(&campaign_id, "Campaign")?;
    
    let character_id = req.character_id; 
    CharacterStorageService::modify_character(&campaign_uuid, &character_id, |character| {
        character.add_achievement(req);
        Ok(())
    })
}

#[tauri::command]
pub async fn remove_character_achievement(
    campaign_id: String,
    character_id: String,
    achievement_id: String,
) -> DmResult<PlayerCharacter> {
    let campaign_uuid = validate_uuid(&campaign_id, "Campaign")?;
    let char_uuid = validate_uuid(&character_id, "Character")?;
    let ach_uuid = validate_uuid(&achievement_id, "Achievement")?;
    
    CharacterStorageService::modify_character(&campaign_uuid, &char_uuid, |character| {
        let initial_count = character.achievements.len();
        character.achievements.retain(|a| a.id != ach_uuid);
        
        if character.achievements.len() == initial_count {
            return Err(DmAssistantError::not_found("Achievement", &achievement_id));
        }
        
        Ok(())
    })
}

#[tauri::command]
pub async fn update_character_relationship(
    campaign_id: String,
    req: UpdateRelationshipRequest,
) -> DmResult<PlayerCharacter> {
    let campaign_uuid = validate_uuid(&campaign_id, "Campaign")?;
    
    let character_id = req.character_id;
    CharacterStorageService::modify_character(&campaign_uuid, &character_id, |character| {
        character.update_relationship(req);
        Ok(())
    })
}

#[tauri::command]
pub async fn remove_character_relationship(
    campaign_id: String,
    character_id: String,
    npc_id: String,
) -> DmResult<PlayerCharacter> {
    let campaign_uuid = validate_uuid(&campaign_id, "Campaign")?;
    let char_uuid = validate_uuid(&character_id, "Character")?;
    let npc_uuid = validate_uuid(&npc_id, "NPC")?;
    
    CharacterStorageService::modify_character(&campaign_uuid, &char_uuid, |character| {
        let initial_count = character.relationships.len();
        character.relationships.retain(|r| r.npc_id != npc_uuid);
        
        if character.relationships.len() == initial_count {
            return Err(DmAssistantError::not_found("Relationship", &format!("Character {} with NPC {}", character_id, npc_id)));
        }
        
        Ok(())
    })
}

#[tauri::command]
pub async fn get_characters_by_npc_relationship(npc_id: String) -> DmResult<Vec<PlayerCharacter>> {
    let npc_uuid = validate_uuid(&npc_id, "NPC")?;
    
    // This requires cross-campaign search, which is not implemented yet
    CharacterStorageService::get_characters_by_npc_relationship(&npc_uuid)
}

#[tauri::command]
pub async fn level_up_character(
    campaign_id: String,
    character_id: String,
) -> DmResult<PlayerCharacter> {
    let campaign_uuid = validate_uuid(&campaign_id, "Campaign")?;
    let char_uuid = validate_uuid(&character_id, "Character")?;
    
    CharacterStorageService::modify_character(&campaign_uuid, &char_uuid, |character| {
        if character.level >= 20 {
            return Err(DmAssistantError::character("Character is already at max level (20)"));
        }
        
        character.level += 1;
        Ok(())
    })
}

#[tauri::command]
pub async fn toggle_character_active(
    campaign_id: String,
    character_id: String,
) -> DmResult<PlayerCharacter> {
    let campaign_uuid = validate_uuid(&campaign_id, "Campaign")?;
    let char_uuid = validate_uuid(&character_id, "Character")?;
    
    CharacterStorageService::modify_character(&campaign_uuid, &char_uuid, |character| {
        character.is_active = !character.is_active;
        Ok(())
    })
}

// File persistence functions

#[tauri::command]
pub async fn save_characters_to_file(campaign_id: String) -> DmResult<String> {
    let campaign_uuid = validate_uuid(&campaign_id, "Campaign")?;
    
    // Create backup before saving
    let backup_path = CharacterStorageService::backup_characters(&campaign_uuid)
        .unwrap_or_else(|_| std::path::PathBuf::from("backup failed"));
    
    Ok(format!("Characters saved successfully. Backup created at: {}", backup_path.display()))
}

#[tauri::command]
pub async fn load_characters_from_file(campaign_id: String) -> DmResult<Vec<PlayerCharacter>> {
    let campaign_uuid = validate_uuid(&campaign_id, "Campaign")?;
    CharacterStorageService::get_characters_by_campaign(&campaign_uuid)
}

#[tauri::command]
pub async fn characters_file_exists(campaign_id: String) -> DmResult<bool> {
    let campaign_uuid = validate_uuid(&campaign_id, "Campaign")?;
    Ok(CharacterStorageService::characters_file_exists(&campaign_uuid))
}