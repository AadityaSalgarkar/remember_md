import { useEffect } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useReminderStore } from "@/stores/reminderStore";
import { useArticleStore } from "@/stores/articleStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <header className="sticky top-0 z-10 bg-[hsl(var(--background)_/_0.9)] backdrop-blur-sm border-b border-[hsl(var(--border))]">
        <div className="max-w-3xl mx-auto px-6 py-5">
          {/* Title row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-baseline gap-4">
              <h1 className="text-2xl font-semibold tracking-tight">
                Remember
              </h1>
              {dueCount > 0 && (
                <Badge variant="due">
                  {dueCount} due
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleRefresh} title="Refresh from vault">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </Button>
              <Button variant="ghost" size="sm" onClick={openSettings}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-4">
            {/* View toggle */}
            <div className="flex border border-[hsl(var(--border))] rounded-sm overflow-hidden">
              <button
                onClick={() => handleViewChange("active")}
                className={`
                  px-3 py-1.5 font-mono text-xs uppercase tracking-wider
                  transition-colors duration-200
                  ${viewMode === "active"
                    ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]"
                    : "bg-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                  }
                `}
              >
                Active
              </button>
              <button
                onClick={() => handleViewChange("archived")}
                className={`
                  px-3 py-1.5 font-mono text-xs uppercase tracking-wider
                  transition-colors duration-200
                  border-l border-[hsl(var(--border))]
                  ${viewMode === "archived"
                    ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]"
                    : "bg-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                  }
                `}
              >
                Archived
              </button>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-xs">
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[hsl(var(--border))]">
        <div className="max-w-3xl mx-auto px-6">
          <p className="font-mono text-xs text-[hsl(var(--ink-faint))] text-center tracking-wider">
            REMEMBER YOUR READINGS
          </p>
        </div>
      </footer>
    </div>
  );
}
