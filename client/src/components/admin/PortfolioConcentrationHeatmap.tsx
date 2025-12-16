import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, AlertTriangle, CheckCircle2, Filter, ZoomOut, MapPin, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { statePaths } from "@/components/USMap";
import { parsePathBounds, latLngToSvgWithBounds, SLUG_TO_ABBR, type SVGBounds } from "@/lib/mapUtils";
import { useQuery } from "@tanstack/react-query";

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

interface MetroData {
  name: string;
  lat: number;
  lng: number;
  loanCount: number;
  portfolioValue: number;
  performanceMetrics: {
    current: number;
    late: number;
    defaulted: number;
  };
  loanIds: string[];
}

interface LoanDetail {
  id: string;
  propertyAddress: string;
  loanAmount: number;
  status: string;
  fundedDate: string;
  borrowerName: string;
  city: string;
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

function getMetroMarkerSize(value: number, max: number): number {
  if (max === 0 || value === 0) return 0;
  const ratio = value / max;
  return Math.max(4, Math.min(20, 4 + ratio * 16));
}

function getMetroRiskColor(metro: MetroData): string {
  const total = metro.performanceMetrics.current + metro.performanceMetrics.late + metro.performanceMetrics.defaulted;
  if (total === 0) return "#10B981";
  
  const problemRate = (metro.performanceMetrics.late + metro.performanceMetrics.defaulted) / total;
  
  if (problemRate === 0) return "#10B981";
  if (problemRate < 0.1) return "#84CC16";
  if (problemRate < 0.2) return "#FBBF24";
  if (problemRate < 0.3) return "#F97316";
  return "#EF4444";
}

export function PortfolioConcentrationHeatmap({ data, isLoading }: PortfolioConcentrationHeatmapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [focusedState, setFocusedState] = useState<string | null>(null);
  const [selectedMetro, setSelectedMetro] = useState<MetroData | null>(null);
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [viewBox, setViewBox] = useState<string>("0 0 959 593");
  const [isZooming, setIsZooming] = useState(false);
  
  // Fetch metro data for focused state
  const { data: metroData = [] } = useQuery<MetroData[]>({
    queryKey: ['/api/admin/analytics/metro-portfolio', focusedState],
    enabled: !!focusedState,
  });
  
  // Fetch loan details for selected metro
  const { data: metroLoans = [] } = useQuery<LoanDetail[]>({
    queryKey: ['/api/admin/analytics/metro-loans', selectedMetro?.name, focusedState],
    enabled: !!selectedMetro && !!focusedState,
  });
  
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
  
  const handleStateClick = (stateCode: string) => {
    if (focusedState === stateCode) {
      // Zoom out
      handleZoomOut();
    } else {
      // Zoom into state
      const pathD = statePaths[stateCode];
      if (!pathD) return;
      
      const bounds = parsePathBounds(pathD);
      const padding = 50;
      const newViewBox = `${bounds.minX - padding} ${bounds.minY - padding} ${bounds.maxX - bounds.minX + padding * 2} ${bounds.maxY - bounds.minY + padding * 2}`;
      
      setIsZooming(true);
      setViewBox(newViewBox);
      setFocusedState(stateCode);
      setSelectedState(stateCode);
      setSelectedMetro(null);
      
      setTimeout(() => setIsZooming(false), 350);
    }
  };
  
  const handleZoomOut = () => {
    setIsZooming(true);
    setViewBox("0 0 959 593");
    setFocusedState(null);
    setSelectedMetro(null);
    setTimeout(() => setIsZooming(false), 350);
  };
  
  const handleMetroClick = (metro: MetroData) => {
    if (selectedMetro?.name === metro.name) {
      setSelectedMetro(null);
    } else {
      setSelectedMetro(metro);
    }
  };
  
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
              {focusedState && (
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    onClick={handleZoomOut}
                    variant="secondary"
                    size="sm"
                    className="shadow-lg"
                  >
                    <ZoomOut className="h-4 w-4 mr-2" />
                    Back to US Map
                  </Button>
                </div>
              )}
              <svg
                viewBox={viewBox}
                className="w-full h-auto"
                data-testid="map-svg-portfolio"
                style={{
                  transition: isZooming ? "viewBox 0.35s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
                }}
              >
              {Object.entries(statePaths).map(([stateCode, pathD]) => (
                <path
                  key={stateCode}
                  d={pathD}
                  fill={focusedState === stateCode ? "#374151" : "#1F2937"}
                  stroke="#374151"
                  strokeWidth={0.5}
                  className={focusedState && focusedState !== stateCode ? "opacity-30" : ""}
                  data-testid={`state-bg-${stateCode}`}
                />
              ))}
              
              {!focusedState && filteredData.filter(d => d.portfolioValue > 0).map(stateData => {
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
                        onClick={() => handleStateClick(stateData.state)}
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
              
              {focusedState && metroData.length > 0 && (() => {
                const statePathD = statePaths[focusedState];
                if (!statePathD) return null;
                
                const bounds = parsePathBounds(statePathD);
                const maxMetroValue = Math.max(...metroData.map(m => m.portfolioValue), 1);
                const stateSlug = Object.entries(SLUG_TO_ABBR).find(([_, abbr]) => abbr === focusedState)?.[0];
                
                return metroData.map((metro, idx) => {
                  const pos = latLngToSvgWithBounds(metro.lat, metro.lng, focusedState, bounds);
                  const radius = getMetroMarkerSize(metro.portfolioValue, maxMetroValue);
                  const color = getMetroRiskColor(metro);
                  const isSelected = selectedMetro?.name === metro.name;
                  
                  return (
                    <Tooltip key={`metro-${idx}`}>
                      <TooltipTrigger asChild>
                        <g>
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={radius + 3}
                            fill={color}
                            opacity={0.2}
                            className="metro-pulse"
                          />
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={radius}
                            fill={color}
                            fillOpacity={isSelected ? 1 : 0.8}
                            stroke={isSelected ? "#FFFFFF" : color}
                            strokeWidth={isSelected ? 2 : 1}
                            className="transition-all duration-150 cursor-pointer hover:scale-110"
                            onClick={() => handleMetroClick(metro)}
                          />
                        </g>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-card border shadow-lg p-3 max-w-xs">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <p className="font-semibold text-foreground">{metro.name}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">{metro.loanCount}</span> loans
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">{formatCurrency(metro.portfolioValue)}</span> portfolio
                            </p>
                          </div>
                          <div className="pt-2 border-t border-border">
                            <div className="flex items-center gap-3 text-xs">
                              <span className="flex items-center gap-1 text-green-500">
                                <CheckCircle2 className="h-3 w-3" />
                                {metro.performanceMetrics.current}
                              </span>
                              {metro.performanceMetrics.late > 0 && (
                                <span className="flex items-center gap-1 text-yellow-500">
                                  <AlertTriangle className="h-3 w-3" />
                                  {metro.performanceMetrics.late}
                                </span>
                              )}
                              {metro.performanceMetrics.defaulted > 0 && (
                                <span className="flex items-center gap-1 text-red-500">
                                  <AlertTriangle className="h-3 w-3" />
                                  {metro.performanceMetrics.defaulted}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground italic mt-2">Click to view loans</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                });
              })()}
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
          
          {selectedMetro && metroLoans.length > 0 && (
            <div className="mt-6 p-4 border border-border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {selectedMetro.name} Loans
                </h4>
                <Badge variant="outline">{metroLoans.length} loans</Badge>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-2 font-medium text-muted-foreground">Property</th>
                      <th className="pb-2 font-medium text-muted-foreground">Borrower</th>
                      <th className="pb-2 font-medium text-muted-foreground">Amount</th>
                      <th className="pb-2 font-medium text-muted-foreground">Status</th>
                      <th className="pb-2 font-medium text-muted-foreground">Funded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metroLoans.map((loan) => (
                      <tr key={loan.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-foreground">{loan.propertyAddress}</span>
                          </div>
                        </td>
                        <td className="py-3 text-foreground">{loan.borrowerName}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{formatCurrency(loan.loanAmount)}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge 
                            variant={
                              loan.status === 'current' ? 'default' : 
                              loan.status === 'late' ? 'secondary' : 
                              'destructive'
                            }
                            className="capitalize"
                          >
                            {loan.status}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(loan.fundedDate).toLocaleDateString()}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {selectedState && !focusedState && (() => {
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
