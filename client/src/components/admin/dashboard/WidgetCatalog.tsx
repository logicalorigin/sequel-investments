import { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DollarSign, 
  Calculator, 
  Banknote, 
  TrendingUp, 
  Clock, 
  FileText, 
  Calendar,
  PieChart,
  BarChart3,
  LineChart,
  Map,
  MapPin,
  Wallet,
  Activity,
  LayoutDashboard,
} from "lucide-react";
import { widgetCatalog, getCategoryLabel, createWidgetFromTemplate } from "@/data/widgetCatalog";
import type { WidgetTemplate, Widget, WidgetCategory } from "@/types/dashboard";

interface WidgetCatalogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWidget: (widget: Widget) => void;
  existingWidgetIds: string[];
}

const iconMap: Record<string, typeof DollarSign> = {
  DollarSign,
  Calculator,
  Banknote,
  TrendingUp,
  Clock,
  FileText,
  Calendar,
  PieChart,
  BarChart3,
  LineChart,
  Map,
  MapPin,
  Wallet,
  Activity,
  LayoutDashboard,
};

const categoryOrder: WidgetCategory[] = ["finance", "performance", "activity", "analytics", "geographic"];

export function WidgetCatalog({ open, onOpenChange, onAddWidget, existingWidgetIds }: WidgetCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<WidgetCategory | "all">("all");
  
  const filteredTemplates = selectedCategory === "all" 
    ? widgetCatalog 
    : widgetCatalog.filter(t => t.category === selectedCategory);
  
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, WidgetTemplate[]>);
  
  const handleAddWidget = (template: WidgetTemplate) => {
    const widget = createWidgetFromTemplate(template);
    onAddWidget(widget);
    onOpenChange(false);
  };
  
  const isAlreadyAdded = (templateId: string) => {
    return existingWidgetIds.some(id => id.includes(templateId));
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]" data-testid="widget-catalog-sheet">
        <SheetHeader>
          <SheetTitle>Add Widget</SheetTitle>
          <SheetDescription>
            Choose a widget to add to your dashboard
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-wrap gap-1 mt-4 mb-4">
          <Button 
            variant={selectedCategory === "all" ? "default" : "outline"} 
            size="sm"
            onClick={() => setSelectedCategory("all")}
            data-testid="category-filter-all"
          >
            All
          </Button>
          {categoryOrder.map(category => (
            <Button 
              key={category}
              variant={selectedCategory === category ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory(category)}
              data-testid={`category-filter-${category}`}
            >
              {getCategoryLabel(category)}
            </Button>
          ))}
        </div>
        
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="space-y-6 pr-4">
            {categoryOrder.map(category => {
              const templates = groupedTemplates[category];
              if (!templates || templates.length === 0) return null;
              
              return (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                    {getCategoryLabel(category)}
                  </h3>
                  <div className="grid gap-3">
                    {templates.map(template => {
                      const IconComponent = iconMap[template.icon] || LayoutDashboard;
                      const alreadyAdded = isAlreadyAdded(template.id);
                      
                      return (
                        <div 
                          key={template.id}
                          className="flex items-start gap-3 p-3 rounded-lg border bg-card hover-elevate cursor-pointer"
                          onClick={() => !alreadyAdded && handleAddWidget(template)}
                          data-testid={`widget-template-${template.id}`}
                        >
                          <div className="p-2 rounded-md bg-muted">
                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">{template.title}</span>
                              {template.supportsTimePeriod && (
                                <Badge variant="outline" className="text-xs">Time Period</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {template.defaultSize.w}×{template.defaultSize.h}
                              </Badge>
                              {alreadyAdded && (
                                <Badge variant="outline" className="text-xs text-muted-foreground">
                                  Added
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
