import { invoke } from "@tauri-apps/api/core";
import { format, isToday, isTomorrow, isPast, differenceInDays } from "date-fns";
import {
  ExternalLink,
  Check,
  Clock,
  Bell,
  Archive,
  RotateCcw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUIStore } from "@/stores/uiStore";
import { useReminderStore } from "@/stores/reminderStore";
import { useArticleStore } from "@/stores/articleStore";
import type { ArticleWithReminder } from "@/domain/articles/types";
import { cn } from "@/lib/utils";

interface ArticleRowProps {
  article: ArticleWithReminder;
}

export function ArticleRow({ article }: ArticleRowProps) {
  const { openReminderDialog, viewMode } = useUIStore();
  const { markDone, snooze, cancelReminder, loadDueCount } = useReminderStore();
  const { archiveArticle, restoreArticle, loadArticles } = useArticleStore();

  const reminder = article.reminder;
  const remindDate = reminder ? new Date(reminder.remind_at) : null;
  const isDue = remindDate && (isToday(remindDate) || isPast(remindDate));
  const isTomorrowDue = remindDate && isTomorrow(remindDate);
  const daysUntil = remindDate ? differenceInDays(remindDate, new Date()) : null;
  const isUpcoming = isTomorrowDue || (daysUntil !== null && daysUntil <= 3 && daysUntil > 0);

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

  const getStatusIndicatorClass = () => {
    if (isDue) return "bg-primary";
    if (isUpcoming) return "bg-amber";
    return "bg-transparent";
  };

  const getBadgeVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (isDue) return "destructive";
    if (isUpcoming) return "default";
    return "secondary";
  };

  return (
    <div className="group relative">
      <div
        className={cn(
          "flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer",
          isDue && "bg-coral-light/30"
        )}
        onClick={handleOpen}
      >
        {/* Status indicator */}
        <div
          className={cn(
            "w-1 h-10 rounded-full shrink-0 transition-colors",
            getStatusIndicatorClass()
          )}
        />

        {/* Title & path */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate text-foreground">
            {article.title}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {article.relative_path}
          </p>
        </div>

        {/* Reminder badge - always visible */}
        <div className="shrink-0">
          {reminder ? (
            <Badge
              variant={getBadgeVariant()}
              className={cn(
                "text-xs",
                isDue && "bg-coral-light text-primary border-0",
                isUpcoming && "bg-amber-light text-amber border-0"
              )}
            >
              {formatRemindDate(remindDate!)}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">No reminder</span>
          )}
        </div>

        {/* Actions - visible on hover */}
        <div
          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <TooltipProvider delayDuration={0}>
            {viewMode === "archived" ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-sm" onClick={handleRestore}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Restore</TooltipContent>
              </Tooltip>
            ) : (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-sm" onClick={handleOpen}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Open</TooltipContent>
                </Tooltip>

                {reminder ? (
                  <>
                    {isDue && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={handleMarkDone}
                            className="text-teal hover:text-teal"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Mark done</TooltipContent>
                      </Tooltip>
                    )}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleSnooze(isDue ? 1 : 7)}
                        >
                          <Clock className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isDue ? "Snooze +1 day" : "Snooze +7 days"}
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={handleCancelReminder}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Cancel reminder</TooltipContent>
                    </Tooltip>
                  </>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openReminderDialog(article.id)}
                      >
                        <Bell className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Set reminder</TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-sm" onClick={handleArchive}>
                      <Archive className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Archive</TooltipContent>
                </Tooltip>
              </>
            )}
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
