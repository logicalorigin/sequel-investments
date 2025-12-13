import { createContext, useContext, ReactNode } from "react";

interface EditorModeContextValue {
  isEditorMode: boolean;
}

const EditorModeContext = createContext<EditorModeContextValue>({
  isEditorMode: false,
});

interface EditorModeProviderProps {
  children: ReactNode;
  isEditorMode?: boolean;
}

export function EditorModeProvider({ children, isEditorMode = true }: EditorModeProviderProps) {
  return (
    <EditorModeContext.Provider value={{ isEditorMode }}>
      {children}
    </EditorModeContext.Provider>
  );
}

export function useEditorMode() {
  return useContext(EditorModeContext);
}

export function InteractionBlocker({ children }: { children: ReactNode }) {
  const { isEditorMode } = useEditorMode();

  if (!isEditorMode) {
    return <>{children}</>;
  }

  return (
    <div
      className="pointer-events-none select-none"
      onClick={(e) => e.preventDefault()}
      onMouseDown={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
}
