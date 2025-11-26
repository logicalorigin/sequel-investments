import { useRef, useEffect, useState, useCallback } from "react";
import Radar from "radar-sdk-js";
import "radar-sdk-js/dist/radar.css";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";

interface RadarAddress {
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  addressLabel?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  postalCode?: string;
  country?: string;
  countryCode?: string;
}

interface PlaceResult {
  formatted_address?: string;
  name?: string;
  geometry?: {
    location?: {
      lat: () => number;
      lng: () => number;
    };
  };
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  place_id?: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: PlaceResult) => void;
  placeholder?: string;
  className?: string;
  "data-testid"?: string;
}

function convertRadarToPlaceResult(radarAddress: RadarAddress): PlaceResult {
  const addressComponents: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }> = [];

  if (radarAddress.city) {
    addressComponents.push({
      long_name: radarAddress.city,
      short_name: radarAddress.city,
      types: ["locality", "political"],
    });
  }

  if (radarAddress.state) {
    addressComponents.push({
      long_name: radarAddress.state,
      short_name: radarAddress.stateCode || radarAddress.state,
      types: ["administrative_area_level_1", "political"],
    });
  }

  if (radarAddress.postalCode) {
    addressComponents.push({
      long_name: radarAddress.postalCode,
      short_name: radarAddress.postalCode,
      types: ["postal_code"],
    });
  }

  if (radarAddress.country) {
    addressComponents.push({
      long_name: radarAddress.country,
      short_name: radarAddress.countryCode || radarAddress.country,
      types: ["country", "political"],
    });
  }

  return {
    formatted_address: radarAddress.formattedAddress,
    name: radarAddress.addressLabel,
    geometry: radarAddress.latitude && radarAddress.longitude ? {
      location: {
        lat: () => radarAddress.latitude!,
        lng: () => radarAddress.longitude!,
      },
    } : undefined,
    address_components: addressComponents,
  };
}

export default function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Enter property address",
  className = "",
  "data-testid": testId,
}: AddressAutocompleteProps) {
  const apiKey = import.meta.env.VITE_RADAR_PUBLISHABLE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSelection = useCallback((address: RadarAddress) => {
    if (address.formattedAddress) {
      onChange(address.formattedAddress);
      setInputValue(address.formattedAddress);
    }
    if (onPlaceSelect) {
      onPlaceSelect(convertRadarToPlaceResult(address));
    }
  }, [onChange, onPlaceSelect]);

  useEffect(() => {
    if (!apiKey || !containerRef.current || isInitialized) return;

    try {
      Radar.initialize(apiKey);

      const containerId = `radar-autocomplete-${Math.random().toString(36).substr(2, 9)}`;
      containerRef.current.id = containerId;

      autocompleteRef.current = Radar.ui.autocomplete({
        container: containerId,
        width: "100%",
        responsive: true,
        placeholder: placeholder,
        limit: 8,
        countryCode: "US",
        onSelection: handleSelection,
      });

      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to initialize Radar autocomplete:", error);
    }

    return () => {
      if (autocompleteRef.current) {
        try {
          autocompleteRef.current.remove();
        } catch (e) {
        }
        autocompleteRef.current = null;
      }
    };
  }, [apiKey, placeholder, handleSelection, isInitialized]);

  if (!apiKey) {
    return (
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          className={`pl-10 ${className}`}
          data-testid={testId}
        />
      </div>
    );
  }

  return (
    <div className="relative radar-autocomplete-wrapper">
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
      <div 
        ref={containerRef} 
        className={`radar-container ${className}`}
        data-testid={testId}
      />
      <style>{`
        .radar-autocomplete-wrapper .radar-autocomplete-wrapper {
          width: 100%;
        }
        .radar-autocomplete-wrapper input {
          width: 100% !important;
          height: 36px !important;
          padding-left: 40px !important;
          padding-right: 12px !important;
          border-radius: 6px !important;
          border: 1px solid hsl(var(--input)) !important;
          background: transparent !important;
          font-size: 14px !important;
          color: hsl(var(--foreground)) !important;
          transition: border-color 0.2s, box-shadow 0.2s !important;
        }
        .radar-autocomplete-wrapper input::placeholder {
          color: hsl(var(--muted-foreground)) !important;
        }
        .radar-autocomplete-wrapper input:focus {
          outline: none !important;
          border-color: hsl(var(--ring)) !important;
          box-shadow: 0 0 0 1px hsl(var(--ring)) !important;
        }
        .radar-autocomplete-results {
          background: hsl(var(--popover)) !important;
          border: 1px solid hsl(var(--border)) !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          margin-top: 4px !important;
          overflow: hidden !important;
          z-index: 50 !important;
        }
        .radar-autocomplete-results-item {
          padding: 8px 12px !important;
          cursor: pointer !important;
          color: hsl(var(--popover-foreground)) !important;
          font-size: 14px !important;
          border-bottom: 1px solid hsl(var(--border)) !important;
        }
        .radar-autocomplete-results-item:last-child {
          border-bottom: none !important;
        }
        .radar-autocomplete-results-item:hover {
          background: hsl(var(--accent)) !important;
        }
        .radar-autocomplete-results-item-highlight {
          font-weight: 600 !important;
        }
        .radar-powered {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
