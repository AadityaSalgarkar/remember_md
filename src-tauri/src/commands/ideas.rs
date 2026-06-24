use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
use walkdir::WalkDir;

#[derive(Debug, Serialize)]
pub struct IdeaFile {
    /// Absolute path to the file
    pub path: String,
    /// Filename without .md extension
    pub title: String,
    /// Path relative to ideas root
    pub relative_path: String,
}

fn ensure_ideas_dir(ideas_path: &Path) -> Result<(), String> {
    fs::create_dir_all(ideas_path).map_err(|e| {
        format!(
            "Failed to create ideas directory {}: {}",
            ideas_path.to_string_lossy(),
            e
        )
    })
}

fn title_from_path(file_path: &Path) -> String {
    file_path
        .file_stem()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string()
}

fn title_from_markdown(file_path: &Path) -> String {
    if let Ok(contents) = fs::read_to_string(file_path) {
        for line in contents.lines() {
            let trimmed = line.trim();
            if let Some(title) = trimmed.strip_prefix("# ") {
                let title = title.trim();
                if !title.is_empty() {
                    return title.to_string();
                }
            }
        }
    }

    title_from_path(file_path)
}

fn relative_path(ideas_path: &Path, file_path: &Path) -> String {
    file_path
        .strip_prefix(ideas_path)
        .unwrap_or(file_path)
        .to_string_lossy()
        .to_string()
}

fn slugify(title: &str) -> String {
    let mut slug = String::new();
    let mut previous_dash = false;

    for character in title.trim().to_lowercase().chars() {
        if character.is_ascii_alphanumeric() {
            slug.push(character);
            previous_dash = false;
        } else if !previous_dash {
            slug.push('-');
            previous_dash = true;
        }
    }

    let slug = slug.trim_matches('-').to_string();
    if slug.is_empty() {
        "untitled-idea".to_string()
    } else {
        slug
    }
}

fn unix_timestamp() -> Result<u128, String> {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .map_err(|e| format!("System clock error: {}", e))
}

/// Recursively scan the Ideas directory for markdown files.
#[tauri::command]
pub async fn scan_ideas(ideas_path: String) -> Result<Vec<IdeaFile>, String> {
    let path = PathBuf::from(&ideas_path);
    ensure_ideas_dir(&path)?;

    let mut files = Vec::new();

    for entry in WalkDir::new(&path)
        .follow_links(true)
        .into_iter()
        .filter_entry(|e| {
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
                    files.push(IdeaFile {
                        path: file_path.to_string_lossy().to_string(),
                        title: title_from_markdown(file_path),
                        relative_path: relative_path(&path, file_path),
                    });
                }
            }
        }
    }

    Ok(files)
}

/// Create a markdown file for a new idea in the Ideas directory.
#[tauri::command]
pub async fn create_idea_file(
    ideas_path: String,
    title: String,
    body: String,
) -> Result<IdeaFile, String> {
    let path = PathBuf::from(&ideas_path);
    ensure_ideas_dir(&path)?;

    let title = title.trim();
    let title = if title.is_empty() { "Untitled Idea" } else { title };
    let slug = slugify(title);
    let timestamp = unix_timestamp()?;
    let mut file_path = path.join(format!("{}-{}.md", slug, timestamp));

    let mut suffix = 1;
    while file_path.exists() {
        file_path = path.join(format!("{}-{}-{}.md", slug, timestamp, suffix));
        suffix += 1;
    }

    let body = body.trim();
    let content = if body.is_empty() {
        format!("# {}\n", title)
    } else {
        format!("# {}\n\n{}\n", title, body)
    };

    fs::write(&file_path, content).map_err(|e| {
        format!(
            "Failed to write idea file {}: {}",
            file_path.to_string_lossy(),
            e
        )
    })?;

    Ok(IdeaFile {
        path: file_path.to_string_lossy().to_string(),
        title: title.to_string(),
        relative_path: relative_path(&path, &file_path),
    })
}
