use crate::core::models::campaign::{Campaign, CampaignSummary, AppSettings};
use crate::utils::error::{DmAssistantError, DmResult};
use crate::utils::file_system::{get_app_data_dir, save_json, load_json, file_exists, backup_file};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use uuid::Uuid;

/// Campaign collection for the entire app
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CampaignCollection {
    pub campaigns: HashMap<Uuid, Campaign>,
    pub app_settings: AppSettings,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl CampaignCollection {
    pub fn new() -> Self {
        let now = chrono::Utc::now();
        Self {
            campaigns: HashMap::new(),
            app_settings: AppSettings::new(),
            created_at: now,
            updated_at: now,
        }
    }
    
    pub fn add_campaign(&mut self, campaign: Campaign) {
        self.campaigns.insert(campaign.id, campaign);
        self.updated_at = chrono::Utc::now();
    }
    
    pub fn update_campaign(&mut self, campaign: Campaign) -> bool {
        if self.campaigns.contains_key(&campaign.id) {
            self.campaigns.insert(campaign.id, campaign);
            self.updated_at = chrono::Utc::now();
            true
        } else {
            false
        }
    }
    
    pub fn remove_campaign(&mut self, campaign_id: &Uuid) -> bool {
        if self.campaigns.remove(campaign_id).is_some() {
            // Clear from settings if it was current
            if self.app_settings.current_campaign_id == Some(*campaign_id) {
                self.app_settings.clear_current_campaign();
            }
            
            // Remove from recents
            self.app_settings.recent_campaigns.retain(|&id| id != *campaign_id);
            
            self.updated_at = chrono::Utc::now();
            true
        } else {
            false
        }
    }
    
    pub fn get_campaign(&self, campaign_id: &Uuid) -> Option<&Campaign> {
        self.campaigns.get(campaign_id)
    }
    
    pub fn get_campaign_mut(&mut self, campaign_id: &Uuid) -> Option<&mut Campaign> {
        self.campaigns.get_mut(campaign_id)
    }
    
    pub fn get_all_campaigns(&self) -> Vec<&Campaign> {
        self.campaigns.values().collect()
    }
    
    pub fn get_active_campaigns(&self) -> Vec<&Campaign> {
        self.campaigns.values().filter(|c| c.is_active).collect()
    }
    
    pub fn get_campaign_summaries(&self) -> Vec<CampaignSummary> {
        self.campaigns.values()
            .map(|c| c.to_summary())
            .collect()
    }
    
    pub fn set_current_campaign(&mut self, campaign_id: Uuid) -> DmResult<()> {
        if !self.campaigns.contains_key(&campaign_id) {
            return Err(DmAssistantError::not_found("Campaign", &campaign_id.to_string()));
        }
        
        self.app_settings.set_current_campaign(campaign_id);
        self.updated_at = chrono::Utc::now();
        Ok(())
    }
    
    pub fn get_current_campaign(&self) -> Option<&Campaign> {
        self.app_settings.current_campaign_id
            .and_then(|id| self.campaigns.get(&id))
    }
    
    pub fn get_recent_campaigns(&self) -> Vec<&Campaign> {
        self.app_settings.recent_campaigns
            .iter()
            .filter_map(|id| self.campaigns.get(id))
            .collect()
    }
}

/// Campaign storage service - manages all campaigns and app settings
pub struct CampaignStorageService;

impl CampaignStorageService {
    /// Get file path for campaigns data
    fn get_campaigns_file_path() -> DmResult<PathBuf> {
        let app_data_dir = get_app_data_dir()?;
        Ok(app_data_dir.join("campaigns.json"))
    }
    
    /// Get file path for app settings
    fn get_settings_file_path() -> DmResult<PathBuf> {
        let app_data_dir = get_app_data_dir()?;
        Ok(app_data_dir.join("settings.json"))
    }
    
    /// Load all campaigns and settings
    pub fn load_collection() -> DmResult<CampaignCollection> {
        let file_path = Self::get_campaigns_file_path()?;
        
        if file_exists(&file_path) {
            load_json(&file_path)
        } else {
            // Create new collection if file doesn't exist
            let collection = CampaignCollection::new();
            Self::save_collection(&collection)?;
            Ok(collection)
        }
    }
    
    /// Save campaigns and settings
    pub fn save_collection(collection: &CampaignCollection) -> DmResult<()> {
        let file_path = Self::get_campaigns_file_path()?;
        save_json(collection, &file_path)
    }
    
    /// Create a new campaign
    pub fn create_campaign(campaign: Campaign) -> DmResult<Campaign> {
        let mut collection = Self::load_collection()?;
        
        // Check if campaign already exists
        if collection.campaigns.contains_key(&campaign.id) {
            return Err(DmAssistantError::campaign(&format!("Campaign with ID {} already exists", campaign.id)));
        }
        
        collection.add_campaign(campaign.clone());
        Self::save_collection(&collection)?;
        
        Ok(campaign)
    }
    
    /// Get campaign by ID
    pub fn get_campaign(campaign_id: &Uuid) -> DmResult<Option<Campaign>> {
        let collection = Self::load_collection()?;
        Ok(collection.get_campaign(campaign_id).cloned())
    }
    
    /// Get all campaigns
    pub fn get_all_campaigns() -> DmResult<Vec<Campaign>> {
        let collection = Self::load_collection()?;
        Ok(collection.get_all_campaigns().into_iter().cloned().collect())
    }
    
    /// Get active campaigns only
    pub fn get_active_campaigns() -> DmResult<Vec<Campaign>> {
        let collection = Self::load_collection()?;
        Ok(collection.get_active_campaigns().into_iter().cloned().collect())
    }
    
    /// Get campaign summaries for list views
    pub fn get_campaign_summaries() -> DmResult<Vec<CampaignSummary>> {
        let collection = Self::load_collection()?;
        let mut summaries = collection.get_campaign_summaries();
        
        // Sort by last updated, then by created date
        summaries.sort_by(|a, b| {
            match (a.last_session_date, b.last_session_date) {
                (Some(a_date), Some(b_date)) => b_date.cmp(&a_date),
                (Some(_), None) => std::cmp::Ordering::Less,
                (None, Some(_)) => std::cmp::Ordering::Greater,
                (None, None) => b.created_at.cmp(&a.created_at),
            }
        });
        
        Ok(summaries)
    }
    
    /// Update campaign
    pub fn update_campaign(campaign: Campaign) -> DmResult<Campaign> {
        let mut collection = Self::load_collection()?;
        
        if !collection.update_campaign(campaign.clone()) {
            return Err(DmAssistantError::not_found("Campaign", &campaign.id.to_string()));
        }
        
        Self::save_collection(&collection)?;
        Ok(campaign)
    }
    
    /// Delete campaign (with safety checks)
    pub fn delete_campaign(campaign_id: &Uuid) -> DmResult<bool> {
        let mut collection = Self::load_collection()?;
        
        // Check if campaign exists
        let campaign = collection.get_campaign(campaign_id)
            .ok_or_else(|| DmAssistantError::not_found("Campaign", &campaign_id.to_string()))?;
        
        // Safety check: prevent deletion of active campaigns with data
        if campaign.is_active && campaign.campaign_info.total_characters > 0 {
            return Err(DmAssistantError::campaign(
                "Cannot delete active campaign with characters. Archive it first."
            ));
        }
        
        let removed = collection.remove_campaign(campaign_id);
        if removed {
            Self::save_collection(&collection)?;
        }
        
        Ok(removed)
    }
    
    /// Modify campaign in place
    pub fn modify_campaign<F>(campaign_id: &Uuid, modifier: F) -> DmResult<Campaign>
    where
        F: FnOnce(&mut Campaign) -> DmResult<()>,
    {
        let mut collection = Self::load_collection()?;
        
        let campaign = collection.get_campaign_mut(campaign_id)
            .ok_or_else(|| DmAssistantError::not_found("Campaign", &campaign_id.to_string()))?;
        
        modifier(campaign)?;
        campaign.updated_at = chrono::Utc::now();
        
        let result = campaign.clone();
        Self::save_collection(&collection)?;
        
        Ok(result)
    }
    
    /// Set current campaign
    pub fn set_current_campaign(campaign_id: &Uuid) -> DmResult<Campaign> {
        let mut collection = Self::load_collection()?;
        
        // Validate campaign exists and is playable
        let campaign = collection.get_campaign(campaign_id)
            .ok_or_else(|| DmAssistantError::not_found("Campaign", &campaign_id.to_string()))?
            .clone();
        
        if !campaign.is_playable() {
            return Err(DmAssistantError::campaign("Cannot set non-playable campaign as current"));
        }
        
        collection.set_current_campaign(*campaign_id)?;
        Self::save_collection(&collection)?;
        
        Ok(campaign)
    }
    
    /// Get current campaign
    pub fn get_current_campaign() -> DmResult<Option<Campaign>> {
        let collection = Self::load_collection()?;
        Ok(collection.get_current_campaign().cloned())
    }
    
    /// Clear current campaign
    pub fn clear_current_campaign() -> DmResult<()> {
        let mut collection = Self::load_collection()?;
        collection.app_settings.clear_current_campaign();
        Self::save_collection(&collection)?;
        Ok(())
    }
    
    /// Get recent campaigns
    pub fn get_recent_campaigns() -> DmResult<Vec<Campaign>> {
        let collection = Self::load_collection()?;
        Ok(collection.get_recent_campaigns().into_iter().cloned().collect())
    }
    
    /// Archive campaign (safer than delete)
    pub fn archive_campaign(campaign_id: &Uuid) -> DmResult<Campaign> {
        Self::modify_campaign(campaign_id, |campaign| {
            campaign.archive();
            Ok(())
        })
    }
    
    /// Start new session in campaign
    pub fn start_session(campaign_id: &Uuid) -> DmResult<Campaign> {
        Self::modify_campaign(campaign_id, |campaign| {
            if !campaign.is_playable() {
                return Err(DmAssistantError::campaign("Cannot start session in non-playable campaign"));
            }
            campaign.start_session();
            Ok(())
        })
    }
    
    /// Update campaign statistics (called by other services)
    pub fn update_campaign_stats(
        campaign_id: &Uuid, 
        active_chars: u32, 
        total_chars: u32, 
        avg_level: f32
    ) -> DmResult<Campaign> {
        Self::modify_campaign(campaign_id, |campaign| {
            campaign.update_stats(active_chars, total_chars, avg_level);
            Ok(())
        })
    }
    
    /// Get app settings
    pub fn get_app_settings() -> DmResult<AppSettings> {
        let collection = Self::load_collection()?;
        Ok(collection.app_settings)
    }
    
    /// Update app settings
    pub fn update_app_settings<F>(modifier: F) -> DmResult<AppSettings>
    where
        F: FnOnce(&mut AppSettings) -> DmResult<()>,
    {
        let mut collection = Self::load_collection()?;
        
        modifier(&mut collection.app_settings)?;
        collection.app_settings.updated_at = chrono::Utc::now();
        collection.updated_at = chrono::Utc::now();
        
        let result = collection.app_settings.clone();
        Self::save_collection(&collection)?;
        
        Ok(result)
    }
    
    /// Backup campaigns file
    pub fn backup_campaigns() -> DmResult<PathBuf> {
        let file_path = Self::get_campaigns_file_path()?;
        backup_file(&file_path)
    }
    
    /// Check if campaigns file exists
    pub fn campaigns_file_exists() -> bool {
        if let Ok(file_path) = Self::get_campaigns_file_path() {
            file_exists(&file_path)
        } else {
            false
        }
    }
    
    /// Initialize app (create default files if needed)
    pub fn initialize_app() -> DmResult<()> {
        let collection = Self::load_collection()?;
        Self::save_collection(&collection)?;
        Ok(())
    }
    
    /// Export campaign for backup/sharing
    pub fn export_campaign(campaign_id: &Uuid) -> DmResult<String> {
        let campaign = Self::get_campaign(campaign_id)?
            .ok_or_else(|| DmAssistantError::not_found("Campaign", &campaign_id.to_string()))?;
        
        let json_data = serde_json::to_string_pretty(&campaign)
            .map_err(|e| DmAssistantError::json(&format!("Failed to export campaign: {}", e)))?;
        
        Ok(json_data)
    }
    
    /// Import campaign from JSON
    pub fn import_campaign(json_data: &str) -> DmResult<Campaign> {
        let mut campaign: Campaign = serde_json::from_str(json_data)
            .map_err(|e| DmAssistantError::json(&format!("Failed to import campaign: {}", e)))?;
        
        // Generate new ID to avoid conflicts
        campaign.id = Uuid::new_v4();
        campaign.updated_at = chrono::Utc::now();
        
        Self::create_campaign(campaign)
    }
}