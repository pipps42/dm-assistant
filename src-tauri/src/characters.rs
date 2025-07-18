use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use uuid::Uuid;
use chrono::Utc;
use partial_derive::Partial;


#[derive(Debug, Clone, Serialize, Deserialize, Partial)]
pub struct Character {
    pub id: String,
    pub name: String,
    pub race: String,
    pub class: String,
    pub level: u8,
    pub background: String,
    pub hit_points: u16,
    pub max_hit_points: u16,
    pub avatar: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}
// AUTOMATICAMENTE GENERA PartialCharacter con tutti i campi Option<T>

#[derive(Debug, Serialize, Deserialize)]
pub struct CharacterData {
    pub name: String,
    pub race: String,
    pub class: String,
    pub level: u8,
    pub background: String,
    pub hit_points: u16,
    pub max_hit_points: u16,
}

pub struct CharacterService {
    data_dir: PathBuf,
}

impl CharacterService {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let data_dir = std::env::current_dir()?.join("data");
        if !data_dir.exists() {
            fs::create_dir_all(&data_dir)?;
        }
        Ok(CharacterService { data_dir })
    }
    
    fn get_characters_file(&self) -> PathBuf {
        self.data_dir.join("characters.json")
    }
    
    fn load_characters_from_file(&self) -> Result<Vec<Character>, Box<dyn std::error::Error>> {
        let file_path = self.get_characters_file();
        if !file_path.exists() {
            return Ok(Vec::new());
        }
        let contents = fs::read_to_string(file_path)?;
        let characters: Vec<Character> = serde_json::from_str(&contents)?;
        Ok(characters)
    }
    
    fn save_characters_to_file(&self, characters: &[Character]) -> Result<(), Box<dyn std::error::Error>> {
        let file_path = self.get_characters_file();
        let contents = serde_json::to_string_pretty(characters)?;
        fs::write(file_path, contents)?;
        Ok(())
    }
    
    pub fn create_character(&self, data: CharacterData) -> Result<Character, Box<dyn std::error::Error>> {
        // Validazione base
        if data.name.trim().is_empty() {
            return Err("Il nome non può essere vuoto".into());
        }
        if data.level == 0 || data.level > 20 {
            return Err("Il livello deve essere tra 1 e 20".into());
        }
        if data.max_hit_points == 0 {
            return Err("I punti ferita massimi devono essere maggiori di 0".into());
        }
        if data.hit_points > data.max_hit_points {
            return Err("I punti ferita non possono superare quelli massimi".into());
        }

        let mut characters = self.load_characters_from_file()?;
        let now = Utc::now().to_rfc3339();
        
        let character = Character {
            id: Uuid::new_v4().to_string(),
            name: data.name.trim().to_string(),
            race: data.race,
            class: data.class,
            level: data.level,
            background: data.background,
            hit_points: data.hit_points,
            max_hit_points: data.max_hit_points,
            avatar: None,
            created_at: now.clone(),
            updated_at: now,
        };
        
        characters.push(character.clone());
        self.save_characters_to_file(&characters)?;
        Ok(character)
    }
    
    pub fn load_characters(&self) -> Result<Vec<Character>, Box<dyn std::error::Error>> {
        self.load_characters_from_file()
    }
    
    pub fn update_character(&self, id: &str, updates: PartialCharacter) -> Result<Character, Box<dyn std::error::Error>> {
        let mut characters = self.load_characters_from_file()?;
        
        let character = characters
            .iter_mut()
            .find(|c| c.id == id)
            .ok_or("Personaggio non trovato")?;
        
        // Validazioni smart (usa i nuovi valori o quelli esistenti)
        let new_hit_points = updates.hit_points.unwrap_or(character.hit_points);
        let new_max_hit_points = updates.max_hit_points.unwrap_or(character.max_hit_points);
        
        if let Some(ref name) = updates.name {
            if name.trim().is_empty() {
                return Err("Il nome non può essere vuoto".into());
            }
        }
        
        if let Some(level) = updates.level {
            if level == 0 || level > 20 {
                return Err("Il livello deve essere tra 1 e 20".into());
            }
        }
        
        if new_max_hit_points == 0 {
            return Err("I punti ferita massimi devono essere maggiori di 0".into());
        }
        
        if new_hit_points > new_max_hit_points {
            return Err("I punti ferita non possono superare quelli massimi".into());
        }
        
        if let Some(name) = updates.name {
            character.name = name.trim().to_string();
        }
        if let Some(race) = updates.race {
            character.race = race;
        }
        if let Some(class) = updates.class {
            character.class = class;
        }
        if let Some(level) = updates.level {
            character.level = level;
        }
        if let Some(background) = updates.background {
            character.background = background;
        }
        if let Some(hit_points) = updates.hit_points {
            character.hit_points = hit_points;
        }
        if let Some(max_hit_points) = updates.max_hit_points {
            character.max_hit_points = max_hit_points;
        }
        if let Some(avatar) = updates.avatar {
            character.avatar = avatar;
        }
        
        // Non permettere update di id, created_at
        character.updated_at = Utc::now().to_rfc3339();

        let updated_character = character.clone();
        self.save_characters_to_file(&characters)?;
        Ok(updated_character)
    }
    
    pub fn delete_character(&self, id: &str) -> Result<(), Box<dyn std::error::Error>> {
        let mut characters = self.load_characters_from_file()?;
        let initial_len = characters.len();
        characters.retain(|c| c.id != id);
        
        if characters.len() == initial_len {
            return Err("Personaggio non trovato".into());
        }
        
        self.save_characters_to_file(&characters)?;
        Ok(())
    }
    
    pub fn export_characters(&self) -> Result<String, Box<dyn std::error::Error>> {
        let characters = self.load_characters_from_file()?;
        let json = serde_json::to_string_pretty(&characters)?;
        Ok(json)
    }
    
    pub fn import_characters(&self, data: &str) -> Result<(), Box<dyn std::error::Error>> {
        let imported_characters: Vec<Character> = serde_json::from_str(data)?;
        
        for character in &imported_characters {
            if character.name.trim().is_empty() {
                return Err("Nome del personaggio non può essere vuoto".into());
            }
            if character.level == 0 || character.level > 20 {
                return Err("Livello deve essere tra 1 e 20".into());
            }
            if character.max_hit_points == 0 {
                return Err("Punti ferita massimi devono essere maggiori di 0".into());
            }
            if character.hit_points > character.max_hit_points {
                return Err("Punti ferita non possono superare quelli massimi".into());
            }
        }
        
        self.save_characters_to_file(&imported_characters)?;
        Ok(())
    }
}

// TAURI COMMANDS
#[tauri::command]
pub fn create_character(data: CharacterData) -> Result<Character, String> {
    let service = CharacterService::new().map_err(|e| e.to_string())?;
    service.create_character(data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn load_characters() -> Result<Vec<Character>, String> {
    let service = CharacterService::new().map_err(|e| e.to_string())?;
    service.load_characters().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_character(id: String, data: PartialCharacter) -> Result<Character, String> {
    let service = CharacterService::new().map_err(|e| e.to_string())?;
    service.update_character(&id, data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_character(id: String) -> Result<(), String> {
    let service = CharacterService::new().map_err(|e| e.to_string())?;
    service.delete_character(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn export_characters() -> Result<String, String> {
    let service = CharacterService::new().map_err(|e| e.to_string())?;
    service.export_characters().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn import_characters(data: String) -> Result<(), String> {
    let service = CharacterService::new().map_err(|e| e.to_string())?;
    service.import_characters(&data).map_err(|e| e.to_string())
}