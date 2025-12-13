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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-8 h-8 border-2 border-[hsl(var(--border))] border-t-[hsl(var(--accent))] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!settings.vaultPath) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md animate-fade-in">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 text-[hsl(var(--accent))]">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-2">
            Remember
          </h1>
          <p className="text-[hsl(var(--text-secondary))] mb-8">
            A reading companion for your Obsidian vault.
            Set reminders for articles you want to revisit.
          </p>

          <SettingsDialog defaultOpen />
        </div>
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
