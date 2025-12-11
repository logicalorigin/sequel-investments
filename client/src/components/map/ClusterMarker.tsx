import type { MarketDetail } from "@/data/marketDetails";
import type { MarkerCluster } from "@/hooks/useMarkerClustering";

/** Props for the ClusterMarker component */
export interface ClusterMarkerProps {
  cluster: MarkerCluster;
  clusterIdx: number;
  hoveredMarket: MarketDetail | null;
  selectedMarket: MarketDetail | null;
  onMarkerClick: (market: MarketDetail) => void;
  onMarkerHover: (market: MarketDetail | null) => void;
}

/** Get color based on CAP rate tier */
function getCapRateColor(capRate: number): { bg: string; border: string; text: string } {
  if (capRate >= 6.0) return { bg: "#16a34a", border: "#15803d", text: "#fff" };
  if (capRate >= 5.0) return { bg: "#eab308", border: "#ca8a04", text: "#1f2937" };
  if (capRate >= 4.0) return { bg: "#f97316", border: "#ea580c", text: "#fff" };
  return { bg: "#ef4444", border: "#dc2626", text: "#fff" };
}

/** Truncate market name for display */
function truncateName(name: string, maxLength: number = 10): string {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength - 1) + "…";
}

/**
 * Google Maps style cluster marker.
 * - Single market: Shows pill with name and CAP rate
 * - Multiple markets: Shows count bubble, click to open first market details
 */
export function ClusterMarker({
  cluster,
  clusterIdx,
  hoveredMarket,
  selectedMarket,
  onMarkerClick,
  onMarkerHover,
}: ClusterMarkerProps) {
  const { stats, center, markers } = cluster;
  const isSingleMarket = markers.length === 1;
  const topMarket = stats.topMarket;
  const colors = getCapRateColor(stats.maxCapRate);
  
  const isActive = markers.some(m => 
    hoveredMarket?.id === m.market.id || selectedMarket?.id === m.market.id
  );

  // Single market - show informative pill
  if (isSingleMarket) {
    const market = markers[0].market;
    const isSTRExcellent = market.strFriendliness?.tier === "Excellent";
    
    return (
      <g 
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => onMarkerHover(market)}
        onMouseLeave={() => onMarkerHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          onMarkerClick(market);
        }}
        data-testid={`marker-${market.id}`}
      >
        <SingleMarkerPill
          x={center.x}
          y={center.y}
          market={market}
          colors={colors}
          isActive={isActive}
          isSTRExcellent={isSTRExcellent}
        />
      </g>
    );
  }

  // Multiple markets - Google Maps style cluster bubble
  return (
    <g 
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => onMarkerHover(topMarket)}
      onMouseLeave={() => onMarkerHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        onMarkerClick(topMarket);
      }}
      data-testid={`cluster-marker-${clusterIdx}`}
    >
      <ClusterBubble
        x={center.x}
        y={center.y}
        count={markers.length}
        colors={colors}
        isActive={isActive}
        hasSTRExcellent={stats.hasSTRExcellent}
      />
    </g>
  );
}

interface SingleMarkerPillProps {
  x: number;
  y: number;
  market: MarketDetail;
  colors: { bg: string; border: string; text: string };
  isActive: boolean;
  isSTRExcellent: boolean;
}

/** Pill showing market name, CAP rate, and STR badge */
function SingleMarkerPill({ x, y, market, colors, isActive, isSTRExcellent }: SingleMarkerPillProps) {
  const name = truncateName(market.name, 12);
  const capRate = market.realEstate.capRate.toFixed(1);
  const pillWidth = isSTRExcellent ? 52 : 44;
  const pillHeight = 16;
  
  return (
    <g style={{ filter: isActive ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
      {/* Active glow */}
      {isActive && (
        <rect
          x={x - pillWidth/2 - 2}
          y={y - pillHeight/2 - 2}
          width={pillWidth + 4}
          height={pillHeight + 4}
          rx={10}
          fill="rgba(255,255,255,0.3)"
        />
      )}
      
      {/* Main pill */}
      <rect
        x={x - pillWidth/2}
        y={y - pillHeight/2}
        width={pillWidth}
        height={pillHeight}
        rx={8}
        fill={colors.bg}
        stroke={colors.border}
        strokeWidth={1.5}
      />
      
      {/* Market name */}
      <text
        x={x - pillWidth/2 + 4}
        y={y + 3}
        fill={colors.text}
        fontSize={6}
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
        style={{ pointerEvents: 'none' }}
      >
        {name}
      </text>
      
      {/* CAP rate badge */}
      <rect
        x={x + pillWidth/2 - 16}
        y={y - 5}
        width={14}
        height={10}
        rx={3}
        fill="rgba(0,0,0,0.25)"
      />
      <text
        x={x + pillWidth/2 - 9}
        y={y + 2}
        fill="#fff"
        fontSize={5}
        fontWeight="700"
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
        style={{ pointerEvents: 'none' }}
      >
        {capRate}%
      </text>
      
      {/* STR Excellent badge */}
      {isSTRExcellent && (
        <g>
          <circle
            cx={x + pillWidth/2 + 4}
            cy={y}
            r={4}
            fill="#10b981"
            stroke="#047857"
            strokeWidth={1}
          />
          <text
            x={x + pillWidth/2 + 4}
            y={y + 2}
            fill="#fff"
            fontSize={4}
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
            style={{ pointerEvents: 'none' }}
          >
            S
          </text>
        </g>
      )}
    </g>
  );
}

interface ClusterBubbleProps {
  x: number;
  y: number;
  count: number;
  colors: { bg: string; border: string; text: string };
  isActive: boolean;
  hasSTRExcellent: boolean;
}

/** Google Maps style cluster bubble showing count */
function ClusterBubble({ x, y, count, colors, isActive, hasSTRExcellent }: ClusterBubbleProps) {
  const radius = count > 9 ? 14 : 12;
  
  return (
    <g style={{ filter: isActive ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
      {/* Active glow */}
      {isActive && (
        <circle
          cx={x}
          cy={y}
          r={radius + 3}
          fill="rgba(255,255,255,0.35)"
        />
      )}
      
      {/* Main bubble */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={colors.bg}
        stroke={colors.border}
        strokeWidth={2}
      />
      
      {/* Count number */}
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fill={colors.text}
        fontSize={10}
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
        style={{ pointerEvents: 'none' }}
      >
        {count}
      </text>
      
      {/* Small STR indicator if any market in cluster is Excellent */}
      {hasSTRExcellent && (
        <circle
          cx={x + radius - 2}
          cy={y - radius + 2}
          r={3}
          fill="#10b981"
          stroke="#047857"
          strokeWidth={0.5}
        />
      )}
    </g>
  );
}
