// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use ruci_cmd::Args;

fn main() {
    let rt = tokio::runtime::Runtime::new().unwrap();

    // 在mac中默认双击 .app 程序 其工作目录为 根目录 "/", 这是不行的，因为要生成日志文件

    let mh = homedir::my_home();
    if let Ok(odir) = mh {
        if let Some(dir) = odir {
            let _ = std::env::set_current_dir(dir);
        }
    }

    rt.spawn(ruci_cmd::run_main_with_args(Args {
        mode: ruci_cmd::Mode::C,
        config: ruci_cmd::rucimp::DEFAULT_LUA_CONFIG_FILE_NAME.to_string(),
        api_server: true,
        log_dir: Some("ruci_logs".to_string()),
        ..Default::default() // log_level: todo!(),
                             // log_file: todo!(),
                             // log_dir: todo!(),
                             // sub_cmds: todo!(),
    }));

    ruci_gui_lib::run()
}
