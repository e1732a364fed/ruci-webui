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
        .plugin(tauri_plugin_http::init())
        .setup(|_app| {
            // 在mac中默认双击 .app 程序 其工作目录为 根目录 "/", 这是不行的，因为要生成日志文件

            #[cfg(not(target_os = "ios"))]
            {
                let mh = homedir::my_home();
                if let Ok(odir) = mh {
                    if let Some(dir) = odir {
                        // 安卓这里会设为 "/data"

                        let _ = std::env::set_current_dir(dir);
                    }
                }
            }

            #[cfg(any(target_os = "android", target_os = "ios"))]
            let log_file = Some(String::new());

            #[cfg(not(any(target_os = "android", target_os = "ios")))]
            let log_file = None;

            use ruci_cmd::Args;

            tauri::async_runtime::spawn(async {
                let _r = ruci_cmd::run_main_with_args(Args {
                    mode: ruci_cmd::Mode::C,
                    config: ruci_cmd::rucimp::DEFAULT_LUA_CONFIG_FILE_NAME.to_string(),
                    api_server: true,
                    log_file,
                    api_addr: Some("0.0.0.0:40681".to_string()),
                    // log_level: todo!(),
                    log_dir: Some("ruci_logs".to_string()),
                    ..Default::default()
                })
                .await;
            });
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        // .invoke_handler(tauri::generate_handler![run_exe])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
