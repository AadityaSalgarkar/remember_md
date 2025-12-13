use std::process::Command;

/// Open a markdown file in MD_RENDER application
#[tauri::command]
pub async fn open_in_md_render(file_path: String) -> Result<(), String> {
    // Use macOS 'open' command with -a flag to specify the application
    let status = Command::new("open")
        .arg("-a")
        .arg("MD_RENDER")
        .arg(&file_path)
        .status()
        .map_err(|e| format!("Failed to execute open command: {}", e))?;

    if status.success() {
        Ok(())
    } else {
        Err(format!("Failed to open file in MD_RENDER: {}", file_path))
    }
}

/// Reveal file in Finder
#[tauri::command]
pub async fn reveal_in_finder(file_path: String) -> Result<(), String> {
    let status = Command::new("open")
        .arg("-R")
        .arg(&file_path)
        .status()
        .map_err(|e| format!("Failed to execute open command: {}", e))?;

    if status.success() {
        Ok(())
    } else {
        Err(format!("Failed to reveal file in Finder: {}", file_path))
    }
}
