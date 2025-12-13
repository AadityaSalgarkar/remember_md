import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
          className="absolute inset-0 bg-[hsl(var(--ink)_/_0.4)] backdrop-blur-sm animate-fade-in"
          onClick={handleClose}
        />
      )}

      {/* Dialog */}
      <div className="relative w-full max-w-lg paper rounded-md p-6 animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">Settings</h2>
          <p className="font-mono text-sm text-[hsl(var(--muted-foreground))]">
            Configure your Obsidian vault location
          </p>
        </div>

        {/* Vault Path */}
        <div className="mb-6">
          <label className="block font-mono text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">
            Obsidian Vault Path
          </label>
          <div className="flex gap-2">
            <Input
              value={vaultPath}
              onChange={(e) => setVaultPath(e.target.value)}
              placeholder="/path/to/your/vault"
              className="flex-1"
            />
            <Button variant="secondary" onClick={handleBrowse}>
              Browse
            </Button>
          </div>
        </div>

        {/* Sync info */}
        {settings.lastSyncAt && (
          <div className="mb-4 p-3 rounded-sm bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
            <p className="font-mono text-xs text-[hsl(var(--muted-foreground))]">
              Last synced: {new Date(settings.lastSyncAt).toLocaleString()}
            </p>
          </div>
        )}

        {/* Sync result */}
        {syncResult && (
          <div className={`
            mb-4 p-3 rounded-sm border font-mono text-xs
            ${syncResult.startsWith("Error")
              ? "bg-[hsl(var(--accent)_/_0.1)] border-[hsl(var(--accent)_/_0.3)] text-[hsl(var(--accent))]"
              : "bg-[hsl(var(--success-light))] border-[hsl(var(--success)_/_0.3)] text-[hsl(var(--success))]"
            }
          `}>
            {syncResult}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--border))]">
          <div>
            {settings.vaultPath && (
              <Button variant="ghost" onClick={handleSync} disabled={isSyncing}>
                {isSyncing ? "Syncing..." : "Sync Now"}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {!defaultOpen && (
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
            )}
            <Button variant="primary" onClick={handleSave} disabled={!vaultPath || isSyncing}>
              {isSyncing ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
