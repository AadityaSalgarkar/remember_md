use std::process::Command;

/// Open a markdown file using mdrender.
#[tauri::command]
pub async fn open_in_md_render(file_path: String) -> Result<(), String> {
    let home = std::env::var("HOME").map_err(|_| "Could not get HOME directory".to_string())?;
    let mdrender_path = format!("{}/bin/mdrender", home);

    let status = Command::new(&mdrender_path)
        .arg(&file_path)
        .status()
        .map_err(|e| format!("Failed to execute mdrender: {}", e))?;

    if status.success() {
        Ok(())
    } else {
        Err(format!("Failed to open file with mdrender: {}", file_path))
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
