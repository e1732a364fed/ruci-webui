// use std::process::Command;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// #[tauri::command]
// fn run_exe(exe_path: &str, args: Vec<String>) -> String {
//     let child = Command::new(exe_path).args(args).spawn();
//     match child {
//         Ok(child) => child.id().to_string(),
//         Err(e) => {
//             format!("{e:?}")
//         }
//     }
// }

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        // .invoke_handler(tauri::generate_handler![run_exe])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
