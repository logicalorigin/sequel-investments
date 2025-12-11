import type { MarketDetail } from "@/data/marketDetails";
import type { Point } from "@/lib/mapUtils";

/** Props for the MapMarker component */
export interface MapMarkerProps {
  market: MarketDetail;
  index: number;
  pos: Point;
  isHovered: boolean;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

/**
 * Renders a single market marker on the SVG map.
 * Displays a numbered circle with hover/selection states.
 */
export function MapMarker({
  market,
  index,
  pos,
  isHovered,
  isSelected,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: MapMarkerProps) {
  const isActive = isSelected || isHovered;
  const radius = isActive ? 8 : 6;
  
  return (
    <g 
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {isActive && (
        <circle 
          cx={pos.x} 
          cy={pos.y} 
          r={radius + 4} 
          fill="hsl(var(--primary) / 0.3)" 
        />
      )}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={radius}
        fill={isActive ? "hsl(45 93% 58%)" : index === 0 ? "hsl(38 92% 50%)" : index === 1 ? "hsl(32 95% 44%)" : "hsl(28 94% 39%)"}
        stroke={isActive ? "hsl(48 96% 89%)" : "hsl(30 94% 25%)"}
        strokeWidth={isActive ? 2 : 1.5}
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
      />
      <text
        x={pos.x}
        y={pos.y + 2.5}
        textAnchor="middle"
        fill={isActive ? "#0f172a" : "hsl(48 96% 89%)"}
        fontSize={isActive ? 8 : 7}
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
        style={{ pointerEvents: 'none' }}
      >
        {index + 1}
      </text>
    </g>
  );
}
