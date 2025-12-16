import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, Activity } from "lucide-react";
import { statePaths } from "@/components/USMap";

interface StateActivityData {
  state: string;
  count: number;
  volume: number;
  statusBreakdown: Record<string, number>;
}

interface ApplicationActivityHeatmapProps {
  data: StateActivityData[];
  isLoading?: boolean;
}

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "Washington D.C.",
};

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

function getHeatColor(value: number, max: number): string {
  if (max === 0 || value === 0) return "#374151";
  
  const ratio = Math.min(value / max, 1);
  
  if (ratio < 0.25) {
    return "#FEF3C7";
  } else if (ratio < 0.5) {
    return "#FDE68A";
  } else if (ratio < 0.75) {
    return "#F59E0B";
  } else {
    return "#D97706";
  }
}

export function ApplicationActivityHeatmap({ data, isLoading }: ApplicationActivityHeatmapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  
  const stateDataMap = useMemo(() => {
    const map = new Map<string, StateActivityData>();
    data.forEach(item => {
      map.set(item.state, item);
    });
    return map;
  }, [data]);
  
  const maxCount = useMemo(() => {
    return Math.max(...data.map(d => d.count), 1);
  }, [data]);
  
  const hoveredData = hoveredState ? stateDataMap.get(hoveredState) : null;
  
  if (isLoading) {
    return (
      <Card data-testid="heatmap-application-activity">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-amber-500" />
            Application Activity by State
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse bg-muted rounded h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card data-testid="heatmap-application-activity">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-amber-500" />
          Application Activity by State
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <TooltipProvider>
            <svg
              viewBox="0 0 959 593"
              className="w-full h-auto"
              data-testid="map-svg-activity"
            >
              {Object.entries(statePaths).map(([stateCode, pathD]) => {
                const stateData = stateDataMap.get(stateCode);
                const fillColor = stateData ? getHeatColor(stateData.count, maxCount) : "#374151";
                const isHovered = hoveredState === stateCode;
                
                return (
                  <Tooltip key={stateCode}>
                    <TooltipTrigger asChild>
                      <path
                        d={pathD}
                        fill={fillColor}
                        stroke={isHovered ? "#FFFFFF" : "#1F2937"}
                        strokeWidth={isHovered ? 2 : 0.5}
                        className="transition-all duration-150 cursor-pointer"
                        onMouseEnter={() => setHoveredState(stateCode)}
                        onMouseLeave={() => setHoveredState(null)}
                        data-testid={`state-path-${stateCode}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-card border shadow-lg p-3 max-w-xs">
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">
                          {STATE_NAMES[stateCode] || stateCode}
                        </p>
                        {stateData ? (
                          <>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">{stateData.count}</span> applications
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">{formatCurrency(stateData.volume)}</span> total volume
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">No applications</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </svg>
          </TooltipProvider>
          
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-4 h-3 rounded" style={{ backgroundColor: "#374151" }} />
              <span>No Activity</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-4 h-3 rounded" style={{ backgroundColor: "#FEF3C7" }} />
              <span>Low</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-4 h-3 rounded" style={{ backgroundColor: "#F59E0B" }} />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-4 h-3 rounded" style={{ backgroundColor: "#D97706" }} />
              <span>High</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
