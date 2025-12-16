export interface GridLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}

export type WidgetType = 
  | "kpi"
  | "line-chart"
  | "bar-chart"
  | "pie-chart"
  | "area-chart"
  | "stacked-bar-chart"
  | "heatmap"
  | "trend-chart";

export type WidgetCategory = 
  | "finance"
  | "performance"
  | "activity"
  | "analytics"
  | "geographic";

export type TimePeriod = 
  | "1d"
  | "7d"
  | "30d"
  | "90d"
  | "ytd"
  | "all";

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  metric?: string;
  dataSource: string;
  timePeriod?: TimePeriod;
  showTrend?: boolean;
  chartConfig?: {
    colors?: string[];
    stacked?: boolean;
    showLegend?: boolean;
    showGrid?: boolean;
  };
}

export interface Widget extends WidgetConfig {
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
  };
}

export interface WidgetTemplate {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  category: WidgetCategory;
  icon: string;
  metric?: string;
  dataSource: string;
  defaultSize: {
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
  };
  supportsTimePeriod?: boolean;
  defaultTimePeriod?: TimePeriod;
}

export interface DashboardLayout {
  id: number;
  userId: number;
  widgets: Widget[];
  updatedAt: string;
}

export interface DashboardState {
  widgets: Widget[];
  isEditing: boolean;
  catalogOpen: boolean;
}

export function widgetToGridLayout(widget: Widget): GridLayoutItem {
  return {
    i: widget.id,
    x: widget.layout.x,
    y: widget.layout.y,
    w: widget.layout.w,
    h: widget.layout.h,
    minW: widget.layout.minW,
    minH: widget.layout.minH,
    maxW: widget.layout.maxW,
    maxH: widget.layout.maxH,
  };
}

export function gridLayoutToWidget(layout: GridLayoutItem, widget: Widget): Widget {
  return {
    ...widget,
    layout: {
      x: layout.x,
      y: layout.y,
      w: layout.w,
      h: layout.h,
      minW: layout.minW,
      minH: layout.minH,
      maxW: layout.maxW,
      maxH: layout.maxH,
    },
  };
}
