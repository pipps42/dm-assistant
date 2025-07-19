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
            // Commands will be registered here
        ])
        .setup(|app| {
            // App setup logic
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
