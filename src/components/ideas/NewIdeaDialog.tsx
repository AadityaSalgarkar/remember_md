import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/stores/uiStore";
import { useIdeaStore } from "@/stores/ideaStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useReminderStore } from "@/stores/reminderStore";

export function NewIdeaDialog() {
  const { isNewIdeaDialogOpen, closeNewIdeaDialog } = useUIStore();
  const { settings } = useSettingsStore();
  const { createIdea } = useIdeaStore();
  const { loadDueCount } = useReminderStore();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (!isSaving) {
      closeNewIdeaDialog();
      setTitle("");
      setBody("");
      setError(null);
    }
  };

  const handleCreate = async () => {
    if (!settings.vaultPath || !title.trim()) return;

    setIsSaving(true);
    setError(null);
    try {
      await createIdea(settings.vaultPath, {
        title: title.trim(),
        body,
      });
      await loadDueCount();
      closeNewIdeaDialog();
      setTitle("");
      setBody("");
    } catch (createError) {
      setError(String(createError));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isNewIdeaDialogOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>New Idea</DialogTitle>
          <DialogDescription>
            Create a Markdown note in the Ideas folder.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
              Title
            </label>
            <Input
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Working title"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
              Notes
            </label>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Optional starting notes"
              className="min-h-32 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg text-sm bg-coral-light text-primary">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!title.trim() || isSaving}>
            {isSaving ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
