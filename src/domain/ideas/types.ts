export interface Idea {
  id: string;
  file_path: string;
  title: string;
  relative_path: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface IdeaInput {
  file_path: string;
  title: string;
  relative_path: string;
}

export interface IdeaWithReminder extends Idea {
  reminder?: {
    id: string;
    remind_at: string;
    is_first: boolean;
    completed_at: string | null;
  };
}

export interface IdeaFile {
  path: string;
  title: string;
  relative_path: string;
}
