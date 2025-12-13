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
        setSyncResult(`Added ${result.added} articles, removed ${result.removed}`);
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
        setSyncResult(`Added ${result.added} articles, removed ${result.removed}`);
        await loadArticles();
      } catch (error) {
        setSyncResult(`Error: ${error}`);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Obsidian Vault Path
            </label>
            <div className="flex gap-2">
              <Input
                value={vaultPath}
                onChange={(e) => setVaultPath(e.target.value)}
                placeholder="/path/to/vault"
                className="flex-1"
              />
              <Button variant="outline" onClick={handleBrowse}>
                Browse
              </Button>
            </div>
          </div>

          {settings.lastSyncAt && (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Last synced: {new Date(settings.lastSyncAt).toLocaleString()}
            </p>
          )}

          {syncResult && (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{syncResult}</p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          {settings.vaultPath && (
            <Button variant="outline" onClick={handleSync} disabled={isSyncing}>
              {isSyncing ? "Syncing..." : "Sync Now"}
            </Button>
          )}
          {!defaultOpen && (
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={!vaultPath || isSyncing}>
            {isSyncing ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
