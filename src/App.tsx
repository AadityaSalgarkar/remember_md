import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { useSettingsStore } from "./stores/settingsStore";
import { useArticleStore } from "./stores/articleStore";
import { AppShell } from "./components/layout/AppShell";
import { ArticleList } from "./components/articles/ArticleList";
import { SettingsDialog } from "./components/settings/SettingsDialog";
import { ReminderDialog } from "./components/reminders/ReminderDialog";

function App() {
  const { settings, loadSettings, isLoading: settingsLoading } = useSettingsStore();
  const { loadArticles, syncFromVault } = useArticleStore();
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!settings.vaultPath) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-background">
        <div className="text-center max-w-md animate-fade-in">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 text-primary">
            <BookOpen className="w-full h-full" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-2 text-foreground">Remember</h1>
          <p className="text-muted-foreground mb-8">
            A reading companion for your Obsidian vault. Set reminders for
            articles you want to revisit.
          </p>

          <SettingsDialog defaultOpen />
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <ArticleList />
      <SettingsDialog />
      <ReminderDialog />
    </AppShell>
  );
}

export default App;
