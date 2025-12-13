import { useArticleStore } from "@/stores/articleStore";
import { useUIStore } from "@/stores/uiStore";
import { ArticleCard } from "./ArticleCard";

export function ArticleList() {
  const { articles, isLoading } = useArticleStore();
  const { searchQuery, viewMode } = useUIStore();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-8 h-8 border-2 border-[hsl(var(--border))] border-t-[hsl(var(--accent))] rounded-full animate-spin mb-4" />
        <span className="font-mono text-sm text-[hsl(var(--muted-foreground))]">
          Loading articles...
        </span>
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
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-16 h-16 mb-6 text-[hsl(var(--ink-faint))]">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">
          {searchQuery
            ? "No matches found"
            : viewMode === "archived"
              ? "No archived articles"
              : "No articles yet"}
        </h3>
        <p className="font-mono text-sm text-[hsl(var(--muted-foreground))] text-center max-w-sm">
          {searchQuery
            ? "Try a different search term"
            : viewMode === "archived"
              ? "Archived articles will appear here"
              : "Configure your vault path in settings to import articles from your Obsidian vault"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results count */}
      <div className="flex items-center justify-between mb-6">
        <p className="font-mono text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
          {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {/* Article list */}
      <div className="space-y-3">
        {filteredArticles.map((article, index) => (
          <ArticleCard key={article.id} article={article} index={index} />
        ))}
      </div>
    </div>
  );
}
