use crate::utils::error::{DmAssistantError, DmResult};
use std::fs;
use std::path::{Path, PathBuf};
use serde::{Serialize, Deserialize};

/// Get the application data directory
pub fn get_app_data_dir() -> DmResult<PathBuf> {
    let app_data = dirs::data_local_dir()
        .ok_or_else(|| DmAssistantError::storage("Could not determine app data directory"))?;
    
    let dm_assistant_dir = app_data.join("dm-assistant");
    
    // Create directory if it doesn't exist
    if !dm_assistant_dir.exists() {
        fs::create_dir_all(&dm_assistant_dir)
            .map_err(|e| DmAssistantError::storage(&format!("Failed to create app data directory: {}", e)))?;
    }
    
    Ok(dm_assistant_dir)
}

/// Get campaigns data directory
pub fn get_campaigns_dir() -> DmResult<PathBuf> {
    let app_data = get_app_data_dir()?;
    let campaigns_dir = app_data.join("campaigns");
    
    if !campaigns_dir.exists() {
        fs::create_dir_all(&campaigns_dir)
            .map_err(|e| DmAssistantError::storage(&format!("Failed to create campaigns directory: {}", e)))?;
    }
    
    Ok(campaigns_dir)
}

/// Get specific campaign directory
pub fn get_campaign_dir(campaign_id: &str) -> DmResult<PathBuf> {
    let campaigns_dir = get_campaigns_dir()?;
    let campaign_dir = campaigns_dir.join(campaign_id);
    
    if !campaign_dir.exists() {
        fs::create_dir_all(&campaign_dir)
            .map_err(|e| DmAssistantError::storage(&format!("Failed to create campaign directory: {}", e)))?;
    }
    
    Ok(campaign_dir)
}

/// Save JSON data to file
pub fn save_json<T: Serialize>(data: &T, file_path: &Path) -> DmResult<()> {
    let json_data = serde_json::to_string_pretty(data)
        .map_err(|e| DmAssistantError::json(&format!("Failed to serialize data: {}", e)))?;
    
    // Create parent directory if it doesn't exist
    if let Some(parent) = file_path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .map_err(|e| DmAssistantError::storage(&format!("Failed to create directory: {}", e)))?;
        }
    }
    
    fs::write(file_path, json_data)
        .map_err(|e| DmAssistantError::storage(&format!("Failed to write file: {}", e)))?;
    
    Ok(())
}

/// Load JSON data from file
pub fn load_json<T: for<'de> Deserialize<'de>>(file_path: &Path) -> DmResult<T> {
    if !file_path.exists() {
        return Err(DmAssistantError::not_found_msg(&format!("File not found: {}", file_path.display())));
    }
    
    let json_data = fs::read_to_string(file_path)
        .map_err(|e| DmAssistantError::storage(&format!("Failed to read file: {}", e)))?;
    
    let data = serde_json::from_str(&json_data)
        .map_err(|e| DmAssistantError::json(&format!("Failed to deserialize data: {}", e)))?;
    
    Ok(data)
}

/// Check if file exists
pub fn file_exists(file_path: &Path) -> bool {
    file_path.exists() && file_path.is_file()
}

/// Check if directory exists
pub fn dir_exists(dir_path: &Path) -> bool {
    dir_path.exists() && dir_path.is_dir()
}

/// Delete file if it exists
pub fn delete_file(file_path: &Path) -> DmResult<bool> {
    if file_path.exists() {
        fs::remove_file(file_path)
            .map_err(|e| DmAssistantError::storage(&format!("Failed to delete file: {}", e)))?;
        Ok(true)
    } else {
        Ok(false)
    }
}

/// Create backup of file
pub fn backup_file(file_path: &Path) -> DmResult<PathBuf> {
    if !file_path.exists() {
        return Err(DmAssistantError::not_found_msg(&format!("File not found: {}", file_path.display())));
    }
    
    let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S").to_string();
    let backup_path = file_path.with_extension(format!("backup_{}.json", timestamp));
    
    fs::copy(file_path, &backup_path)
        .map_err(|e| DmAssistantError::storage(&format!("Failed to create backup: {}", e)))?;
    
    Ok(backup_path)
}

/// List files in directory with specific extension
pub fn list_files_with_extension(dir_path: &Path, extension: &str) -> DmResult<Vec<PathBuf>> {
    if !dir_exists(dir_path) {
        return Ok(vec![]);
    }
    
    let entries = fs::read_dir(dir_path)
        .map_err(|e| DmAssistantError::storage(&format!("Failed to read directory: {}", e)))?;
    
    let mut files = Vec::new();
    for entry in entries {
        let entry = entry
            .map_err(|e| DmAssistantError::storage(&format!("Failed to read directory entry: {}", e)))?;
        let path = entry.path();
        
        if path.is_file() {
            if let Some(ext) = path.extension() {
                if ext == extension {
                    files.push(path);
                }
            }
        }
    }
    
    Ok(files)
}

/// Get file size in bytes
pub fn get_file_size(file_path: &Path) -> DmResult<u64> {
    let metadata = fs::metadata(file_path)
        .map_err(|e| DmAssistantError::storage(&format!("Failed to get file metadata: {}", e)))?;
    
    Ok(metadata.len())
}

/// Ensure directory exists, create if necessary
pub fn ensure_dir_exists(dir_path: &Path) -> DmResult<()> {
    if !dir_path.exists() {
        fs::create_dir_all(dir_path)
            .map_err(|e| DmAssistantError::storage(&format!("Failed to create directory: {}", e)))?;
    }
    Ok(())
}

/// File operation result for batch operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileOperationResult {
    pub success: bool,
    pub file_path: String,
    pub error_message: Option<String>,
}

impl FileOperationResult {
    pub fn success(file_path: String) -> Self {
        Self {
            success: true,
            file_path,
            error_message: None,
        }
    }
    
    pub fn error(file_path: String, error: String) -> Self {
        Self {
            success: false,
            file_path,
            error_message: Some(error),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;
    use serde_json::json;

    #[test]
    fn test_save_and_load_json() {
        let temp_dir = tempdir().unwrap();
        let file_path = temp_dir.path().join("test.json");
        
        let test_data = json!({
            "name": "Test",
            "value": 42
        });
        
        save_json(&test_data, &file_path).unwrap();
        assert!(file_exists(&file_path));
        
        let loaded_data: serde_json::Value = load_json(&file_path).unwrap();
        assert_eq!(test_data, loaded_data);
    }

    #[test]
    fn test_file_exists() {
        let temp_dir = tempdir().unwrap();
        let file_path = temp_dir.path().join("test.txt");
        
        assert!(!file_exists(&file_path));
        
        fs::write(&file_path, "test content").unwrap();
        assert!(file_exists(&file_path));
    }

    #[test]
    fn test_dir_exists() {
        let temp_dir = tempdir().unwrap();
        let dir_path = temp_dir.path().join("subdir");
        
        assert!(!dir_exists(&dir_path));
        
        fs::create_dir(&dir_path).unwrap();
        assert!(dir_exists(&dir_path));
    }

    #[test]
    fn test_delete_file() {
        let temp_dir = tempdir().unwrap();
        let file_path = temp_dir.path().join("delete_me.txt");
        
        fs::write(&file_path, "content").unwrap();
        assert!(file_exists(&file_path));
        
        let deleted = delete_file(&file_path).unwrap();
        assert!(deleted);
        assert!(!file_exists(&file_path));
        
        // Test deleting non-existent file
        let deleted_again = delete_file(&file_path).unwrap();
        assert!(!deleted_again);
    }

    #[test]
    fn test_ensure_dir_exists() {
        let temp_dir = tempdir().unwrap();
        let nested_dir = temp_dir.path().join("level1").join("level2");
        
        assert!(!dir_exists(&nested_dir));
        
        ensure_dir_exists(&nested_dir).unwrap();
        assert!(dir_exists(&nested_dir));
    }
}