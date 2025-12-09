import { useMemo } from "react";
import { STATE_BOUNDARIES } from "@/data/stateBoundaries";
import type { MarketDetail } from "@/data/marketDetails";

interface StateMap3DProps {
  stateSlug: string;
  stateName: string;
  markets?: MarketDetail[];
  selectedMarket?: MarketDetail | null;
  hoveredMarket?: MarketDetail | null;
  onMarkerClick?: (market: MarketDetail) => void;
  onMarkerHover?: (market: MarketDetail | null) => void;
  className?: string;
  showMarkers?: boolean;
}

export function StateMap3D({
  stateSlug,
  stateName,
  markets = [],
  selectedMarket,
  hoveredMarket,
  onMarkerClick,
  onMarkerHover,
  className = "",
  showMarkers = true,
}: StateMap3DProps) {
  const boundary = STATE_BOUNDARIES[stateSlug];

  const { focusPathData, backgroundPaths, viewBox, markerPositions, bounds } = useMemo(() => {
    if (!boundary || !boundary.coordinates || boundary.coordinates.length === 0) {
      return { focusPathData: "", backgroundPaths: [], viewBox: "0 0 100 100", markerPositions: [], bounds: null };
    }

    const coords = boundary.coordinates;
    
    const lats = coords.map(c => c.lat);
    const lngs = coords.map(c => c.lng);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const latRange = maxLat - minLat;
    const lngRange = maxLng - minLng;
    
    const padding = 0.2;
    const paddedLatRange = latRange * (1 + padding * 2);
    const paddedLngRange = lngRange * (1 + padding * 2);
    const paddedMinLat = minLat - latRange * padding;
    const paddedMinLng = minLng - lngRange * padding;
    
    const width = 500;
    const height = 500 * (paddedLatRange / paddedLngRange);
    
    const toSvgX = (lng: number) => ((lng - paddedMinLng) / paddedLngRange) * width;
    const toSvgY = (lat: number) => height - ((lat - paddedMinLat) / paddedLatRange) * height;
    
    const focusPathPoints = coords.map((c, i) => {
      const x = toSvgX(c.lng);
      const y = toSvgY(c.lat);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    });
    focusPathPoints.push("Z");
    
    const bgPaths: { slug: string; path: string }[] = [];
    Object.entries(STATE_BOUNDARIES).forEach(([slug, state]) => {
      if (slug === stateSlug || !state.coordinates || state.coordinates.length === 0) return;
      
      const stateCoords = state.coordinates;
      const stateLats = stateCoords.map(c => c.lat);
      const stateLngs = stateCoords.map(c => c.lng);
      
      const stateMinLat = Math.min(...stateLats);
      const stateMaxLat = Math.max(...stateLats);
      const stateMinLng = Math.min(...stateLngs);
      const stateMaxLng = Math.max(...stateLngs);
      
      const overlapLat = stateMaxLat >= paddedMinLat && stateMinLat <= (paddedMinLat + paddedLatRange);
      const overlapLng = stateMaxLng >= paddedMinLng && stateMinLng <= (paddedMinLng + paddedLngRange);
      
      if (!overlapLat || !overlapLng) return;
      
      const points = stateCoords.map((c, i) => {
        const x = toSvgX(c.lng);
        const y = toSvgY(c.lat);
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      });
      points.push("Z");
      
      bgPaths.push({
        slug,
        path: points.join(" "),
      });
    });
    
    const markerPos = markets.map(market => ({
      market,
      x: toSvgX(market.lng),
      y: toSvgY(market.lat),
    }));

    return {
      focusPathData: focusPathPoints.join(" "),
      backgroundPaths: bgPaths,
      viewBox: `0 0 ${width} ${height}`,
      markerPositions: markerPos,
      bounds: { width, height, minLat: paddedMinLat, maxLat: paddedMinLat + paddedLatRange, minLng: paddedMinLng, maxLng: paddedMinLng + paddedLngRange },
    };
  }, [boundary, markets, stateSlug]);

  if (!boundary || !focusPathData) {
    return (
      <div className={`flex items-center justify-center bg-muted/20 rounded-lg ${className}`}>
        <p className="text-muted-foreground">Map not available for {stateName}</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className="relative w-full"
        style={{
          perspective: "1000px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          style={{
            transform: "rotateX(-12deg) scale(1.15)",
            transformStyle: "preserve-3d",
          }}
        >
          <svg
            viewBox={viewBox}
            className="w-full h-auto"
            style={{
              filter: "drop-shadow(0 20px 30px rgba(0, 0, 0, 0.4)) drop-shadow(0 10px 15px rgba(0, 0, 0, 0.3))",
            }}
          >
            <defs>
              <linearGradient id={`focus-state-gradient-${stateSlug}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d4a030" stopOpacity="1" />
                <stop offset="100%" stopColor="#c49020" stopOpacity="1" />
              </linearGradient>
              
              <filter id={`focus-state-shadow-${stateSlug}`} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.2)" />
              </filter>
            </defs>
            
            <rect x="0" y="0" width="100%" height="100%" fill="#e8e8e8" />
            
            <path
              d={focusPathData}
              fill={`url(#focus-state-gradient-${stateSlug})`}
              stroke="#a07020"
              strokeWidth="1.5"
              strokeLinejoin="round"
              filter={`url(#focus-state-shadow-${stateSlug})`}
            />
            
            {showMarkers && markerPositions.map(({ market, x, y }) => {
              const isSelected = selectedMarket?.name === market.name;
              const isHovered = hoveredMarket?.name === market.name;
              
              const population = market.demographics?.population || 500000;
              const minRadius = bounds ? Math.min(bounds.width, bounds.height) * 0.012 : 4;
              let sizeMultiplier = 1;
              if (population >= 2000000) sizeMultiplier = 1.8;
              else if (population >= 1000000) sizeMultiplier = 1.5;
              else if (population >= 500000) sizeMultiplier = 1.2;
              
              const baseRadius = minRadius * sizeMultiplier;
              const radius = isSelected ? baseRadius * 1.4 : isHovered ? baseRadius * 1.2 : baseRadius;
              const ringWidth = radius * 0.35;
              const outerRadius = radius + ringWidth;
              
              return (
                <g 
                  key={market.name}
                  className="cursor-pointer"
                  onClick={() => onMarkerClick?.(market)}
                  onMouseEnter={() => onMarkerHover?.(market)}
                  onMouseLeave={() => onMarkerHover?.(null)}
                  data-testid={`marker-${market.id}`}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={outerRadius + 3}
                    fill="hsl(var(--primary) / 0.15)"
                    className="transition-all duration-200"
                    style={{
                      filter: isSelected || isHovered 
                        ? "blur(3px)" 
                        : "blur(2px)",
                      opacity: isSelected ? 0.8 : isHovered ? 0.6 : 0.4,
                    }}
                  />
                  
                  <circle
                    cx={x}
                    cy={y}
                    r={outerRadius}
                    fill="white"
                    className="transition-all duration-200"
                    style={{
                      filter: isSelected || isHovered 
                        ? "drop-shadow(0 2px 6px rgba(0,0,0,0.3))" 
                        : "drop-shadow(0 1px 3px rgba(0,0,0,0.2))",
                    }}
                  />
                  
                  <circle
                    cx={x}
                    cy={y}
                    r={radius}
                    fill="hsl(var(--primary))"
                    className="transition-all duration-200"
                    style={{
                      filter: isSelected || isHovered 
                        ? "drop-shadow(0 0 4px hsl(var(--primary) / 0.6))" 
                        : undefined,
                    }}
                  />
                  
                  {(isSelected || isHovered) && (
                    <text
                      x={x}
                      y={y - outerRadius - 6}
                      textAnchor="middle"
                      className="fill-foreground text-[10px] font-medium pointer-events-none"
                      style={{ 
                        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))",
                      }}
                    >
                      {market.name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      
    </div>
  );
}
