import { useArticleStore } from "@/stores/articleStore";
import { useUIStore } from "@/stores/uiStore";
import { ArticleCard } from "./ArticleCard";

export function ArticleList() {
  const { articles, isLoading } = useArticleStore();
  const { searchQuery, viewMode } = useUIStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-[hsl(var(--muted-foreground))]">Loading articles...</span>
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
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <span className="text-[hsl(var(--muted-foreground))]">
          {searchQuery
            ? "No articles match your search"
            : viewMode === "archived"
              ? "No archived articles"
              : "No articles found"}
        </span>
        {!searchQuery && viewMode === "active" && (
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            Configure your vault path in settings to import articles
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredArticles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
