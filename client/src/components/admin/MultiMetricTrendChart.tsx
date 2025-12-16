import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TrendingUp, Calendar } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TimeSeriesData {
  date: string;
  applicationCount: number;
  fundingCount: number;
  fundingVolume: number;
  inReviewCount: number;
}

interface TemporalAnalyticsResponse {
  timeSeries: TimeSeriesData[];
  period: string;
  groupBy: "day" | "week";
  summary: {
    totalApplications: number;
    totalFunded: number;
    totalVolume: number;
    avgDailyApplications: number;
    avgDailyFunding: number;
  };
}

type Period = "7d" | "30d" | "90d" | "ytd" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "7 Days",
  "30d": "30 Days",
  "90d": "90 Days",
  "ytd": "Year to Date",
  "all": "All Time",
};

const GOLD_COLOR = "#D4A01D";
const GREEN_COLOR = "#10B981";
const BLUE_COLOR = "#3B82F6";

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function MultiMetricTrendChart() {
  const [period, setPeriod] = useState<Period>("30d");
  const [showApplications, setShowApplications] = useState(true);
  const [showFunding, setShowFunding] = useState(true);
  const [showVolume, setShowVolume] = useState(false);
  
  const { data, isLoading, error } = useQuery<TemporalAnalyticsResponse>({
    queryKey: ["/api/admin/analytics/temporal", period],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/temporal?period=${period}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch temporal analytics");
      return response.json();
    },
  });
  
  const chartData = data?.timeSeries.map(item => ({
    ...item,
    dateLabel: formatDate(item.date),
  })) || [];
  
  if (error) {
    return (
      <Card data-testid="chart-multi-metric-trend">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-500" />
            Activity Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Unable to load trend data
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card data-testid="chart-multi-metric-trend">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-500" />
            Activity Trends
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(p)}
                className="text-xs"
                data-testid={`period-btn-${p}`}
              >
                {PERIOD_LABELS[p]}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="show-applications"
                  checked={showApplications}
                  onCheckedChange={setShowApplications}
                  data-testid="toggle-applications"
                />
                <Label htmlFor="show-applications" className="text-sm flex items-center gap-1">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: GOLD_COLOR }} />
                  Applications
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="show-funding"
                  checked={showFunding}
                  onCheckedChange={setShowFunding}
                  data-testid="toggle-funding"
                />
                <Label htmlFor="show-funding" className="text-sm flex items-center gap-1">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: GREEN_COLOR }} />
                  Funded Deals
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="show-volume"
                  checked={showVolume}
                  onCheckedChange={setShowVolume}
                  data-testid="toggle-volume"
                />
                <Label htmlFor="show-volume" className="text-sm flex items-center gap-1">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: BLUE_COLOR }} />
                  Funding Volume
                </Label>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gradientApplications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GOLD_COLOR} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={GOLD_COLOR} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradientFunding" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GREEN_COLOR} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={GREEN_COLOR} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradientVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BLUE_COLOR} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={BLUE_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="dateLabel"
                  stroke="#9CA3AF"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  yAxisId="count"
                  stroke="#9CA3AF"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                {showVolume && (
                  <YAxis
                    yAxisId="volume"
                    orientation="right"
                    stroke="#9CA3AF"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatCurrency}
                  />
                )}
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "Funding Volume") {
                      return [formatCurrency(value), name];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label) => label}
                />
                <Legend />
                {showApplications && (
                  <Area
                    yAxisId="count"
                    type="monotone"
                    dataKey="applicationCount"
                    name="Applications"
                    stroke={GOLD_COLOR}
                    strokeWidth={2}
                    fill="url(#gradientApplications)"
                  />
                )}
                {showFunding && (
                  <Area
                    yAxisId="count"
                    type="monotone"
                    dataKey="fundingCount"
                    name="Funded Deals"
                    stroke={GREEN_COLOR}
                    strokeWidth={2}
                    fill="url(#gradientFunding)"
                  />
                )}
                {showVolume && (
                  <Area
                    yAxisId="volume"
                    type="monotone"
                    dataKey="fundingVolume"
                    name="Funding Volume"
                    stroke={BLUE_COLOR}
                    strokeWidth={2}
                    fill="url(#gradientVolume)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
            
            {data?.summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{data.summary.totalApplications}</p>
                  <p className="text-xs text-muted-foreground">Total Applications</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{data.summary.totalFunded}</p>
                  <p className="text-xs text-muted-foreground">Total Funded</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(data.summary.totalVolume)}</p>
                  <p className="text-xs text-muted-foreground">Total Volume</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{data.summary.avgDailyApplications}</p>
                  <p className="text-xs text-muted-foreground">Avg Daily Apps</p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
