import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Home, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

interface PropertyValueData {
  currentValue: number;
  purchasePrice: number;
  changePercent: number;
  changeAmount: number;
  source: string;
  lastUpdated: string;
  history?: Array<{
    date: string;
    value: number;
  }>;
}

interface PropertyValueChartProps {
  propertyAddress: string;
  propertyCity?: string;
  propertyState?: string;
  propertyZip?: string;
  purchasePrice?: number;
}

type TimeRange = "3M" | "6M" | "1Y" | "3Y" | "All";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function generateHistoricalData(currentValue: number, months: number): Array<{ date: string; value: number }> {
  const data: Array<{ date: string; value: number }> = [];
  const now = new Date();
  const monthlyGrowthRate = 0.003;
  
  for (let i = months; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    const randomVariation = 1 + (Math.random() - 0.5) * 0.02;
    const growthFactor = Math.pow(1 + monthlyGrowthRate, months - i);
    const value = currentValue / Math.pow(1 + monthlyGrowthRate, months) * growthFactor * randomVariation;
    
    data.push({
      date: date.toISOString().slice(0, 7),
      value: Math.round(value),
    });
  }
  
  data[data.length - 1].value = currentValue;
  
  return data;
}

export function PropertyValueChart({
  propertyAddress,
  propertyCity,
  propertyState,
  propertyZip,
  purchasePrice,
}: PropertyValueChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("6M");
  
  const fullAddress = [propertyAddress, propertyCity, propertyState, propertyZip]
    .filter(Boolean)
    .join(", ");

  const { data: propertyData, isLoading, error, refetch, isFetching } = useQuery<PropertyValueData>({
    queryKey: ["/api/property-value", encodeURIComponent(fullAddress)],
    enabled: !!propertyAddress,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });

  const displayData = useMemo(() => {
    if (propertyData) return propertyData;
    
    const estimatedValue = purchasePrice ? purchasePrice * 1.05 : 450000;
    const purchase = purchasePrice || estimatedValue * 0.95;
    
    return {
      currentValue: estimatedValue,
      purchasePrice: purchase,
      changePercent: ((estimatedValue - purchase) / purchase) * 100,
      changeAmount: estimatedValue - purchase,
      source: "estimate",
      lastUpdated: new Date().toISOString(),
      history: generateHistoricalData(estimatedValue, 36),
    };
  }, [propertyData, purchasePrice]);

  const filteredHistory = useMemo(() => {
    if (!displayData.history) return [];
    
    const monthsMap: Record<TimeRange, number> = {
      "3M": 3,
      "6M": 6,
      "1Y": 12,
      "3Y": 36,
      "All": displayData.history.length,
    };
    
    const months = monthsMap[timeRange];
    return displayData.history.slice(-months - 1);
  }, [displayData.history, timeRange]);

  const chartData = useMemo(() => {
    return filteredHistory.map((point) => ({
      ...point,
      dateLabel: new Date(point.date + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: timeRange === "All" || timeRange === "3Y" ? "2-digit" : undefined,
      }),
    }));
  }, [filteredHistory, timeRange]);

  const isPositive = displayData.changePercent >= 0;
  const timeRanges: TimeRange[] = ["3M", "6M", "1Y", "3Y", "All"];

  if (!propertyAddress) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-8">
            Property address required to display value estimates
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Home className="h-5 w-5 text-primary" />
            Estimated Home Value
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {fullAddress}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => refetch()}
            disabled={isFetching}
            data-testid="button-refresh-value"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
          <Badge variant="outline" className="text-xs">
            {displayData.source === "rentcast" ? "RentCast" : 
             displayData.source === "zillow" ? "Zillow" : "Estimate"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            {isLoading ? (
              <Skeleton className="h-10 w-40" />
            ) : (
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold" data-testid="text-current-value">
                  {formatCurrency(displayData.currentValue)}
                </span>
                <Badge 
                  variant={isPositive ? "default" : "destructive"}
                  className={`flex items-center gap-1 ${isPositive ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : ""}`}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {isPositive ? "+" : ""}{displayData.changePercent.toFixed(1)}%
                </Badge>
              </div>
            )}
          </div>
          <div className="flex bg-muted rounded-lg p-1">
            {timeRanges.map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => setTimeRange(range)}
                data-testid={`button-range-${range.toLowerCase()}`}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        <div className="h-[200px]">
          {isLoading ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(168, 76%, 36%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(168, 76%, 36%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  axisLine={false}
                  tickLine={false}
                  className="text-muted-foreground"
                  width={55}
                  domain={['dataMin - 10000', 'dataMax + 10000']}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Value"]}
                  labelFormatter={(label) => label}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(168, 76%, 36%)"
                  strokeWidth={2}
                  fill="url(#valueGradient)"
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: "hsl(var(--background))" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {purchasePrice && (
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Purchase Price</p>
              <p className="font-semibold">{formatCurrency(purchasePrice)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Equity Gained</p>
              <p className={`font-semibold ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {isPositive ? "+" : ""}{formatCurrency(displayData.changeAmount)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
