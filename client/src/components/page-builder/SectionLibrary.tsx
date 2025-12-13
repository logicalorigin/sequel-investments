import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import {
  Layout,
  Award,
  CreditCard,
  MessageSquareQuote,
  HelpCircle,
  Star,
  MapPin,
  Megaphone,
  FileText,
  BarChart3,
  FormInput,
  DollarSign,
  Search,
  GripVertical,
  Workflow,
  Table,
  BadgeCheck,
} from "lucide-react";
import { SECTION_PRESETS, type SectionPresetCategory } from "@shared/schema";
import type { SectionPreset } from "@shared/schema";

const SECTION_TYPE_ICONS: Record<string, typeof Layout> = {
  hero: Layout,
  trust_indicators: Award,
  loan_products: CreditCard,
  testimonials: MessageSquareQuote,
  faq: HelpCircle,
  lead_form: FormInput,
  recently_funded: DollarSign,
  state_map: MapPin,
  feature_highlights: Star,
  cta_banner: Megaphone,
  custom_content: FileText,
  stats_bar: BarChart3,
  process_steps: Workflow,
  product_comparison: Table,
  partner_badges: BadgeCheck,
};

const SECTION_TYPE_LABELS: Record<string, string> = {
  hero: "Hero",
  trust_indicators: "Trust",
  loan_products: "Products",
  testimonials: "Testimonials",
  faq: "FAQ",
  lead_form: "Lead Form",
  recently_funded: "Funded",
  state_map: "Map",
  feature_highlights: "Features",
  cta_banner: "CTA",
  custom_content: "Content",
  stats_bar: "Stats",
  process_steps: "Process Steps",
  product_comparison: "Product Compare",
  partner_badges: "Partner Badges",
};

const CATEGORY_LABELS: Record<SectionPresetCategory | "all", string> = {
  all: "All",
  hero: "Hero",
  trust: "Trust",
  products: "Products",
  testimonials: "Testimonials",
  faq: "FAQ",
  features: "Features",
  cta: "CTA",
  content: "Content",
  map: "Maps",
  form: "Forms",
  stats: "Stats",
  funded: "Funded",
  process: "Process",
  comparison: "Compare",
  badges: "Badges",
};

interface DraggablePresetCardProps {
  preset: SectionPreset;
}

function DraggablePresetCard({ preset }: DraggablePresetCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `preset-${preset.id}`,
    data: {
      type: "preset",
      preset,
    },
  });

  const Icon = SECTION_TYPE_ICONS[preset.type] || FileText;

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="cursor-grab hover-elevate select-none"
      data-testid={`draggable-preset-${preset.id}`}
      {...listeners}
      {...attributes}
    >
      <CardHeader className="p-3 pb-1">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
          <Icon className="h-4 w-4 text-primary shrink-0" />
          <CardTitle className="text-sm truncate flex-1">{preset.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <CardDescription className="text-xs line-clamp-2">{preset.description}</CardDescription>
        <Badge variant="outline" className="mt-2 text-xs">
          {SECTION_TYPE_LABELS[preset.type]}
        </Badge>
      </CardContent>
    </Card>
  );
}

interface SectionLibraryProps {
  className?: string;
}

export function SectionLibrary({ className }: SectionLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SectionPresetCategory | "all">("all");

  const filteredPresets = useMemo(() => {
    let presets = SECTION_PRESETS;

    if (selectedCategory !== "all") {
      presets = presets.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      presets = presets.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.type.toLowerCase().includes(query)
      );
    }

    return presets;
  }, [selectedCategory, searchQuery]);

  const categories: (SectionPresetCategory | "all")[] = [
    "all",
    "hero",
    "trust",
    "products",
    "testimonials",
    "faq",
    "features",
    "cta",
    "stats",
    "form",
    "funded",
    "map",
    "content",
    "process",
    "comparison",
    "badges",
  ];

  return (
    <div className={`flex flex-col h-full bg-background border-r ${className}`}>
      <div className="p-3 border-b space-y-3">
        <h3 className="font-semibold text-sm">Section Library</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9"
            data-testid="input-search-sections"
          />
        </div>
      </div>

      <Tabs
        value={selectedCategory}
        onValueChange={(v) => setSelectedCategory(v as SectionPresetCategory | "all")}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="border-b px-3 overflow-x-auto">
          <div className="w-full">
            <TabsList className="h-9 bg-transparent p-0 justify-start w-max">
              {categories.slice(0, 6).map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="text-xs px-2 data-[state=active]:bg-muted"
                  data-testid={`tab-category-${cat}`}
                >
                  {CATEGORY_LABELS[cat]}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {filteredPresets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No sections found
              </div>
            ) : (
              filteredPresets.map((preset) => (
                <DraggablePresetCard key={preset.id} preset={preset} />
              ))
            )}
          </div>
        </ScrollArea>
      </Tabs>

      <div className="p-3 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Drag sections to the canvas
        </p>
      </div>
    </div>
  );
}
