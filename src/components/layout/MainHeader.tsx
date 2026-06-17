import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUIStore } from "@/stores/uiStore";
import { useArticleStore } from "@/stores/articleStore";
import { useIdeaStore } from "@/stores/ideaStore";

export function MainHeader() {
  const {
    appMode,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    openNewIdeaDialog,
  } = useUIStore();
  const { loadArticles } = useArticleStore();
  const { loadIdeas } = useIdeaStore();

  const handleViewChange = (mode: string) => {
    const viewModeTyped = mode as "active" | "archived";
    setViewMode(viewModeTyped);
    if (appMode === "articles") {
      loadArticles(viewModeTyped === "archived");
    } else {
      loadIdeas(viewModeTyped === "archived");
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-background border-b border-border px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder={appMode === "articles" ? "Search articles..." : "Search ideas..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {appMode === "ideas" && (
            <Button size="sm" onClick={openNewIdeaDialog}>
              <Plus className="w-4 h-4" />
              New Idea
            </Button>
          )}

          <Tabs value={viewMode} onValueChange={handleViewChange}>
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </header>
  );
}
