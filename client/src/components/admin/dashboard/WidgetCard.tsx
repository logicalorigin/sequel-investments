import { X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WidgetCardProps {
  children: React.ReactNode;
  onRemove: () => void;
  widgetId: string;
}

export function WidgetCard({ children, onRemove, widgetId }: WidgetCardProps) {
  return (
    <div className="relative h-full w-full group" data-testid={`widget-card-${widgetId}`}>
      <div 
        className="drag-handle absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-grab active:cursor-grabbing bg-muted/50 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
        data-testid={`drag-handle-${widgetId}`}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/80 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={onRemove}
        data-testid={`remove-widget-${widgetId}`}
      >
        <X className="h-3 w-3" />
      </Button>
      <div className="h-full w-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}
