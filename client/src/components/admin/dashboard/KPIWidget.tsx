import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, DollarSign, Calculator, Banknote, Clock, FileText, Calendar, TrendingUp as TrendIcon } from "lucide-react";
import type { Widget } from "@/types/dashboard";

const GOLD_COLOR = "#D4A01D";

interface KPIWidgetProps {
  widget: Widget;
  data: Record<string, unknown> | null;
  isLoading: boolean;
}

const iconMap: Record<string, typeof DollarSign> = {
  DollarSign,
  Calculator,
  Banknote,
  Clock,
  FileText,
  Calendar,
  TrendingUp: TrendIcon,
};

function formatValue(value: unknown, metric: string | undefined): string {
  if (value === null || value === undefined) return "-";
  const num = Number(value);
  
  if (metric?.includes("Rate") || metric?.includes("rate")) {
    return `${num.toFixed(1)}%`;
  }
  if (metric?.includes("Days") || metric?.includes("days")) {
    return `${num.toFixed(0)} days`;
  }
  if (metric?.includes("Value") || metric?.includes("Size") || metric?.includes("Funded") || metric?.includes("Volume")) {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  }
  return num.toLocaleString();
}

function getTrend(current: number, previous: number): { trend: "up" | "down" | "neutral"; value: string } {
  if (previous === 0) return { trend: "neutral", value: "No change" };
  const change = ((current - previous) / previous) * 100;
  if (change > 0) return { trend: "up", value: `+${change.toFixed(1)}%` };
  if (change < 0) return { trend: "down", value: `${change.toFixed(1)}%` };
  return { trend: "neutral", value: "No change" };
}

export function KPIWidget({ widget, data, isLoading }: KPIWidgetProps) {
  const IconComponent = iconMap[widget.chartConfig?.colors?.[0] || "DollarSign"] || DollarSign;
  
  if (isLoading) {
    return (
      <Card className="h-full" data-testid={`widget-kpi-${widget.id}`}>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }
  
  const value = data && widget.metric ? data[widget.metric] : null;
  const formattedValue = formatValue(value, widget.metric);
  
  const stats = data?.stats as Record<string, number> | undefined;
  let trendInfo: { trend: "up" | "down" | "neutral"; value: string } | null = null;
  
  if (widget.showTrend && stats && widget.metric === "thisMonthApps") {
    trendInfo = getTrend(stats.thisMonthCount || 0, stats.lastMonthCount || 0);
  }
  
  return (
    <Card className="h-full flex flex-col" data-testid={`widget-kpi-${widget.id}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2 flex-shrink-0">
        <CardTitle className="text-sm font-medium text-muted-foreground truncate">
          {widget.title}
        </CardTitle>
        <IconComponent className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <div 
          className="text-2xl font-bold truncate" 
          style={{ color: GOLD_COLOR }}
          data-testid={`kpi-value-${widget.id}`}
        >
          {formattedValue}
        </div>
        {trendInfo && (
          <div className="flex items-center gap-1 mt-1">
            {trendInfo.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
            {trendInfo.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
            {trendInfo.trend === "neutral" && <Minus className="h-3 w-3 text-muted-foreground" />}
            <span 
              className={`text-xs ${
                trendInfo.trend === "up" ? "text-green-500" : 
                trendInfo.trend === "down" ? "text-red-500" : 
                "text-muted-foreground"
              }`}
            >
              {trendInfo.value}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
