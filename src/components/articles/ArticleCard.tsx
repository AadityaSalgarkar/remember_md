import { invoke } from "@tauri-apps/api/core";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/stores/uiStore";
import { useReminderStore } from "@/stores/reminderStore";
import { useArticleStore } from "@/stores/articleStore";
import type { ArticleWithReminder } from "@/domain/articles/types";

interface ArticleCardProps {
  article: ArticleWithReminder;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { openReminderDialog, viewMode } = useUIStore();
  const { markDone, snooze, cancelReminder, loadDueCount } = useReminderStore();
  const { archiveArticle, restoreArticle, loadArticles } = useArticleStore();

  const reminder = article.reminder;
  const remindDate = reminder ? new Date(reminder.remind_at) : null;
  const isDue = remindDate && (isToday(remindDate) || isPast(remindDate));
  const isTomorrowDue = remindDate && isTomorrow(remindDate);

  const handleOpen = async () => {
    try {
      await invoke("open_in_md_render", { filePath: article.file_path });
    } catch (error) {
      console.error("Failed to open file:", error);
    }
  };

  const handleMarkDone = async () => {
    if (reminder) {
      await markDone(reminder.id, article.id);
      await loadDueCount();
      await loadArticles();
    }
  };

  const handleSnooze = async (days: number) => {
    if (reminder) {
      await snooze(reminder.id, days);
      await loadDueCount();
      await loadArticles();
    }
  };

  const handleCancelReminder = async () => {
    if (reminder) {
      await cancelReminder(reminder.id);
      await loadDueCount();
      await loadArticles();
    }
  };

  const handleArchive = async () => {
    if (reminder) {
      await cancelReminder(reminder.id);
    }
    await archiveArticle(article.id);
    await loadDueCount();
  };

  const handleRestore = async () => {
    await restoreArticle(article.id);
  };

  const formatRemindDate = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] p-4 hover:bg-[hsl(var(--accent))]/50 transition-colors">
      {/* Title and path */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{article.title}</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))] truncate">
            {article.relative_path}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleOpen}>
          Open
        </Button>
      </div>

      {/* Reminder status and actions */}
      <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {reminder ? (
            <>
              <Badge variant={isDue ? "destructive" : isTomorrowDue ? "secondary" : "outline"}>
                {isDue ? "Due" : `Remind: ${formatRemindDate(remindDate!)}`}
              </Badge>
            </>
          ) : (
            <span className="text-sm text-[hsl(var(--muted-foreground))]">No reminder</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {viewMode === "archived" ? (
            <Button variant="outline" size="sm" onClick={handleRestore}>
              Restore
            </Button>
          ) : (
            <>
              {reminder ? (
                <>
                  {isDue && (
                    <Button variant="default" size="sm" onClick={handleMarkDone}>
                      Done
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSnooze(isDue ? 1 : 7)}
                  >
                    {isDue ? "Tomorrow" : "Snooze"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCancelReminder}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openReminderDialog(article.id)}
                >
                  Set Reminder
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleArchive}>
                Archive
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
