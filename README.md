# Remember

Remember is a small Tauri desktop app for revisiting reading and ideas. It scans a Markdown clippings folder, tracks article reminders, and also provides an Ideas view for quick Markdown notes that live beside your clippings.

## Screenshots

| Main View | Set Reminder |
|-----------|--------------|
| ![Main list view](assets/screenshot-list.png) | ![Reminder dialog](assets/screenshot-dialog.png) |

## What it does

- **Sync from a clippings folder**: recursively finds `*.md` files (skips hidden dirs like `.obsidian`, `.git`).
- **Ideas view**: creates raw `.md` idea notes in a sibling `Ideas/` folder.
- **Local library**: stores article and idea metadata in a local SQLite DB.
- **Reminders**: set reminder dates for articles or ideas, with separate due-count badges.
- **Snooze / Done flows**:
  - **Snooze** moves the reminder date forward.
  - **Done** completes the current reminder and creates a new one **7 days** later.
- **Archive**: hide articles you’re not currently tracking (toggle Active/Archived).
- **Open in external editor**: “Open” invokes `~/bin/mdrender` for Markdown files.

## Tech stack

- **Tauri v2** (`src-tauri/`) for the desktop shell + native commands.
- **React + Vite + TypeScript** (`src/`) for the UI.
- **Zustand** stores for UI/data state.
- **SQLite via `@tauri-apps/plugin-sql`** (DB is `sqlite:remember.db`).
- **Tailwind v4 plugin** + small custom CSS system (`src/index.css`).

## Getting started (dev)

### Prerequisites

- Node.js (recommended: current LTS)
- Rust toolchain (stable)
- Tauri prerequisites for your OS (see Tauri docs for system deps)

### Install

```bash
npm install
```

### Run the web UI (Vite)

```bash
npm run dev
```

### Run the desktop app (Tauri)

```bash
npm run tauri dev
```

## Building

### Web build

```bash
npm run build
```

### Desktop bundle

```bash
npm run tauri build
```

### Install to /Applications (macOS)

Use the Makefile target to build and install the app bundle:

```bash
make macos-install
```

To build, install, and remove generated build artifacts afterward:

```bash
make macos-install-clean
```

## Using the app

1. Open **Settings**.
2. Choose your **Clippings Folder** (folder selection uses the Tauri dialog plugin).
3. Click **Save** to sync:
   - New Markdown files are added to the DB.
   - Missing files (no longer in the clippings or ideas folder) are removed from the DB.
   - A sibling `Ideas/` folder is created if needed.
4. Use **Set Reminder** on an article, pick a date (or use a quick preset).
5. Switch to **Ideas** and click **New Idea** to create a Markdown note with a default reminder one week out.

## Data model (SQLite)

The app maintains a local SQLite DB with:

- `settings`: persisted values like `vaultPath` and `lastSyncAt`
- `articles`: one row per clipping Markdown file
- `reminders`: reminders linked to `articles` (`completed_at` marks completion)
- `ideas`: one row per idea Markdown file
- `idea_reminders`: reminders linked to `ideas`

Schema lives at `src/lib/db/schema.ts`.

## Where data lives

The DB is loaded as `sqlite:remember.db` via the Tauri SQL plugin (`src/lib/db/client.ts`). The plugin manages the actual file location in your app data directory (OS-dependent).

## Opening files

Clicking **Open** invokes the Tauri command `open_in_md_render`.

- Implementation: `src-tauri/src/commands/opener.rs`
- Current behavior: runs `~/bin/mdrender <file>`.

If you want “Open” to use a different app (or to be cross-platform), adjust `open_in_md_render` accordingly.

## Permissions / capabilities

Tauri capabilities are defined in `src-tauri/capabilities/default.json`.

- File access is configured to allow read access under `$HOME/**` (needed to scan your clippings and ideas folders).
- SQL execute/select permissions are enabled for the app DB.

## Repo layout

- `src/` — React UI, domain types, and Zustand stores
- `src/lib/db/` — SQLite schema + small repo modules for articles, ideas, reminders, and settings
- `src-tauri/` — Tauri backend (Rust commands: folder scans, idea file creation, opener)

## License

MIT
