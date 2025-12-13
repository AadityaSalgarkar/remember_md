import { invoke } from "@tauri-apps/api/core";
import { format, isToday, isTomorrow, isPast, differenceInDays } from "date-fns";
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

  const getCardClass = () => {
    let base = "card p-4 animate-fade-in";
    if (isDue) base += " card-due";
    else if (isTomorrowDue || (daysUntil && daysUntil <= 3)) base += " card-upcoming";
    return base;
  };

  const getBadgeClass = () => {
    if (isDue) return "badge badge-due";
    if (isTomorrowDue || (daysUntil && daysUntil <= 3)) return "badge badge-upcoming";
    return "badge badge-muted";
  };

  return (
    <article
      className={getCardClass()}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3
            className="text-[15px] font-semibold leading-snug cursor-pointer hover:text-[hsl(var(--accent))] transition-colors truncate"
            onClick={handleOpen}
            title={article.title}
          >
            {article.title}
          </h3>
          <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5 truncate">
            {article.relative_path}
          </p>
        </div>
        <button className="btn btn-ghost btn-sm shrink-0" onClick={handleOpen}>
          Open
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-[hsl(var(--border))]">
        {/* Status */}
        <div>
          {reminder ? (
            <span className={getBadgeClass()}>
              {formatRemindDate(remindDate!)}
            </span>
          ) : (
            <span className="text-xs text-[hsl(var(--text-tertiary))]">
              No reminder
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {viewMode === "archived" ? (
            <button className="btn btn-secondary btn-sm" onClick={handleRestore}>
              Restore
            </button>
          ) : (
            <>
              {reminder ? (
                <>
                  {isDue && (
                    <button className="btn btn-primary btn-sm" onClick={handleMarkDone}>
                      Done
                    </button>
                  )}
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleSnooze(isDue ? 1 : 7)}
                  >
                    {isDue ? "+1d" : "Snooze"}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={handleCancelReminder}>
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => openReminderDialog(article.id)}
                >
                  Set Reminder
                </button>
              )}
              <button className="btn btn-ghost btn-sm" onClick={handleArchive}>
                Archive
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
