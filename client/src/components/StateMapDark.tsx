import { useState, useEffect, useCallback, useRef } from "react";
import { Map, Marker, useApiIsLoaded, useMap } from "@vis.gl/react-google-maps";
import { darkMapStyles, STATE_CENTERS } from "@/lib/mapStyles";
import { getStateBoundary } from "@/lib/stateBoundaries";
import type { MarketDetail } from "@/data/marketDetails";
import { Home, TrendingUp, DollarSign, Sparkles } from "lucide-react";

// Component to draw state boundary polygon
function StateBoundaryPolygon({ stateSlug }: { stateSlug: string }) {
  const map = useMap();
  const polygonRef = useRef<google.maps.Polygon | null>(null);

  useEffect(() => {
    if (!map) return;

    const boundary = getStateBoundary(stateSlug);
    if (!boundary) return;

    // Create the polygon
    const polygon = new google.maps.Polygon({
      paths: boundary.coordinates,
      strokeColor: "#b45309",
      strokeOpacity: 0.9,
      strokeWeight: 2,
      fillColor: "#b45309",
      fillOpacity: 0.6,
      map: map,
    });

    polygonRef.current = polygon;

    // Cleanup
    return () => {
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
        polygonRef.current = null;
      }
    };
  }, [map, stateSlug]);

  return null;
}

interface StateMapDarkProps {
  stateSlug: string;
  stateName: string;
  markets?: MarketDetail[];
  selectedMarket?: MarketDetail | null;
  hoveredMarket?: MarketDetail | null;
  onMarkerClick?: (market: MarketDetail) => void;
  onMarkerHover?: (market: MarketDetail | null) => void;
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function StateMapDark({
  stateSlug,
  stateName,
  markets = [],
  selectedMarket,
  hoveredMarket,
  onMarkerClick,
  onMarkerHover,
  className = "",
}: StateMapDarkProps) {
  const [activeMarket, setActiveMarket] = useState<MarketDetail | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const apiIsLoaded = useApiIsLoaded();

  const stateCenter = STATE_CENTERS[stateSlug] || { lat: 39.8283, lng: -98.5795, zoom: 4 };
  
  // Use a slightly zoomed out view to show more US context (grey surrounding states)
  const displayZoom = Math.max(stateCenter.zoom - 0.5, 4);

  const handleMarkerClick = useCallback((market: MarketDetail) => {
    if (onMarkerClick) {
      onMarkerClick(market);
    }
    setActiveMarket(prev => prev?.id === market.id ? null : market);
  }, [onMarkerClick]);

  const handleMarkerMouseEnter = useCallback((market: MarketDetail) => {
    if (onMarkerHover) {
      onMarkerHover(market);
    }
    if (!selectedMarket) {
      setActiveMarket(market);
    }
  }, [onMarkerHover, selectedMarket]);

  const handleMarkerMouseLeave = useCallback(() => {
    if (onMarkerHover) {
      onMarkerHover(null);
    }
    if (!selectedMarket) {
      setActiveMarket(null);
    }
  }, [onMarkerHover, selectedMarket]);

  useEffect(() => {
    if (selectedMarket) {
      setActiveMarket(selectedMarket);
    }
  }, [selectedMarket]);

  return (
    <div className={`relative w-full h-[400px] md:h-[500px] lg:h-[550px] rounded-xl overflow-hidden ${className}`}>
      <Map
        defaultCenter={{ lat: stateCenter.lat, lng: stateCenter.lng }}
        defaultZoom={displayZoom}
        styles={darkMapStyles}
        disableDefaultUI={true}
        zoomControl={true}
        scrollwheel={true}
        gestureHandling="cooperative"
        onTilesLoaded={() => setMapLoaded(true)}
      >
        {/* State boundary polygon filled with amber/gold theme color */}
        {apiIsLoaded && <StateBoundaryPolygon stateSlug={stateSlug} />}
        
        {apiIsLoaded && markets.map((market, index) => {
          const isSelected = selectedMarket?.id === market.id;
          const isHovered = hoveredMarket?.id === market.id;
          const isActive = isSelected || isHovered || activeMarket?.id === market.id;
          const size = isActive ? 52 : 44;
          const anchor = isActive ? 26 : 22;

          return (
            <Marker
              key={market.id}
              position={{ lat: market.lat, lng: market.lng }}
              onClick={() => handleMarkerClick(market)}
              onMouseOver={() => handleMarkerMouseEnter(market)}
              onMouseOut={handleMarkerMouseLeave}
              icon={{
                url: `data:image/svg+xml,${encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 52 52">
                    <defs>
                      <filter id="shadow${market.id}" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.5"/>
                      </filter>
                      <linearGradient id="grad${market.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:${isActive ? '#fbbf24' : index === 0 ? '#f59e0b' : index === 1 ? '#d97706' : '#b45309'};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${isActive ? '#f59e0b' : index === 0 ? '#d97706' : index === 1 ? '#b45309' : '#92400e'};stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <circle cx="26" cy="26" r="${isActive ? 22 : 18}" fill="url(#grad${market.id})" filter="url(#shadow${market.id})" stroke="${isActive ? '#fef3c7' : '#78350f'}" stroke-width="${isActive ? 3 : 2}"/>
                    <text x="26" y="31" text-anchor="middle" fill="${isActive ? '#0f172a' : '#fef3c7'}" font-size="15" font-weight="bold" font-family="system-ui, sans-serif">${index + 1}</text>
                  </svg>
                `)}`,
                scaledSize: new google.maps.Size(size, size),
                anchor: new google.maps.Point(anchor, anchor),
              }}
              zIndex={isActive ? 1000 : 100 - index}
            />
          );
        })}
      </Map>

      {/* Floating info card when market is active */}
      {activeMarket && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72 bg-slate-900/95 backdrop-blur-sm border border-amber-500/30 rounded-lg p-4 shadow-xl z-10">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h4 className="font-bold text-amber-400 text-lg">{activeMarket.name}</h4>
            {activeMarket.strFriendliness.tier === "Excellent" && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                <Sparkles className="w-3 h-3" />
                STR Friendly
              </span>
            )}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" /> Median Price
              </span>
              <span className="font-semibold text-white">{formatCurrency(activeMarket.realEstate.medianPrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> YoY Growth
              </span>
              <span className="font-semibold text-green-400">+{activeMarket.realEstate.priceGrowth.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Avg Rent
              </span>
              <span className="font-semibold text-white">{formatCurrency(activeMarket.realEstate.avgRent)}/mo</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-700/50 text-center">
            <span className="text-xs text-amber-400/70">Click market card for full analysis</span>
          </div>
        </div>
      )}

      {/* Loading state */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <span className="text-amber-400/80 text-sm">Loading {stateName} map...</span>
          </div>
        </div>
      )}

      {/* Simple edge gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-slate-900/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-900/60 to-transparent" />
      </div>
    </div>
  );
}
