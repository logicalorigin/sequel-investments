import { useState, useCallback } from "react";
import { Map } from "@vis.gl/react-google-maps";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Globe,
  DollarSign,
  TrendingUp,
  Loader2,
  ExternalLink
} from "lucide-react";
import { useGoogleMapsApiKey } from "@/components/GoogleMapsProvider";

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

function MapTypeToggle({ onToggle, mapType }: { onToggle: () => void; mapType: MapType }) {
  return (
    <Button
      size="icon"
      variant="secondary"
      className="absolute bottom-3 right-3 z-10 h-8 w-8 bg-white/90 hover:bg-white shadow-md"
      onClick={onToggle}
      data-testid="button-toggle-map-type"
    >
      <Globe className="h-4 w-4" />
    </Button>
  );
}

function CenterPinOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="relative">
        <div 
          className="w-6 h-6 bg-primary rounded-full border-3 border-white shadow-lg"
          style={{ 
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            border: "3px solid white"
          }}
        />
        <div 
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/30 rounded-full blur-sm"
        />
      </div>
    </div>
  );
}

function PropertyMapView({ 
  latitude, 
  longitude, 
  mapType,
  onMapTypeToggle 
}: { 
  latitude: number; 
  longitude: number;
  mapType: MapType;
  onMapTypeToggle: () => void;
}) {
  return (
    <div className="relative w-full h-40 rounded-lg overflow-hidden">
      <Map
        key={mapType}
        style={{ width: "100%", height: "100%" }}
        defaultCenter={{ lat: latitude, lng: longitude }}
        defaultZoom={18}
        mapTypeId={mapType}
        gestureHandling="none"
        disableDefaultUI={true}
        zoomControl={false}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        clickableIcons={false}
      />
      <CenterPinOverlay />
      <MapTypeToggle onToggle={onMapTypeToggle} mapType={mapType} />
      <div className="absolute top-3 left-3 z-10">
        <Badge variant="secondary" className="bg-white/90 text-foreground shadow-sm text-xs">
          {mapType === "satellite" ? "Satellite" : mapType === "hybrid" ? "Hybrid" : "Map"}
        </Badge>
      </div>
    </div>
  );
}

function FallbackMapView({ address }: { address: string }) {
  return (
    <div className="relative w-full h-40 bg-muted rounded-lg flex items-center justify-center">
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
  const [mapType, setMapType] = useState<MapType>("satellite");
  const apiKey = useGoogleMapsApiKey();

  const toggleMapType = useCallback(() => {
    setMapType((prev) => {
      if (prev === "satellite") return "hybrid";
      if (prev === "hybrid") return "roadmap";
      return "satellite";
    });
  }, []);

  const hasValidCoordinates = latitude !== 0 && longitude !== 0;

  return (
    <div className={`space-y-3 ${className}`} data-testid="property-map-preview">
      {hasValidCoordinates && apiKey ? (
        <PropertyMapView
          latitude={latitude}
          longitude={longitude}
          mapType={mapType}
          onMapTypeToggle={toggleMapType}
        />
      ) : hasValidCoordinates ? (
        <FallbackMapView address={address} />
      ) : null}

      {address && (
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground" data-testid="text-property-address">
            {address}
          </p>
        </div>
      )}

      <ValueEstimateDisplay
        estimatedValue={estimatedValue}
        valueLow={valueLow}
        valueHigh={valueHigh}
        isLoadingValue={isLoadingValue}
        valueSource={valueSource}
      />
    </div>
  );
}

export function PropertyMapPreviewSkeleton() {
  return (
    <div className="space-y-3">
      <div className="w-full h-40 bg-muted rounded-lg animate-pulse" />
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
