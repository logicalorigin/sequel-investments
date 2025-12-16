import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, AlertTriangle, CheckCircle2, Filter } from "lucide-react";
import { statePaths } from "@/components/USMap";
import { parsePathBounds } from "@/lib/mapUtils";

interface PortfolioStateData {
  state: string;
  fundedCount: number;
  portfolioValue: number;
  performanceMetrics: {
    current: number;
    late: number;
    defaulted: number;
  };
}

interface PortfolioConcentrationHeatmapProps {
  data: PortfolioStateData[];
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

function getRiskColor(data: PortfolioStateData): string {
  const total = data.performanceMetrics.current + data.performanceMetrics.late + data.performanceMetrics.defaulted;
  if (total === 0) return "#10B981";
  
  const problemRate = (data.performanceMetrics.late + data.performanceMetrics.defaulted) / total;
  
  if (problemRate === 0) return "#10B981";
  if (problemRate < 0.1) return "#84CC16";
  if (problemRate < 0.2) return "#FBBF24";
  if (problemRate < 0.3) return "#F97316";
  return "#EF4444";
}

function getMarkerSize(value: number, max: number): number {
  if (max === 0 || value === 0) return 0;
  const ratio = value / max;
  return Math.max(6, Math.min(30, 6 + ratio * 24));
}

export function PortfolioConcentrationHeatmap({ data, isLoading }: PortfolioConcentrationHeatmapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  
  const filteredData = useMemo(() => {
    if (riskFilter === "all") return data;
    
    return data.filter(d => {
      const total = d.performanceMetrics.current + d.performanceMetrics.late + d.performanceMetrics.defaulted;
      if (total === 0) return riskFilter === "healthy";
      
      const problemRate = (d.performanceMetrics.late + d.performanceMetrics.defaulted) / total;
      
      if (riskFilter === "healthy") return problemRate === 0;
      if (riskFilter === "warning") return problemRate > 0 && problemRate < 0.2;
      if (riskFilter === "high-risk") return problemRate >= 0.2;
      
      return true;
    });
  }, [data, riskFilter]);
  
  const stateDataMap = useMemo(() => {
    const map = new Map<string, PortfolioStateData>();
    filteredData.forEach(item => {
      map.set(item.state, item);
    });
    return map;
  }, [filteredData]);
  
  const maxPortfolioValue = useMemo(() => {
    return Math.max(...filteredData.map(d => d.portfolioValue), 1);
  }, [filteredData]);
  
  const stateCenters = useMemo(() => {
    const centers: Record<string, { x: number; y: number }> = {};
    Object.entries(statePaths).forEach(([stateCode, pathD]) => {
      const bounds = parsePathBounds(pathD);
      centers[stateCode] = { x: bounds.centerX, y: bounds.centerY };
    });
    return centers;
  }, []);
  
  if (isLoading) {
    return (
      <Card data-testid="heatmap-portfolio-concentration">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-amber-500" />
            Portfolio Concentration
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
    <Card data-testid="heatmap-portfolio-concentration">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-amber-500" />
            Portfolio Concentration
          </CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="healthy">Healthy Only</SelectItem>
                <SelectItem value="warning">Warning States</SelectItem>
                <SelectItem value="high-risk">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <TooltipProvider>
            <div className="relative">
              <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
                <button
                  onClick={() => setZoomLevel(Math.min(zoomLevel + 0.25, 3))}
                  className="bg-background border border-border rounded p-1.5 hover:bg-muted transition-colors"
                  title="Zoom in"
                >
                  <span className="text-lg font-bold">+</span>
                </button>
                <button
                  onClick={() => setZoomLevel(Math.max(zoomLevel - 0.25, 0.5))}
                  className="bg-background border border-border rounded p-1.5 hover:bg-muted transition-colors"
                  title="Zoom out"
                >
                  <span className="text-lg font-bold">−</span>
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="bg-background border border-border rounded p-1.5 hover:bg-muted transition-colors text-xs"
                  title="Reset zoom"
                >
                  ⟲
                </button>
              </div>
              <svg
                viewBox="0 0 959 593"
                className="w-full h-auto"
                data-testid="map-svg-portfolio"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transition: "transform 0.3s ease",
                }}
              >
              {Object.entries(statePaths).map(([stateCode, pathD]) => (
                <path
                  key={stateCode}
                  d={pathD}
                  fill="#1F2937"
                  stroke="#374151"
                  strokeWidth={0.5}
                  data-testid={`state-bg-${stateCode}`}
                />
              ))}
              
              {filteredData.filter(d => d.portfolioValue > 0).map(stateData => {
                const center = stateCenters[stateData.state];
                if (!center) return null;
                
                const radius = getMarkerSize(stateData.portfolioValue, maxPortfolioValue);
                const color = getRiskColor(stateData);
                const isHovered = hoveredState === stateData.state;
                
                return (
                  <Tooltip key={stateData.state}>
                    <TooltipTrigger asChild>
                      <circle
                        cx={center.x}
                        cy={center.y}
                        r={isHovered ? radius * 1.2 : radius}
                        fill={color}
                        fillOpacity={selectedState === stateData.state ? 1 : 0.7}
                        stroke={selectedState === stateData.state ? "#FFFFFF" : isHovered ? "#FFFFFF" : color}
                        strokeWidth={selectedState === stateData.state ? 3 : isHovered ? 2 : 1}
                        className="transition-all duration-150 cursor-pointer"
                        onMouseEnter={() => setHoveredState(stateData.state)}
                        onMouseLeave={() => setHoveredState(null)}
                        onClick={() => setSelectedState(selectedState === stateData.state ? null : stateData.state)}
                        data-testid={`marker-${stateData.state}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-card border shadow-lg p-3 max-w-xs">
                      <div className="space-y-2">
                        <p className="font-semibold text-foreground">
                          {STATE_NAMES[stateData.state] || stateData.state}
                        </p>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{stateData.fundedCount}</span> loans
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{formatCurrency(stateData.portfolioValue)}</span> portfolio value
                          </p>
                        </div>
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Performance</p>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1 text-green-500">
                              <CheckCircle2 className="h-3 w-3" />
                              {stateData.performanceMetrics.current} current
                            </span>
                            {stateData.performanceMetrics.late > 0 && (
                              <span className="flex items-center gap-1 text-yellow-500">
                                <AlertTriangle className="h-3 w-3" />
                                {stateData.performanceMetrics.late} late
                              </span>
                            )}
                            {stateData.performanceMetrics.defaulted > 0 && (
                              <span className="flex items-center gap-1 text-red-500">
                                <AlertTriangle className="h-3 w-3" />
                                {stateData.performanceMetrics.defaulted} default
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              </svg>
            </div>
          </TooltipProvider>
          
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#10B981" }} />
              <span>Healthy</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FBBF24" }} />
              <span>Some Late</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#EF4444" }} />
              <span>High Risk</span>
            </div>
            <div className="border-l border-border pl-4 flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                <span>Small</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-muted-foreground" />
                <span>Large</span>
              </div>
            </div>
          </div>
          
          {selectedState && (() => {
            const stateInfo = filteredData.find(d => d.state === selectedState);
            if (!stateInfo) return null;
            
            const total = stateInfo.performanceMetrics.current + stateInfo.performanceMetrics.late + stateInfo.performanceMetrics.defaulted;
            const healthRate = total > 0 ? (stateInfo.performanceMetrics.current / total * 100).toFixed(1) : "0";
            
            return (
              <div className="mt-6 p-4 border border-border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-lg">
                    {STATE_NAMES[selectedState] || selectedState}
                  </h4>
                  <button 
                    onClick={() => setSelectedState(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Loans</p>
                    <p className="text-2xl font-bold">{stateInfo.fundedCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Portfolio Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(stateInfo.portfolioValue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Loan Size</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(stateInfo.portfolioValue / stateInfo.fundedCount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Health Rate</p>
                    <p className="text-2xl font-bold text-green-500">{healthRate}%</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Current</p>
                      <p className="font-semibold">{stateInfo.performanceMetrics.current}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Late</p>
                      <p className="font-semibold">{stateInfo.performanceMetrics.late}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Default</p>
                      <p className="font-semibold">{stateInfo.performanceMetrics.defaulted}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
}
