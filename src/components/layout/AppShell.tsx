import { useEffect } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useReminderStore } from "@/stores/reminderStore";
import { useArticleStore } from "@/stores/articleStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { viewMode, setViewMode, searchQuery, setSearchQuery, openSettings } = useUIStore();
  const { dueCount, loadDueCount } = useReminderStore();
  const { loadArticles } = useArticleStore();

  useEffect(() => {
    loadDueCount();
  }, [loadDueCount]);

  const handleViewChange = (mode: "active" | "archived") => {
    setViewMode(mode);
    loadArticles(mode === "archived");
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b border-[hsl(var(--border))] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Remember</h1>
            {dueCount > 0 && (
              <Badge variant="destructive">Due: {dueCount}</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={openSettings}>
            Settings
          </Button>
        </div>

        {/* View toggle and search */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex gap-1">
            <Button
              variant={viewMode === "active" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("active")}
            >
              Active
            </Button>
            <Button
              variant={viewMode === "archived" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("archived")}
            >
              Archived
            </Button>
          </div>
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
