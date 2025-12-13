import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GripVertical, Eye, EyeOff, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PageSection } from "@shared/schema";
import { InteractionBlocker } from "./EditorModeContext";

const SECTION_TYPE_LABELS: Record<string, string> = {
  hero: "Hero",
  trust_indicators: "Trust Indicators",
  loan_products: "Loan Products",
  testimonials: "Testimonials",
  faq: "FAQ",
  lead_form: "Lead Form",
  recently_funded: "Recently Funded",
  state_map: "State Map",
  feature_highlights: "Feature Highlights",
  cta_banner: "CTA Banner",
  custom_content: "Custom Content",
  stats_bar: "Stats Bar",
};

interface SectionWrapperProps {
  section: PageSection;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onRemove: () => void;
  children: ReactNode;
}

export function SectionWrapper({
  section,
  isSelected,
  onSelect,
  onToggleVisibility,
  onRemove,
  children,
}: SectionWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${!section.isVisible ? "opacity-50" : ""}`}
      data-testid={`preview-section-${section.id}`}
    >
      <div
        className={`absolute inset-0 z-10 transition-all cursor-pointer ${
          isSelected
            ? "ring-2 ring-primary ring-inset bg-primary/5"
            : "hover:ring-2 hover:ring-primary/50 hover:ring-inset"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      />

      <div
        className={`absolute top-2 left-2 z-20 flex items-center gap-1 bg-background/95 backdrop-blur-sm rounded-md border shadow-sm p-1 transition-opacity ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <button
          className="cursor-grab touch-none p-1 rounded hover:bg-muted"
          {...attributes}
          {...listeners}
          data-testid={`drag-handle-${section.id}`}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <Badge variant="secondary" className="text-xs">
          {SECTION_TYPE_LABELS[section.type] || section.type}
        </Badge>
      </div>

      <div
        className={`absolute top-2 right-2 z-20 flex items-center gap-1 bg-background/95 backdrop-blur-sm rounded-md border shadow-sm p-1 transition-opacity ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          data-testid={`button-toggle-visibility-${section.id}`}
        >
          {section.isVisible ? (
            <Eye className="h-3.5 w-3.5" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          data-testid={`button-remove-${section.id}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <InteractionBlocker>
        {children}
      </InteractionBlocker>
    </div>
  );
}
