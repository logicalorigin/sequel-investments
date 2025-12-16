import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Widget, TimePeriod } from "@/types/dashboard";

const GOLD_COLORS = ["#D4A01D", "#B8860B", "#DAA520", "#FFD700", "#F4C430", "#CFB53B", "#E6BE8A"];

const statusColors: Record<string, string> = {
  draft: "#6B7280",
  submitted: "#3B82F6",
  in_review: "#F59E0B",
  approved: "#10B981",
  funded: "#059669",
  denied: "#EF4444",
  withdrawn: "#9CA3AF",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  in_review: "In Review",
  approved: "Approved",
  funded: "Funded",
  denied: "Denied",
  withdrawn: "Withdrawn",
};

const timePeriodLabels: Record<TimePeriod, string> = {
  "1d": "1 Day",
  "7d": "7 Days",
  "30d": "30 Days",
  "90d": "90 Days",
  "ytd": "Year to Date",
  "all": "All Time",
};

interface ChartWidgetProps {
  widget: Widget;
  data: Record<string, unknown> | null;
  isLoading: boolean;
  onTimePeriodChange?: (widgetId: string, period: TimePeriod) => void;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

export function ChartWidget({ widget, data, isLoading, onTimePeriodChange }: ChartWidgetProps) {
  const [localTimePeriod, setLocalTimePeriod] = useState<TimePeriod>(widget.timePeriod || "30d");
  
  const handleTimePeriodChange = (period: TimePeriod) => {
    setLocalTimePeriod(period);
    onTimePeriodChange?.(widget.id, period);
  };
  
  const supportsTimePeriod = widget.dataSource === "temporal" || widget.dataSource === "weeklyVolume";
  
  if (isLoading) {
    return (
      <Card className="h-full" data-testid={`widget-chart-${widget.id}`}>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <Skeleton className="h-4 w-32" />
          {supportsTimePeriod && <Skeleton className="h-8 w-20" />}
        </CardHeader>
        <CardContent className="h-[calc(100%-4rem)]">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }
  
  const renderChart = () => {
    switch (widget.type) {
      case "pie-chart":
        return renderPieChart();
      case "bar-chart":
        return renderBarChart();
      case "line-chart":
      case "trend-chart":
        return renderLineChart();
      case "area-chart":
        return renderAreaChart();
      default:
        return <div className="text-muted-foreground text-sm">Unsupported chart type</div>;
    }
  };
  
  const renderPieChart = () => {
    let chartData: { name: string; value: number; fill: string }[] = [];
    
    if (widget.dataSource === "statusBreakdown" && data?.statusCounts) {
      chartData = Object.entries(data.statusCounts as Record<string, number>).map(([status, count]) => ({
        name: statusLabels[status] || status,
        value: count,
        fill: statusColors[status] || "#6B7280",
      }));
    } else if (widget.dataSource === "productBreakdown" && data?.loanTypeCounts) {
      chartData = Object.entries(data.loanTypeCounts as Record<string, number>).map(([type, count], index) => ({
        name: type,
        value: count,
        fill: GOLD_COLORS[index % GOLD_COLORS.length],
      }));
    }
    
    if (chartData.length === 0) {
      return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data available</div>;
    }
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="70%"
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            labelLine={{ strokeWidth: 1 }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [value, "Count"]} />
        </PieChart>
      </ResponsiveContainer>
    );
  };
  
  const renderBarChart = () => {
    let chartData: { name: string; value: number; fill: string }[] = [];
    
    if (widget.dataSource === "productBreakdown" && data?.loanTypeCounts) {
      chartData = Object.entries(data.loanTypeCounts as Record<string, number>).map(([type, count], index) => ({
        name: type,
        value: count,
        fill: GOLD_COLORS[index % GOLD_COLORS.length],
      }));
    } else if (widget.dataSource === "topStates" && data?.topStates) {
      chartData = (data.topStates as { state: string; count: number; volume: number }[]).slice(0, 10).map((item, index) => ({
        name: item.state,
        value: item.volume,
        fill: GOLD_COLORS[index % GOLD_COLORS.length],
      }));
    }
    
    if (chartData.length === 0) {
      return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data available</div>;
    }
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11 }} 
            axisLine={false} 
            tickLine={false}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis 
            tick={{ fontSize: 11 }} 
            axisLine={false} 
            tickLine={false}
            stroke="hsl(var(--muted-foreground))"
            tickFormatter={(value) => widget.dataSource === "topStates" ? formatCurrency(value) : value}
          />
          <Tooltip 
            formatter={(value: number) => [
              widget.dataSource === "topStates" ? formatCurrency(value) : value,
              widget.dataSource === "topStates" ? "Volume" : "Count"
            ]}
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  const renderLineChart = () => {
    let chartData: { name: string; count?: number; volume?: number }[] = [];
    
    if (widget.dataSource === "temporal" && data?.weeklyVolume) {
      chartData = (data.weeklyVolume as { week: string; count: number; volume: number }[]).map(item => ({
        name: item.week,
        count: item.count,
        volume: item.volume,
      }));
    }
    
    if (chartData.length === 0) {
      return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data available</div>;
    }
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11 }} 
            axisLine={false} 
            tickLine={false}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis 
            tick={{ fontSize: 11 }} 
            axisLine={false} 
            tickLine={false}
            stroke="hsl(var(--muted-foreground))"
            yAxisId="left"
          />
          <YAxis 
            tick={{ fontSize: 11 }} 
            axisLine={false} 
            tickLine={false}
            stroke="hsl(var(--muted-foreground))"
            yAxisId="right"
            orientation="right"
            tickFormatter={formatCurrency}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
            formatter={(value: number, name: string) => [
              name === "volume" ? formatCurrency(value) : value,
              name === "volume" ? "Volume" : "Applications"
            ]}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="count" 
            name="Applications"
            stroke={GOLD_COLORS[0]} 
            strokeWidth={2}
            dot={false}
            yAxisId="left"
          />
          <Line 
            type="monotone" 
            dataKey="volume" 
            name="Volume"
            stroke={GOLD_COLORS[3]} 
            strokeWidth={2}
            dot={false}
            yAxisId="right"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };
  
  const renderAreaChart = () => {
    let chartData: { name: string; volume?: number }[] = [];
    
    if (widget.dataSource === "weeklyVolume" && data?.weeklyVolume) {
      chartData = (data.weeklyVolume as { week: string; count: number; volume: number }[]).map(item => ({
        name: item.week,
        volume: item.volume,
      }));
    }
    
    if (chartData.length === 0) {
      return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data available</div>;
    }
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={GOLD_COLORS[0]} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={GOLD_COLORS[0]} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11 }} 
            axisLine={false} 
            tickLine={false}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis 
            tick={{ fontSize: 11 }} 
            axisLine={false} 
            tickLine={false}
            stroke="hsl(var(--muted-foreground))"
            tickFormatter={formatCurrency}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
            formatter={(value: number) => [formatCurrency(value), "Volume"]}
          />
          <Area 
            type="monotone" 
            dataKey="volume" 
            stroke={GOLD_COLORS[0]} 
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorVolume)"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };
  
  return (
    <Card className="h-full flex flex-col" data-testid={`widget-chart-${widget.id}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2 flex-shrink-0">
        <CardTitle className="text-sm font-medium text-muted-foreground truncate">
          {widget.title}
        </CardTitle>
        {supportsTimePeriod && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs" data-testid={`time-period-trigger-${widget.id}`}>
                {timePeriodLabels[localTimePeriod]}
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.entries(timePeriodLabels) as [TimePeriod, string][]).map(([key, label]) => (
                <DropdownMenuItem 
                  key={key}
                  onClick={() => handleTimePeriodChange(key)}
                  data-testid={`time-period-${key}-${widget.id}`}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="flex-1 pb-4 min-h-0">
        {renderChart()}
      </CardContent>
    </Card>
  );
}
