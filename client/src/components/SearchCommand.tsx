import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
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
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { SearchContext, SearchResponse, SearchResult } from "@shared/schema";

interface SearchCommandProps {
  context?: SearchContext;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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
    return <Icon className="mr-2 h-4 w-4" />;
  }
  
  switch (result.type) {
    case "page":
      return <Home className="mr-2 h-4 w-4" />;
    case "product":
      return <Package className="mr-2 h-4 w-4" />;
    case "application":
      return <FileText className="mr-2 h-4 w-4" />;
    case "user":
      return <User className="mr-2 h-4 w-4" />;
    case "faq":
      return <HelpCircle className="mr-2 h-4 w-4" />;
    default:
      return <Search className="mr-2 h-4 w-4" />;
  }
}

export function SearchCommand({ context = "public", open, onOpenChange }: SearchCommandProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, setIsOpen]);

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
      setResults(response as SearchResponse);
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
      setIsOpen(false);
      setQuery("");
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  const groupedResults = results?.results?.reduce((acc, result) => {
    const group = result.type;
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const groupLabels: Record<string, string> = {
    page: "Pages",
    product: "Loan Products",
    application: "Applications",
    document: "Documents",
    user: "Users",
    faq: "FAQs",
    resource: "Resources",
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput 
        placeholder="Search pages, products, applications..." 
        value={query}
        onValueChange={setQuery}
        data-testid="input-search"
      />
      <CommandList>
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {!isLoading && query.length >= 2 && (!results || !results.results || results.results.length === 0) && (
          <CommandEmpty>No results found for "{query}"</CommandEmpty>
        )}

        {!isLoading && groupedResults && Object.entries(groupedResults).map(([type, items]) => (
          <CommandGroup key={type} heading={groupLabels[type] || type}>
            {items.map((result) => (
              <CommandItem
                key={result.id}
                value={`${result.title} ${result.description || ""}`}
                onSelect={() => handleSelect(result)}
                className="cursor-pointer"
                data-testid={`search-result-${result.id}`}
              >
                {getIcon(result)}
                <div className="flex flex-col flex-1">
                  <span>{result.title}</span>
                  {result.description && (
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {result.description}
                    </span>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        {!isLoading && results?.suggestions && results.suggestions.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Suggestions">
              {results.suggestions.map((suggestion, i) => (
                <CommandItem
                  key={i}
                  value={suggestion}
                  onSelect={() => handleSuggestionClick(suggestion)}
                  className="cursor-pointer"
                  data-testid={`search-suggestion-${i}`}
                >
                  <Search className="mr-2 h-4 w-4" />
                  <span>{suggestion}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {!query && (
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => { setLocation("/"); setIsOpen(false); }} data-testid="quick-action-home">
              <Home className="mr-2 h-4 w-4" />
              <span>Go to Home</span>
            </CommandItem>
            <CommandItem onSelect={() => { setLocation("/quote"); setIsOpen(false); }} data-testid="quick-action-quote">
              <FileText className="mr-2 h-4 w-4" />
              <span>Get a Quote</span>
            </CommandItem>
            <CommandItem onSelect={() => { setLocation("/contact"); setIsOpen(false); }} data-testid="quick-action-contact">
              <Building className="mr-2 h-4 w-4" />
              <span>Contact Us</span>
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export function SearchTrigger({ context = "public" }: { context?: SearchContext }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground hover-elevate transition-colors"
        data-testid="button-search-trigger"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <SearchCommand context={context} open={open} onOpenChange={setOpen} />
    </>
  );
}
