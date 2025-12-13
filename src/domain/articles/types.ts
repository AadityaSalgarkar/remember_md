export interface Article {
  id: string;
  file_path: string;
  title: string;
  relative_path: string;
  is_archived: boolean;
  created_at: string;
}

export interface ArticleInput {
  file_path: string;
  title: string;
  relative_path: string;
}

export interface ArticleWithReminder extends Article {
  reminder?: {
    id: string;
    remind_at: string;
    is_first: boolean;
    completed_at: string | null;
  };
}

export interface MarkdownFile {
  path: string;
  title: string;
  relative_path: string;
}
