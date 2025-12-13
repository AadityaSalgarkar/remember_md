import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { useSettingsStore } from "@/stores/settingsStore";
import { useArticleStore } from "@/stores/articleStore";
import { useUIStore } from "@/stores/uiStore";

interface SettingsDialogProps {
  defaultOpen?: boolean;
}

export function SettingsDialog({ defaultOpen }: SettingsDialogProps) {
  const { settings, updateVaultPath } = useSettingsStore();
  const { syncFromVault, loadArticles } = useArticleStore();
  const { closeSettings } = useUIStore();
  const [vaultPath, setVaultPath] = useState(settings.vaultPath || "");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const handleBrowse = async () => {
    const selected = await open({
      directory: true,
      title: "Select Obsidian Vault",
    });
    if (selected) {
      setVaultPath(selected);
    }
  };

  const handleSave = async () => {
    if (vaultPath) {
      await updateVaultPath(vaultPath);
      setIsSyncing(true);
      setSyncResult(null);
      try {
        const result = await syncFromVault(vaultPath);
        setSyncResult(`Synced: +${result.added} added, -${result.removed} removed`);
        await loadArticles();
      } catch (error) {
        setSyncResult(`Error: ${error}`);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleClose = () => {
    if (!defaultOpen) {
      closeSettings();
    }
  };

  const handleSync = async () => {
    if (settings.vaultPath) {
      setIsSyncing(true);
      setSyncResult(null);
      try {
        const result = await syncFromVault(settings.vaultPath);
        setSyncResult(`Synced: +${result.added} added, -${result.removed} removed`);
        await loadArticles();
      } catch (error) {
        setSyncResult(`Error: ${error}`);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      {!defaultOpen && (
        <div
          className="dialog-overlay animate-fade-in"
          onClick={handleClose}
        />
      )}

      {/* Dialog */}
      <div className="dialog-content animate-fade-in-scale">
        <div className="dialog-header">
          <h2 className="dialog-title">Settings</h2>
          <p className="dialog-subtitle">
            Configure your Obsidian vault location
          </p>
        </div>

        <div className="dialog-body">
          {/* Vault Path */}
          <label className="label">Obsidian Vault Path</label>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={vaultPath}
              onChange={(e) => setVaultPath(e.target.value)}
              placeholder="/path/to/your/vault"
              className="input flex-1"
            />
            <button className="btn btn-secondary" onClick={handleBrowse}>
              Browse
            </button>
          </div>

          {/* Sync info */}
          {settings.lastSyncAt && (
            <div className="p-3 rounded-lg bg-[hsl(var(--stone-100))] mb-4">
              <p className="text-xs text-[hsl(var(--text-secondary))]">
                Last synced: {new Date(settings.lastSyncAt).toLocaleString()}
              </p>
            </div>
          )}

          {/* Sync result */}
          {syncResult && (
            <div className={`p-3 rounded-lg mb-4 text-sm ${
              syncResult.startsWith("Error")
                ? "bg-[hsl(var(--accent-light))] text-[hsl(var(--accent))]"
                : "bg-[hsl(var(--success-light))] text-[hsl(var(--success))]"
            }`}>
              {syncResult}
            </div>
          )}
        </div>

        <div className="dialog-footer justify-between">
          <div>
            {settings.vaultPath && (
              <button className="btn btn-ghost" onClick={handleSync} disabled={isSyncing}>
                {isSyncing ? "Syncing..." : "Sync Now"}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {!defaultOpen && (
              <button className="btn btn-ghost" onClick={handleClose}>
                Cancel
              </button>
            )}
            <button className="btn btn-primary" onClick={handleSave} disabled={!vaultPath || isSyncing}>
              {isSyncing ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
