export interface Reminder {
  id: string;
  article_id: string;
  remind_at: string;
  is_first: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface ReminderInput {
  article_id: string;
  remind_at: string;
  is_first?: boolean;
}

export interface IdeaReminder {
  id: string;
  idea_id: string;
  remind_at: string;
  is_first: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface IdeaReminderInput {
  idea_id: string;
  remind_at: string;
  is_first?: boolean;
}
