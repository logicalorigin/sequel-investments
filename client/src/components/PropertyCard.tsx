import { useState, useCallback } from "react";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Globe, 
  Heart, 
  Share2, 
  ExternalLink,
  Bed,
  Bath,
  Square,
  DollarSign,
  Building2,
  Calculator
} from "lucide-react";
import { useGoogleMapsApiKey } from "@/components/GoogleMapsProvider";

interface PropertyCardProps {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  estimatedValue?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  yearBuilt?: number;
  propertyType?: string;
  imageUrl?: string;
  onAnalyze?: () => void;
  onFavorite?: () => void;
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
    <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
      <Map
        key={mapType}
        style={{ width: "100%", height: "100%" }}
        defaultCenter={{ lat: latitude, lng: longitude }}
        defaultZoom={18}
        mapTypeId={mapType}
        gestureHandling="cooperative"
        disableDefaultUI={true}
        zoomControl={false}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
      >
        <AdvancedMarker position={{ lat: latitude, lng: longitude }}>
          <div className="bg-primary text-primary-foreground p-2 rounded-full shadow-lg">
            <MapPin className="h-4 w-4" />
          </div>
        </AdvancedMarker>
      </Map>
      <MapTypeToggle onToggle={onMapTypeToggle} mapType={mapType} />
      <div className="absolute top-3 left-3 z-10">
        <Badge variant="secondary" className="bg-white/90 text-foreground shadow-sm">
          {mapType === "satellite" ? "Satellite" : mapType === "hybrid" ? "Hybrid" : "Map"}
        </Badge>
      </div>
    </div>
  );
}

function PropertyCardContent({
  address,
  city,
  state,
  zipCode,
  estimatedValue,
  bedrooms,
  bathrooms,
  squareFeet,
  yearBuilt,
  propertyType,
  onAnalyze,
  onFavorite,
}: Omit<PropertyCardProps, "latitude" | "longitude" | "imageUrl">) {
  return (
    <CardContent className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate" data-testid="text-property-address">
            {address}
          </h3>
          <p className="text-sm text-muted-foreground" data-testid="text-property-location">
            {city}, {state} {zipCode}
          </p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8"
            onClick={onFavorite}
            data-testid="button-favorite-property"
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8"
            data-testid="button-share-property"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {estimatedValue && (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          <span className="text-lg font-bold text-primary" data-testid="text-property-value">
            ${estimatedValue.toLocaleString()}
          </span>
          <Badge variant="outline" className="text-xs">
            Est. Value
          </Badge>
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        {bedrooms !== undefined && (
          <div className="flex items-center gap-1" data-testid="text-property-beds">
            <Bed className="h-4 w-4" />
            <span>{bedrooms} bd</span>
          </div>
        )}
        {bathrooms !== undefined && (
          <div className="flex items-center gap-1" data-testid="text-property-baths">
            <Bath className="h-4 w-4" />
            <span>{bathrooms} ba</span>
          </div>
        )}
        {squareFeet !== undefined && (
          <div className="flex items-center gap-1" data-testid="text-property-sqft">
            <Square className="h-4 w-4" />
            <span>{squareFeet.toLocaleString()} sqft</span>
          </div>
        )}
      </div>

      {(yearBuilt || propertyType) && (
        <div className="flex flex-wrap gap-2">
          {propertyType && (
            <Badge variant="secondary" className="text-xs">
              <Building2 className="h-3 w-3 mr-1" />
              {propertyType}
            </Badge>
          )}
          {yearBuilt && (
            <Badge variant="outline" className="text-xs">
              Built {yearBuilt}
            </Badge>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button 
          className="flex-1" 
          onClick={onAnalyze}
          data-testid="button-analyze-property"
        >
          <Calculator className="h-4 w-4 mr-2" />
          Analyze Deal
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          data-testid="button-view-details"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  );
}

function FallbackMapView({
  address,
  imageUrl,
}: {
  address: string;
  imageUrl?: string;
}) {
  return (
    <div className="relative w-full h-48 bg-muted flex items-center justify-center">
      {imageUrl ? (
        <img src={imageUrl} alt={address} className="w-full h-full object-cover" />
      ) : (
        <div className="text-center text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Map unavailable</p>
        </div>
      )}
    </div>
  );
}

export function PropertyCard({
  address,
  city,
  state,
  zipCode,
  latitude,
  longitude,
  estimatedValue,
  bedrooms,
  bathrooms,
  squareFeet,
  yearBuilt,
  propertyType,
  imageUrl,
  onAnalyze,
  onFavorite,
}: PropertyCardProps) {
  const [mapType, setMapType] = useState<MapType>("satellite");
  const apiKey = useGoogleMapsApiKey();

  const toggleMapType = useCallback(() => {
    setMapType((prev) => {
      if (prev === "satellite") return "hybrid";
      if (prev === "hybrid") return "roadmap";
      return "satellite";
    });
  }, []);

  const cardTestId = `card-property-${address.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <Card className="overflow-hidden hover-elevate" data-testid={cardTestId}>
      {apiKey ? (
        <PropertyMapView
          latitude={latitude}
          longitude={longitude}
          mapType={mapType}
          onMapTypeToggle={toggleMapType}
        />
      ) : (
        <FallbackMapView address={address} imageUrl={imageUrl} />
      )}
      <PropertyCardContent
        address={address}
        city={city}
        state={state}
        zipCode={zipCode}
        estimatedValue={estimatedValue}
        bedrooms={bedrooms}
        bathrooms={bathrooms}
        squareFeet={squareFeet}
        yearBuilt={yearBuilt}
        propertyType={propertyType}
        onAnalyze={onAnalyze}
        onFavorite={onFavorite}
      />
    </Card>
  );
}

export function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="w-full h-48 bg-muted animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        </div>
        <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
        <div className="flex gap-3">
          <div className="h-4 bg-muted rounded animate-pulse w-16" />
          <div className="h-4 bg-muted rounded animate-pulse w-16" />
          <div className="h-4 bg-muted rounded animate-pulse w-20" />
        </div>
        <div className="h-9 bg-muted rounded animate-pulse w-full mt-2" />
      </CardContent>
    </Card>
  );
}

export default PropertyCard;
