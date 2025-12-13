import { useArticleStore } from "@/stores/articleStore";
import { useUIStore } from "@/stores/uiStore";
import { ArticleCard } from "./ArticleCard";

export function ArticleList() {
  const { articles, isLoading } = useArticleStore();
  const { searchQuery, viewMode } = useUIStore();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-4 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <div className="skeleton h-5 w-3/4 mb-2" />
                <div className="skeleton h-3 w-1/2" />
              </div>
              <div className="skeleton h-8 w-14" />
            </div>
            <div className="pt-3 border-t border-[hsl(var(--border))]">
              <div className="skeleton h-6 w-20" />
            </div>
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
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
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
    <div>
      {/* Results count */}
      <p className="article-count">
        <strong>{filteredArticles.length}</strong> article{filteredArticles.length !== 1 ? "s" : ""}
        {searchQuery && ` matching "${searchQuery}"`}
      </p>

      {/* Article list */}
      <div className="space-y-3">
        {filteredArticles.map((article, index) => (
          <ArticleCard key={article.id} article={article} index={index} />
        ))}
      </div>
    </div>
  );
}
