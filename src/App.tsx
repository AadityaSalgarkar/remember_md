import { useEffect, useState } from "react";
import { useSettingsStore } from "./stores/settingsStore";
import { useArticleStore } from "./stores/articleStore";
import { useUIStore } from "./stores/uiStore";
import { AppShell } from "./components/layout/AppShell";
import { ArticleList } from "./components/articles/ArticleList";
import { SettingsDialog } from "./components/settings/SettingsDialog";
import { ReminderDialog } from "./components/reminders/ReminderDialog";

function App() {
  const { settings, loadSettings, isLoading: settingsLoading } = useSettingsStore();
  const { loadArticles, syncFromVault } = useArticleStore();
  const { isSettingsOpen, isReminderDialogOpen } = useUIStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadSettings();
      setInitialized(true);
    };
    init();
  }, [loadSettings]);

  useEffect(() => {
    if (initialized && settings.vaultPath) {
      syncFromVault(settings.vaultPath).then(() => loadArticles());
    }
  }, [initialized, settings.vaultPath, syncFromVault, loadArticles]);

  if (settingsLoading || !initialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!settings.vaultPath) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-2xl font-semibold">Welcome to Remember</h1>
        <p className="text-muted-foreground text-center max-w-md">
          To get started, configure your Obsidian vault location in settings.
        </p>
        <SettingsDialog defaultOpen />
      </div>
    );
  }

  return (
    <AppShell>
      <ArticleList />
      {isSettingsOpen && <SettingsDialog />}
      {isReminderDialogOpen && <ReminderDialog />}
    </AppShell>
  );
}

export default App;
