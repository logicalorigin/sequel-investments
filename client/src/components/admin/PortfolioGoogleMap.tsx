import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Map, useMap, useMapsLibrary, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import { MarkerClusterer, SuperClusterAlgorithm } from "@googlemaps/markerclusterer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  DollarSign, 
  Percent, 
  Clock, 
  TrendingUp, 
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { darkMapStyles } from "@/lib/mapStyles";

interface LoanData {
  id: string;
  loanNumber: string;
  propertyAddress: string;
  propertyCity: string | null;
  propertyState: string;
  propertyZip: string | null;
  propertyType: string | null;
  loanAmount: number;
  currentBalance: number;
  status: string;
  loanType: string;
  interestRate: string;
  fundedDate: string;
  borrowerName: string;
  lat: number;
  lng: number;
  riskScore: number;
  creditScore: number | null;
  ltvRatio: number | null;
  dscrRatio: number | null;
  daysFunded: number | null;
  nextPaymentDate: string | null;
  paymentsDue: number;
  totalPastDue: number;
  projectCompletionPercent: number | null;
  arv: number | null;
  currentValue: number | null;
}

interface PortfolioGoogleMapProps {
  onLoanSelect?: (loan: LoanData | null) => void;
  onClusterSelect?: (loans: LoanData[], center: { lat: number; lng: number }) => void;
  onVisibleLoansChange?: (visibleLoans: LoanData[], totalLoans: number) => void;
  className?: string;
}

// Risk score color based on 0-100 scale
function getRiskScoreColor(score: number): string {
  if (score >= 90) return "#10B981";
  if (score >= 75) return "#84CC16";
  if (score >= 60) return "#FBBF24";
  if (score >= 45) return "#F97316";
  return "#EF4444";
}

function getRiskScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 45) return "Caution";
  return "High Risk";
}

function getLoanStatusColor(status: string): string {
  const s = status.toLowerCase();
  if (s === 'current') return "#10B981";
  if (s === 'grace_period') return "#84CC16";
  if (s === 'late') return "#FBBF24";
  if (s === 'default' || s === 'foreclosure') return "#EF4444";
  return "#6B7280";
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function formatDaysFunded(days: number | null): string {
  if (days === null) return "N/A";
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  if (days < 60) return "1 month ago";
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} year${days >= 730 ? 's' : ''} ago`;
}

// Custom cluster renderer for styled clusters
function createClusterRenderer() {
  return {
    render: ({ count, position }: { count: number; position: google.maps.LatLng }) => {
      const size = Math.min(60, 30 + Math.log2(count) * 8);
      const color = count > 20 ? "#EF4444" : count > 10 ? "#F97316" : count > 5 ? "#FBBF24" : "#10B981";
      
      const svg = `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${color}" fill-opacity="0.9" stroke="#fff" stroke-width="2"/>
          <text x="${size/2}" y="${size/2 + 5}" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">${count}</text>
        </svg>
      `;
      
      return new google.maps.Marker({
        position,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
          scaledSize: new google.maps.Size(size, size),
          anchor: new google.maps.Point(size / 2, size / 2),
        },
        zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
      });
    },
  };
}

// Loan marker component
function LoanMarker({ 
  loan, 
  onClick,
  isSelected 
}: { 
  loan: LoanData; 
  onClick: () => void;
  isSelected: boolean;
}) {
  const riskScore = loan.riskScore ?? 100;
  const color = getRiskScoreColor(riskScore);
  const size = isSelected ? 20 : 14;
  
  return (
    <AdvancedMarker
      position={{ lat: loan.lat, lng: loan.lng }}
      onClick={onClick}
      zIndex={isSelected ? 1000 : 1}
    >
      <div 
        className="relative cursor-pointer transition-transform hover:scale-125"
        style={{ transform: isSelected ? 'scale(1.3)' : 'scale(1)' }}
        data-testid={`loan-marker-${loan.id}`}
      >
        <svg width={size} height={size} viewBox="0 0 20 20">
          <circle 
            cx="10" 
            cy="10" 
            r="8" 
            fill={color}
            stroke="#fff"
            strokeWidth="2"
          />
          {isSelected && (
            <circle 
              cx="10" 
              cy="10" 
              r="12" 
              fill="transparent"
              stroke={color}
              strokeWidth="2"
              opacity="0.5"
            />
          )}
        </svg>
      </div>
    </AdvancedMarker>
  );
}

// Info window content for selected loan
function LoanInfoContent({ loan }: { loan: LoanData }) {
  const riskScore = loan.riskScore ?? 100;
  
  return (
    <div className="p-0 min-w-[280px] max-w-[320px]" data-testid={`loan-info-${loan.id}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-2 bg-slate-800 border-b border-slate-700">
        <div 
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ backgroundColor: getRiskScoreColor(riskScore) }}
        >
          {riskScore}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{loan.loanNumber}</p>
          <p className="text-xs text-slate-400">{getRiskScoreLabel(riskScore)} Risk</p>
        </div>
        <Badge 
          variant="outline" 
          className="text-xs shrink-0"
          style={{ 
            borderColor: getLoanStatusColor(loan.status),
            color: getLoanStatusColor(loan.status)
          }}
        >
          {loan.status.replace(/_/g, ' ')}
        </Badge>
      </div>
      
      {/* Property Info */}
      <div className="px-3 py-2 bg-slate-850 border-b border-slate-700">
        <div className="flex items-start gap-2">
          <Building2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm text-white font-medium truncate">{loan.propertyAddress}</p>
            <p className="text-xs text-slate-400">
              {loan.propertyCity}, {loan.propertyState} {loan.propertyZip}
            </p>
          </div>
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 px-3 py-2 bg-slate-900">
        <div className="flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 text-amber-500" />
          <div>
            <p className="text-xs text-slate-400">Balance</p>
            <p className="text-sm font-semibold text-white">{formatCurrency(loan.currentBalance)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Percent className="h-3.5 w-3.5 text-blue-400" />
          <div>
            <p className="text-xs text-slate-400">Rate</p>
            <p className="text-sm font-semibold text-white">{loan.interestRate}%</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-green-400" />
          <div>
            <p className="text-xs text-slate-400">LTV</p>
            <p className="text-sm font-semibold text-white">
              {loan.ltvRatio ? `${loan.ltvRatio.toFixed(0)}%` : 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-purple-400" />
          <div>
            <p className="text-xs text-slate-400">Funded</p>
            <p className="text-sm font-semibold text-white">{formatDaysFunded(loan.daysFunded)}</p>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="px-3 py-2 bg-slate-800 border-t border-slate-700">
        <Link href={`/admin/servicing/${loan.id}`}>
          <Button size="sm" variant="outline" className="w-full gap-1 text-xs">
            View Details <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Cluster info window content
function ClusterInfoContent({ 
  loans, 
  onViewAll 
}: { 
  loans: LoanData[];
  onViewAll: () => void;
}) {
  const totalValue = loans.reduce((sum, l) => sum + l.currentBalance, 0);
  const avgRiskScore = loans.reduce((sum, l) => sum + (l.riskScore ?? 100), 0) / loans.length;
  const currentCount = loans.filter(l => l.status.toLowerCase() === 'current').length;
  const lateCount = loans.filter(l => ['late', 'default', 'foreclosure'].includes(l.status.toLowerCase())).length;
  
  return (
    <div className="p-0 min-w-[240px]" data-testid="cluster-info">
      <div className="px-3 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white">{loans.length} Loans</span>
          <Badge variant="secondary" className="text-xs">
            {formatCurrency(totalValue)}
          </Badge>
        </div>
      </div>
      
      <div className="px-3 py-2 bg-slate-900 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Avg Risk Score</span>
          <span 
            className="font-semibold"
            style={{ color: getRiskScoreColor(avgRiskScore) }}
          >
            {avgRiskScore.toFixed(0)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-slate-400">
            <CheckCircle2 className="h-3 w-3 text-green-500" /> Current
          </span>
          <span className="font-semibold text-white">{currentCount}</span>
        </div>
        {lateCount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-slate-400">
              <AlertTriangle className="h-3 w-3 text-yellow-500" /> Late/Default
            </span>
            <span className="font-semibold text-yellow-500">{lateCount}</span>
          </div>
        )}
      </div>
      
      <div className="px-3 py-2 bg-slate-800 border-t border-slate-700">
        <Button size="sm" variant="outline" className="w-full text-xs" onClick={onViewAll}>
          Zoom to View All
        </Button>
      </div>
    </div>
  );
}

// Map controls
function MapControls({ 
  onZoomIn, 
  onZoomOut, 
  onReset 
}: { 
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  return (
    <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
      <Button 
        size="icon" 
        variant="secondary" 
        className="h-8 w-8 bg-slate-800/90 hover:bg-slate-700 border border-slate-600"
        onClick={onZoomIn}
        data-testid="button-zoom-in"
      >
        <ZoomIn className="h-4 w-4 text-white" />
      </Button>
      <Button 
        size="icon" 
        variant="secondary" 
        className="h-8 w-8 bg-slate-800/90 hover:bg-slate-700 border border-slate-600"
        onClick={onZoomOut}
        data-testid="button-zoom-out"
      >
        <ZoomOut className="h-4 w-4 text-white" />
      </Button>
      <Button 
        size="icon" 
        variant="secondary" 
        className="h-8 w-8 bg-slate-800/90 hover:bg-slate-700 border border-slate-600"
        onClick={onReset}
        data-testid="button-reset-view"
      >
        <Maximize2 className="h-4 w-4 text-white" />
      </Button>
    </div>
  );
}

// Legend component
function MapLegend() {
  return (
    <div className="absolute bottom-3 left-3 bg-slate-800/95 rounded-lg p-2 border border-slate-700 z-10">
      <p className="text-xs font-medium text-white mb-1.5">Risk Score</p>
      <div className="flex flex-col gap-1">
        {[
          { color: "#10B981", label: "90+ Excellent" },
          { color: "#84CC16", label: "75-89 Good" },
          { color: "#FBBF24", label: "60-74 Fair" },
          { color: "#F97316", label: "45-59 Caution" },
          { color: "#EF4444", label: "0-44 High Risk" },
        ].map(({ color, label }) => (
          <div key={color} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-slate-300">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main map component inner
function PortfolioMapInner({ 
  loans,
  onLoanSelect,
  onClusterSelect,
  onVisibleLoansChange
}: { 
  loans: LoanData[];
  onLoanSelect?: (loan: LoanData | null) => void;
  onClusterSelect?: (loans: LoanData[], center: { lat: number; lng: number }) => void;
  onVisibleLoansChange?: (visibleLoans: LoanData[], totalLoans: number) => void;
}) {
  const map = useMap();
  const markersLib = useMapsLibrary("marker");
  const [selectedLoan, setSelectedLoan] = useState<LoanData | null>(null);
  const [clusterInfo, setClusterInfo] = useState<{ loans: LoanData[]; position: google.maps.LatLng } | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  
  // Track visible loans based on viewport bounds
  const updateVisibleLoans = useCallback(() => {
    if (!map || loans.length === 0) return;
    
    const bounds = map.getBounds();
    if (!bounds) return;
    
    const visibleLoans = loans.filter(loan => {
      if (!loan.lat || !loan.lng) return false;
      return bounds.contains({ lat: loan.lat, lng: loan.lng });
    });
    
    onVisibleLoansChange?.(visibleLoans, loans.length);
  }, [map, loans, onVisibleLoansChange]);
  
  // Listen to map idle event (fires after zoom/pan completes)
  useEffect(() => {
    if (!map) return;
    
    const idleListener = map.addListener('idle', updateVisibleLoans);
    
    // Initial update
    updateVisibleLoans();
    
    return () => {
      google.maps.event.removeListener(idleListener);
    };
  }, [map, updateVisibleLoans]);
  
  // Create markers and clusterer
  useEffect(() => {
    if (!map || !markersLib || loans.length === 0) return;
    
    // Clear existing markers
    markersRef.current.forEach(m => m.map = null);
    markersRef.current = [];
    
    // Create new markers
    const validLoans = loans.filter(l => l.lat && l.lng && !isNaN(l.lat) && !isNaN(l.lng));
    
    const markers = validLoans.map(loan => {
      const riskScore = loan.riskScore ?? 100;
      const color = getRiskScoreColor(riskScore);
      
      const markerContent = document.createElement('div');
      markerContent.className = 'loan-marker-content';
      markerContent.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="8" fill="${color}" stroke="#fff" stroke-width="2"/>
        </svg>
      `;
      markerContent.style.cursor = 'pointer';
      markerContent.style.transition = 'transform 0.2s';
      markerContent.addEventListener('mouseenter', () => {
        markerContent.style.transform = 'scale(1.3)';
      });
      markerContent.addEventListener('mouseleave', () => {
        markerContent.style.transform = 'scale(1)';
      });
      
      const marker = new markersLib.AdvancedMarkerElement({
        position: { lat: loan.lat, lng: loan.lng },
        content: markerContent,
        title: loan.loanNumber,
      });
      
      // Store loan data on marker for cluster info
      (marker as any).loanData = loan;
      
      marker.addListener('click', () => {
        setSelectedLoan(loan);
        setClusterInfo(null);
        onLoanSelect?.(loan);
      });
      
      return marker;
    });
    
    markersRef.current = markers;
    
    // Create or update clusterer
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current.addMarkers(markers);
    } else {
      clustererRef.current = new MarkerClusterer({
        map,
        markers,
        algorithm: new SuperClusterAlgorithm({ 
          radius: 80,
          maxZoom: 15,
        }),
        renderer: createClusterRenderer(),
        onClusterClick: (event, cluster, map) => {
          const clusterMarkers = cluster.markers as google.maps.marker.AdvancedMarkerElement[];
          const clusterLoans = clusterMarkers
            .map(m => (m as any).loanData as LoanData)
            .filter(Boolean);
          
          if (clusterLoans.length > 0) {
            const position = cluster.position;
            setClusterInfo({ loans: clusterLoans, position });
            setSelectedLoan(null);
            onClusterSelect?.(clusterLoans, { lat: position.lat(), lng: position.lng() });
          }
        },
      });
    }
    
    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
      }
    };
  }, [map, markersLib, loans, onLoanSelect, onClusterSelect]);
  
  // Map controls
  const handleZoomIn = useCallback(() => {
    if (map) map.setZoom((map.getZoom() || 4) + 1);
  }, [map]);
  
  const handleZoomOut = useCallback(() => {
    if (map) map.setZoom((map.getZoom() || 4) - 1);
  }, [map]);
  
  const handleReset = useCallback(() => {
    if (map) {
      map.setCenter({ lat: 39.8283, lng: -98.5795 });
      map.setZoom(4);
      setSelectedLoan(null);
      setClusterInfo(null);
    }
  }, [map]);
  
  const handleClusterZoom = useCallback(() => {
    if (map && clusterInfo) {
      map.setCenter({ lat: clusterInfo.position.lat(), lng: clusterInfo.position.lng() });
      map.setZoom((map.getZoom() || 4) + 2);
      setClusterInfo(null);
    }
  }, [map, clusterInfo]);
  
  return (
    <>
      <MapControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onReset={handleReset} />
      <MapLegend />
      
      {selectedLoan && (
        <InfoWindow
          position={{ lat: selectedLoan.lat, lng: selectedLoan.lng }}
          onCloseClick={() => {
            setSelectedLoan(null);
            onLoanSelect?.(null);
          }}
          pixelOffset={[0, -10]}
        >
          <LoanInfoContent loan={selectedLoan} />
        </InfoWindow>
      )}
      
      {clusterInfo && (
        <InfoWindow
          position={{ lat: clusterInfo.position.lat(), lng: clusterInfo.position.lng() }}
          onCloseClick={() => setClusterInfo(null)}
          pixelOffset={[0, -20]}
        >
          <ClusterInfoContent loans={clusterInfo.loans} onViewAll={handleClusterZoom} />
        </InfoWindow>
      )}
    </>
  );
}

// Main exported component
export function PortfolioGoogleMap({ 
  onLoanSelect,
  onClusterSelect,
  onVisibleLoansChange,
  className = ""
}: PortfolioGoogleMapProps) {
  // Fetch all serviced loans with coordinates
  const { data: loans = [], isLoading } = useQuery<LoanData[]>({
    queryKey: ['/api/admin/analytics/portfolio-loans-all'],
  });
  
  const validLoans = useMemo(() => {
    return loans.filter(l => l.lat && l.lng && !isNaN(l.lat) && !isNaN(l.lng));
  }, [loans]);
  
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-slate-900 ${className}`}>
        <div className="text-slate-400 text-sm">Loading portfolio map...</div>
      </div>
    );
  }
  
  return (
    <div className={`relative ${className}`} data-testid="portfolio-google-map">
      <Map
        defaultCenter={{ lat: 39.8283, lng: -98.5795 }}
        defaultZoom={4}
        mapId="portfolio-concentration-map"
        gestureHandling="greedy"
        disableDefaultUI={true}
        styles={darkMapStyles}
        style={{ width: "100%", height: "100%" }}
      >
        <PortfolioMapInner 
          loans={validLoans}
          onLoanSelect={onLoanSelect}
          onClusterSelect={onClusterSelect}
          onVisibleLoansChange={onVisibleLoansChange}
        />
      </Map>
      
      {/* Stats overlay */}
      <div className="absolute top-3 left-3 bg-slate-800/95 rounded-lg px-3 py-2 border border-slate-700 z-10">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Total Loans</p>
            <p className="text-lg font-bold text-white">{validLoans.length}</p>
          </div>
          <div className="h-8 w-px bg-slate-600" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Portfolio Value</p>
            <p className="text-lg font-bold text-amber-500">
              {formatCurrency(validLoans.reduce((sum, l) => sum + l.currentBalance, 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PortfolioGoogleMap;
