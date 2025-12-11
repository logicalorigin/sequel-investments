import { useState, useEffect, useCallback } from "react";
import { Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import { darkMapStyles, STATE_CENTERS } from "@/lib/mapStyles";
import type { MarketDetail } from "@/data/marketDetails";
import { Badge } from "@/components/ui/badge";
import { Home, TrendingUp, DollarSign, Sparkles } from "lucide-react";

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
  const [infoWindowMarket, setInfoWindowMarket] = useState<MarketDetail | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const stateCenter = STATE_CENTERS[stateSlug] || { lat: 39.8283, lng: -98.5795, zoom: 4 };

  const handleMarkerClick = useCallback((market: MarketDetail) => {
    if (onMarkerClick) {
      onMarkerClick(market);
    }
    setInfoWindowMarket(market);
  }, [onMarkerClick]);

  const handleMarkerMouseEnter = useCallback((market: MarketDetail) => {
    if (onMarkerHover) {
      onMarkerHover(market);
    }
  }, [onMarkerHover]);

  const handleMarkerMouseLeave = useCallback(() => {
    if (onMarkerHover) {
      onMarkerHover(null);
    }
  }, [onMarkerHover]);

  useEffect(() => {
    if (selectedMarket) {
      setInfoWindowMarket(selectedMarket);
    } else {
      setInfoWindowMarket(null);
    }
  }, [selectedMarket]);

  return (
    <div className={`relative w-full h-[400px] md:h-[500px] lg:h-[550px] rounded-xl overflow-hidden ${className}`}>
      <Map
        defaultCenter={{ lat: stateCenter.lat, lng: stateCenter.lng }}
        defaultZoom={stateCenter.zoom}
        styles={darkMapStyles}
        disableDefaultUI={true}
        zoomControl={true}
        scrollwheel={true}
        gestureHandling="cooperative"
        onTilesLoaded={() => setMapLoaded(true)}
        mapId="dark-state-map"
      >
        {markets.map((market, index) => {
          const isSelected = selectedMarket?.id === market.id;
          const isHovered = hoveredMarket?.id === market.id;
          const isActive = isSelected || isHovered;

          return (
            <Marker
              key={market.id}
              position={{ lat: market.lat, lng: market.lng }}
              onClick={() => handleMarkerClick(market)}
              onMouseOver={() => handleMarkerMouseEnter(market)}
              onMouseOut={handleMarkerMouseLeave}
              icon={{
                url: `data:image/svg+xml,${encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="${isActive ? 48 : 40}" height="${isActive ? 48 : 40}" viewBox="0 0 48 48">
                    <defs>
                      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.4"/>
                      </filter>
                    </defs>
                    <circle cx="24" cy="24" r="${isActive ? 20 : 16}" fill="${isActive ? '#f59e0b' : index === 0 ? '#f59e0b' : index === 1 ? '#d97706' : '#92400e'}" filter="url(#shadow)" stroke="${isActive ? '#fbbf24' : 'transparent'}" stroke-width="${isActive ? 3 : 0}"/>
                    <text x="24" y="28" text-anchor="middle" fill="${isActive || index < 2 ? '#0f172a' : '#fef3c7'}" font-size="14" font-weight="bold" font-family="system-ui, sans-serif">${index + 1}</text>
                  </svg>
                `)}`,
                scaledSize: new google.maps.Size(isActive ? 48 : 40, isActive ? 48 : 40),
                anchor: new google.maps.Point(isActive ? 24 : 20, isActive ? 24 : 20),
              }}
              zIndex={isActive ? 1000 : 100 - index}
              data-testid={`marker-${market.name.toLowerCase().replace(/\s+/g, '-')}`}
            />
          );
        })}

        {infoWindowMarket && (
          <InfoWindow
            position={{ lat: infoWindowMarket.lat, lng: infoWindowMarket.lng }}
            onCloseClick={() => setInfoWindowMarket(null)}
            pixelOffset={new google.maps.Size(0, -25)}
          >
            <div className="p-3 min-w-[200px] max-w-[280px] bg-slate-900 text-white rounded-lg">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="font-bold text-amber-400 text-lg">{infoWindowMarket.name}</h4>
                {infoWindowMarket.strFriendliness.tier === "Excellent" && (
                  <span className="inline-flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    STR
                  </span>
                )}
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Home className="w-3 h-3" /> Median
                  </span>
                  <span className="font-semibold">{formatCurrency(infoWindowMarket.realEstate.medianPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Growth
                  </span>
                  <span className="font-semibold text-green-400">+{infoWindowMarket.realEstate.priceGrowth.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Rent
                  </span>
                  <span className="font-semibold">{formatCurrency(infoWindowMarket.realEstate.avgRent)}/mo</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-700 text-center">
                <span className="text-xs text-amber-400/80">Click for detailed analysis</span>
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>

      {!mapLoaded && (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <span className="text-amber-400/80 text-sm">Loading {stateName} map...</span>
          </div>
        </div>
      )}
    </div>
  );
}
