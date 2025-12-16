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

interface LoanData {
  id: string;
  loanNumber: string;
  propertyAddress: string;
  propertyCity: string | null;
  propertyState: string;
  propertyZip: string | null;
  loanAmount: number;
  currentBalance: number;
  status: string;
  loanType: string;
  interestRate: string;
  fundedDate: string;
  borrowerName: string;
  lat: number;
  lng: number;
}

interface LoanCluster {
  id: string;
  centerLat: number;
  centerLng: number;
  centerX: number;
  centerY: number;
  loans: LoanData[];
  portfolioValue: number;
  avgInterestRate: number;
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

function getMetroMarkerSize(value: number, max: number): number {
  if (max === 0 || value === 0) return 0;
  const ratio = value / max;
  return Math.max(4, Math.min(20, 4 + ratio * 16));
}

function getClusterColor(cluster: LoanCluster): string {
  const total = cluster.performanceMetrics.current + cluster.performanceMetrics.late + cluster.performanceMetrics.defaulted;
  if (total === 0) return "#10B981";
  
  const problemRate = (cluster.performanceMetrics.late + cluster.performanceMetrics.defaulted) / total;
  
  if (problemRate === 0) return "#10B981";
  if (problemRate < 0.1) return "#84CC16";
  if (problemRate < 0.2) return "#FBBF24";
  if (problemRate < 0.3) return "#F97316";
  return "#EF4444";
}

function getLoanColor(loan: LoanData): string {
  const status = loan.status.toLowerCase();
  if (status === 'current') return "#10B981";
  if (status === 'grace_period') return "#84CC16";
  if (status === 'late') return "#FBBF24";
  if (status === 'default' || status === 'foreclosure') return "#EF4444";
  return "#6B7280";
}

export function PortfolioConcentrationHeatmap({ data, isLoading }: PortfolioConcentrationHeatmapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [focusedState, setFocusedState] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<LoanCluster | null>(null);
  const [hoveredCluster, setHoveredCluster] = useState<LoanCluster | null>(null);
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [viewBox, setViewBox] = useState<string>("0 0 959 593");
  const [isZooming, setIsZooming] = useState(false);
  
  // Fetch loan-level data for focused state
  const { data: loanData = [] } = useQuery<LoanData[]>({
    queryKey: ['/api/admin/analytics/portfolio-loans', focusedState],
    enabled: !!focusedState,
  });
  
  // Fetch state-level clusters for US map view
  interface StateCluster {
    state: string;
    loanCount: number;
    portfolioValue: number;
    avgInterestRate: number;
    performanceMetrics: {
      current: number;
      late: number;
      defaulted: number;
    };
  }
  
  const { data: stateClusters = [] } = useQuery<StateCluster[]>({
    queryKey: ['/api/admin/analytics/portfolio-state-clusters'],
    enabled: !focusedState,
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
  
  // Geographic clustering for loan-level data
  const loanClusters = useMemo(() => {
    if (!focusedState || !loanData.length) return [];
    
    const statePathD = statePaths[focusedState];
    if (!statePathD) return [];
    
    const bounds = parsePathBounds(statePathD);
    const CLUSTER_DISTANCE_THRESHOLD = 15; // SVG pixels
    
    // Convert loans to SVG coordinates
    const loansWithSVG = loanData.map(loan => ({
      ...loan,
      svgX: latLngToSvgWithBounds(loan.lat, loan.lng, focusedState, bounds).x,
      svgY: latLngToSvgWithBounds(loan.lat, loan.lng, focusedState, bounds).y,
    }));
    
    // Simple geographic clustering algorithm
    const clusters: LoanCluster[] = [];
    const processed = new Set<string>();
    
    loansWithSVG.forEach((loan, index) => {
      if (processed.has(loan.id)) return;
      
      const clusterLoans = [loan];
      processed.add(loan.id);
      
      // Find nearby loans
      loansWithSVG.forEach((otherLoan) => {
        if (processed.has(otherLoan.id)) return;
        
        const dx = loan.svgX - otherLoan.svgX;
        const dy = loan.svgY - otherLoan.svgY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < CLUSTER_DISTANCE_THRESHOLD) {
          clusterLoans.push(otherLoan);
          processed.add(otherLoan.id);
        }
      });
      
      // Calculate cluster center
      const centerX = clusterLoans.reduce((sum, l) => sum + l.svgX, 0) / clusterLoans.length;
      const centerY = clusterLoans.reduce((sum, l) => sum + l.svgY, 0) / clusterLoans.length;
      const centerLat = clusterLoans.reduce((sum, l) => sum + l.lat, 0) / clusterLoans.length;
      const centerLng = clusterLoans.reduce((sum, l) => sum + l.lng, 0) / clusterLoans.length;
      
      // Calculate cluster statistics
      const portfolioValue = clusterLoans.reduce((sum, l) => sum + l.loanAmount, 0);
      const avgInterestRate = clusterLoans.reduce((sum, l) => sum + parseFloat(l.interestRate), 0) / clusterLoans.length;
      
      const performanceMetrics = {
        current: clusterLoans.filter(l => l.status === 'current').length,
        late: clusterLoans.filter(l => l.status === 'late' || l.status === 'grace_period').length,
        defaulted: clusterLoans.filter(l => l.status === 'default' || l.status === 'foreclosure').length,
      };
      
      clusters.push({
        id: `cluster-${index}`,
        centerLat,
        centerLng,
        centerX,
        centerY,
        loans: clusterLoans,
        portfolioValue,
        avgInterestRate,
        performanceMetrics,
      });
    });
    
    return clusters;
  }, [focusedState, loanData]);
  
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
      setSelectedCluster(null);
      
      setTimeout(() => setIsZooming(false), 350);
    }
  };
  
  const handleZoomOut = () => {
    setIsZooming(true);
    setViewBox("0 0 959 593");
    setFocusedState(null);
    setSelectedCluster(null);
    setTimeout(() => setIsZooming(false), 350);
  };
  
  const handleClusterClick = (cluster: LoanCluster) => {
    if (selectedCluster?.id === cluster.id) {
      setSelectedCluster(null);
    } else {
      setSelectedCluster(cluster);
    }
  };
  
  // Calculate spiderfied positions for loans in selected cluster
  const spiderfiedLoans = useMemo(() => {
    if (!selectedCluster || selectedCluster.loans.length === 1) return [];
    
    const loans = selectedCluster.loans;
    const radius = 30 + (loans.length * 2); // Dynamic radius based on count
    const angleStep = (2 * Math.PI) / loans.length;
    
    return loans.map((loan, index) => {
      const angle = index * angleStep;
      const x = selectedCluster.centerX + radius * Math.cos(angle);
      const y = selectedCluster.centerY + radius * Math.sin(angle);
      
      return {
        loan,
        x,
        y,
        lineX1: selectedCluster.centerX,
        lineY1: selectedCluster.centerY,
      };
    });
  }, [selectedCluster]);
  
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
              
              {!focusedState && stateClusters.map(cluster => {
                const center = stateCenters[cluster.state];
                if (!center) return null;
                
                const maxClusterValue = Math.max(...stateClusters.map(c => c.portfolioValue), 1);
                const radius = getMarkerSize(cluster.portfolioValue, maxClusterValue);
                
                // Calculate cluster color based on performance
                const total = cluster.performanceMetrics.current + cluster.performanceMetrics.late + cluster.performanceMetrics.defaulted;
                const problemRate = total > 0 ? (cluster.performanceMetrics.late + cluster.performanceMetrics.defaulted) / total : 0;
                let color = "#10B981";
                if (problemRate > 0 && problemRate < 0.1) color = "#84CC16";
                else if (problemRate >= 0.1 && problemRate < 0.2) color = "#FBBF24";
                else if (problemRate >= 0.2 && problemRate < 0.3) color = "#F97316";
                else if (problemRate >= 0.3) color = "#EF4444";
                
                const isHovered = hoveredState === cluster.state;
                
                return (
                  <Tooltip key={cluster.state}>
                    <TooltipTrigger asChild>
                      <g>
                        <circle
                          cx={center.x}
                          cy={center.y}
                          r={radius + 3}
                          fill={color}
                          opacity={0.2}
                          className="cluster-pulse"
                        />
                        <circle
                          cx={center.x}
                          cy={center.y}
                          r={isHovered ? radius * 1.2 : radius}
                          fill={color}
                          fillOpacity={selectedState === cluster.state ? 1 : 0.8}
                          stroke={selectedState === cluster.state ? "#FFFFFF" : isHovered ? "#FFFFFF" : color}
                          strokeWidth={selectedState === cluster.state ? 3 : isHovered ? 2 : 1}
                          className="transition-all duration-150 cursor-pointer hover:scale-110"
                          onMouseEnter={() => setHoveredState(cluster.state)}
                          onMouseLeave={() => setHoveredState(null)}
                          onClick={() => handleStateClick(cluster.state)}
                          data-testid={`marker-${cluster.state}`}
                        />
                        <text
                          x={center.x}
                          y={center.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-xs font-bold fill-white pointer-events-none"
                        >
                          {cluster.loanCount}
                        </text>
                      </g>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-card border shadow-lg p-3 max-w-xs">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <p className="font-semibold text-foreground">
                            {STATE_NAMES[cluster.state] || cluster.state}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{cluster.loanCount}</span> loans
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{formatCurrency(cluster.portfolioValue)}</span> total
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{cluster.avgInterestRate.toFixed(2)}%</span> avg rate
                          </p>
                        </div>
                        <div className="pt-2 border-t border-border">
                          <div className="flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1 text-green-500">
                              <CheckCircle2 className="h-3 w-3" />
                              {cluster.performanceMetrics.current}
                            </span>
                            {cluster.performanceMetrics.late > 0 && (
                              <span className="flex items-center gap-1 text-yellow-500">
                                <AlertTriangle className="h-3 w-3" />
                                {cluster.performanceMetrics.late}
                              </span>
                            )}
                            {cluster.performanceMetrics.defaulted > 0 && (
                              <span className="flex items-center gap-1 text-red-500">
                                <AlertTriangle className="h-3 w-3" />
                                {cluster.performanceMetrics.defaulted}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground italic mt-2">Click to zoom in</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              
              {focusedState && loanClusters.length > 0 && (() => {
                const maxClusterValue = Math.max(...loanClusters.map(c => c.portfolioValue), 1);
                
                return (
                  <>
                    {/* Render clusters */}
                    {loanClusters.map((cluster) => {
                      const radius = getMetroMarkerSize(cluster.portfolioValue, maxClusterValue);
                      const color = getClusterColor(cluster);
                      const isSelected = selectedCluster?.id === cluster.id;
                      const isHovered = hoveredCluster?.id === cluster.id;
                      
                      // Don't render main cluster marker if it's selected and spiderfied
                      if (isSelected && cluster.loans.length > 1) return null;
                      
                      return (
                        <Tooltip key={cluster.id}>
                          <TooltipTrigger asChild>
                            <g>
                              <circle
                                cx={cluster.centerX}
                                cy={cluster.centerY}
                                r={radius + 3}
                                fill={color}
                                opacity={0.2}
                                className="cluster-pulse"
                              />
                              <circle
                                cx={cluster.centerX}
                                cy={cluster.centerY}
                                r={radius}
                                fill={color}
                                fillOpacity={isSelected || isHovered ? 1 : 0.8}
                                stroke={isSelected ? "#FFFFFF" : isHovered ? "#FFFFFF" : color}
                                strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                                className="transition-all duration-150 cursor-pointer hover:scale-110"
                                onClick={() => handleClusterClick(cluster)}
                                onMouseEnter={() => setHoveredCluster(cluster)}
                                onMouseLeave={() => setHoveredCluster(null)}
                              />
                              {cluster.loans.length > 1 && (
                                <text
                                  x={cluster.centerX}
                                  y={cluster.centerY}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  className="text-xs font-bold fill-white pointer-events-none"
                                >
                                  {cluster.loans.length}
                                </text>
                              )}
                            </g>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-card border shadow-lg p-3 max-w-xs">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <p className="font-semibold text-foreground">
                                  {cluster.loans.length} {cluster.loans.length === 1 ? 'Loan' : 'Loans'}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium text-foreground">{formatCurrency(cluster.portfolioValue)}</span> total
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium text-foreground">{cluster.avgInterestRate.toFixed(2)}%</span> avg rate
                                </p>
                              </div>
                              <div className="pt-2 border-t border-border">
                                <div className="flex items-center gap-3 text-xs">
                                  <span className="flex items-center gap-1 text-green-500">
                                    <CheckCircle2 className="h-3 w-3" />
                                    {cluster.performanceMetrics.current}
                                  </span>
                                  {cluster.performanceMetrics.late > 0 && (
                                    <span className="flex items-center gap-1 text-yellow-500">
                                      <AlertTriangle className="h-3 w-3" />
                                      {cluster.performanceMetrics.late}
                                    </span>
                                  )}
                                  {cluster.performanceMetrics.defaulted > 0 && (
                                    <span className="flex items-center gap-1 text-red-500">
                                      <AlertTriangle className="h-3 w-3" />
                                      {cluster.performanceMetrics.defaulted}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground italic mt-2">Click to view details</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                    
                    {/* Render spiderfied loans */}
                    {spiderfiedLoans.map(({ loan, x, y, lineX1, lineY1 }, index) => (
                      <g key={`spider-${loan.id}`}>
                        {/* Connection line */}
                        <line
                          x1={lineX1}
                          y1={lineY1}
                          x2={x}
                          y2={y}
                          stroke="#666"
                          strokeWidth={1}
                          strokeDasharray="2,2"
                          opacity={0.5}
                        />
                        {/* Individual loan marker */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <circle
                              cx={x}
                              cy={y}
                              r={6}
                              fill={getLoanColor(loan)}
                              stroke="#FFFFFF"
                              strokeWidth={1.5}
                              className="cursor-pointer hover:scale-125 transition-transform"
                            />
                          </TooltipTrigger>
                          <TooltipContent side="right" className="bg-card border shadow-lg p-3 max-w-xs">
                            <div className="space-y-2">
                              <p className="font-semibold text-sm">{loan.loanNumber}</p>
                              <p className="text-xs text-muted-foreground">{loan.propertyAddress}</p>
                              <div className="space-y-1 pt-2 border-t border-border">
                                <p className="text-xs">
                                  <span className="text-muted-foreground">Amount:</span>{' '}
                                  <span className="font-medium">{formatCurrency(loan.loanAmount)}</span>
                                </p>
                                <p className="text-xs">
                                  <span className="text-muted-foreground">Rate:</span>{' '}
                                  <span className="font-medium">{loan.interestRate}%</span>
                                </p>
                                <p className="text-xs">
                                  <span className="text-muted-foreground">Borrower:</span>{' '}
                                  <span className="font-medium">{loan.borrowerName}</span>
                                </p>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </g>
                    ))}
                  </>
                );
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
          
          {selectedCluster && selectedCluster.loans.length > 0 && (
            <div className="mt-6 p-4 border border-border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Cluster Details
                </h4>
                <Badge variant="outline">{selectedCluster.loans.length} loans</Badge>
              </div>
              
              {/* Summary Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-background rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Total Portfolio</p>
                  <p className="text-lg font-bold">{formatCurrency(selectedCluster.portfolioValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Interest Rate</p>
                  <p className="text-lg font-bold">{selectedCluster.avgInterestRate.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Loan Size</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(selectedCluster.portfolioValue / selectedCluster.loans.length)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Performance</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="default" className="text-xs">
                      {selectedCluster.performanceMetrics.current} current
                    </Badge>
                    {selectedCluster.performanceMetrics.late > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedCluster.performanceMetrics.late} late
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-2 font-medium text-muted-foreground">Loan #</th>
                      <th className="pb-2 font-medium text-muted-foreground">Property</th>
                      <th className="pb-2 font-medium text-muted-foreground">Borrower</th>
                      <th className="pb-2 font-medium text-muted-foreground">Amount</th>
                      <th className="pb-2 font-medium text-muted-foreground">Rate</th>
                      <th className="pb-2 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCluster.loans.map((loan) => (
                      <tr key={loan.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 font-mono text-xs">{loan.loanNumber}</td>
                        <td className="py-3">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-foreground">{loan.propertyAddress}</div>
                              <div className="text-xs text-muted-foreground">
                                {loan.propertyCity}, {loan.propertyState} {loan.propertyZip}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-foreground">{loan.borrowerName}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{formatCurrency(loan.loanAmount)}</span>
                          </div>
                        </td>
                        <td className="py-3 font-medium">{loan.interestRate}%</td>
                        <td className="py-3">
                          <Badge 
                            variant={
                              loan.status === 'current' ? 'default' : 
                              loan.status === 'grace_period' ? 'secondary' :
                              loan.status === 'late' ? 'secondary' : 
                              'destructive'
                            }
                            className="capitalize"
                          >
                            {loan.status.replace('_', ' ')}
                          </Badge>
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
