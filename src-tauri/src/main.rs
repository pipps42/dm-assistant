// DM Assistant - Main entry point
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod core;
mod services;
mod utils;

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // Character commands
            commands::characters::create_character,
            commands::characters::get_character_with_campaign,
            commands::characters::get_characters_by_campaign,
            commands::characters::get_active_characters_by_campaign,
            commands::characters::update_character_with_campaign,
            commands::characters::delete_character,
            commands::characters::add_character_achievement,
            commands::characters::remove_character_achievement,
            commands::characters::update_character_relationship,
            commands::characters::remove_character_relationship,
            commands::characters::get_characters_by_npc_relationship,
            commands::characters::level_up_character,
            commands::characters::toggle_character_active,
            commands::characters::save_characters_to_file,
            commands::characters::load_characters_from_file,
            commands::characters::characters_file_exists,
        ])
        .setup(|app| {
            // App setup logic
            println!("DM Assistant starting up...");
            
            // Initialize app data directories
            if let Err(e) = crate::utils::file_system::get_app_data_dir() {
                eprintln!("Failed to initialize app data directory: {}", e);
                return Err(Box::new(e));
            }
            
            println!("File system initialized");
            
            // Future: Load configuration, initialize services, etc.
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}