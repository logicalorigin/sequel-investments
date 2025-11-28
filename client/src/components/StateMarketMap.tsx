import { useState, useCallback, useEffect } from "react";
import { Map, useMap, Marker, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  ZoomIn, 
  ZoomOut,
  MapPin,
  Loader2,
  Layers,
  Navigation
} from "lucide-react";
import { useGoogleMapsApiKey } from "@/components/GoogleMapsProvider";
import type { MarketDetail } from "@/data/marketDetails";

type MapType = "roadmap" | "satellite" | "hybrid" | "terrain";

interface StateMarketMapProps {
  stateSlug: string;
  stateName: string;
  markets: MarketDetail[];
  selectedMarket: MarketDetail | null;
  hoveredMarket: MarketDetail | null;
  onMarkerClick: (market: MarketDetail) => void;
  onMarkerHover: (market: MarketDetail | null) => void;
  className?: string;
}

interface StateBounds {
  north: number;
  south: number;
  east: number;
  west: number;
  center: { lat: number; lng: number };
  zoom: number;
}

const STATE_BOUNDS: Record<string, StateBounds> = {
  california: { north: 42.0, south: 32.5, east: -114.0, west: -124.5, center: { lat: 36.7783, lng: -119.4179 }, zoom: 5.5 },
  texas: { north: 36.5, south: 25.8, east: -93.5, west: -106.7, center: { lat: 31.0, lng: -100.0 }, zoom: 5.5 },
  florida: { north: 31.0, south: 24.5, east: -80.0, west: -87.6, center: { lat: 27.6648, lng: -81.5158 }, zoom: 6 },
  "new-york": { north: 45.0, south: 40.5, east: -71.9, west: -79.8, center: { lat: 42.1657, lng: -74.9481 }, zoom: 6 },
  arizona: { north: 37.0, south: 31.3, east: -109.0, west: -114.8, center: { lat: 34.0489, lng: -111.0937 }, zoom: 6 },
  colorado: { north: 41.0, south: 37.0, east: -102.0, west: -109.1, center: { lat: 39.0598, lng: -105.3111 }, zoom: 6.5 },
  georgia: { north: 35.0, south: 30.4, east: -80.8, west: -85.6, center: { lat: 32.1656, lng: -82.9001 }, zoom: 6.5 },
  nevada: { north: 42.0, south: 35.0, east: -114.0, west: -120.0, center: { lat: 38.8026, lng: -116.4194 }, zoom: 6 },
  "north-carolina": { north: 36.6, south: 33.8, east: -75.5, west: -84.3, center: { lat: 35.7596, lng: -79.0193 }, zoom: 6.5 },
  tennessee: { north: 36.7, south: 35.0, east: -81.6, west: -90.3, center: { lat: 35.5175, lng: -86.5804 }, zoom: 6.5 },
  washington: { north: 49.0, south: 45.5, east: -116.9, west: -124.8, center: { lat: 47.7511, lng: -120.7401 }, zoom: 6 },
  oregon: { north: 46.3, south: 42.0, east: -116.5, west: -124.6, center: { lat: 43.8041, lng: -120.5542 }, zoom: 6 },
  virginia: { north: 39.5, south: 36.5, east: -75.2, west: -83.7, center: { lat: 37.4316, lng: -78.6569 }, zoom: 6.5 },
  massachusetts: { north: 42.9, south: 41.2, east: -69.9, west: -73.5, center: { lat: 42.4072, lng: -71.3824 }, zoom: 7.5 },
  default: { north: 49.0, south: 25.0, east: -66.0, west: -124.0, center: { lat: 39.8283, lng: -98.5795 }, zoom: 4 },
};

function MarketMarker({ 
  market, 
  isSelected, 
  isHovered,
  onClick,
  onHover 
}: { 
  market: MarketDetail;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}) {
  const coreLib = useMapsLibrary("core");
  
  if (!coreLib) return null;

  const scale = isSelected ? 1.4 : isHovered ? 1.2 : 1;
  const fillColor = isSelected ? "#16a34a" : isHovered ? "#22c55e" : "#0d9488";
  const strokeColor = isSelected || isHovered ? "#ffffff" : "#ffffff";
  const strokeWeight = isSelected || isHovered ? 3 : 2;

  return (
    <Marker
      position={{ lat: market.lat, lng: market.lng }}
      title={market.name}
      onClick={onClick}
      onMouseOver={() => onHover(true)}
      onMouseOut={() => onHover(false)}
      icon={{
        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
        fillColor,
        fillOpacity: 1,
        strokeColor,
        strokeWeight,
        scale: 1.5 * scale,
        anchor: new coreLib.Point(12, 22),
      }}
    />
  );
}

function RankMarker({ 
  market, 
  isSelected, 
  isHovered,
  onClick,
  onHover 
}: { 
  market: MarketDetail;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}) {
  const coreLib = useMapsLibrary("core");
  
  if (!coreLib) return null;

  const scale = isSelected ? 16 : isHovered ? 14 : 12;
  const fillColor = isSelected ? "#16a34a" : isHovered ? "#22c55e" : market.rank === 1 ? "#0d9488" : market.rank <= 3 ? "#14b8a6" : "#5eead4";

  return (
    <Marker
      position={{ lat: market.lat, lng: market.lng }}
      title={`${market.rank}. ${market.name}`}
      onClick={onClick}
      onMouseOver={() => onHover(true)}
      onMouseOut={() => onHover(false)}
      label={{
        text: market.rank.toString(),
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: isSelected || isHovered ? "14px" : "12px",
      }}
      icon={{
        path: coreLib.SymbolPath.CIRCLE,
        fillColor,
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: isSelected || isHovered ? 3 : 2,
        scale,
      }}
    />
  );
}

function MapControls({ 
  onToggleMapType, 
  onZoomIn,
  onZoomOut,
  onResetView,
  mapType,
}: { 
  onToggleMapType: () => void; 
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  mapType: MapType;
}) {
  return (
    <>
      <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1">
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 bg-white/90 hover:bg-white shadow-md dark:bg-gray-800/90 dark:hover:bg-gray-800"
          onClick={onResetView}
          title="Reset View"
          data-testid="button-reset-view"
        >
          <Navigation className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 bg-white/90 hover:bg-white shadow-md dark:bg-gray-800/90 dark:hover:bg-gray-800"
          onClick={onZoomIn}
          title="Zoom In"
          data-testid="button-zoom-in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 bg-white/90 hover:bg-white shadow-md dark:bg-gray-800/90 dark:hover:bg-gray-800"
          onClick={onZoomOut}
          title="Zoom Out"
          data-testid="button-zoom-out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 bg-white/90 hover:bg-white shadow-md dark:bg-gray-800/90 dark:hover:bg-gray-800"
          onClick={onToggleMapType}
          title={`Map: ${mapType}`}
          data-testid="button-toggle-map-type"
        >
          {mapType === "satellite" || mapType === "hybrid" ? <Globe className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
        </Button>
      </div>
    </>
  );
}

function MapContent({ 
  markets, 
  selectedMarket, 
  hoveredMarket,
  onMarkerClick,
  onMarkerHover,
  stateBounds,
}: {
  markets: MarketDetail[];
  selectedMarket: MarketDetail | null;
  hoveredMarket: MarketDetail | null;
  onMarkerClick: (market: MarketDetail) => void;
  onMarkerHover: (market: MarketDetail | null) => void;
  stateBounds: StateBounds;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    
    if (selectedMarket) {
      map.panTo({ lat: selectedMarket.lat, lng: selectedMarket.lng });
      map.setZoom(10);
    }
  }, [map, selectedMarket]);

  const handleResetView = useCallback(() => {
    if (!map) return;
    map.panTo(stateBounds.center);
    map.setZoom(stateBounds.zoom);
  }, [map, stateBounds]);

  return (
    <>
      {markets.map((market) => (
        <RankMarker
          key={market.id}
          market={market}
          isSelected={selectedMarket?.id === market.id}
          isHovered={hoveredMarket?.id === market.id}
          onClick={() => onMarkerClick(market)}
          onHover={(hovered) => onMarkerHover(hovered ? market : null)}
        />
      ))}
    </>
  );
}

export function StateMarketMap({
  stateSlug,
  stateName,
  markets,
  selectedMarket,
  hoveredMarket,
  onMarkerClick,
  onMarkerHover,
  className = "",
}: StateMarketMapProps) {
  const apiKey = useGoogleMapsApiKey();
  const [mapType, setMapType] = useState<MapType>("roadmap");
  const [isLoading, setIsLoading] = useState(true);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  const stateBounds = STATE_BOUNDS[stateSlug] || STATE_BOUNDS.default;

  const handleToggleMapType = useCallback(() => {
    setMapType(current => {
      const types: MapType[] = ["roadmap", "terrain", "satellite", "hybrid"];
      const currentIndex = types.indexOf(current);
      return types[(currentIndex + 1) % types.length];
    });
  }, []);

  const handleZoomIn = useCallback(() => {
    if (mapInstance) {
      const currentZoom = mapInstance.getZoom() || stateBounds.zoom;
      mapInstance.setZoom(currentZoom + 1);
    }
  }, [mapInstance, stateBounds.zoom]);

  const handleZoomOut = useCallback(() => {
    if (mapInstance) {
      const currentZoom = mapInstance.getZoom() || stateBounds.zoom;
      mapInstance.setZoom(Math.max(currentZoom - 1, 4));
    }
  }, [mapInstance, stateBounds.zoom]);

  const handleResetView = useCallback(() => {
    if (mapInstance) {
      mapInstance.panTo(stateBounds.center);
      mapInstance.setZoom(stateBounds.zoom);
    }
  }, [mapInstance, stateBounds]);

  if (!apiKey) {
    return (
      <div className={`relative aspect-[4/3] flex items-center justify-center bg-muted/30 rounded-lg ${className}`}>
        <div className="text-center text-muted-foreground">
          <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">{stateName}</p>
          <p className="text-sm mt-1">Map unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative aspect-[4/3] rounded-lg overflow-hidden ${className}`} data-testid="state-market-map">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      <Map
        defaultCenter={stateBounds.center}
        defaultZoom={stateBounds.zoom}
        mapTypeId={mapType}
        gestureHandling="cooperative"
        disableDefaultUI={true}
        clickableIcons={false}
        onTilesLoaded={() => setIsLoading(false)}
        onIdle={(e) => setMapInstance(e.map)}
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
      >
        <MapContent
          markets={markets}
          selectedMarket={selectedMarket}
          hoveredMarket={hoveredMarket}
          onMarkerClick={onMarkerClick}
          onMarkerHover={onMarkerHover}
          stateBounds={stateBounds}
        />
      </Map>

      <MapControls
        onToggleMapType={handleToggleMapType}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        mapType={mapType}
      />

      {hoveredMarket && !selectedMarket && (
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border shadow-lg rounded-lg px-3 py-2">
          <p className="font-semibold text-sm flex items-center gap-2">
            <Badge variant="outline" className="h-5 w-5 p-0 justify-center text-xs">
              {hoveredMarket.rank}
            </Badge>
            {hoveredMarket.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click to view details
          </p>
        </div>
      )}

      {selectedMarket && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-primary text-primary-foreground shadow-md">
            <MapPin className="h-3 w-3 mr-1" />
            {selectedMarket.name}
          </Badge>
        </div>
      )}

      <div className="absolute top-3 right-3 z-10">
        <Badge variant="secondary" className="text-xs bg-white/90 dark:bg-gray-800/90 shadow-sm">
          {mapType === "roadmap" ? "Map" : mapType === "terrain" ? "Terrain" : mapType === "satellite" ? "Satellite" : "Hybrid"}
        </Badge>
      </div>
    </div>
  );
}

export default StateMarketMap;
