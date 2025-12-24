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

export function ReminderDialog() {
  const { selectedArticleId, closeReminderDialog } = useUIStore();
  const { createReminder, loadDueCount } = useReminderStore();
  const { articles, loadArticles } = useArticleStore();
  const [customDate, setCustomDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const article = articles.find((a) => a.id === selectedArticleId);
  const isOpen = !!selectedArticleId;

  const handleQuickSet = async (days: number) => {
    if (!article) return;
    const remindAt = format(addDays(new Date(), days), "yyyy-MM-dd");
    await createReminder({
      article_id: article.id,
      remind_at: remindAt,
      is_first: true,
    });
    await loadDueCount();
    await loadArticles();
    closeReminderDialog();
  };

  const handleCustomSet = async () => {
    if (!article) return;
    await createReminder({
      article_id: article.id,
      remind_at: customDate,
      is_first: true,
    });
    await loadDueCount();
    await loadArticles();
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
          {article && (
            <DialogDescription className="truncate" title={article.title}>
              {article.title}
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
