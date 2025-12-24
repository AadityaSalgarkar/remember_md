import { BookOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useArticleStore } from "@/stores/articleStore";
import { useUIStore } from "@/stores/uiStore";
import { ArticleRow } from "./ArticleRow";

export function ArticleList() {
  const { articles, isLoading } = useArticleStore();
  const { searchQuery, viewMode } = useUIStore();

  if (isLoading) {
    return (
      <div className="divide-y divide-border">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3 animate-fade-in"
            style={{ animationDelay: `${i * 50}ms` }}
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

  // Filter by search query
  const filteredArticles = articles.filter((article) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(query) ||
      article.relative_path.toLowerCase().includes(query)
    );
  });

  if (filteredArticles.length === 0) {
    return (
      <div className="empty-state animate-fade-in">
        <div className="empty-state-icon">
          <BookOpen className="w-12 h-12" />
        </div>
        <p className="empty-state-title">
          {searchQuery
            ? "No matches found"
            : viewMode === "archived"
              ? "No archived articles"
              : "No articles yet"}
        </p>
        <p className="empty-state-text">
          {searchQuery
            ? "Try a different search term"
            : viewMode === "archived"
              ? "Archived articles will appear here"
              : "Configure your vault in settings to get started"}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Results count */}
      <div className="px-4 py-2 border-b border-border bg-muted/30">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{filteredArticles.length}</span>
          {" "}article{filteredArticles.length !== 1 ? "s" : ""}
          {searchQuery && (
            <span className="text-muted-foreground"> matching "{searchQuery}"</span>
          )}
        </p>
      </div>

      {/* Article list */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {filteredArticles.map((article) => (
            <ArticleRow key={article.id} article={article} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
