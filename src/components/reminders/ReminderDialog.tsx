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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-2">Set Reminder</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4 truncate">
          {article.title}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Quick options</label>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleQuickSet(0)}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickSet(1)}>
                Tomorrow
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickSet(7)}>
                1 Week
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickSet(30)}>
                1 Month
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Or pick a date</label>
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
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="ghost" onClick={closeReminderDialog}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
