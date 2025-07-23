use crate::core::models::campaign::{
    Campaign, 
    CampaignSummary,
    CreateCampaignRequest, 
    UpdateCampaignRequest,
    AppSettings,
    CampaignStatus,
};
use crate::services::campaign_storage::CampaignStorageService;
use crate::utils::error::{DmAssistantError, DmResult, validate_uuid, validate_non_empty};
use uuid::Uuid;

// ============================================
// CORE CAMPAIGN OPERATIONS
// ============================================

#[tauri::command]
pub async fn create_campaign(req: CreateCampaignRequest) -> DmResult<Campaign> {
    // Validate required fields
    validate_non_empty(&req.name, "Campaign name")?;
    validate_non_empty(&req.description, "Campaign description")?;
    validate_non_empty(&req.setting, "Campaign setting")?;
    
    // Validate player count if provided
    if let Some(count) = req.player_count {
        if count == 0 || count > 12 {
            return Err(DmAssistantError::validation("Player count must be between 1 and 12"));
        }
    }
    
    let campaign = Campaign::new(req);
    CampaignStorageService::create_campaign(campaign)
}

#[tauri::command]
pub async fn get_campaign(campaign_id: String) -> DmResult<Option<Campaign>> {
    let id = validate_uuid(&campaign_id, "Campaign")?;
    CampaignStorageService::get_campaign(&id)
}

#[tauri::command]
pub async fn get_all_campaigns() -> DmResult<Vec<Campaign>> {
    CampaignStorageService::get_all_campaigns()
}

#[tauri::command]
pub async fn get_active_campaigns() -> DmResult<Vec<Campaign>> {
    CampaignStorageService::get_active_campaigns()
}

#[tauri::command]
pub async fn get_campaign_summaries() -> DmResult<Vec<CampaignSummary>> {
    CampaignStorageService::get_campaign_summaries()
}

#[tauri::command]
pub async fn update_campaign(
    campaign_id: String,
    req: UpdateCampaignRequest,
) -> DmResult<Campaign> {
    let id = validate_uuid(&campaign_id, "Campaign")?;
    
    // Validate fields if provided
    if let Some(ref name) = req.name {
        validate_non_empty(name, "Campaign name")?;
    }
    if let Some(ref description) = req.description {
        validate_non_empty(description, "Campaign description")?;
    }
    if let Some(ref setting) = req.setting {
        validate_non_empty(setting, "Campaign setting")?;
    }
    if let Some(count) = req.player_count {
        if count == 0 || count > 12 {
            return Err(DmAssistantError::validation("Player count must be between 1 and 12"));
        }
    }
    
    CampaignStorageService::modify_campaign(&id, |campaign| {
        campaign.update(req);
        Ok(())
    })
}

#[tauri::command]
pub async fn delete_campaign(campaign_id: String) -> DmResult<bool> {
    let id = validate_uuid(&campaign_id, "Campaign")?;
    CampaignStorageService::delete_campaign(&id)
}

#[tauri::command]
pub async fn archive_campaign(campaign_id: String) -> DmResult<Campaign> {
    let id = validate_uuid(&campaign_id, "Campaign")?;
    CampaignStorageService::archive_campaign(&id)
}

// ============================================
// CURRENT CAMPAIGN MANAGEMENT
// ============================================

#[tauri::command]
pub async fn set_current_campaign(campaign_id: String) -> DmResult<Campaign> {
    let id = validate_uuid(&campaign_id, "Campaign")?;
    CampaignStorageService::set_current_campaign(&id)
}

#[tauri::command]
pub async fn get_current_campaign() -> DmResult<Option<Campaign>> {
    CampaignStorageService::get_current_campaign()
}

#[tauri::command]
pub async fn clear_current_campaign() -> DmResult<()> {
    CampaignStorageService::clear_current_campaign()
}

#[tauri::command]
pub async fn get_recent_campaigns() -> DmResult<Vec<Campaign>> {
    CampaignStorageService::get_recent_campaigns()
}

// ============================================
// SESSION MANAGEMENT
// ============================================

#[tauri::command]
pub async fn start_campaign_session(campaign_id: String) -> DmResult<Campaign> {
    let id = validate_uuid(&campaign_id, "Campaign")?;
    CampaignStorageService::start_session(&id)
}

#[tauri::command]
pub async fn update_campaign_stats(
    campaign_id: String,
    active_characters: u32,
    total_characters: u32,
    average_level: f32,
) -> DmResult<Campaign> {
    let id = validate_uuid(&campaign_id, "Campaign")?;
    
    // Validate stats
    if total_characters < active_characters {
        return Err(DmAssistantError::validation("Total characters cannot be less than active characters"));
    }
    if average_level < 1.0 || average_level > 20.0 {
        return Err(DmAssistantError::validation("Average level must be between 1.0 and 20.0"));
    }
    
    CampaignStorageService::update_campaign_stats(&id, active_characters, total_characters, average_level)
}

// ============================================
// CAMPAIGN LIFECYCLE
// ============================================

#[tauri::command]
pub async fn complete_campaign(campaign_id: String) -> DmResult<Campaign> {
    let id = validate_uuid(&campaign_id, "Campaign")?;
    
    CampaignStorageService::modify_campaign(&id, |campaign| {
        if !campaign.is_playable() {
            return Err(DmAssistantError::campaign("Cannot complete a non-playable campaign"));
        }
        campaign.complete();
        Ok(())
    })
}

#[tauri::command]
pub async fn pause_campaign(campaign_id: String) -> DmResult<Campaign> {
    let id = validate_uuid(&campaign_id, "Campaign")?;
    
    CampaignStorageService::modify_campaign(&id, |campaign| {
        if !matches!(campaign.campaign_info.campaign_status, CampaignStatus::Active) {
            return Err(DmAssistantError::campaign("Can only pause active campaigns"));
        }
        campaign.campaign_info.campaign_status = CampaignStatus::OnHold;
        Ok(())
    })
}

#[tauri::command]
pub async fn resume_campaign(campaign_id: String) -> DmResult<Campaign> {
    let id = validate_uuid(&campaign_id, "Campaign")?;
    
    CampaignStorageService::modify_campaign(&id, |campaign| {
        if !matches!(campaign.campaign_info.campaign_status, CampaignStatus::OnHold) {
            return Err(DmAssistantError::campaign("Can only resume paused campaigns"));
        }
        campaign.campaign_info.campaign_status = CampaignStatus::Active;
        Ok(())
    })
}

#[tauri::command]
pub async fn duplicate_campaign(
    campaign_id: String, 
    new_name: String
) -> DmResult<Campaign> {
    let id = validate_uuid(&campaign_id, "Campaign")?;
    validate_non_empty(&new_name, "New campaign name")?;
    
    // Get original campaign
    let original = CampaignStorageService::get_campaign(&id)?
        .ok_or_else(|| DmAssistantError::not_found("Campaign", &campaign_id))?;
    
    // Create duplicate with new ID and name
    let mut duplicate = original.clone();
    duplicate.id = Uuid::new_v4();
    duplicate.name = new_name;
    duplicate.current_session = 0;
    duplicate.campaign_info.total_sessions = 0;
    duplicate.campaign_info.campaign_status = CampaignStatus::Planning;
    duplicate.last_session_date = None;
    duplicate.created_at = chrono::Utc::now();
    duplicate.updated_at = chrono::Utc::now();
    
    // Reset character-related stats (will be populated when characters are added)
    duplicate.campaign_info.total_characters = 0;
    duplicate.campaign_info.active_characters = 0;
    duplicate.player_count = 0;
    duplicate.average_level = 1.0;
    
    CampaignStorageService::create_campaign(duplicate)
}

// ============================================
// IMPORT/EXPORT & BACKUP
// ============================================

#[tauri::command]
pub async fn export_campaign(campaign_id: String) -> DmResult<String> {
    let id = validate_uuid(&campaign_id, "Campaign")?;
    CampaignStorageService::export_campaign(&id)
}

#[tauri::command]
pub async fn import_campaign(json_data: String) -> DmResult<Campaign> {
    validate_non_empty(&json_data, "JSON data")?;
    CampaignStorageService::import_campaign(&json_data)
}

#[tauri::command]
pub async fn backup_campaigns() -> DmResult<String> {
    let backup_path = CampaignStorageService::backup_campaigns()?;
    Ok(format!("Campaigns backed up successfully to: {}", backup_path.display()))
}

// ============================================
// APP SETTINGS
// ============================================

#[tauri::command]
pub async fn get_app_settings() -> DmResult<AppSettings> {
    CampaignStorageService::get_app_settings()
}

#[tauri::command]
pub async fn update_app_theme(theme: String) -> DmResult<AppSettings> {
    validate_non_empty(&theme, "Theme")?;
    
    // Validate theme value
    if !["light", "dark", "system"].contains(&theme.as_str()) {
        return Err(DmAssistantError::validation("Theme must be 'light', 'dark', or 'system'"));
    }
    
    CampaignStorageService::update_app_settings(|settings| {
        settings.theme = theme;
        Ok(())
    })
}

#[tauri::command]
pub async fn update_backup_settings(
    auto_backup: bool,
    backup_frequency_hours: u32,
) -> DmResult<AppSettings> {
    // Validate backup frequency
    if backup_frequency_hours == 0 || backup_frequency_hours > 168 { // Max 1 week
        return Err(DmAssistantError::validation("Backup frequency must be between 1 and 168 hours"));
    }
    
    CampaignStorageService::update_app_settings(|settings| {
        settings.auto_backup = auto_backup;
        settings.backup_frequency_hours = backup_frequency_hours;
        Ok(())
    })
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

#[tauri::command]
pub async fn validate_campaign_name(name: String) -> DmResult<bool> {
    validate_non_empty(&name, "Campaign name")?;
    
    // Check if name already exists
    let campaigns = CampaignStorageService::get_all_campaigns()?;
    let exists = campaigns.iter().any(|c| c.name.eq_ignore_ascii_case(&name));
    
    Ok(!exists) // Return true if name is available (doesn't exist)
}

#[tauri::command]
pub async fn get_campaign_count() -> DmResult<u32> {
    let campaigns = CampaignStorageService::get_all_campaigns()?;
    Ok(campaigns.len() as u32)
}

#[tauri::command]
pub async fn get_active_campaign_count() -> DmResult<u32> {
    let campaigns = CampaignStorageService::get_active_campaigns()?;
    Ok(campaigns.len() as u32)
}

#[tauri::command]
pub async fn campaigns_file_exists() -> DmResult<bool> {
    Ok(CampaignStorageService::campaigns_file_exists())
}

#[tauri::command]
pub async fn initialize_app() -> DmResult<String> {
    CampaignStorageService::initialize_app()?;
    
    // Return status message
    let campaigns_exist = CampaignStorageService::campaigns_file_exists();
    let app_settings = CampaignStorageService::get_app_settings()?;
    let current_campaign = CampaignStorageService::get_current_campaign()?;
    
    let status = if campaigns_exist {
        format!(
            "App initialized successfully. Current campaign: {}",
            current_campaign
                .map(|c| c.name)
                .unwrap_or_else(|| "None".to_string())
        )
    } else {
        "App initialized with default settings. No campaigns found.".to_string()
    };
    
    Ok(status)
}

// ============================================
// HELPER FUNCTIONS FOR VALIDATION
// ============================================

/// Validate that campaign exists and return it
async fn get_campaign_or_error(campaign_id: &str) -> DmResult<Campaign> {
    let id = validate_uuid(campaign_id, "Campaign")?;
    CampaignStorageService::get_campaign(&id)?
        .ok_or_else(|| DmAssistantError::not_found("Campaign", campaign_id))
}

/// Validate that campaign is in a state that allows modifications
fn validate_campaign_modifiable(campaign: &Campaign) -> DmResult<()> {
    if !campaign.campaign_info.campaign_status.allows_modifications() {
        return Err(DmAssistantError::campaign(
            "Cannot modify campaign in current status. Only Planning, Active, and OnHold campaigns can be modified."
        ));
    }
    Ok(())
}

/// Validate campaign name uniqueness (excluding specific campaign)
async fn validate_name_unique_excluding(name: &str, exclude_id: &Uuid) -> DmResult<()> {
    let campaigns = CampaignStorageService::get_all_campaigns()?;
    let exists = campaigns.iter().any(|c| c.id != *exclude_id && c.name.eq_ignore_ascii_case(name));
    
    if exists {
        return Err(DmAssistantError::validation("Campaign name already exists"));
    }
    
    Ok(())
}

// ============================================
// ADVANCED OPERATIONS
// ============================================

#[tauri::command]
pub async fn get_campaign_analytics() -> DmResult<CampaignAnalytics> {
    let campaigns = CampaignStorageService::get_all_campaigns()?;
    
    let total_campaigns = campaigns.len() as u32;
    let active_campaigns = campaigns.iter().filter(|c| c.is_active).count() as u32;
    let completed_campaigns = campaigns.iter()
        .filter(|c| matches!(c.campaign_info.campaign_status, CampaignStatus::Completed))
        .count() as u32;
    
    let total_sessions: u32 = campaigns.iter().map(|c| c.campaign_info.total_sessions).sum();
    let total_characters: u32 = campaigns.iter().map(|c| c.campaign_info.total_characters).sum();
    
    let avg_level = if total_characters > 0 {
        campaigns.iter()
            .map(|c| c.average_level * c.campaign_info.active_characters as f32)
            .sum::<f32>() / total_characters as f32
    } else {
        0.0
    };
    
    Ok(CampaignAnalytics {
        total_campaigns,
        active_campaigns,
        completed_campaigns,
        total_sessions,
        total_characters,
        average_level: avg_level,
    })
}

/// Analytics data for dashboard
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CampaignAnalytics {
    pub total_campaigns: u32,
    pub active_campaigns: u32,
    pub completed_campaigns: u32,
    pub total_sessions: u32,
    pub total_characters: u32,
    pub average_level: f32,
}