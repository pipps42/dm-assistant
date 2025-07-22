use uuid::Uuid;

/// Generate a new UUID v4
pub fn generate_id() -> Uuid {
    Uuid::new_v4()
}

/// Generate a new UUID v4 as string
pub fn generate_id_string() -> String {
    Uuid::new_v4().to_string()
}

/// Generate a short ID (first 8 characters of UUID)
pub fn generate_short_id() -> String {
    Uuid::new_v4().to_string()[..8].to_string()
}

/// Validate UUID format
pub fn is_valid_uuid(id: &str) -> bool {
    Uuid::parse_str(id).is_ok()
}

/// Convert UUID to short display format
pub fn to_short_display(id: &Uuid) -> String {
    id.to_string()[..8].to_string()
}

/// Convert UUID string to short display format
pub fn to_short_display_str(id: &str) -> Result<String, uuid::Error> {
    let uuid = Uuid::parse_str(id)?;
    Ok(to_short_display(&uuid))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_id() {
        let id1 = generate_id();
        let id2 = generate_id();
        assert_ne!(id1, id2);
    }

    #[test]
    fn test_generate_id_string() {
        let id = generate_id_string();
        assert!(is_valid_uuid(&id));
    }

    #[test]
    fn test_generate_short_id() {
        let short_id = generate_short_id();
        assert_eq!(short_id.len(), 8);
    }

    #[test]
    fn test_is_valid_uuid() {
        assert!(is_valid_uuid("550e8400-e29b-41d4-a716-446655440000"));
        assert!(!is_valid_uuid("invalid-uuid"));
        assert!(!is_valid_uuid(""));
    }

    #[test]
    fn test_to_short_display() {
        let uuid = Uuid::parse_str("550e8400-e29b-41d4-a716-446655440000").unwrap();
        let short = to_short_display(&uuid);
        assert_eq!(short, "550e8400");
    }

    #[test]
    fn test_to_short_display_str() {
        let short = to_short_display_str("550e8400-e29b-41d4-a716-446655440000").unwrap();
        assert_eq!(short, "550e8400");
        
        assert!(to_short_display_str("invalid").is_err());
    }
}