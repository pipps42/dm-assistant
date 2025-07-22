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
            // Campaign commands
            commands::campaigns::create_campaign,
            commands::campaigns::get_campaign,
            commands::campaigns::get_all_campaigns,
            commands::campaigns::get_active_campaigns,
            commands::campaigns::get_campaign_summaries,
            commands::campaigns::update_campaign,
            commands::campaigns::delete_campaign,
            commands::campaigns::archive_campaign,
            commands::campaigns::set_current_campaign,
            commands::campaigns::get_current_campaign,
            commands::campaigns::clear_current_campaign,
            commands::campaigns::get_recent_campaigns,
            commands::campaigns::start_campaign_session,
            commands::campaigns::update_campaign_stats,
            commands::campaigns::get_app_settings,
            commands::campaigns::update_app_theme,
            commands::campaigns::update_backup_settings,
            commands::campaigns::export_campaign,
            commands::campaigns::import_campaign,
            commands::campaigns::backup_campaigns,
            commands::campaigns::campaigns_file_exists,
            commands::campaigns::initialize_app,
            commands::campaigns::validate_campaign_name,
            commands::campaigns::get_campaign_count,
            commands::campaigns::get_active_campaign_count,
            commands::campaigns::duplicate_campaign,
            commands::campaigns::complete_campaign,
            commands::campaigns::pause_campaign,
            commands::campaigns::resume_campaign,
            
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
            
            // Initialize campaigns and settings
            if let Err(e) = crate::services::campaign_storage::CampaignStorageService::initialize_app() {
                eprintln!("Failed to initialize campaign storage: {}", e);
                return Err(Box::new(e));
            }
            
            println!("Campaign system initialized");
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}