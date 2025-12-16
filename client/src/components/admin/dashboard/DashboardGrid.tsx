import { useMemo, useCallback, useRef, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import GridLayoutBase from "react-grid-layout";

const GridLayout = GridLayoutBase as React.ComponentType<{
  className?: string;
  layout: { i: string; x: number; y: number; w: number; h: number; minW?: number; minH?: number }[];
  cols: number;
  rowHeight: number;
  width: number;
  margin?: [number, number];
  containerPadding?: [number, number];
  isDraggable?: boolean;
  isResizable?: boolean;
  draggableHandle?: string;
  onLayoutChange?: (layout: { i: string; x: number; y: number; w: number; h: number }[]) => void;
  useCSSTransforms?: boolean;
  children: React.ReactNode;
}>;
import { Button } from "@/components/ui/button";
import { Plus, Settings, RotateCcw, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { KPIWidget } from "./KPIWidget";
import { ChartWidget } from "./ChartWidget";
import { MapWidget } from "./MapWidget";
import { WidgetCard } from "./WidgetCard";
import { WidgetCatalog } from "./WidgetCatalog";
import { defaultWidgets } from "@/data/widgetCatalog";
import { widgetToGridLayout, gridLayoutToWidget } from "@/types/dashboard";
import type { Widget, TimePeriod, GridLayoutItem } from "@/types/dashboard";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";


const GRID_COLS = 12;
const ROW_HEIGHT = 80;
const SAVE_DEBOUNCE_MS = 60000;

interface AnalyticsData {
  statusCounts: Record<string, number>;
  loanTypeCounts: Record<string, number>;
  weeklyVolume: { week: string; count: number; volume: number }[];
  topStates: { state: string; count: number; volume: number }[];
  funnel: { stage: string; count: number }[];
  stats: {
    totalPipelineValue: number;
    avgLoanSize: number;
    avgDaysToClose: number;
    thisMonthCount: number;
    lastMonthCount: number;
    thisMonthVolume: number;
    lastMonthVolume: number;
  };
}

interface GeographicAnalyticsData {
  applicationActivity: {
    state: string;
    count: number;
    volume: number;
    statusBreakdown: Record<string, number>;
  }[];
  portfolioConcentration: {
    state: string;
    fundedCount: number;
    portfolioValue: number;
    performanceMetrics: {
      current: number;
      late: number;
      defaulted: number;
    };
  }[];
  summary: {
    totalApplications: number;
    totalApplicationVolume: number;
    totalPortfolioValue: number;
    activeStatesCount: number;
  };
}

interface DashboardLayoutResponse {
  id: number;
  userId: string;
  widgets: Widget[];
  updatedAt: string;
}

export function DashboardGrid() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const lastSaveRef = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);
  
  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics"],
  });
  
  const { data: geoAnalytics, isLoading: geoLoading } = useQuery<GeographicAnalyticsData>({
    queryKey: ["/api/admin/analytics/geographic"],
  });
  
  const { data: savedLayout, isLoading: layoutLoading } = useQuery<DashboardLayoutResponse>({
    queryKey: ["/api/admin/dashboard/layout"],
  });
  
  useEffect(() => {
    if (savedLayout?.widgets && savedLayout.widgets.length > 0) {
      setWidgets(savedLayout.widgets);
    }
  }, [savedLayout]);
  
  const saveMutation = useMutation({
    mutationFn: async (widgetsToSave: Widget[]) => {
      return apiRequest("POST", "/api/admin/dashboard/layout", { widgets: widgetsToSave });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/layout"] });
      setHasUnsavedChanges(false);
      toast({
        title: "Layout saved",
        description: "Your dashboard layout has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Save failed",
        description: "Failed to save your dashboard layout.",
        variant: "destructive",
      });
    },
  });
  
  const resetMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/admin/dashboard/layout");
    },
    onSuccess: () => {
      setWidgets(defaultWidgets);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/layout"] });
      setHasUnsavedChanges(false);
      toast({
        title: "Layout reset",
        description: "Your dashboard has been reset to default.",
      });
    },
  });
  
  const debouncedSave = useCallback((widgetsToSave: Widget[]) => {
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveRef.current;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    if (timeSinceLastSave >= SAVE_DEBOUNCE_MS) {
      lastSaveRef.current = now;
      saveMutation.mutate(widgetsToSave);
    } else {
      setHasUnsavedChanges(true);
      saveTimeoutRef.current = setTimeout(() => {
        lastSaveRef.current = Date.now();
        saveMutation.mutate(widgetsToSave);
      }, SAVE_DEBOUNCE_MS - timeSinceLastSave);
    }
  }, [saveMutation]);
  
  const handleLayoutChange = useCallback((newLayout: GridLayoutItem[]) => {
    setWidgets(prevWidgets => {
      const updatedWidgets = prevWidgets.map(widget => {
        const layoutItem = newLayout.find(l => l.i === widget.id);
        if (layoutItem) {
          return gridLayoutToWidget(layoutItem, widget);
        }
        return widget;
      });
      
      if (isEditing) {
        debouncedSave(updatedWidgets);
      }
      
      return updatedWidgets;
    });
  }, [isEditing, debouncedSave]);
  
  const handleAddWidget = useCallback((widget: Widget) => {
    setWidgets(prev => {
      const newWidgets = [...prev, widget];
      debouncedSave(newWidgets);
      return newWidgets;
    });
  }, [debouncedSave]);
  
  const handleRemoveWidget = useCallback((widgetId: string) => {
    setWidgets(prev => {
      const newWidgets = prev.filter(w => w.id !== widgetId);
      debouncedSave(newWidgets);
      return newWidgets;
    });
  }, [debouncedSave]);
  
  const handleTimePeriodChange = useCallback((widgetId: string, period: TimePeriod) => {
    setWidgets(prev => {
      const newWidgets = prev.map(w => 
        w.id === widgetId ? { ...w, timePeriod: period } : w
      );
      debouncedSave(newWidgets);
      return newWidgets;
    });
  }, [debouncedSave]);
  
  const handleSaveNow = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    lastSaveRef.current = Date.now();
    saveMutation.mutate(widgets);
  }, [widgets, saveMutation]);
  
  const layout = useMemo(() => 
    widgets.map(widgetToGridLayout), 
  [widgets]);
  
  const getKPIData = (widget: Widget): Record<string, unknown> | null => {
    if (!analytics) return null;
    
    const dataMap: Record<string, unknown> = {
      totalPipelineValue: analytics.stats.totalPipelineValue,
      avgLoanSize: analytics.stats.avgLoanSize,
      totalFunded: analytics.stats.thisMonthVolume,
      conversionRate: analytics.funnel.length > 0 
        ? (analytics.funnel[analytics.funnel.length - 1].count / analytics.funnel[0].count) * 100 
        : 0,
      avgDaysToClose: analytics.stats.avgDaysToClose,
      activeApplications: Object.values(analytics.statusCounts).reduce((a, b) => a + b, 0),
      thisMonthApps: analytics.stats.thisMonthCount,
      stats: analytics.stats,
    };
    
    if (widget.metric && widget.metric in dataMap) {
      return { [widget.metric]: dataMap[widget.metric], stats: analytics.stats };
    }
    
    return dataMap;
  };
  
  const getChartData = (): Record<string, unknown> | null => {
    if (!analytics) return null;
    return {
      statusCounts: analytics.statusCounts,
      loanTypeCounts: analytics.loanTypeCounts,
      weeklyVolume: analytics.weeklyVolume,
      topStates: analytics.topStates,
      funnel: analytics.funnel,
    };
  };
  
  const renderWidget = (widget: Widget) => {
    const content = (() => {
      switch (widget.type) {
        case "kpi":
          return (
            <KPIWidget 
              widget={widget} 
              data={getKPIData(widget)} 
              isLoading={analyticsLoading} 
            />
          );
        case "pie-chart":
        case "bar-chart":
        case "line-chart":
        case "area-chart":
        case "trend-chart":
          return (
            <ChartWidget 
              widget={widget} 
              data={getChartData()} 
              isLoading={analyticsLoading}
              onTimePeriodChange={handleTimePeriodChange}
            />
          );
        case "heatmap":
          return (
            <MapWidget 
              widget={widget} 
              data={geoAnalytics || null} 
              isLoading={geoLoading} 
            />
          );
        default:
          return <div className="flex items-center justify-center h-full text-muted-foreground">Unknown widget type</div>;
      }
    })();
    
    return (
      <WidgetCard 
        key={widget.id}
        widgetId={widget.id} 
        isEditing={isEditing} 
        onRemove={() => handleRemoveWidget(widget.id)}
      >
        {content}
      </WidgetCard>
    );
  };
  
  if (layoutLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4" data-testid="dashboard-grid-container">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            data-testid="toggle-edit-mode"
          >
            <Settings className="h-4 w-4 mr-2" />
            {isEditing ? "Done Editing" : "Customize"}
          </Button>
          {isEditing && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCatalogOpen(true)}
                data-testid="add-widget-button"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetMutation.mutate()}
                disabled={resetMutation.isPending}
                data-testid="reset-layout-button"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
            </>
          )}
        </div>
        {hasUnsavedChanges && (
          <Button
            variant="default"
            size="sm"
            onClick={handleSaveNow}
            disabled={saveMutation.isPending}
            data-testid="save-now-button"
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Now
          </Button>
        )}
      </div>
      
      <div ref={containerRef} className="min-h-[400px]">
        <GridLayout
          className="layout"
          layout={layout}
          cols={GRID_COLS}
          rowHeight={ROW_HEIGHT}
          width={containerWidth}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          isDraggable={isEditing}
          isResizable={isEditing}
          draggableHandle=".drag-handle"
          onLayoutChange={(currentLayout) => handleLayoutChange([...currentLayout] as GridLayoutItem[])}
          useCSSTransforms
        >
          {widgets.map(widget => (
            <div key={widget.id} data-testid={`grid-item-${widget.id}`}>
              {renderWidget(widget)}
            </div>
          ))}
        </GridLayout>
      </div>
      
      <WidgetCatalog
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        onAddWidget={handleAddWidget}
        existingWidgetIds={widgets.map(w => w.id)}
      />
    </div>
  );
}
