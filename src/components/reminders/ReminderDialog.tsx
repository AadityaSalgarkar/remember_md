import { useState } from "react";
import { format, addDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useUIStore } from "@/stores/uiStore";
import { useReminderStore } from "@/stores/reminderStore";
import { useArticleStore } from "@/stores/articleStore";
import { useIdeaStore } from "@/stores/ideaStore";

export function ReminderDialog() {
  const { selectedReminderTarget, closeReminderDialog } = useUIStore();
  const { createReminder, createIdeaReminder, loadDueCount } = useReminderStore();
  const { articles, loadArticles } = useArticleStore();
  const { ideas, loadIdeas } = useIdeaStore();
  const [customDate, setCustomDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const article =
    selectedReminderTarget?.type === "article"
      ? articles.find((a) => a.id === selectedReminderTarget.id)
      : undefined;
  const idea =
    selectedReminderTarget?.type === "idea"
      ? ideas.find((item) => item.id === selectedReminderTarget.id)
      : undefined;
  const targetTitle = article?.title ?? idea?.title;
  const isOpen = !!selectedReminderTarget;

  const handleQuickSet = async (days: number) => {
    if (!selectedReminderTarget) return;
    const remindAt = format(addDays(new Date(), days), "yyyy-MM-dd");
    if (selectedReminderTarget.type === "article") {
      await createReminder({
        article_id: selectedReminderTarget.id,
        remind_at: remindAt,
        is_first: true,
      });
      await loadArticles();
    } else {
      await createIdeaReminder({
        idea_id: selectedReminderTarget.id,
        remind_at: remindAt,
        is_first: true,
      });
      await loadIdeas();
    }
    await loadDueCount();
    closeReminderDialog();
  };

  const handleCustomSet = async () => {
    if (!selectedReminderTarget) return;
    if (selectedReminderTarget.type === "article") {
      await createReminder({
        article_id: selectedReminderTarget.id,
        remind_at: customDate,
        is_first: true,
      });
      await loadArticles();
    } else {
      await createIdeaReminder({
        idea_id: selectedReminderTarget.id,
        remind_at: customDate,
        is_first: true,
      });
      await loadIdeas();
    }
    await loadDueCount();
    closeReminderDialog();
  };

  const quickOptions = [
    { label: "Today", sub: "Now", days: 0 },
    { label: "Tomorrow", sub: "+1 day", days: 1 },
    { label: "1 Week", sub: "+7 days", days: 7 },
    { label: "1 Month", sub: "+30 days", days: 30 },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeReminderDialog()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Reminder</DialogTitle>
          {targetTitle && (
            <DialogDescription className="truncate" title={targetTitle}>
              {targetTitle}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="py-4">
          {/* Quick options */}
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">
            Quick Options
          </label>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {quickOptions.map(({ label, sub, days }) => (
              <button
                key={days}
                onClick={() => handleQuickSet(days)}
                className="quick-action"
              >
                <span className="quick-action-label">{label}</span>
                <span className="quick-action-sub">{sub}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <Separator className="flex-1" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              or
            </span>
            <Separator className="flex-1" />
          </div>

          {/* Custom date */}
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">
            Pick a Date
          </label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              min={format(new Date(), "yyyy-MM-dd")}
              className="flex-1"
            />
            <Button onClick={handleCustomSet}>Set</Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={closeReminderDialog}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
