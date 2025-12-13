use serde::Serialize;
use std::path::PathBuf;
use walkdir::WalkDir;

#[derive(Debug, Serialize)]
pub struct MarkdownFile {
    /// Absolute path to the file
    pub path: String,
    /// Filename without .md extension
    pub title: String,
    /// Path relative to vault root
    pub relative_path: String,
}

/// Recursively scan a directory for markdown files
/// Skips hidden directories (.obsidian, .git, etc.)
#[tauri::command]
pub async fn scan_vault(vault_path: String) -> Result<Vec<MarkdownFile>, String> {
    let path = PathBuf::from(&vault_path);

    if !path.exists() {
        return Err(format!("Vault path does not exist: {}", vault_path));
    }

    if !path.is_dir() {
        return Err(format!("Vault path is not a directory: {}", vault_path));
    }

    let mut files = Vec::new();

    for entry in WalkDir::new(&path)
        .follow_links(true)
        .into_iter()
        .filter_entry(|e| {
            // Skip hidden directories
            !e.file_name()
                .to_str()
                .map(|s| s.starts_with('.'))
                .unwrap_or(false)
        })
        .filter_map(|e| e.ok())
    {
        let file_path = entry.path();

        if file_path.is_file() {
            if let Some(ext) = file_path.extension() {
                if ext == "md" {
                    let relative = file_path
                        .strip_prefix(&path)
                        .unwrap_or(file_path)
                        .to_string_lossy()
                        .to_string();

                    let title = file_path
                        .file_stem()
                        .unwrap_or_default()
                        .to_string_lossy()
                        .to_string();

                    files.push(MarkdownFile {
                        path: file_path.to_string_lossy().to_string(),
                        title,
                        relative_path: relative,
                    });
                }
            }
        }
    }

    Ok(files)
}
