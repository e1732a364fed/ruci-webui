// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use ruci_cmd::Args;

fn main() {
    let rt = tokio::runtime::Runtime::new().unwrap();

    rt.spawn(ruci_cmd::run_main_with_args(Args {
        mode: ruci_cmd::Mode::C,
        config: ruci_cmd::rucimp::DEFAULT_LUA_CONFIG_FILE_NAME.to_string(),
        api_server: true,
        ..Default::default() // log_level: todo!(),
                             // log_file: todo!(),
                             // log_dir: todo!(),
                             // sub_cmds: todo!(),
    }));

    ruci_gui_lib::run()
}
