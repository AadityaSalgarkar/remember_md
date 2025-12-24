import { useState, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettingsStore } from "@/stores/settingsStore";
import { useArticleStore } from "@/stores/articleStore";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";

interface SettingsDialogProps {
  defaultOpen?: boolean;
}

export function SettingsDialog({ defaultOpen }: SettingsDialogProps) {
  const { settings, updateVaultPath } = useSettingsStore();
  const { syncFromVault, loadArticles } = useArticleStore();
  const { isSettingsOpen, closeSettings } = useUIStore();
  const [vaultPath, setVaultPath] = useState(settings.vaultPath || "");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  // Sync vaultPath state when settings change
  useEffect(() => {
    setVaultPath(settings.vaultPath || "");
  }, [settings.vaultPath]);

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

  const isOpen = defaultOpen || isSettingsOpen;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your Obsidian vault location
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Vault Path */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
              Obsidian Vault Path
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
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
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground">
                Last synced: {new Date(settings.lastSyncAt).toLocaleString()}
              </p>
            </div>
          )}

          {/* Sync result */}
          {syncResult && (
            <div
              className={cn(
                "p-3 rounded-lg text-sm",
                syncResult.startsWith("Error")
                  ? "bg-coral-light text-primary"
                  : "bg-teal-light text-teal"
              )}
            >
              {syncResult}
            </div>
          )}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
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
            <Button onClick={handleSave} disabled={!vaultPath || isSyncing}>
              {isSyncing ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
