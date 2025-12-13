import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import {
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Settings2,
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
} from "lucide-react";
import type { PageSection, SectionPreset } from "@shared/schema";
import { useEditorStore } from "@/stores/editorStore";

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
};

const SECTION_TYPE_LABELS: Record<string, string> = {
  hero: "Hero Section",
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

interface SortableSectionCardProps {
  section: PageSection;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onRemove: () => void;
}

function SortableSectionCard({
  section,
  isSelected,
  onSelect,
  onToggleVisibility,
  onRemove,
}: SortableSectionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const Icon = SECTION_TYPE_ICONS[section.type] || FileText;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : section.isVisible ? 1 : 0.5,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-all cursor-pointer ${
        isSelected
          ? "ring-2 ring-primary border-primary"
          : "hover:border-primary/50"
      } ${!section.isVisible ? "bg-muted/50" : ""}`}
      onClick={onSelect}
      data-testid={`canvas-section-${section.id}`}
    >
      <CardHeader className="p-3 flex-row items-center gap-2">
        <button
          className="cursor-grab touch-none p-1 rounded hover:bg-muted"
          {...attributes}
          {...listeners}
          data-testid={`drag-handle-${section.id}`}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        <Icon className="h-4 w-4 text-primary shrink-0" />

        <div className="flex-1 min-w-0">
          <CardTitle className="text-sm truncate">
            {section.title || SECTION_TYPE_LABELS[section.type]}
          </CardTitle>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Badge variant="secondary" className="text-xs">
            {SECTION_TYPE_LABELS[section.type]}
          </Badge>
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
      </CardHeader>

      <CardContent className="p-3 pt-0 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Order: {section.order + 1}</span>
          {!section.isVisible && (
            <Badge variant="outline" className="text-xs">
              Hidden
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface EditorCanvasProps {
  className?: string;
  onSectionDrop: (preset: SectionPreset, index?: number) => void;
}

export function EditorCanvas({ className, onSectionDrop }: EditorCanvasProps) {
  const {
    draftSections,
    selectedSectionId,
    selectSection,
    toggleSectionVisibility,
    removeSection,
    reorderSections,
    pageName,
  } = useEditorStore();

  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-drop-zone",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeData = active.data.current;

    if (activeData?.type === "preset" && activeData?.preset) {
      const dropIndex =
        over.id === "canvas-drop-zone"
          ? draftSections.length
          : draftSections.findIndex((s) => s.id === over.id);
      onSectionDrop(activeData.preset, dropIndex >= 0 ? dropIndex : undefined);
      return;
    }

    if (active.id !== over.id) {
      const oldIndex = draftSections.findIndex((s) => s.id === active.id);
      const newIndex = draftSections.findIndex((s) => s.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderSections(oldIndex, newIndex);
      }
    }
  };

  const activeSection = activeId
    ? draftSections.find((s) => s.id === activeId)
    : null;

  return (
    <div className={`flex flex-col h-full bg-muted/30 ${className}`}>
      <div className="p-3 border-b bg-background flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">{pageName || "Page Canvas"}</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {draftSections.length} section{draftSections.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <ScrollArea className="flex-1">
        <div
          ref={setNodeRef}
          className={`p-4 min-h-full transition-colors ${
            isOver ? "bg-primary/10" : ""
          }`}
        >
          {draftSections.length === 0 ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                isOver ? "border-primary bg-primary/5" : "border-muted-foreground/30"
              }`}
            >
              <Layout className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h4 className="font-medium text-muted-foreground mb-2">
                No sections yet
              </h4>
              <p className="text-sm text-muted-foreground/70">
                Drag sections from the library to start building your page
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={draftSections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {draftSections.map((section) => (
                    <SortableSectionCard
                      key={section.id}
                      section={section}
                      isSelected={selectedSectionId === section.id}
                      onSelect={() => selectSection(section.id)}
                      onToggleVisibility={() =>
                        toggleSectionVisibility(section.id)
                      }
                      onRemove={() => removeSection(section.id)}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeSection && (
                  <Card className="shadow-lg opacity-90">
                    <CardHeader className="p-3 flex-row items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm">
                        {activeSection.title ||
                          SECTION_TYPE_LABELS[activeSection.type]}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                )}
              </DragOverlay>
            </DndContext>
          )}

          {draftSections.length > 0 && (
            <div
              className={`mt-4 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                isOver ? "border-primary bg-primary/5" : "border-muted-foreground/20"
              }`}
            >
              <p className="text-xs text-muted-foreground">
                Drop section here to add at the end
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
