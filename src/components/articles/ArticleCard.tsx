import { invoke } from "@tauri-apps/api/core";
import { format, isToday, isTomorrow, isPast, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/stores/uiStore";
import { useReminderStore } from "@/stores/reminderStore";
import { useArticleStore } from "@/stores/articleStore";
import type { ArticleWithReminder } from "@/domain/articles/types";

interface ArticleCardProps {
  article: ArticleWithReminder;
  index?: number;
}

export function ArticleCard({ article, index = 0 }: ArticleCardProps) {
  const { openReminderDialog, viewMode } = useUIStore();
  const { markDone, snooze, cancelReminder, loadDueCount } = useReminderStore();
  const { archiveArticle, restoreArticle, loadArticles } = useArticleStore();

  const reminder = article.reminder;
  const remindDate = reminder ? new Date(reminder.remind_at) : null;
  const isDue = remindDate && (isToday(remindDate) || isPast(remindDate));
  const isTomorrowDue = remindDate && isTomorrow(remindDate);
  const daysUntil = remindDate ? differenceInDays(remindDate, new Date()) : null;

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
    if (isPast(date)) {
      const daysAgo = Math.abs(differenceInDays(date, new Date()));
      return `${daysAgo}d overdue`;
    }
    if (daysUntil && daysUntil <= 7) return `In ${daysUntil}d`;
    return format(date, "MMM d");
  };

  const getBadgeVariant = () => {
    if (isDue) return "due";
    if (isTomorrowDue || (daysUntil && daysUntil <= 3)) return "upcoming";
    return "muted";
  };

  return (
    <article
      className="paper rounded-md p-5 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header: Title + Open button */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h2
            className="text-lg font-medium leading-snug cursor-pointer hover:text-[hsl(var(--accent))] transition-colors"
            onClick={handleOpen}
            title="Open in MD_RENDER"
          >
            {article.title}
          </h2>
          <p className="font-mono text-xs text-[hsl(var(--ink-faint))] mt-1 truncate">
            {article.relative_path}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleOpen} className="shrink-0">
          Open
        </Button>
      </div>

      {/* Divider */}
      <div className="h-px bg-[hsl(var(--border))] my-4" />

      {/* Footer: Status + Actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Status */}
        <div className="flex items-center gap-3">
          {reminder ? (
            <Badge variant={getBadgeVariant()}>
              {formatRemindDate(remindDate!)}
            </Badge>
          ) : (
            <span className="font-mono text-xs text-[hsl(var(--ink-faint))] italic">
              No reminder set
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {viewMode === "archived" ? (
            <Button variant="secondary" size="sm" onClick={handleRestore}>
              Restore
            </Button>
          ) : (
            <>
              {reminder ? (
                <>
                  {isDue && (
                    <Button variant="primary" size="sm" onClick={handleMarkDone}>
                      Done
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSnooze(isDue ? 1 : 7)}
                  >
                    {isDue ? "+1d" : "Snooze"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCancelReminder}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
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
    </article>
  );
}
