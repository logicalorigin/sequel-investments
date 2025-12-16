import type { WidgetTemplate, Widget } from "@/types/dashboard";

export const widgetCatalog: WidgetTemplate[] = [
  {
    id: "total-pipeline-value",
    type: "kpi",
    title: "Total Pipeline Value",
    description: "Total value of all applications in pipeline",
    category: "finance",
    icon: "DollarSign",
    metric: "totalPipelineValue",
    dataSource: "analytics",
    defaultSize: { w: 6, h: 2, minW: 4, minH: 2 },
  },
  {
    id: "avg-loan-size",
    type: "kpi",
    title: "Average Loan Size",
    description: "Average loan amount across all applications",
    category: "finance",
    icon: "Calculator",
    metric: "avgLoanSize",
    dataSource: "analytics",
    defaultSize: { w: 6, h: 2, minW: 4, minH: 2 },
  },
  {
    id: "total-funded",
    type: "kpi",
    title: "Total Funded",
    description: "Total value of funded loans",
    category: "finance",
    icon: "Banknote",
    metric: "totalFunded",
    dataSource: "analytics",
    defaultSize: { w: 6, h: 2, minW: 4, minH: 2 },
  },
  {
    id: "conversion-rate",
    type: "kpi",
    title: "Conversion Rate",
    description: "Percentage of applications that convert to funded loans",
    category: "performance",
    icon: "TrendingUp",
    metric: "conversionRate",
    dataSource: "analytics",
    defaultSize: { w: 6, h: 2, minW: 4, minH: 2 },
  },
  {
    id: "avg-days-to-close",
    type: "kpi",
    title: "Avg Days to Close",
    description: "Average time from application to funding",
    category: "performance",
    icon: "Clock",
    metric: "avgDaysToClose",
    dataSource: "analytics",
    defaultSize: { w: 6, h: 2, minW: 4, minH: 2 },
  },
  {
    id: "active-applications",
    type: "kpi",
    title: "Active Applications",
    description: "Number of applications currently in progress",
    category: "activity",
    icon: "FileText",
    metric: "activeApplications",
    dataSource: "analytics",
    defaultSize: { w: 6, h: 2, minW: 4, minH: 2 },
  },
  {
    id: "this-month-apps",
    type: "kpi",
    title: "This Month Applications",
    description: "Applications received this month",
    category: "activity",
    icon: "Calendar",
    metric: "thisMonthApps",
    dataSource: "analytics",
    defaultSize: { w: 6, h: 2, minW: 4, minH: 2 },
  },
  {
    id: "status-distribution",
    type: "pie-chart",
    title: "Status Distribution",
    description: "Breakdown of applications by status",
    category: "analytics",
    icon: "PieChart",
    dataSource: "statusBreakdown",
    defaultSize: { w: 8, h: 4, minW: 6, minH: 3 },
  },
  {
    id: "loan-type-breakdown",
    type: "bar-chart",
    title: "Loan Type Breakdown",
    description: "Applications by loan product type",
    category: "analytics",
    icon: "BarChart3",
    dataSource: "productBreakdown",
    defaultSize: { w: 12, h: 4, minW: 8, minH: 3 },
  },
  {
    id: "activity-trends",
    type: "trend-chart",
    title: "Activity Trends",
    description: "Application and funding trends over time",
    category: "activity",
    icon: "LineChart",
    dataSource: "temporal",
    defaultSize: { w: 16, h: 4, minW: 12, minH: 3 },
    supportsTimePeriod: true,
    defaultTimePeriod: "30d",
  },
  {
    id: "top-states-volume",
    type: "bar-chart",
    title: "Top States by Volume",
    description: "Highest volume states for applications",
    category: "geographic",
    icon: "MapPin",
    dataSource: "topStates",
    defaultSize: { w: 12, h: 4, minW: 8, minH: 3 },
  },
  {
    id: "application-heatmap",
    type: "heatmap",
    title: "Application Activity Map",
    description: "Geographic distribution of application activity",
    category: "geographic",
    icon: "Map",
    dataSource: "applicationActivity",
    defaultSize: { w: 12, h: 5, minW: 8, minH: 4 },
  },
  {
    id: "portfolio-concentration",
    type: "heatmap",
    title: "Portfolio Concentration",
    description: "Geographic concentration of funded portfolio",
    category: "geographic",
    icon: "Wallet",
    dataSource: "portfolioConcentration",
    defaultSize: { w: 12, h: 5, minW: 8, minH: 4 },
  },
  {
    id: "weekly-volume",
    type: "area-chart",
    title: "Weekly Funding Volume",
    description: "Funding volume trends by week",
    category: "finance",
    icon: "TrendingUp",
    dataSource: "weeklyVolume",
    defaultSize: { w: 12, h: 4, minW: 8, minH: 3 },
    supportsTimePeriod: true,
    defaultTimePeriod: "90d",
  },
];

export const defaultWidgets: Widget[] = [
  {
    id: "widget-1",
    type: "kpi",
    title: "Total Pipeline Value",
    metric: "totalPipelineValue",
    dataSource: "analytics",
    layout: { x: 0, y: 0, w: 6, h: 2, minW: 4, minH: 2 },
  },
  {
    id: "widget-2",
    type: "kpi",
    title: "Conversion Rate",
    metric: "conversionRate",
    dataSource: "analytics",
    layout: { x: 6, y: 0, w: 6, h: 2, minW: 4, minH: 2 },
  },
  {
    id: "widget-3",
    type: "kpi",
    title: "Avg Days to Close",
    metric: "avgDaysToClose",
    dataSource: "analytics",
    layout: { x: 12, y: 0, w: 6, h: 2, minW: 4, minH: 2 },
  },
  {
    id: "widget-4",
    type: "kpi",
    title: "Active Applications",
    metric: "activeApplications",
    dataSource: "analytics",
    layout: { x: 18, y: 0, w: 6, h: 2, minW: 4, minH: 2 },
  },
  {
    id: "widget-5",
    type: "pie-chart",
    title: "Status Distribution",
    dataSource: "statusBreakdown",
    layout: { x: 0, y: 2, w: 8, h: 4, minW: 6, minH: 3 },
  },
  {
    id: "widget-6",
    type: "trend-chart",
    title: "Activity Trends",
    dataSource: "temporal",
    timePeriod: "30d",
    layout: { x: 8, y: 2, w: 16, h: 4, minW: 12, minH: 3 },
  },
];

export function createWidgetFromTemplate(template: WidgetTemplate, position?: { x: number; y: number }): Widget {
  return {
    id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: template.type,
    title: template.title,
    metric: template.metric,
    dataSource: template.dataSource,
    timePeriod: template.supportsTimePeriod ? template.defaultTimePeriod : undefined,
    layout: {
      x: position?.x ?? 0,
      y: position?.y ?? Infinity,
      w: template.defaultSize.w,
      h: template.defaultSize.h,
      minW: template.defaultSize.minW,
      minH: template.defaultSize.minH,
      maxW: template.defaultSize.maxW,
      maxH: template.defaultSize.maxH,
    },
  };
}

export function getCategoryIcon(category: string): string {
  switch (category) {
    case "finance": return "DollarSign";
    case "performance": return "TrendingUp";
    case "activity": return "Activity";
    case "analytics": return "PieChart";
    case "geographic": return "Map";
    default: return "LayoutDashboard";
  }
}

export function getCategoryLabel(category: string): string {
  switch (category) {
    case "finance": return "Finance";
    case "performance": return "Performance";
    case "activity": return "Activity";
    case "analytics": return "Analytics";
    case "geographic": return "Geographic";
    default: return category;
  }
}
