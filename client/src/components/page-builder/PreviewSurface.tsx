import {
  DndContext,
  DragEndEvent,
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Layout, GripVertical } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { PageSection, SectionPreset } from "@shared/schema";
import { useEditorStore } from "@/stores/editorStore";
import { EditorModeProvider } from "./EditorModeContext";
import { SectionWrapper } from "./SectionWrapper";
import { RenderSectionContent } from "./RenderSectionContent";

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

interface PreviewSurfaceProps {
  className?: string;
  onSectionDrop: (preset: SectionPreset, index?: number) => void;
}

export function PreviewSurface({ className, onSectionDrop }: PreviewSurfaceProps) {
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

  const sortedSections = [...draftSections].sort((a, b) => a.order - b.order);

  return (
    <div className={`h-full overflow-auto bg-background ${className}`}>
      <div
        ref={setNodeRef}
        className={`min-h-full transition-colors ${
          isOver ? "bg-primary/10" : ""
        }`}
        onClick={() => selectSection(null)}
      >
        {draftSections.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div
              className={`max-w-md border-2 border-dashed rounded-lg p-8 text-center ${
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
          </div>
        ) : (
            <EditorModeProvider isEditorMode={true}>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sortedSections.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div>
                    {sortedSections.map((section) => (
                      <SectionWrapper
                        key={section.id}
                        section={section}
                        isSelected={selectedSectionId === section.id}
                        onSelect={() => selectSection(section.id)}
                        onToggleVisibility={() => toggleSectionVisibility(section.id)}
                        onRemove={() => removeSection(section.id)}
                      >
                        <RenderSectionContent section={section} />
                      </SectionWrapper>
                    ))}
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activeSection && (
                    <Card className="shadow-lg opacity-90 max-w-xs">
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
            </EditorModeProvider>
          )}

          {draftSections.length > 0 && (
            <div
              className={`m-4 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                isOver ? "border-primary bg-primary/5" : "border-muted-foreground/20"
              }`}
            >
              <p className="text-xs text-muted-foreground">
                Drop section here to add at the end
              </p>
            </div>
        )}
      </div>
    </div>
  );
}
