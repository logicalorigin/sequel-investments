import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  FileText, 
  Home, 
  Building, 
  Calculator, 
  HelpCircle, 
  User, 
  Package,
  ArrowRight,
  Loader2,
  X,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { SearchContext, SearchResponse, SearchResult } from "@shared/schema";

interface InlineSearchProps {
  context?: SearchContext;
  className?: string;
  placeholder?: string;
}

const iconMap: Record<string, any> = {
  "file-text": FileText,
  "home": Home,
  "building": Building,
  "calculator": Calculator,
  "help-circle": HelpCircle,
  "user": User,
  "package": Package,
};

function getIcon(result: SearchResult) {
  if (result.icon && iconMap[result.icon]) {
    const Icon = iconMap[result.icon];
    return <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />;
  }
  
  switch (result.type) {
    case "page":
      return <Home className="h-4 w-4 shrink-0 text-muted-foreground" />;
    case "product":
      return <Package className="h-4 w-4 shrink-0 text-muted-foreground" />;
    case "application":
      return <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />;
    case "user":
      return <User className="h-4 w-4 shrink-0 text-muted-foreground" />;
    case "faq":
      return <HelpCircle className="h-4 w-4 shrink-0 text-muted-foreground" />;
    default:
      return <Search className="h-4 w-4 shrink-0 text-muted-foreground" />;
  }
}

const groupLabels: Record<string, string> = {
  page: "Pages",
  product: "Loan Products",
  application: "Applications",
  document: "Documents",
  user: "Users",
  faq: "FAQs",
  resource: "Resources",
};

export function InlineSearch({ 
  context = "public", 
  className = "",
  placeholder = "Search..."
}: InlineSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      }
      if (e.key === "Escape" && isFocused) {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isFocused]);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/search", {
        query: searchQuery,
        context,
      });
      const data: SearchResponse = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.length >= 2) {
        performSearch(query);
      } else {
        setResults(null);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, performSearch]);

  const handleSelect = (result: SearchResult) => {
    if (result.url) {
      setLocation(result.url);
      setIsFocused(false);
      setQuery("");
      setResults(null);
    }
  };

  const handleQuickAction = (url: string) => {
    setLocation(url);
    setIsFocused(false);
    setQuery("");
  };

  const handleClear = () => {
    setQuery("");
    setResults(null);
    inputRef.current?.focus();
  };

  const groupedResults = results?.results?.reduce((acc, result) => {
    const group = result.type;
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const showDropdown = isFocused && (query.length >= 2 || query.length === 0);
  const hasResults = groupedResults && Object.keys(groupedResults).length > 0;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="pl-9 pr-16 w-full"
          data-testid="input-search"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              onClick={handleClear}
              className="p-1 rounded hover:bg-muted text-muted-foreground"
              data-testid="button-clear-search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 max-h-[400px] overflow-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && query.length >= 2 && !hasResults && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          )}

          {!isLoading && hasResults && (
            <div className="py-2">
              {Object.entries(groupedResults!).map(([type, items]) => (
                <div key={type}>
                  <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {groupLabels[type] || type}
                  </div>
                  {items.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelect(result)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover-elevate cursor-pointer text-left"
                      data-testid={`search-result-${result.id}`}
                    >
                      {getIcon(result)}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm truncate">{result.title}</span>
                        {result.description && (
                          <span className="text-xs text-muted-foreground truncate">
                            {result.description}
                          </span>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}

          {!isLoading && results?.suggestions && results.suggestions.length > 0 && (
            <div className="border-t py-2">
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Suggestions
              </div>
              {results.suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(suggestion)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover-elevate cursor-pointer text-left"
                  data-testid={`search-suggestion-${i}`}
                >
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {!isLoading && !query && (
            <div className="py-2">
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Quick Actions
              </div>
              <button
                onClick={() => handleQuickAction("/")}
                className="w-full flex items-center gap-3 px-3 py-2 hover-elevate cursor-pointer text-left"
                data-testid="quick-action-home"
              >
                <Home className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Go to Home</span>
              </button>
              <button
                onClick={() => handleQuickAction("/quote")}
                className="w-full flex items-center gap-3 px-3 py-2 hover-elevate cursor-pointer text-left"
                data-testid="quick-action-quote"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Get a Quote</span>
              </button>
              <button
                onClick={() => handleQuickAction("/contact")}
                className="w-full flex items-center gap-3 px-3 py-2 hover-elevate cursor-pointer text-left"
                data-testid="quick-action-contact"
              >
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Contact Us</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
