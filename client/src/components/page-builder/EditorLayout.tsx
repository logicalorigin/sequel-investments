import { useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Undo2,
  Redo2,
  Save,
  Loader2,
  Check,
  RotateCcw,
  LayoutTemplate,
} from "lucide-react";
import { SectionLibrary } from "./SectionLibrary";
import { PreviewSurface } from "./PreviewSurface";
import { PropertyInspector } from "./PropertyInspector";
import { useEditorStore } from "@/stores/editorStore";
import type { PageLayout, PageSection, SectionPreset, PageTemplateId } from "@shared/schema";
import { PAGE_TEMPLATES } from "@shared/schema";

interface EditorLayoutProps {
  pageId: string;
}

export function EditorLayout({ pageId }: EditorLayoutProps) {
  const { toast } = useToast();
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    draftSections,
    isDirty,
    isSaving,
    lastSavedAt,
    setPage,
    addSection,
    setSaving,
    setLastSavedAt,
    markClean,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  } = useEditorStore();

  const { data: layout, isLoading } = useQuery<PageLayout>({
    queryKey: ["/api/page-layouts", pageId],
  });

  const saveMutation = useMutation({
    mutationFn: async (sections: PageSection[]) => {
      return apiRequest("PUT", `/api/admin/page-layouts/${pageId}`, { sections });
    },
    onSuccess: () => {
      setLastSavedAt(new Date());
      markClean();
      queryClient.invalidateQueries({ queryKey: ["/api/page-layouts", pageId] });
    },
    onError: () => {
      toast({
        title: "Save failed",
        description: "Could not save changes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/admin/page-layouts/${pageId}/reset`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/page-layouts", pageId] });
      toast({
        title: "Layout reset",
        description: "Page layout has been reset to default.",
      });
    },
  });

  useEffect(() => {
    if (layout) {
      setPage(layout.pageId, layout.pageName, layout.sections);
    }
  }, [layout, setPage]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  useEffect(() => {
    if (isDirty && !isSaving) {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
      autosaveTimeoutRef.current = setTimeout(() => {
        handleSave();
      }, 3000);
    }

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [isDirty, draftSections]);

  const handleSave = useCallback(() => {
    if (isDirty && !isSaving) {
      setSaving(true);
      saveMutation.mutate(draftSections, {
        onSettled: () => setSaving(false),
      });
    }
  }, [isDirty, isSaving, draftSections, saveMutation, setSaving]);

  const handleSectionDrop = useCallback(
    (preset: SectionPreset, index?: number) => {
      const newSection: PageSection = {
        id: `${preset.type}-${Date.now()}`,
        type: preset.type,
        title: preset.name,
        isVisible: true,
        order: index ?? draftSections.length,
        config: { ...preset.config },
      };
      addSection(newSection, index);
    },
    [addSection, draftSections.length]
  );

  const handleApplyTemplate = useCallback(() => {
    const template = PAGE_TEMPLATES[pageId as PageTemplateId];
    if (template) {
      const sections = template.sections.map((s, i) => ({ ...s, order: i }));
      setPage(pageId, layout?.pageName || pageId, sections);
    }
  }, [pageId, layout, setPage]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeData = active.data.current;
      if (activeData?.type === "preset" && activeData?.preset) {
        const dropIndex =
          over.id === "canvas-drop-zone"
            ? draftSections.length
            : draftSections.findIndex((s) => s.id === over.id);
        handleSectionDrop(activeData.preset, dropIndex >= 0 ? dropIndex : undefined);
      }
    },
    [draftSections, handleSectionDrop]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between gap-4 p-3 border-b bg-background">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">Visual Editor</h2>
            <Badge variant="outline" className="text-xs">
              {layout?.pageName || pageId}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={undo}
                disabled={!canUndo()}
                data-testid="button-undo"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={redo}
                disabled={!canRedo()}
                data-testid="button-redo"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleApplyTemplate}
              data-testid="button-apply-template"
            >
              <LayoutTemplate className="h-4 w-4 mr-1" />
              Apply Template
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => resetMutation.mutate()}
              disabled={resetMutation.isPending}
              data-testid="button-reset"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>

            <div className="flex items-center gap-2">
              {isSaving ? (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </Badge>
              ) : isDirty ? (
                <Badge variant="secondary" className="text-xs">
                  Unsaved changes
                </Badge>
              ) : lastSavedAt ? (
                <Badge variant="outline" className="text-xs gap-1">
                  <Check className="h-3 w-3" />
                  Saved
                </Badge>
              ) : null}

              <Button
                size="sm"
                onClick={handleSave}
                disabled={!isDirty || isSaving}
                data-testid="button-save"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Save
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          <SectionLibrary className="w-64 shrink-0" />
          <PreviewSurface className="flex-1" onSectionDrop={handleSectionDrop} />
          <PropertyInspector className="w-72 shrink-0" />
        </div>
      </div>
    </DndContext>
  );
}
