import { create } from "zustand";
import type { PageSection, PageLayout } from "@shared/schema";

export interface EditorHistoryEntry {
  sections: PageSection[];
  timestamp: number;
}

export interface EditorState {
  pageId: string | null;
  pageName: string | null;
  draftSections: PageSection[];
  selectedSectionId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  
  history: EditorHistoryEntry[];
  historyIndex: number;
  
  setPage: (pageId: string, pageName: string, sections: PageSection[]) => void;
  setDraftSections: (sections: PageSection[]) => void;
  selectSection: (sectionId: string | null) => void;
  updateSection: (sectionId: string, updates: Partial<PageSection>) => void;
  updateSectionConfig: (sectionId: string, config: PageSection["config"]) => void;
  addSection: (section: PageSection, atIndex?: number) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  
  setSaving: (isSaving: boolean) => void;
  setLastSavedAt: (date: Date) => void;
  markClean: () => void;
  
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  pushHistory: () => void;
  
  reset: () => void;
}

const MAX_HISTORY_LENGTH = 50;

export const useEditorStore = create<EditorState>((set, get) => ({
  pageId: null,
  pageName: null,
  draftSections: [],
  selectedSectionId: null,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  
  history: [],
  historyIndex: -1,
  
  setPage: (pageId, pageName, sections) => {
    const normalizedSections = sections.map((s, i) => ({ ...s, order: i }));
    set({
      pageId,
      pageName,
      draftSections: normalizedSections,
      selectedSectionId: null,
      isDirty: false,
      history: [{ sections: normalizedSections, timestamp: Date.now() }],
      historyIndex: 0,
    });
  },
  
  setDraftSections: (sections) => {
    set({ draftSections: sections, isDirty: true });
  },
  
  selectSection: (sectionId) => {
    set({ selectedSectionId: sectionId });
  },
  
  updateSection: (sectionId, updates) => {
    const { draftSections } = get();
    const updatedSections = draftSections.map((s) =>
      s.id === sectionId ? { ...s, ...updates } : s
    );
    set({ draftSections: updatedSections, isDirty: true });
    get().pushHistory();
  },
  
  updateSectionConfig: (sectionId, config) => {
    const { draftSections } = get();
    const updatedSections = draftSections.map((s) =>
      s.id === sectionId ? { ...s, config } : s
    );
    set({ draftSections: updatedSections, isDirty: true });
  },
  
  addSection: (section, atIndex) => {
    const { draftSections } = get();
    const newSections = [...draftSections];
    const insertIndex = atIndex !== undefined ? atIndex : newSections.length;
    newSections.splice(insertIndex, 0, section);
    const normalizedSections = newSections.map((s, i) => ({ ...s, order: i }));
    set({ draftSections: normalizedSections, isDirty: true, selectedSectionId: section.id });
    get().pushHistory();
  },
  
  removeSection: (sectionId) => {
    const { draftSections, selectedSectionId } = get();
    const newSections = draftSections
      .filter((s) => s.id !== sectionId)
      .map((s, i) => ({ ...s, order: i }));
    set({
      draftSections: newSections,
      isDirty: true,
      selectedSectionId: selectedSectionId === sectionId ? null : selectedSectionId,
    });
    get().pushHistory();
  },
  
  reorderSections: (fromIndex, toIndex) => {
    const { draftSections } = get();
    const newSections = [...draftSections];
    const [movedSection] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, movedSection);
    const normalizedSections = newSections.map((s, i) => ({ ...s, order: i }));
    set({ draftSections: normalizedSections, isDirty: true });
    get().pushHistory();
  },
  
  toggleSectionVisibility: (sectionId) => {
    const { draftSections } = get();
    const updatedSections = draftSections.map((s) =>
      s.id === sectionId ? { ...s, isVisible: !s.isVisible } : s
    );
    set({ draftSections: updatedSections, isDirty: true });
    get().pushHistory();
  },
  
  setSaving: (isSaving) => set({ isSaving }),
  
  setLastSavedAt: (date) => set({ lastSavedAt: date }),
  
  markClean: () => set({ isDirty: false }),
  
  pushHistory: () => {
    const { draftSections, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ sections: [...draftSections], timestamp: Date.now() });
    if (newHistory.length > MAX_HISTORY_LENGTH) {
      newHistory.shift();
    }
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },
  
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        draftSections: [...history[newIndex].sections],
        historyIndex: newIndex,
        isDirty: true,
      });
    }
  },
  
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        draftSections: [...history[newIndex].sections],
        historyIndex: newIndex,
        isDirty: true,
      });
    }
  },
  
  canUndo: () => {
    const { historyIndex } = get();
    return historyIndex > 0;
  },
  
  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },
  
  reset: () => {
    set({
      pageId: null,
      pageName: null,
      draftSections: [],
      selectedSectionId: null,
      isDirty: false,
      isSaving: false,
      lastSavedAt: null,
      history: [],
      historyIndex: -1,
    });
  },
}));
