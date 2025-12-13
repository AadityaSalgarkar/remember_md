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
