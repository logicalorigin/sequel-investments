import { useState, useCallback, useRef, useEffect } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { useGoogleMapsApiKey } from "@/components/GoogleMapsProvider";

interface PlaceResult {
  placeId: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  zipCode: string;
  country: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

interface PropertySearchBarProps {
  onPlaceSelect: (place: PlaceResult) => void;
  placeholder?: string;
  className?: string;
  size?: "default" | "lg";
  showButton?: boolean;
}

interface AutocompletePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface PlaceDetailsResult {
  address_components?: AddressComponent[];
  geometry?: {
    location?: {
      lat: () => number;
      lng: () => number;
    };
  };
  formatted_address?: string;
  place_id?: string;
}

type AutocompleteService = {
  getPlacePredictions: (
    request: { input: string; componentRestrictions?: { country: string }; types?: string[] },
    callback: (results: AutocompletePrediction[] | null, status: string) => void
  ) => void;
};

type PlacesService = {
  getDetails: (
    request: { placeId: string; fields: string[] },
    callback: (result: PlaceDetailsResult | null, status: string) => void
  ) => void;
};

function PlacesAutocompleteInput({
  onPlaceSelect,
  placeholder = "Search for a property address...",
  className = "",
  size = "default",
  showButton = true,
}: PropertySearchBarProps) {
  const [inputValue, setInputValue] = useState("");
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const places = useMapsLibrary("places");
  const autocompleteServiceRef = useRef<AutocompleteService | null>(null);
  const placesServiceRef = useRef<PlacesService | null>(null);

  useEffect(() => {
    if (places) {
      autocompleteServiceRef.current = new places.AutocompleteService() as unknown as AutocompleteService;
      const dummyDiv = document.createElement("div");
      placesServiceRef.current = new places.PlacesService(dummyDiv) as unknown as PlacesService;
    }
  }, [places]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPredictions = useCallback(
    async (input: string) => {
      if (!autocompleteServiceRef.current || input.length < 3) {
        setPredictions([]);
        return;
      }

      setIsLoading(true);
      try {
        const request = {
          input,
          componentRestrictions: { country: "us" },
          types: ["address"],
        };

        autocompleteServiceRef.current.getPlacePredictions(
          request,
          (results: AutocompletePrediction[] | null, status: string) => {
            if (status === "OK" && results) {
              setPredictions(results);
              setShowDropdown(true);
            } else {
              setPredictions([]);
            }
            setIsLoading(false);
          }
        );
      } catch (error) {
        console.error("Error fetching predictions:", error);
        setIsLoading(false);
      }
    },
    []
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      fetchPredictions(value);
    },
    [fetchPredictions]
  );

  const handleSelectPlace = useCallback(
    (prediction: AutocompletePrediction) => {
      if (!placesServiceRef.current) return;

      setIsLoading(true);
      placesServiceRef.current.getDetails(
        {
          placeId: prediction.place_id,
          fields: ["address_components", "geometry", "formatted_address", "place_id"],
        },
        (place: PlaceDetailsResult | null, status: string) => {
          if (status === "OK" && place) {
            let streetNumber = "";
            let streetName = "";
            let city = "";
            let state = "";
            let stateCode = "";
            let zipCode = "";
            let country = "";

            place.address_components?.forEach((component: AddressComponent) => {
              const types = component.types;
              if (types.includes("street_number")) {
                streetNumber = component.long_name;
              }
              if (types.includes("route")) {
                streetName = component.long_name;
              }
              if (types.includes("locality")) {
                city = component.long_name;
              }
              if (types.includes("administrative_area_level_1")) {
                state = component.long_name;
                stateCode = component.short_name;
              }
              if (types.includes("postal_code")) {
                zipCode = component.long_name;
              }
              if (types.includes("country")) {
                country = component.long_name;
              }
            });

            const address = streetNumber && streetName 
              ? `${streetNumber} ${streetName}` 
              : prediction.structured_formatting?.main_text || "";

            const result: PlaceResult = {
              placeId: prediction.place_id,
              address,
              city,
              state,
              stateCode,
              zipCode,
              country,
              latitude: place.geometry?.location?.lat() || 0,
              longitude: place.geometry?.location?.lng() || 0,
              formattedAddress: place.formatted_address || prediction.description,
            };

            setInputValue(place.formatted_address || prediction.description);
            setShowDropdown(false);
            setPredictions([]);
            onPlaceSelect(result);
          }
          setIsLoading(false);
        }
      );
    },
    [onPlaceSelect]
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    setPredictions([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        setShowDropdown(false);
      }
    },
    []
  );

  const sizeClasses = size === "lg" ? "h-12 text-base" : "h-10 text-sm";

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => predictions.length > 0 && setShowDropdown(true)}
            placeholder={placeholder}
            className={`pl-10 pr-10 ${sizeClasses}`}
            data-testid="input-property-search"
          />
          {inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
              onClick={handleClear}
              data-testid="button-clear-search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {isLoading && (
            <Loader2 className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {showButton && (
          <Button 
            type="button" 
            className={size === "lg" ? "h-12 px-6" : ""}
            disabled={!inputValue}
            data-testid="button-search-property"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        )}
      </div>

      {showDropdown && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg overflow-hidden"
          data-testid="dropdown-search-results"
        >
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              type="button"
              className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-start gap-3"
              onClick={() => handleSelectPlace(prediction)}
              data-testid={`option-place-${prediction.place_id}`}
            >
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {prediction.structured_formatting?.main_text}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {prediction.structured_formatting?.secondary_text}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DisabledSearchInput({
  placeholder = "Search for a property address...",
  className = "",
  size = "default",
  showButton = true,
}: Omit<PropertySearchBarProps, "onPlaceSelect">) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            placeholder={placeholder}
            className={`pl-10 ${size === "lg" ? "h-12 text-base" : "h-10 text-sm"}`}
            disabled
            data-testid="input-property-search"
          />
        </div>
        {showButton && (
          <Button disabled data-testid="button-search-property">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Google Maps API key required for address search
      </p>
    </div>
  );
}

export function PropertySearchBar(props: PropertySearchBarProps) {
  const apiKey = useGoogleMapsApiKey();

  if (!apiKey) {
    return <DisabledSearchInput {...props} />;
  }

  return <PlacesAutocompleteInput {...props} />;
}

export type { PlaceResult };
export default PropertySearchBar;
