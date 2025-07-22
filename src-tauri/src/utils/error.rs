use serde::{Deserialize, Serialize};
use std::fmt;
use std::fmt::Debug;

/// Custom error types for DM Assistant application
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DmAssistantError {
    /// Resource not found
    NotFound(String),
    /// Invalid input provided
    InvalidInput(String),
    /// Database/storage operation failed
    StorageError(String),
    /// Validation failed
    ValidationError(String),
    /// IO operation failed
    IoError(String),
    /// JSON serialization/deserialization failed
    JsonError(String),
    /// General application error
    InternalError(String),
    /// Campaign-related errors
    CampaignError(String),
    /// Character-related errors
    CharacterError(String),
    /// NPC-related errors
    NpcError(String),
    /// Combat-related errors
    CombatError(String),
    /// Quest-related errors
    QuestError(String),
    /// Item/Inventory-related errors
    ItemError(String),
    /// Map-related errors
    MapError(String),
    /// Authentication/Authorization errors
    AuthError(String),
}

impl fmt::Display for DmAssistantError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DmAssistantError::NotFound(msg) => write!(f, "Not Found: {}", msg),
            DmAssistantError::InvalidInput(msg) => write!(f, "Invalid Input: {}", msg),
            DmAssistantError::StorageError(msg) => write!(f, "Storage Error: {}", msg),
            DmAssistantError::ValidationError(msg) => write!(f, "Validation Error: {}", msg),
            DmAssistantError::IoError(msg) => write!(f, "IO Error: {}", msg),
            DmAssistantError::JsonError(msg) => write!(f, "JSON Error: {}", msg),
            DmAssistantError::InternalError(msg) => write!(f, "Internal Error: {}", msg),
            DmAssistantError::CampaignError(msg) => write!(f, "Campaign Error: {}", msg),
            DmAssistantError::CharacterError(msg) => write!(f, "Character Error: {}", msg),
            DmAssistantError::NpcError(msg) => write!(f, "NPC Error: {}", msg),
            DmAssistantError::CombatError(msg) => write!(f, "Combat Error: {}", msg),
            DmAssistantError::QuestError(msg) => write!(f, "Quest Error: {}", msg),
            DmAssistantError::ItemError(msg) => write!(f, "Item Error: {}", msg),
            DmAssistantError::MapError(msg) => write!(f, "Map Error: {}", msg),
            DmAssistantError::AuthError(msg) => write!(f, "Auth Error: {}", msg),
        }
    }
}

impl std::error::Error for DmAssistantError {}

// Implement conversion from standard library errors
impl From<std::io::Error> for DmAssistantError {
    fn from(error: std::io::Error) -> Self {
        DmAssistantError::IoError(error.to_string())
    }
}

impl From<serde_json::Error> for DmAssistantError {
    fn from(error: serde_json::Error) -> Self {
        DmAssistantError::JsonError(error.to_string())
    }
}

impl From<uuid::Error> for DmAssistantError {
    fn from(error: uuid::Error) -> Self {
        DmAssistantError::InvalidInput(format!("Invalid UUID: {}", error))
    }
}

// Convenience constructor functions
impl DmAssistantError {
    /// Create a NotFound error
    pub fn not_found(entity: &str, id: &str) -> Self {
        DmAssistantError::NotFound(format!("{} with ID '{}' not found", entity, id))
    }

    /// Create a NotFound error with custom message
    pub fn not_found_msg(msg: &str) -> Self {
        DmAssistantError::NotFound(msg.to_string())
    }

    /// Create an InvalidInput error
    pub fn invalid_input(msg: &str) -> Self {
        DmAssistantError::InvalidInput(msg.to_string())
    }

    /// Create a ValidationError
    pub fn validation(msg: &str) -> Self {
        DmAssistantError::ValidationError(msg.to_string())
    }

    /// Create a StorageError
    pub fn storage(msg: &str) -> Self {
        DmAssistantError::StorageError(msg.to_string())
    }

    /// Create an InternalError
    pub fn internal(msg: &str) -> Self {
        DmAssistantError::InternalError(msg.to_string())
    }

    /// Create a CampaignError
    pub fn campaign(msg: &str) -> Self {
        DmAssistantError::CampaignError(msg.to_string())
    }

    /// Create a CharacterError
    pub fn character(msg: &str) -> Self {
        DmAssistantError::CharacterError(msg.to_string())
    }

    /// Create an NpcError
    pub fn npc(msg: &str) -> Self {
        DmAssistantError::NpcError(msg.to_string())
    }

    /// Create a CombatError
    pub fn combat(msg: &str) -> Self {
        DmAssistantError::CombatError(msg.to_string())
    }

    /// Create a QuestError
    pub fn quest(msg: &str) -> Self {
        DmAssistantError::QuestError(msg.to_string())
    }

    /// Create an ItemError
    pub fn item(msg: &str) -> Self {
        DmAssistantError::ItemError(msg.to_string())
    }

    /// Create a MapError
    pub fn map(msg: &str) -> Self {
        DmAssistantError::MapError(msg.to_string())
    }

    /// Create an AuthError
    pub fn auth(msg: &str) -> Self {
        DmAssistantError::AuthError(msg.to_string())
    }

    /// Create a JsonError
    pub fn json(msg: &str) -> Self {
        DmAssistantError::JsonError(msg.to_string())
    }

    /// Create an IoError
    pub fn io(msg: &str) -> Self {
        DmAssistantError::IoError(msg.to_string())
    }

    /// Get error category for logging/grouping
    pub fn category(&self) -> &'static str {
        match self {
            DmAssistantError::NotFound(_) => "not_found",
            DmAssistantError::InvalidInput(_) => "invalid_input",
            DmAssistantError::StorageError(_) => "storage",
            DmAssistantError::ValidationError(_) => "validation",
            DmAssistantError::IoError(_) => "io",
            DmAssistantError::JsonError(_) => "json",
            DmAssistantError::InternalError(_) => "internal",
            DmAssistantError::CampaignError(_) => "campaign",
            DmAssistantError::CharacterError(_) => "character",
            DmAssistantError::NpcError(_) => "npc",
            DmAssistantError::CombatError(_) => "combat",
            DmAssistantError::QuestError(_) => "quest",
            DmAssistantError::ItemError(_) => "item",
            DmAssistantError::MapError(_) => "map",
            DmAssistantError::AuthError(_) => "auth",
        }
    }

    /// Get user-friendly error message (in Italian)
    pub fn user_message(&self) -> String {
        match self {
            DmAssistantError::NotFound(msg) => {
                if msg.contains("Character") {
                    "Personaggio non trovato".to_string()
                } else if msg.contains("Campaign") {
                    "Campagna non trovata".to_string()
                } else if msg.contains("NPC") {
                    "NPC non trovato".to_string()
                } else {
                    "Elemento non trovato".to_string()
                }
            },
            DmAssistantError::InvalidInput(_) => "Dati inseriti non validi".to_string(),
            DmAssistantError::StorageError(_) => "Errore nel salvataggio dei dati".to_string(),
            DmAssistantError::ValidationError(msg) => format!("Errore di validazione: {}", msg),
            DmAssistantError::IoError(_) => "Errore di lettura/scrittura file".to_string(),
            DmAssistantError::JsonError(_) => "Errore nel formato dei dati".to_string(),
            DmAssistantError::InternalError(_) => "Errore interno dell'applicazione".to_string(),
            DmAssistantError::CampaignError(msg) => format!("Errore campagna: {}", msg),
            DmAssistantError::CharacterError(msg) => format!("Errore personaggio: {}", msg),
            DmAssistantError::NpcError(msg) => format!("Errore NPC: {}", msg),
            DmAssistantError::CombatError(msg) => format!("Errore combattimento: {}", msg),
            DmAssistantError::QuestError(msg) => format!("Errore quest: {}", msg),
            DmAssistantError::ItemError(msg) => format!("Errore oggetto: {}", msg),
            DmAssistantError::MapError(msg) => format!("Errore mappa: {}", msg),
            DmAssistantError::AuthError(_) => "Errore di autorizzazione".to_string(),
        }
    }

    /// Check if error is recoverable (user can retry)
    pub fn is_recoverable(&self) -> bool {
        match self {
            DmAssistantError::NotFound(_) => false,
            DmAssistantError::InvalidInput(_) => true,
            DmAssistantError::StorageError(_) => true,
            DmAssistantError::ValidationError(_) => true,
            DmAssistantError::IoError(_) => true,
            DmAssistantError::JsonError(_) => false,
            DmAssistantError::InternalError(_) => false,
            DmAssistantError::CampaignError(_) => true,
            DmAssistantError::CharacterError(_) => true,
            DmAssistantError::NpcError(_) => true,
            DmAssistantError::CombatError(_) => true,
            DmAssistantError::QuestError(_) => true,
            DmAssistantError::ItemError(_) => true,
            DmAssistantError::MapError(_) => true,
            DmAssistantError::AuthError(_) => false,
        }
    }
}

/// Type alias for Results using DmAssistantError
pub type DmResult<T> = Result<T, DmAssistantError>;

/// Macro for creating quick errors
#[macro_export]
macro_rules! dm_error {
    (not_found, $entity:expr, $id:expr) => {
        DmAssistantError::not_found($entity, $id)
    };
    (invalid_input, $msg:expr) => {
        DmAssistantError::invalid_input($msg)
    };
    (validation, $msg:expr) => {
        DmAssistantError::validation($msg)
    };
    (storage, $msg:expr) => {
        DmAssistantError::storage($msg)
    };
    (internal, $msg:expr) => {
        DmAssistantError::internal($msg)
    };
    (character, $msg:expr) => {
        DmAssistantError::character($msg)
    };
    (campaign, $msg:expr) => {
        DmAssistantError::campaign($msg)
    };
}

/// Helper function to validate UUID strings
pub fn validate_uuid(id: &str, entity_name: &str) -> DmResult<uuid::Uuid> {
    uuid::Uuid::parse_str(id)
        .map_err(|_| DmAssistantError::invalid_input(&format!("Invalid {} ID format", entity_name)))
}

/// Helper function to validate non-empty strings
pub fn validate_non_empty(value: &str, field_name: &str) -> DmResult<()> {
    if value.trim().is_empty() {
        Err(DmAssistantError::validation(&format!("{} cannot be empty", field_name)))
    } else {
        Ok(())
    }
}

/// Helper function to validate numeric ranges
pub fn validate_range<T: PartialOrd + Copy + Debug>(
    value: T, 
    min: T, 
    max: T, 
    field_name: &str
) -> DmResult<()> {
    if value < min || value > max {
        Err(DmAssistantError::validation(&format!("{} must be between {:?} and {:?}", field_name, min, max)))
    } else {
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_display() {
        let error = DmAssistantError::not_found("Character", "123");
        assert_eq!(error.to_string(), "Not Found: Character with ID '123' not found");
    }

    #[test]
    fn test_error_category() {
        let error = DmAssistantError::character("test");
        assert_eq!(error.category(), "character");
    }

    #[test]
    fn test_user_message() {
        let error = DmAssistantError::not_found("Character", "123");
        assert_eq!(error.user_message(), "Personaggio non trovato");
    }

    #[test]
    fn test_is_recoverable() {
        assert!(!DmAssistantError::not_found("Character", "123").is_recoverable());
        assert!(DmAssistantError::invalid_input("test").is_recoverable());
    }

    #[test]
    fn test_validate_uuid() {
        assert!(validate_uuid("invalid", "Character").is_err());
        assert!(validate_uuid("550e8400-e29b-41d4-a716-446655440000", "Character").is_ok());
    }

    #[test]
    fn test_validate_non_empty() {
        assert!(validate_non_empty("", "name").is_err());
        assert!(validate_non_empty("  ", "name").is_err());
        assert!(validate_non_empty("valid", "name").is_ok());
    }

    #[test]
    fn test_validate_range() {
        assert!(validate_range(5, 1, 10, "level").is_ok());
        assert!(validate_range(0, 1, 10, "level").is_err());
        assert!(validate_range(11, 1, 10, "level").is_err());
    }
}