import type { MarketDetail } from "@/data/marketDetails";
import type { MarkerCluster, MarkerWithPosition } from "@/hooks/useMarkerClustering";

/** Props for the ClusterMarker component */
export interface ClusterMarkerProps {
  cluster: MarkerCluster;
  clusterIdx: number;
  isExpanded: boolean;
  hoveredMarket: MarketDetail | null;
  selectedMarket: MarketDetail | null;
  onMarkerClick: (market: MarketDetail) => void;
  onMarkerHover: (market: MarketDetail | null) => void;
  setHoveredMarket: (market: MarketDetail | null) => void;
}

const EXPAND_RADIUS = 12;
const HITBOX_RADIUS = EXPAND_RADIUS + 8;

const MARKER_COLORS = [
  { fill: "hsl(142 71% 45%)", stroke: "hsl(142 71% 35%)" },
  { fill: "hsl(262 80% 55%)", stroke: "hsl(262 80% 40%)" },
  { fill: "hsl(217 91% 60%)", stroke: "hsl(217 91% 45%)" },
  { fill: "hsl(38 92% 50%)", stroke: "hsl(38 92% 40%)" },
  { fill: "hsl(330 80% 55%)", stroke: "hsl(330 80% 40%)" },
];

/**
 * Renders a cluster of market markers on the SVG map.
 * Shows collapsed state (single marker with count) or expanded radial menu.
 */
export function ClusterMarker({
  cluster,
  clusterIdx,
  isExpanded,
  hoveredMarket,
  selectedMarket,
  onMarkerClick,
  onMarkerHover,
  setHoveredMarket,
}: ClusterMarkerProps) {
  if (isExpanded) {
    return (
      <g onMouseLeave={() => onMarkerHover(null)}>
        <circle
          cx={cluster.center.x}
          cy={cluster.center.y}
          r={HITBOX_RADIUS}
          fill="transparent"
          style={{ pointerEvents: 'all' }}
        />
        {cluster.markers.map((m, i) => {
          const angle = (i * 2 * Math.PI) / cluster.markers.length - Math.PI / 2;
          const expandedX = cluster.center.x + Math.cos(angle) * EXPAND_RADIUS;
          const expandedY = cluster.center.y + Math.sin(angle) * EXPAND_RADIUS;
          return (
            <line
              key={`line-${m.market.id}`}
              x1={cluster.center.x}
              y1={cluster.center.y}
              x2={expandedX}
              y2={expandedY}
              stroke="hsl(var(--primary) / 0.3)"
              strokeWidth={1}
              strokeDasharray="1,1"
              style={{ pointerEvents: 'none' }}
            />
          );
        })}
        {cluster.markers.map((m, i) => (
          <ExpandedMarker
            key={m.market.id}
            marker={m}
            index={i}
            totalCount={cluster.markers.length}
            center={cluster.center}
            isHovered={hoveredMarket?.id === m.market.id}
            isSelected={selectedMarket?.id === m.market.id}
            onClick={() => onMarkerClick(m.market)}
            onMouseEnter={() => onMarkerHover(m.market)}
          />
        ))}
      </g>
    );
  }

  return (
    <g 
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => onMarkerHover(cluster.markers[0].market)}
      onMouseLeave={() => onMarkerHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        setHoveredMarket(cluster.markers[0].market);
      }}
      data-testid={`cluster-marker-${clusterIdx}`}
    >
      <circle
        cx={cluster.center.x}
        cy={cluster.center.y}
        r={15}
        fill="transparent"
        style={{ pointerEvents: 'all' }}
      />
      <circle
        cx={cluster.center.x}
        cy={cluster.center.y}
        r={9}
        fill="hsl(38 92% 50%)"
        stroke="hsl(30 94% 25%)"
        strokeWidth={2}
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))', pointerEvents: 'none' }}
      />
      <text
        x={cluster.center.x}
        y={cluster.center.y + 3}
        textAnchor="middle"
        fill="hsl(48 96% 89%)"
        fontSize={8}
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
        style={{ pointerEvents: 'none' }}
      >
        {cluster.markers.length}
      </text>
    </g>
  );
}

interface ExpandedMarkerProps {
  marker: MarkerWithPosition;
  index: number;
  totalCount: number;
  center: { x: number; y: number };
  isHovered: boolean;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

function ExpandedMarker({
  marker,
  index,
  totalCount,
  center,
  isHovered,
  isSelected,
  onClick,
  onMouseEnter,
}: ExpandedMarkerProps) {
  const angle = (index * 2 * Math.PI) / totalCount - Math.PI / 2;
  const expandedX = center.x + Math.cos(angle) * EXPAND_RADIUS;
  const expandedY = center.y + Math.sin(angle) * EXPAND_RADIUS;
  const isActive = isSelected || isHovered;
  const radius = isActive ? 6 : 5;
  
  const colorIndex = index % MARKER_COLORS.length;
  const markerColor = isActive 
    ? { fill: "hsl(45 93% 58%)", stroke: "hsl(48 96% 89%)" }
    : MARKER_COLORS[colorIndex];
  
  return (
    <g 
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {isActive && (
        <circle 
          cx={expandedX} 
          cy={expandedY} 
          r={radius + 3} 
          fill="hsl(var(--primary) / 0.35)" 
        />
      )}
      <circle
        cx={expandedX}
        cy={expandedY}
        r={radius}
        fill={markerColor.fill}
        stroke={markerColor.stroke}
        strokeWidth={isActive ? 1.5 : 1}
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.35))' }}
      />
      <text
        x={expandedX}
        y={expandedY + 1.5}
        textAnchor="middle"
        fill="white"
        fontSize={5}
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
        style={{ pointerEvents: 'none' }}
      >
        {marker.index + 1}
      </text>
    </g>
  );
}
