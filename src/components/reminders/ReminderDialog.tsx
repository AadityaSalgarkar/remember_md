import { useState } from "react";
import { format, addDays } from "date-fns";
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

  const quickOptions = [
    { label: "Today", sub: "Now", days: 0 },
    { label: "Tomorrow", sub: "+1 day", days: 1 },
    { label: "1 Week", sub: "+7 days", days: 7 },
    { label: "1 Month", sub: "+30 days", days: 30 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="dialog-overlay animate-fade-in"
        onClick={closeReminderDialog}
      />

      {/* Dialog */}
      <div className="dialog-content animate-fade-in-scale">
        <div className="dialog-header">
          <h2 className="dialog-title">Set Reminder</h2>
          <p className="dialog-subtitle truncate" title={article.title}>
            {article.title}
          </p>
        </div>

        <div className="dialog-body">
          {/* Quick options */}
          <label className="label">Quick Options</label>
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
          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">or</span>
            <div className="divider-line" />
          </div>

          {/* Custom date */}
          <label className="label">Pick a Date</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              min={format(new Date(), "yyyy-MM-dd")}
              className="input flex-1"
            />
            <button className="btn btn-primary" onClick={handleCustomSet}>
              Set
            </button>
          </div>
        </div>

        <div className="dialog-footer">
          <button className="btn btn-ghost" onClick={closeReminderDialog}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
