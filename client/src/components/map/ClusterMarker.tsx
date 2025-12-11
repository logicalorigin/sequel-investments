import type { MarketDetail } from "@/data/marketDetails";
import type { MarkerCluster } from "@/hooks/useMarkerClustering";

/** Animated position for scattered markers */
export interface ScatteredMarkerPosition {
  id: string;
  x: number;
  y: number;
}

/** Props for the ClusterMarker component */
export interface ClusterMarkerProps {
  cluster: MarkerCluster;
  clusterIdx: number;
  hoveredMarket: MarketDetail | null;
  selectedMarket: MarketDetail | null;
  onMarkerClick: (market: MarketDetail) => void;
  onClusterClick: (cluster: MarkerCluster) => void;
  onMarkerHover: (market: MarketDetail | null) => void;
  onClusterHoverStart?: (cluster: MarkerCluster) => void;
  onClusterHoverEnd?: () => void;
  scatterPositions?: ScatteredMarkerPosition[];
  isScattering?: boolean;
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
 * - During scatter animation: Shows individual markers flying from cluster center
 */
export function ClusterMarker({
  cluster,
  clusterIdx,
  hoveredMarket,
  selectedMarket,
  onMarkerClick,
  onClusterClick,
  onMarkerHover,
  onClusterHoverStart,
  onClusterHoverEnd,
  scatterPositions,
  isScattering,
}: ClusterMarkerProps) {
  const { stats, center, markers } = cluster;
  const isSingleMarket = markers.length === 1;
  const topMarket = stats.topMarket;
  const colors = getCapRateColor(stats.maxCapRate);
  
  const isActive = markers.some(m => 
    hoveredMarket?.id === m.market.id || selectedMarket?.id === m.market.id
  );

  // Single market - show informative pill, click opens details
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

  // If scattering, render individual animated markers instead of cluster bubble
  if (isScattering && scatterPositions && scatterPositions.length > 0) {
    // Calculate bounding box for scatter area to use as hover target
    const padding = 20;
    const allX = scatterPositions.map(p => p.x);
    const allY = scatterPositions.map(p => p.y);
    const minX = Math.min(...allX) - padding;
    const maxX = Math.max(...allX) + padding;
    const minY = Math.min(...allY) - padding;
    const maxY = Math.max(...allY) + padding;
    
    return (
      <g 
        data-testid={`cluster-scatter-${clusterIdx}`}
        onMouseLeave={() => {
          onMarkerHover(null);
          onClusterHoverEnd?.();
        }}
      >
        {/* Invisible hover area covering all scattered markers */}
        <rect
          x={minX}
          y={minY}
          width={maxX - minX}
          height={maxY - minY}
          fill="transparent"
          style={{ pointerEvents: 'all' }}
        />
        
        {/* Heavily faded cluster bubble in background */}
        <g style={{ opacity: 0.12 }}>
          <ClusterBubble
            x={center.x}
            y={center.y}
            count={markers.length}
            colors={colors}
            isActive={false}
            hasSTRExcellent={false}
          />
        </g>
        
        {/* Animated scattered markers */}
        {markers.map((m, i) => {
          const pos = scatterPositions.find(p => p.id === m.market.id);
          if (!pos) return null;
          
          const market = m.market;
          const markerColors = getCapRateColor(market.realEstate.capRate);
          const isSTRExcellent = market.strFriendliness?.tier === "Excellent";
          
          return (
            <g 
              key={market.id}
              style={{ 
                cursor: 'pointer',
                transform: `translate(${pos.x - m.pos.x}px, ${pos.y - m.pos.y}px)`,
              }}
              onMouseEnter={() => onMarkerHover(market)}
              onMouseLeave={() => onMarkerHover(null)}
              onClick={(e) => {
                e.stopPropagation();
                onMarkerClick(market);
              }}
              data-testid={`scatter-marker-${market.id}`}
            >
              <ScatterMarkerDot
                x={m.pos.x}
                y={m.pos.y}
                market={market}
                colors={markerColors}
                isActive={hoveredMarket?.id === market.id}
                isSTRExcellent={isSTRExcellent}
              />
            </g>
          );
        })}
      </g>
    );
  }

  // Multiple markets - cluster bubble, hover starts scatter animation
  const bubbleRadius = markers.length > 9 ? 14 : 12;
  const hitAreaPadding = 12;
  
  const handleHoverStart = () => {
    onMarkerHover(topMarket);
    onClusterHoverStart?.(cluster);
  };
  
  const handleHoverEnd = () => {
    onMarkerHover(null);
    onClusterHoverEnd?.();
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClusterClick(cluster);
  };
  
  return (
    <g 
      style={{ cursor: 'zoom-in' }}
      data-testid={`cluster-marker-${clusterIdx}`}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      onClick={handleClick}
    >
      <ClusterBubble
        x={center.x}
        y={center.y}
        count={markers.length}
        colors={colors}
        isActive={isActive}
        hasSTRExcellent={stats.hasSTRExcellent}
      />
      {/* Hit area on top (rendered last in SVG = highest z-order) for reliable hover detection */}
      <circle
        cx={center.x}
        cy={center.y}
        r={bubbleRadius + hitAreaPadding}
        fill="rgba(0,0,0,0.001)"
        style={{ pointerEvents: 'all' }}
        data-testid={`cluster-hitarea-${clusterIdx}`}
        onMouseEnter={handleHoverStart}
        onMouseLeave={handleHoverEnd}
        onPointerEnter={handleHoverStart}
        onPointerLeave={handleHoverEnd}
        onClick={handleClick}
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

interface ScatterMarkerDotProps {
  x: number;
  y: number;
  market: MarketDetail;
  colors: { bg: string; border: string; text: string };
  isActive: boolean;
  isSTRExcellent: boolean;
}

/** Compact dot marker shown during scatter animation */
function ScatterMarkerDot({ x, y, market, colors, isActive, isSTRExcellent }: ScatterMarkerDotProps) {
  const radius = 8;
  const capRate = market.realEstate.capRate.toFixed(1);
  
  return (
    <g style={{ filter: isActive ? 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
      {/* Active glow */}
      {isActive && (
        <circle
          cx={x}
          cy={y}
          r={radius + 2}
          fill="rgba(255,255,255,0.4)"
        />
      )}
      
      {/* Main dot */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={colors.bg}
        stroke={colors.border}
        strokeWidth={1.5}
      />
      
      {/* CAP rate label */}
      <text
        x={x}
        y={y + 2.5}
        textAnchor="middle"
        fill={colors.text}
        fontSize={5}
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
        style={{ pointerEvents: 'none' }}
      >
        {capRate}
      </text>
      
      {/* STR indicator */}
      {isSTRExcellent && (
        <circle
          cx={x + radius - 1}
          cy={y - radius + 1}
          r={2.5}
          fill="#10b981"
          stroke="#047857"
          strokeWidth={0.5}
        />
      )}
    </g>
  );
}
