use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

/// Main campaign entity
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Campaign {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub setting: String, // "Forgotten Realms", "Homebrew", etc.
    pub dm_notes: String, // Private DM notes
    pub current_session: u32,
    pub is_active: bool,
    pub campaign_info: CampaignInfo,
    pub player_count: u8,
    pub average_level: f32, // Calculated from active characters
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub last_session_date: Option<DateTime<Utc>>,
}

/// Campaign metadata and statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CampaignInfo {
    pub total_sessions: u32,
    pub total_characters: u32,
    pub active_characters: u32,
    pub total_npcs: u32,
    pub total_locations: u32,
    pub total_quests: u32,
    pub completed_quests: u32,
    pub total_encounters: u32,
    pub campaign_status: CampaignStatus,
    pub difficulty_level: DifficultyLevel,
}

/// Campaign status for workflow management
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CampaignStatus {
    Planning,    // Campaign in planning phase
    Active,      // Currently running
    OnHold,      // Temporarily paused
    Completed,   // Campaign finished
    Archived,    // Old campaign, not active
}

/// Difficulty level for encounter balancing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DifficultyLevel {
    Casual,      // Easy, story-focused
    Normal,      // Standard D&D difficulty
    Hard,        // Challenging encounters
    Deadly,      // High-risk campaign
}

/// Request to create a new campaign
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateCampaignRequest {
    pub name: String,
    pub description: String,
    pub setting: String,
    pub dm_notes: Option<String>,
    pub difficulty_level: DifficultyLevel,
    pub player_count: Option<u8>,
}

/// Request to update campaign
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCampaignRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub setting: Option<String>,
    pub dm_notes: Option<String>,
    pub difficulty_level: Option<DifficultyLevel>,
    pub player_count: Option<u8>,
    pub is_active: Option<bool>,
}

/// Campaign summary for lists and selection
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CampaignSummary {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub status: CampaignStatus,
    pub current_session: u32,
    pub active_characters: u32,
    pub average_level: f32,
    pub last_session_date: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub is_active: bool,
}

/// App settings including current campaign
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub current_campaign_id: Option<Uuid>,
    pub recent_campaigns: Vec<Uuid>, // Last 5 campaigns accessed
    pub auto_backup: bool,
    pub backup_frequency_hours: u32,
    pub theme: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Campaign {
    /// Create a new campaign
    pub fn new(req: CreateCampaignRequest) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            name: req.name,
            description: req.description,
            setting: req.setting,
            dm_notes: req.dm_notes.unwrap_or_default(),
            current_session: 0,
            is_active: true,
            campaign_info: CampaignInfo::new(req.difficulty_level),
            player_count: req.player_count.unwrap_or(4),
            average_level: 1.0,
            created_at: now,
            updated_at: now,
            last_session_date: None,
        }
    }

    /// Update campaign data
    pub fn update(&mut self, req: UpdateCampaignRequest) {
        if let Some(name) = req.name { self.name = name; }
        if let Some(description) = req.description { self.description = description; }
        if let Some(setting) = req.setting { self.setting = setting; }
        if let Some(dm_notes) = req.dm_notes { self.dm_notes = dm_notes; }
        if let Some(difficulty_level) = req.difficulty_level { 
            self.campaign_info.difficulty_level = difficulty_level; 
        }
        if let Some(player_count) = req.player_count { self.player_count = player_count; }
        if let Some(is_active) = req.is_active { self.is_active = is_active; }
        
        self.updated_at = Utc::now();
    }

    /// Start a new session
    pub fn start_session(&mut self) {
        self.current_session += 1;
        self.campaign_info.total_sessions += 1;
        self.last_session_date = Some(Utc::now());
        self.updated_at = Utc::now();
        
        // Update status to active if needed
        if matches!(self.campaign_info.campaign_status, CampaignStatus::Planning) {
            self.campaign_info.campaign_status = CampaignStatus::Active;
        }
    }

    /// Update campaign statistics
    pub fn update_stats(&mut self, active_chars: u32, total_chars: u32, avg_level: f32) {
        self.campaign_info.active_characters = active_chars;
        self.campaign_info.total_characters = total_chars;
        self.player_count = active_chars as u8;
        self.average_level = avg_level;
        self.updated_at = Utc::now();
    }

    /// Mark campaign as completed
    pub fn complete(&mut self) {
        self.campaign_info.campaign_status = CampaignStatus::Completed;
        self.is_active = false;
        self.updated_at = Utc::now();
    }

    /// Archive campaign
    pub fn archive(&mut self) {
        self.campaign_info.campaign_status = CampaignStatus::Archived;
        self.is_active = false;
        self.updated_at = Utc::now();
    }

    /// Get campaign summary
    pub fn to_summary(&self) -> CampaignSummary {
        CampaignSummary {
            id: self.id,
            name: self.name.clone(),
            description: self.description.clone(),
            status: self.campaign_info.campaign_status.clone(),
            current_session: self.current_session,
            active_characters: self.campaign_info.active_characters,
            average_level: self.average_level,
            last_session_date: self.last_session_date,
            created_at: self.created_at,
            is_active: self.is_active,
        }
    }

    /// Check if campaign is playable
    pub fn is_playable(&self) -> bool {
        matches!(
            self.campaign_info.campaign_status, 
            CampaignStatus::Active | CampaignStatus::Planning
        ) && self.is_active
    }

    /// Get formatted session info
    pub fn session_info(&self) -> String {
        format!("Sessione {} di {}", self.current_session, self.campaign_info.total_sessions)
    }
}

impl CampaignInfo {
    pub fn new(difficulty_level: DifficultyLevel) -> Self {
        Self {
            total_sessions: 0,
            total_characters: 0,
            active_characters: 0,
            total_npcs: 0,
            total_locations: 0,
            total_quests: 0,
            completed_quests: 0,
            total_encounters: 0,
            campaign_status: CampaignStatus::Planning,
            difficulty_level,
        }
    }

    /// Calculate quest completion rate
    pub fn quest_completion_rate(&self) -> f32 {
        if self.total_quests == 0 {
            0.0
        } else {
            (self.completed_quests as f32 / self.total_quests as f32) * 100.0
        }
    }
}

impl AppSettings {
    pub fn new() -> Self {
        let now = Utc::now();
        Self {
            current_campaign_id: None,
            recent_campaigns: Vec::new(),
            auto_backup: true,
            backup_frequency_hours: 24,
            theme: "dark".to_string(),
            created_at: now,
            updated_at: now,
        }
    }

    /// Set current campaign and update recents
    pub fn set_current_campaign(&mut self, campaign_id: Uuid) {
        self.current_campaign_id = Some(campaign_id);
        
        // Remove if already in recents
        self.recent_campaigns.retain(|&id| id != campaign_id);
        
        // Add to front
        self.recent_campaigns.insert(0, campaign_id);
        
        // Keep only last 5
        self.recent_campaigns.truncate(5);
        
        self.updated_at = Utc::now();
    }

    /// Clear current campaign
    pub fn clear_current_campaign(&mut self) {
        self.current_campaign_id = None;
        self.updated_at = Utc::now();
    }
}

impl CampaignStatus {
    /// Get all available statuses
    pub fn all() -> Vec<CampaignStatus> {
        vec![
            CampaignStatus::Planning,
            CampaignStatus::Active,
            CampaignStatus::OnHold,
            CampaignStatus::Completed,
            CampaignStatus::Archived,
        ]
    }

    /// Get display string
    pub fn display(&self) -> &'static str {
        match self {
            CampaignStatus::Planning => "In Pianificazione",
            CampaignStatus::Active => "Attiva",
            CampaignStatus::OnHold => "In Pausa",
            CampaignStatus::Completed => "Completata",
            CampaignStatus::Archived => "Archiviata",
        }
    }

    /// Check if status allows modifications
    pub fn allows_modifications(&self) -> bool {
        matches!(self, CampaignStatus::Planning | CampaignStatus::Active | CampaignStatus::OnHold)
    }
}

impl DifficultyLevel {
    /// Get all difficulty levels
    pub fn all() -> Vec<DifficultyLevel> {
        vec![
            DifficultyLevel::Casual,
            DifficultyLevel::Normal,
            DifficultyLevel::Hard,
            DifficultyLevel::Deadly,
        ]
    }

    /// Get display string
    pub fn display(&self) -> &'static str {
        match self {
            DifficultyLevel::Casual => "Casual",
            DifficultyLevel::Normal => "Normale",
            DifficultyLevel::Hard => "Difficile",
            DifficultyLevel::Deadly => "Letale",
        }
    }

    /// Get encounter multiplier for CR calculations
    pub fn encounter_multiplier(&self) -> f32 {
        match self {
            DifficultyLevel::Casual => 0.75,
            DifficultyLevel::Normal => 1.0,
            DifficultyLevel::Hard => 1.25,
            DifficultyLevel::Deadly => 1.5,
        }
    }
}