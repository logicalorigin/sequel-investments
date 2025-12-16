import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplicationActivityHeatmap } from "@/components/admin/ApplicationActivityHeatmap";
import { PortfolioConcentrationHeatmap } from "@/components/admin/PortfolioConcentrationHeatmap";
import type { Widget } from "@/types/dashboard";

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

interface MapWidgetProps {
  widget: Widget;
  data: GeographicAnalyticsData | null;
  isLoading: boolean;
}

export function MapWidget({ widget, data, isLoading }: MapWidgetProps) {
  if (isLoading) {
    return (
      <Card className="h-full" data-testid={`widget-map-${widget.id}`}>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="h-[calc(100%-4rem)]">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }
  
  const renderMap = () => {
    if (!data) {
      return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data available</div>;
    }
    
    if (widget.dataSource === "applicationActivity") {
      return (
        <ApplicationActivityHeatmap 
          data={data.applicationActivity}
        />
      );
    }
    
    if (widget.dataSource === "portfolioConcentration") {
      return (
        <PortfolioConcentrationHeatmap 
          data={data.portfolioConcentration}
        />
      );
    }
    
    return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Unknown map type</div>;
  };
  
  return (
    <Card className="h-full flex flex-col" data-testid={`widget-map-${widget.id}`}>
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-sm font-medium text-muted-foreground truncate">
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-4 min-h-0">
        {renderMap()}
      </CardContent>
    </Card>
  );
}
