import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUIStore } from "@/stores/uiStore";
import { useArticleStore } from "@/stores/articleStore";

export function MainHeader() {
  const { viewMode, setViewMode, searchQuery, setSearchQuery } = useUIStore();
  const { loadArticles } = useArticleStore();

  const handleViewChange = (mode: string) => {
    const viewModeTyped = mode as "active" | "archived";
    setViewMode(viewModeTyped);
    loadArticles(viewModeTyped === "archived");
  };

  return (
    <header className="sticky top-0 z-10 bg-background border-b border-border px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* View toggle */}
        <Tabs value={viewMode} onValueChange={handleViewChange}>
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </header>
  );
}
