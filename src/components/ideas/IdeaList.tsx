import { Lightbulb } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIdeaStore } from "@/stores/ideaStore";
import { useUIStore } from "@/stores/uiStore";
import { IdeaRow } from "./IdeaRow";

export function IdeaList() {
  const { ideas, isLoading } = useIdeaStore();
  const { searchQuery, viewMode } = useUIStore();

  if (isLoading) {
    return (
      <div className="divide-y divide-border">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 px-4 py-3 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="w-1 h-10 skeleton rounded-full" />
            <div className="flex-1">
              <div className="skeleton h-4 w-3/4 mb-2" />
              <div className="skeleton h-3 w-1/2" />
            </div>
            <div className="skeleton h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  const filteredIdeas = ideas.filter((idea) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      idea.title.toLowerCase().includes(query) ||
      idea.relative_path.toLowerCase().includes(query)
    );
  });

  if (filteredIdeas.length === 0) {
    return (
      <div className="empty-state animate-fade-in">
        <div className="empty-state-icon">
          <Lightbulb className="w-12 h-12" />
        </div>
        <p className="empty-state-title">
          {searchQuery
            ? "No matches found"
            : viewMode === "archived"
              ? "No archived ideas"
              : "No ideas yet"}
        </p>
        <p className="empty-state-text">
          {searchQuery
            ? "Try a different search term"
            : viewMode === "archived"
              ? "Archived ideas will appear here"
              : "Create a new idea to start a Markdown note"}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 border-b border-border bg-muted/30">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{filteredIdeas.length}</span>{" "}
          idea{filteredIdeas.length !== 1 ? "s" : ""}
          {searchQuery && (
            <span className="text-muted-foreground"> matching "{searchQuery}"</span>
          )}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {filteredIdeas.map((idea) => (
            <IdeaRow key={idea.id} idea={idea} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
