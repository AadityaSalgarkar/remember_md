import { BookOpen, RefreshCw, Settings, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUIStore } from "@/stores/uiStore";
import { useReminderStore } from "@/stores/reminderStore";
import { useArticleStore } from "@/stores/articleStore";
import { useSettingsStore } from "@/stores/settingsStore";

export function Sidebar() {
  const { openSettings, viewMode } = useUIStore();
  const { dueCount } = useReminderStore();
  const { syncFromVault, loadArticles } = useArticleStore();
  const { settings, toggleTheme } = useSettingsStore();
  const { loadDueCount } = useReminderStore();
  const isDark = settings.theme === "dark";

  const handleRefresh = async () => {
    if (settings.vaultPath) {
      await syncFromVault(settings.vaultPath);
      await loadArticles(viewMode === "archived");
      await loadDueCount();
    }
  };

  return (
    <aside className="w-16 border-r border-border bg-sidebar flex flex-col items-center py-4 gap-2 shrink-0">
      {/* Logo */}
      <div className="mb-4 relative">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        {dueCount > 0 && (
          <span className="absolute -top-1 -right-1 due-indicator pulse text-[10px] min-w-[18px] h-[18px]">
            {dueCount}
          </span>
        )}
      </div>

      {/* Actions */}
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Sync vault</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {isDark ? "Light mode" : "Dark mode"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={openSettings}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </aside>
  );
}
