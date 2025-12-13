import { useEffect } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useReminderStore } from "@/stores/reminderStore";
import { useArticleStore } from "@/stores/articleStore";
import { useSettingsStore } from "@/stores/settingsStore";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { viewMode, setViewMode, searchQuery, setSearchQuery, openSettings } = useUIStore();
  const { dueCount, loadDueCount } = useReminderStore();
  const { syncFromVault, loadArticles } = useArticleStore();
  const { settings } = useSettingsStore();

  useEffect(() => {
    loadDueCount();
  }, [loadDueCount]);

  const handleViewChange = (mode: "active" | "archived") => {
    setViewMode(mode);
    loadArticles(mode === "archived");
  };

  const handleRefresh = async () => {
    if (settings.vaultPath) {
      await syncFromVault(settings.vaultPath);
      await loadArticles(viewMode === "archived");
      await loadDueCount();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <svg className="app-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
          <span className="app-logo-text">Remember</span>
          {dueCount > 0 && (
            <span className="due-indicator pulse">{dueCount}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="search-wrapper">
            <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              className="search-input input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* View toggle */}
          <div className="tab-group">
            <button
              onClick={() => handleViewChange("active")}
              className={`tab-item ${viewMode === "active" ? "active" : ""}`}
            >
              Active
            </button>
            <button
              onClick={() => handleViewChange("archived")}
              className={`tab-item ${viewMode === "archived" ? "active" : ""}`}
            >
              Archived
            </button>
          </div>

          {/* Actions */}
          <button className="btn btn-ghost btn-sm" onClick={handleRefresh} title="Sync vault">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
          <button className="btn btn-ghost btn-sm" onClick={openSettings} title="Settings">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="app-main flex-1">
        {children}
      </main>
    </div>
  );
}
