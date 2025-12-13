import { useState } from "react";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/stores/uiStore";
import { useReminderStore } from "@/stores/reminderStore";
import { useArticleStore } from "@/stores/articleStore";

export function ReminderDialog() {
  const { selectedArticleId, closeReminderDialog } = useUIStore();
  const { createReminder, loadDueCount } = useReminderStore();
  const { articles, loadArticles } = useArticleStore();
  const [customDate, setCustomDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const article = articles.find((a) => a.id === selectedArticleId);

  if (!article) {
    return null;
  }

  const handleQuickSet = async (days: number) => {
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
    await createReminder({
      article_id: article.id,
      remind_at: customDate,
      is_first: true,
    });
    await loadDueCount();
    await loadArticles();
    closeReminderDialog();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[hsl(var(--ink)_/_0.4)] backdrop-blur-sm animate-fade-in"
        onClick={closeReminderDialog}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md paper rounded-md p-6 animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">Set Reminder</h2>
          <p className="font-mono text-sm text-[hsl(var(--muted-foreground))] truncate">
            {article.title}
          </p>
        </div>

        {/* Quick options */}
        <div className="mb-6">
          <label className="block font-mono text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">
            Quick Options
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Today", days: 0 },
              { label: "Tomorrow", days: 1 },
              { label: "1 Week", days: 7 },
              { label: "1 Month", days: 30 },
            ].map(({ label, days }) => (
              <button
                key={days}
                onClick={() => handleQuickSet(days)}
                className="
                  py-3 px-2
                  border border-[hsl(var(--border))] rounded-sm
                  font-mono text-xs uppercase tracking-wider
                  text-[hsl(var(--foreground))]
                  transition-all duration-200
                  hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))]
                  hover:bg-[hsl(var(--accent)_/_0.05)]
                  active:bg-[hsl(var(--accent)_/_0.1)]
                "
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[hsl(var(--border))]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[hsl(var(--background))] px-3 font-mono text-xs text-[hsl(var(--ink-faint))] uppercase">
              or
            </span>
          </div>
        </div>

        {/* Custom date */}
        <div className="mb-6">
          <label className="block font-mono text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">
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
            <Button variant="primary" onClick={handleCustomSet}>
              Set
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={closeReminderDialog}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
