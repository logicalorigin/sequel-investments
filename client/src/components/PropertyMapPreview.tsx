/// <reference types="google.maps" />
import { useState, useCallback, useEffect, useRef } from "react";
import { Map, useMap, Marker, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Globe,
  DollarSign,
  TrendingUp,
  Loader2,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Home,
  ShoppingCart,
  Train,
  GraduationCap,
  Utensils,
  Building2
} from "lucide-react";
import { useGoogleMapsApiKey } from "@/components/GoogleMapsProvider";

type PlaceType = "grocery" | "transit" | "school" | "restaurant" | "hospital";

interface PropertyMapPreviewProps {
  latitude: number;
  longitude: number;
  address: string;
  estimatedValue?: number;
  valueLow?: number;
  valueHigh?: number;
  isLoadingValue?: boolean;
  valueSource?: string;
  className?: string;
}

type MapType = "satellite" | "roadmap" | "hybrid";

function MapControls({ 
  onToggleMapType, 
  onToggleFullscreen,
  onZoomIn,
  onZoomOut,
  mapType,
  isFullscreen 
}: { 
  onToggleMapType: () => void; 
  onToggleFullscreen: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  mapType: MapType;
  isFullscreen: boolean;
}) {
  return (
    <>
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 bg-white/90 hover:bg-white shadow-md"
          onClick={onToggleFullscreen}
          data-testid="button-toggle-fullscreen"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
      <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1">
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 bg-white/90 hover:bg-white shadow-md"
          onClick={onZoomIn}
          data-testid="button-zoom-in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 bg-white/90 hover:bg-white shadow-md"
          onClick={onZoomOut}
          data-testid="button-zoom-out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 bg-white/90 hover:bg-white shadow-md"
          onClick={onToggleMapType}
          data-testid="button-toggle-map-type"
        >
          <Globe className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}

interface NearbyPlace {
  name: string;
  location: { lat: number; lng: number };
  type: PlaceType;
  rating?: number;
  distance?: string;
}

function PropertyMarker({ latitude, longitude }: { latitude: number; longitude: number }) {
  const coreLib = useMapsLibrary("core");
  
  if (!coreLib) {
    return null;
  }

  return (
    <Marker
      position={{ lat: latitude, lng: longitude }}
      title="Subject Property"
      icon={{
        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
        fillColor: "#16a34a",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
        scale: 1.8,
        anchor: new coreLib.Point(12, 22),
      }}
    />
  );
}

function NearbyPlaceMarker({ place }: { place: NearbyPlace }) {
  const coreLib = useMapsLibrary("core");
  
  const getMarkerColor = (type: PlaceType) => {
    switch (type) {
      case "grocery": return "#f97316";
      case "transit": return "#3b82f6";
      case "school": return "#8b5cf6";
      case "restaurant": return "#ef4444";
      case "hospital": return "#ec4899";
      default: return "#6b7280";
    }
  };

  if (!coreLib) {
    return null;
  }

  return (
    <Marker
      position={place.location}
      title={`${place.name}${place.rating ? ` (${place.rating}★)` : ""}`}
      icon={{
        path: coreLib.SymbolPath.CIRCLE,
        fillColor: getMarkerColor(place.type),
        fillOpacity: 0.9,
        strokeColor: "#ffffff",
        strokeWeight: 2,
        scale: 8,
      }}
    />
  );
}

function LayerTogglePanel({ 
  activeLayers, 
  onToggleLayer,
  isLoading
}: { 
  activeLayers: Set<PlaceType>;
  onToggleLayer: (layer: PlaceType) => void;
  isLoading: boolean;
}) {
  const layers: { type: PlaceType; icon: typeof ShoppingCart; label: string }[] = [
    { type: "grocery", icon: ShoppingCart, label: "Grocery" },
    { type: "transit", icon: Train, label: "Transit" },
    { type: "school", icon: GraduationCap, label: "Schools" },
    { type: "restaurant", icon: Utensils, label: "Dining" },
    { type: "hospital", icon: Building2, label: "Medical" },
  ];

  return (
    <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1">
      {layers.map(({ type, icon: Icon, label }) => (
        <Button
          key={type}
          size="sm"
          variant={activeLayers.has(type) ? "default" : "secondary"}
          className={`h-7 px-2 text-xs shadow-md ${
            activeLayers.has(type) 
              ? "bg-primary text-primary-foreground" 
              : "bg-white/90 hover:bg-white"
          }`}
          onClick={() => onToggleLayer(type)}
          disabled={isLoading}
          data-testid={`button-toggle-${type}`}
        >
          <Icon className="h-3 w-3 mr-1" />
          {label}
        </Button>
      ))}
    </div>
  );
}

function MapControlsWithHook({ 
  isFullscreen,
  onToggleFullscreen
}: { 
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}) {
  const map = useMap();
  const [currentMapType, setCurrentMapType] = useState<MapType>("satellite");

  const handleZoomIn = useCallback(() => {
    if (map) {
      const currentZoom = map.getZoom() || 18;
      map.setZoom(Math.min(currentZoom + 1, 21));
    }
  }, [map]);

  const handleZoomOut = useCallback(() => {
    if (map) {
      const currentZoom = map.getZoom() || 18;
      map.setZoom(Math.max(currentZoom - 1, 10));
    }
  }, [map]);

  const handleToggleMapType = useCallback(() => {
    if (map) {
      const newMapType: MapType = currentMapType === "satellite" 
        ? "hybrid" 
        : currentMapType === "hybrid" 
          ? "roadmap" 
          : "satellite";
      setCurrentMapType(newMapType);
      map.setMapTypeId(newMapType);
    }
  }, [map, currentMapType]);

  return (
    <>
      <MapControls 
        onToggleMapType={handleToggleMapType}
        onToggleFullscreen={onToggleFullscreen}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        mapType={currentMapType}
        isFullscreen={isFullscreen}
      />
      <div className="absolute top-3 left-3 z-10">
        <Badge variant="secondary" className="bg-white/90 text-foreground shadow-sm text-xs">
          {currentMapType === "satellite" ? "Satellite" : currentMapType === "hybrid" ? "Hybrid" : "Map"}
        </Badge>
      </div>
    </>
  );
}

function useNearbyPlaces(
  latitude: number, 
  longitude: number, 
  activeLayers: Set<PlaceType>
) {
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const placesLib = useMapsLibrary("places");
  const map = useMap();

  useEffect(() => {
    if (!placesLib || !map || activeLayers.size === 0) {
      setPlaces([]);
      setIsLoading(false);
      return;
    }

    const searchPlaces = async () => {
      setIsLoading(true);
      const allPlaces: NearbyPlace[] = [];
      
      const typeMapping: Record<PlaceType, string[]> = {
        grocery: ["grocery_or_supermarket", "supermarket"],
        transit: ["transit_station", "subway_station", "bus_station"],
        school: ["school", "primary_school", "secondary_school"],
        restaurant: ["restaurant", "cafe"],
        hospital: ["hospital", "pharmacy", "doctor"],
      };

      const service = new placesLib.PlacesService(map);
      const layersArray = Array.from(activeLayers);
      
      for (let i = 0; i < layersArray.length; i++) {
        const layer = layersArray[i];
        const types = typeMapping[layer];
        const type = types[0];
        
        try {
          const results = await new Promise<google.maps.places.PlaceResult[]>((resolve) => {
            service.nearbySearch(
              {
                location: { lat: latitude, lng: longitude },
                radius: 1500,
                type: type,
              },
              (
                searchResults: google.maps.places.PlaceResult[] | null, 
                status: google.maps.places.PlacesServiceStatus
              ) => {
                if (status === placesLib.PlacesServiceStatus.OK && searchResults) {
                  resolve(searchResults.slice(0, 5));
                } else {
                  resolve([]);
                }
              }
            );
          });

          for (let j = 0; j < results.length; j++) {
            const result = results[j];
            if (result.geometry?.location) {
              allPlaces.push({
                name: result.name || "Unknown",
                location: {
                  lat: result.geometry.location.lat(),
                  lng: result.geometry.location.lng(),
                },
                type: layer,
                rating: result.rating,
              });
            }
          }
        } catch (error) {
          console.error("Error fetching nearby places:", error);
        }
      }
      
      setPlaces(allPlaces);
      setIsLoading(false);
    };

    searchPlaces();
  }, [placesLib, map, latitude, longitude, activeLayers]);

  return { places, isLoading };
}

function PropertyMapView({ 
  latitude, 
  longitude, 
  isFullscreen,
  onToggleFullscreen
}: { 
  latitude: number; 
  longitude: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}) {
  const [activeLayers, setActiveLayers] = useState<Set<PlaceType>>(new Set());
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const isLoadingRef = useRef(false);
  
  const toggleLayer = useCallback((layer: PlaceType) => {
    if (isLoadingRef.current) {
      return;
    }
    
    setActiveLayers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(layer)) {
        newSet.delete(layer);
      } else {
        newSet.add(layer);
      }
      return newSet;
    });
  }, []);

  const handleLoadingChange = useCallback((loading: boolean) => {
    isLoadingRef.current = loading;
    setIsLoadingPlaces(loading);
  }, []);

  const containerClasses = isFullscreen 
    ? "fixed inset-0 z-50 bg-background" 
    : "relative w-full h-64 rounded-lg overflow-hidden";

  return (
    <div className={containerClasses}>
      <Map
        style={{ width: "100%", height: "100%" }}
        defaultCenter={{ lat: latitude, lng: longitude }}
        defaultZoom={18}
        mapTypeId="satellite"
        gestureHandling="greedy"
        disableDefaultUI={true}
        zoomControl={false}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        clickableIcons={false}
      >
        <PropertyMarker latitude={latitude} longitude={longitude} />
        <NearbyPlacesLayer 
          latitude={latitude} 
          longitude={longitude} 
          activeLayers={activeLayers}
          onLoadingChange={handleLoadingChange}
        />
        <MapControlsWithHook 
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
        />
        <LayerTogglePanel 
          activeLayers={activeLayers} 
          onToggleLayer={toggleLayer}
          isLoading={isLoadingPlaces}
        />
      </Map>
    </div>
  );
}

function NearbyPlacesLayer({ 
  latitude, 
  longitude, 
  activeLayers,
  onLoadingChange
}: { 
  latitude: number; 
  longitude: number; 
  activeLayers: Set<PlaceType>;
  onLoadingChange: (loading: boolean) => void;
}) {
  const { places, isLoading } = useNearbyPlaces(latitude, longitude, activeLayers);
  
  useEffect(() => {
    onLoadingChange(isLoading);
  }, [isLoading, onLoadingChange]);
  
  useEffect(() => {
    return () => {
      onLoadingChange(false);
    };
  }, [onLoadingChange]);
  
  return (
    <>
      {places.map((place, index) => (
        <NearbyPlaceMarker key={`${place.type}-${index}`} place={place} />
      ))}
    </>
  );
}

function FallbackMapView({ address }: { address: string }) {
  return (
    <div className="relative w-full h-64 bg-muted rounded-lg flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <MapPin className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm font-medium truncate max-w-[200px]">{address}</p>
        <p className="text-xs">Map unavailable</p>
      </div>
    </div>
  );
}

function ValueEstimateDisplay({
  estimatedValue,
  valueLow,
  valueHigh,
  isLoadingValue,
  valueSource,
}: {
  estimatedValue?: number;
  valueLow?: number;
  valueHigh?: number;
  isLoadingValue?: boolean;
  valueSource?: string;
}) {
  if (isLoadingValue) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Fetching value estimate...</span>
      </div>
    );
  }

  if (!estimatedValue) {
    return null;
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-primary" />
        <span className="text-lg font-bold text-primary" data-testid="text-estimated-value">
          ${estimatedValue.toLocaleString()}
        </span>
        <Badge variant="outline" className="text-xs">
          <TrendingUp className="h-3 w-3 mr-1" />
          Est. Value
        </Badge>
      </div>
      {valueLow && valueHigh && (
        <p className="text-xs text-muted-foreground pl-6">
          Range: ${valueLow.toLocaleString()} - ${valueHigh.toLocaleString()}
        </p>
      )}
      {valueSource && (
        <p className="text-xs text-muted-foreground pl-6">
          Source: {valueSource}
        </p>
      )}
    </div>
  );
}

export function PropertyMapPreview({
  latitude,
  longitude,
  address,
  estimatedValue,
  valueLow,
  valueHigh,
  isLoadingValue,
  valueSource,
  className = "",
}: PropertyMapPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const apiKey = useGoogleMapsApiKey();

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const hasValidCoordinates = latitude !== 0 && longitude !== 0;

  return (
    <div className={`space-y-3 ${className}`} data-testid="property-map-preview">
      {hasValidCoordinates && apiKey ? (
        <PropertyMapView
          latitude={latitude}
          longitude={longitude}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      ) : hasValidCoordinates ? (
        <FallbackMapView address={address} />
      ) : null}

      {address && !isFullscreen && (
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground" data-testid="text-property-address">
            {address}
          </p>
        </div>
      )}

      {!isFullscreen && (
        <ValueEstimateDisplay
          estimatedValue={estimatedValue}
          valueLow={valueLow}
          valueHigh={valueHigh}
          isLoadingValue={isLoadingValue}
          valueSource={valueSource}
        />
      )}
    </div>
  );
}

export function PropertyMapPreviewSkeleton() {
  return (
    <div className="space-y-3">
      <div className="w-full h-64 bg-muted rounded-lg animate-pulse" />
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse flex-1" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 bg-muted rounded animate-pulse" />
        <div className="h-6 bg-muted rounded animate-pulse w-32" />
      </div>
    </div>
  );
}

export default PropertyMapPreview;
