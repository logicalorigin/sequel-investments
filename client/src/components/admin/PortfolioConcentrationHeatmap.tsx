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

function getStateFillColor(stateCode: string, stateDataMap: Map<string, PortfolioStateData>, stateClusters: any[]): string {
  // Try to get state data from the map first
  const stateData = stateDataMap.get(stateCode);
  if (stateData && stateData.fundedCount > 0) {
    const total = stateData.performanceMetrics.current + stateData.performanceMetrics.late + stateData.performanceMetrics.defaulted;
    if (total === 0) return "#1F2937";
    
    const problemRate = (stateData.performanceMetrics.late + stateData.performanceMetrics.defaulted) / total;
    
    // Use lighter opacity colors for state fills
    if (problemRate === 0) return "rgba(16, 185, 129, 0.3)"; // Green
    if (problemRate < 0.1) return "rgba(132, 204, 22, 0.3)"; // Lime
    if (problemRate < 0.2) return "rgba(251, 191, 36, 0.3)"; // Yellow
    if (problemRate < 0.3) return "rgba(249, 115, 22, 0.3)"; // Orange
    return "rgba(239, 68, 68, 0.3)"; // Red
  }
  
  // Fallback to cluster data
  const cluster = stateClusters.find(c => c.state === stateCode);
  if (cluster && cluster.loanCount > 0) {
    const total = cluster.performanceMetrics.current + cluster.performanceMetrics.late + cluster.performanceMetrics.defaulted;
    if (total === 0) return "#1F2937";
    
    const problemRate = (cluster.performanceMetrics.late + cluster.performanceMetrics.defaulted) / total;
    
    if (problemRate === 0) return "rgba(16, 185, 129, 0.3)";
    if (problemRate < 0.1) return "rgba(132, 204, 22, 0.3)";
    if (problemRate < 0.2) return "rgba(251, 191, 36, 0.3)";
    if (problemRate < 0.3) return "rgba(249, 115, 22, 0.3)";
    return "rgba(239, 68, 68, 0.3)";
  }
  
  return "#1F2937"; // Default dark gray for states with no data
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

interface PortfolioConcentrationHeatmapProps {
  data: PortfolioStateData[];
  isLoading?: boolean;
  onViewChange?: (state: string | null, cluster: LoanCluster | null) => void;
}

export function PortfolioConcentrationHeatmap({ data, isLoading, onViewChange }: PortfolioConcentrationHeatmapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [focusedState, setFocusedState] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<LoanCluster | null>(null);
  const [hoveredCluster, setHoveredCluster] = useState<LoanCluster | null>(null);
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [viewBox, setViewBox] = useState<string>("0 0 959 593");
  const [isZooming, setIsZooming] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<'us' | 'state' | 'cluster'>('us');
  
  // Fetch loan-level data for focused state
  const { data: loanData = [] as LoanData[] } = useQuery<LoanData[]>({
    queryKey: ['/api/admin/analytics/portfolio-loans', focusedState],
    enabled: !!focusedState,
  });
  
  // Log loan data when it changes (replaces deprecated onSuccess)
  useEffect(() => {
    if (loanData && loanData.length > 0) {
      console.log(`Loaded ${loanData.length} loans for ${focusedState}`);
      const loansWithCoords = loanData.filter((l: LoanData) => l.lat && l.lng);
      console.log(`${loansWithCoords.length} loans have coordinates`);
    }
  }, [loanData, focusedState]);
  
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
    
    // Filter loans with valid coordinates
    const validLoans = loanData.filter(loan => loan.lat && loan.lng && loan.lat !== 0 && loan.lng !== 0);
    
    if (validLoans.length === 0) {
      console.warn(`No loans with valid coordinates found for ${focusedState}`);
      return [];
    }
    
    const statePathD = statePaths[focusedState];
    if (!statePathD) return [];
    
    const bounds = parsePathBounds(statePathD);
    const CLUSTER_DISTANCE_THRESHOLD = 15; // SVG pixels
    
    // Convert loans to SVG coordinates
    const loansWithSVG = validLoans.map(loan => ({
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
      setZoomLevel('state');
      
      
      // Notify parent of state selection
      if (onViewChange) {
        onViewChange(stateCode, null);
      }
      
      setTimeout(() => setIsZooming(false), 350);
    }
  };
  
  // Helper to fully reset to US view
  const resetToUSView = () => {
    setIsZooming(true);
    setViewBox("0 0 959 593");
    setFocusedState(null);
    setSelectedState(null);
    setSelectedCluster(null);
    setZoomLevel('us');
    
    if (onViewChange) {
      onViewChange(null, null);
    }
    
    setTimeout(() => setIsZooming(false), 350);
  };
  
  const handleZoomOut = () => {
    // Multi-level zoom out logic
    if (zoomLevel === 'cluster') {
      // Zoom out from cluster to state
      setIsZooming(true);
      
      if (focusedState) {
        const pathD = statePaths[focusedState];
        if (pathD) {
          const bounds = parsePathBounds(pathD);
          const padding = 50;
          const stateViewBox = `${bounds.minX - padding} ${bounds.minY - padding} ${bounds.maxX - bounds.minX + padding * 2} ${bounds.maxY - bounds.minY + padding * 2}`;
          setViewBox(stateViewBox);
        }
      }
      
      setZoomLevel('state');
      setSelectedCluster(null);
      
      // Notify parent of zoom back to state
      if (onViewChange) {
        onViewChange(focusedState, null);
      }
      
      setTimeout(() => setIsZooming(false), 350);
    } else {
      // Zoom out from state to US - use helper to fully reset all state
      resetToUSView();
    }
  };
  
  const handleClusterClick = (cluster: LoanCluster) => {
    if (selectedCluster?.id === cluster.id) {
      // Clicking selected cluster - deselect and zoom back to state view
      setSelectedCluster(null);
      setZoomLevel('state');
      
      if (focusedState) {
        const pathD = statePaths[focusedState];
        if (pathD) {
          const bounds = parsePathBounds(pathD);
          const padding = 50;
          const stateViewBox = `${bounds.minX - padding} ${bounds.minY - padding} ${bounds.maxX - bounds.minX + padding * 2} ${bounds.maxY - bounds.minY + padding * 2}`;
          setIsZooming(true);
          setViewBox(stateViewBox);
          setTimeout(() => setIsZooming(false), 350);
        }
      }
      
      
      
      // Notify parent of cluster deselection
      if (onViewChange) {
        onViewChange(focusedState, null);
      }
    } else {
      // Zoom into cluster and show individual loans at their actual positions
      setSelectedCluster(cluster);
      setZoomLevel('cluster');
      
      // Calculate bounding box for all loans in the cluster with their actual coordinates
      const loansWithCoords = cluster.loans.filter(l => l.lat && l.lng);
      
      if (loansWithCoords.length > 0 && focusedState) {
        // Calculate viewBox that encompasses all loan positions
        const pathD = statePaths[focusedState];
        if (pathD) {
          const svgBounds = parsePathBounds(pathD);
          
          // Get SVG coordinates for all loans - pass stateAbbr and svgBounds
          const loanSvgPositions = loansWithCoords.map(loan => {
            return latLngToSvgWithBounds(loan.lat, loan.lng, focusedState, svgBounds);
          });
          
          // Find the bounding box of all loans
          const minX = Math.min(...loanSvgPositions.map(p => p.x), cluster.centerX);
          const maxX = Math.max(...loanSvgPositions.map(p => p.x), cluster.centerX);
          const minY = Math.min(...loanSvgPositions.map(p => p.y), cluster.centerY);
          const maxY = Math.max(...loanSvgPositions.map(p => p.y), cluster.centerY);
          
          // Add padding and ensure minimum size
          const width = Math.max(maxX - minX, 40);
          const height = Math.max(maxY - minY, 40);
          const padding = Math.max(width, height) * 0.5; // 50% padding
          
          const clusterBox = `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;
          
          setIsZooming(true);
          setViewBox(clusterBox);
          setTimeout(() => setIsZooming(false), 350);
        }
      }
      
      // Notify parent of cluster selection
      if (onViewChange) {
        onViewChange(focusedState, cluster);
      }
    }
  };
  
  // Calculate loan positions - use actual geographic coordinates when in cluster view
  const loanPositions = useMemo(() => {
    if (!selectedCluster) return [];
    
    const loans = selectedCluster.loans;
    
    // If we're zoomed into a cluster, show loans at their actual GPS positions
    if (zoomLevel === 'cluster' && focusedState) {
      const pathD = statePaths[focusedState];
      if (!pathD) return [];
      
      const svgBounds = parsePathBounds(pathD);
      
      return loans.map((loan, idx) => {
        // Get actual geographic position if available
        if (loan.lat && loan.lng && loan.lat !== 0 && loan.lng !== 0) {
          // Pass the state abbreviation and SVG bounds to latLngToSvgWithBounds
          const pos = latLngToSvgWithBounds(loan.lat, loan.lng, focusedState, svgBounds);
          return {
            loan,
            x: pos.x,
            y: pos.y,
            isActualPosition: true,
          };
        }
        
        // Fallback to cluster center with deterministic offset for loans without coords
        // Use index for deterministic positioning instead of random
        const angle = (idx / loans.length) * 2 * Math.PI;
        const distance = 5 + (idx % 5) * 2;
        return {
          loan,
          x: selectedCluster.centerX + Math.cos(angle) * distance,
          y: selectedCluster.centerY + Math.sin(angle) * distance,
          isActualPosition: false,
        };
      });
    }
    
    // For state-level view, use spiderfying around cluster center
    if (loans.length === 1) {
      return [{
        loan: loans[0],
        x: selectedCluster.centerX,
        y: selectedCluster.centerY,
        isActualPosition: false,
      }];
    }
    
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
        isActualPosition: false,
      };
    });
  }, [selectedCluster, zoomLevel, focusedState]);
  
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
              {/* Navigation breadcrumb and back button */}
              {(focusedState || zoomLevel !== 'us') && (
                <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                  {/* Breadcrumb */}
                  <div className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-md shadow-sm">
                    <span 
                      className={zoomLevel !== 'us' ? 'cursor-pointer hover:text-foreground transition-colors' : 'text-foreground font-medium'}
                      onClick={() => {
                        if (zoomLevel !== 'us') {
                          resetToUSView();
                        }
                      }}
                    >
                      US
                    </span>
                    {focusedState && (
                      <>
                        <span className="mx-1">/</span>
                        <span 
                          className={zoomLevel === 'cluster' ? 'cursor-pointer hover:text-foreground transition-colors' : 'text-foreground font-medium'}
                          onClick={() => {
                            if (zoomLevel === 'cluster') {
                              handleZoomOut();
                            }
                          }}
                        >
                          {STATE_NAMES[focusedState] || focusedState}
                        </span>
                      </>
                    )}
                    {selectedCluster && zoomLevel === 'cluster' && (
                      <>
                        <span className="mx-1">/</span>
                        <span className="text-foreground font-medium">
                          Cluster ({selectedCluster.loans.length} loans)
                        </span>
                      </>
                    )}
                  </div>
                  
                  <Button
                    onClick={handleZoomOut}
                    variant="secondary"
                    size="sm"
                    className="shadow-lg"
                    data-testid="button-zoom-out"
                  >
                    <ZoomOut className="h-4 w-4 mr-2" />
                    {zoomLevel === 'cluster' 
                      ? `Back to ${STATE_NAMES[focusedState!] || focusedState}` 
                      : 'Back to US Map'}
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
              {Object.entries(statePaths).map(([stateCode, pathD]) => {
                const fillColor = focusedState 
                  ? (focusedState === stateCode ? "#374151" : "#1F2937")
                  : getStateFillColor(stateCode, stateDataMap, stateClusters);
                
                const isHovered = hoveredState === stateCode;
                const isSelected = selectedState === stateCode;
                
                return (
                  <path
                    key={stateCode}
                    d={pathD}
                    fill={fillColor}
                    stroke={isSelected ? "#FFFFFF" : isHovered ? "#9CA3AF" : "#374151"}
                    strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 0.5}
                    className={focusedState && focusedState !== stateCode ? "opacity-30" : "cursor-pointer transition-all duration-200"}
                    data-testid={`state-bg-${stateCode}`}
                    onClick={() => !focusedState && handleStateClick(stateCode)}
                    onMouseEnter={() => !focusedState && setHoveredState(stateCode)}
                    onMouseLeave={() => !focusedState && setHoveredState(null)}
                  />
                );
              })}
              
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
                    
                    {/* Render individual loan markers */}
                    {loanPositions.map(({ loan, x, y, isActualPosition }, index) => (
                      <g key={`loan-${loan.id}`}>
                        {/* Connection line from cluster center (only in state-level spiderfy view) */}
                        {zoomLevel !== 'cluster' && (
                          <line
                            x1={selectedCluster!.centerX}
                            y1={selectedCluster!.centerY}
                            x2={x}
                            y2={y}
                            stroke="#666"
                            strokeWidth={1}
                            strokeDasharray="2,2"
                            opacity={0.5}
                          />
                        )}
                        {/* Individual loan marker */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <g>
                              {/* Pulsing background for actual GPS positions */}
                              {isActualPosition && zoomLevel === 'cluster' && (
                                <circle
                                  cx={x}
                                  cy={y}
                                  r={3}
                                  fill={getLoanColor(loan)}
                                  opacity={0.3}
                                  className="cluster-pulse"
                                />
                              )}
                              <circle
                                cx={x}
                                cy={y}
                                r={zoomLevel === 'cluster' ? 2 : 6}
                                fill={getLoanColor(loan)}
                                stroke="#FFFFFF"
                                strokeWidth={zoomLevel === 'cluster' ? 0.5 : 1.5}
                                className="cursor-pointer hover:scale-125 transition-transform"
                                data-testid={`loan-marker-${loan.id}`}
                              />
                            </g>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="bg-card border shadow-lg p-3 max-w-xs">
                            <div className="space-y-2">
                              <p className="font-semibold text-sm">{loan.loanNumber}</p>
                              <p className="text-xs text-muted-foreground">{loan.propertyAddress}</p>
                              {loan.propertyCity && (
                                <p className="text-xs text-muted-foreground">
                                  {loan.propertyCity}, {loan.propertyState} {loan.propertyZip}
                                </p>
                              )}
                              <div className="space-y-1 pt-2 border-t border-border">
                                <p className="text-xs">
                                  <span className="text-muted-foreground">Amount:</span>{' '}
                                  <span className="font-medium">{formatCurrency(loan.loanAmount)}</span>
                                </p>
                                <p className="text-xs">
                                  <span className="text-muted-foreground">Balance:</span>{' '}
                                  <span className="font-medium">{formatCurrency(loan.currentBalance)}</span>
                                </p>
                                <p className="text-xs">
                                  <span className="text-muted-foreground">Rate:</span>{' '}
                                  <span className="font-medium">{loan.interestRate}%</span>
                                </p>
                                <p className="text-xs">
                                  <span className="text-muted-foreground">Type:</span>{' '}
                                  <span className="font-medium">{loan.loanType}</span>
                                </p>
                                <p className="text-xs">
                                  <span className="text-muted-foreground">Borrower:</span>{' '}
                                  <span className="font-medium">{loan.borrowerName}</span>
                                </p>
                              </div>
                              {isActualPosition && (
                                <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  Actual GPS location
                                </p>
                              )}
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
