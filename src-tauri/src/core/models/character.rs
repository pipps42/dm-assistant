use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

/// Player Character from DM perspective
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlayerCharacter {
    pub id: Uuid,
    pub campaign_id: Uuid,
    pub name: String,
    pub race: String,
    pub class: String,
    pub level: u8,
    pub max_hp: u16,
    pub background: String, // Custom description
    pub achievements: Vec<Achievement>,
    pub relationships: Vec<CharacterRelationship>,
    pub notes: String, // DM private notes about the character
    pub is_active: bool, // Is the character still active in the campaign
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Achievement/significant moment in character's story
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Achievement {
    pub id: Uuid,
    pub title: String,
    pub description: String,
    pub quest_id: Option<Uuid>, // Link to quest if related
    pub session_date: Option<DateTime<Utc>>,
    pub achievement_type: AchievementType,
    pub created_at: DateTime<Utc>,
}

/// Types of achievements for categorization
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AchievementType {
    QuestCompleted,
    PuzzleSolved,
    SocialInteraction,
    CombatVictory,
    Discovery,
    Roleplay,
    Custom(String),
}

/// Relationship between a character and an NPC
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CharacterRelationship {
    pub id: Uuid,
    pub character_id: Uuid,
    pub npc_id: Uuid,
    pub relationship_type: RelationshipType,
    pub notes: String, // Context about the relationship
    pub last_interaction: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Simple relationship states
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum RelationshipType {
    Neutral,
    Friendly,
    Hostile,
    Suspicious,
    Romantic,
    Ally,
    Enemy,
    Respected,
    Feared,
}

/// Request to create a new character
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateCharacterRequest {
    pub campaign_id: Uuid,
    pub name: String,
    pub race: String,
    pub class: String,
    pub level: u8,
    pub max_hp: u16,
    pub background: String,
    pub notes: Option<String>,
}

/// Request to update character
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCharacterRequest {
    pub name: Option<String>,
    pub race: Option<String>,
    pub class: Option<String>,
    pub level: Option<u8>,
    pub max_hp: Option<u16>,
    pub background: Option<String>,
    pub notes: Option<String>,
    pub is_active: Option<bool>,
}

/// Request to add achievement
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AddAchievementRequest {
    pub character_id: Uuid,
    pub title: String,
    pub description: String,
    pub quest_id: Option<Uuid>,
    pub session_date: Option<DateTime<Utc>>,
    pub achievement_type: AchievementType,
}

/// Request to update relationship
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateRelationshipRequest {
    pub character_id: Uuid,
    pub npc_id: Uuid,
    pub relationship_type: RelationshipType,
    pub notes: Option<String>,
}

impl PlayerCharacter {
    /// Create a new character
    pub fn new(req: CreateCharacterRequest) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            campaign_id: req.campaign_id,
            name: req.name,
            race: req.race,
            class: req.class,
            level: req.level,
            max_hp: req.max_hp,
            background: req.background,
            achievements: Vec::new(),
            relationships: Vec::new(),
            notes: req.notes.unwrap_or_default(),
            is_active: true,
            created_at: now,
            updated_at: now,
        }
    }

    /// Update character data
    pub fn update(&mut self, req: UpdateCharacterRequest) {
        if let Some(name) = req.name { self.name = name; }
        if let Some(race) = req.race { self.race = race; }
        if let Some(class) = req.class { self.class = class; }
        if let Some(level) = req.level { self.level = level; }
        if let Some(max_hp) = req.max_hp { self.max_hp = max_hp; }
        if let Some(background) = req.background { self.background = background; }
        if let Some(notes) = req.notes { self.notes = notes; }
        if let Some(is_active) = req.is_active { self.is_active = is_active; }
        
        self.updated_at = Utc::now();
    }

    /// Add achievement to character
    pub fn add_achievement(&mut self, req: AddAchievementRequest) {
        let achievement = Achievement {
            id: Uuid::new_v4(),
            title: req.title,
            description: req.description,
            quest_id: req.quest_id,
            session_date: req.session_date,
            achievement_type: req.achievement_type,
            created_at: Utc::now(),
        };
        
        self.achievements.push(achievement);
        self.updated_at = Utc::now();
    }

    /// Update or create relationship with NPC
    pub fn update_relationship(&mut self, req: UpdateRelationshipRequest) {
        // Find existing relationship
        if let Some(rel) = self.relationships.iter_mut()
            .find(|r| r.npc_id == req.npc_id) {
            // Update existing
            rel.relationship_type = req.relationship_type;
            if let Some(notes) = req.notes {
                rel.notes = notes;
            }
            rel.last_interaction = Some(Utc::now());
            rel.updated_at = Utc::now();
        } else {
            // Create new relationship
            let relationship = CharacterRelationship {
                id: Uuid::new_v4(),
                character_id: req.character_id,
                npc_id: req.npc_id,
                relationship_type: req.relationship_type,
                notes: req.notes.unwrap_or_default(),
                last_interaction: Some(Utc::now()),
                created_at: Utc::now(),
                updated_at: Utc::now(),
            };
            self.relationships.push(relationship);
        }
        
        self.updated_at = Utc::now();
    }

    /// Get active achievements (sorted by date)
    pub fn get_achievements_sorted(&self) -> Vec<&Achievement> {
        let mut achievements: Vec<&Achievement> = self.achievements.iter().collect();
        achievements.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        achievements
    }

    /// Get relationship with specific NPC
    pub fn get_relationship(&self, npc_id: Uuid) -> Option<&CharacterRelationship> {
        self.relationships.iter().find(|r| r.npc_id == npc_id)
    }
}

impl Achievement {
    /// Check if achievement is linked to a quest
    pub fn is_quest_related(&self) -> bool {
        self.quest_id.is_some()
    }
}

impl RelationshipType {
    /// Get all available relationship types
    pub fn all() -> Vec<RelationshipType> {
        vec![
            RelationshipType::Neutral,
            RelationshipType::Friendly,
            RelationshipType::Hostile,
            RelationshipType::Suspicious,
            RelationshipType::Romantic,
            RelationshipType::Ally,
            RelationshipType::Enemy,
            RelationshipType::Respected,
            RelationshipType::Feared,
        ]
    }

    /// Get display string for relationship type
    pub fn display(&self) -> &'static str {
        match self {
            RelationshipType::Neutral => "Neutrale",
            RelationshipType::Friendly => "Amichevole",
            RelationshipType::Hostile => "Ostile",
            RelationshipType::Suspicious => "Diffidente",
            RelationshipType::Romantic => "Romantico",
            RelationshipType::Ally => "Alleato",
            RelationshipType::Enemy => "Nemico",
            RelationshipType::Respected => "Rispettato",
            RelationshipType::Feared => "Temuto",
        }
    }
}