import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGoogleMapsApiKey } from "@/components/GoogleMapsProvider";
import { motion, AnimatePresence } from "framer-motion";

function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return debouncedFn;
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
  name?: string;
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

function GoogleMapsAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Enter property address",
  className = "",
  "data-testid": testId,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
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
    setInputValue(value);
  }, [value]);

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
              // Show top 5 results for better address selection
              setPredictions(results.slice(0, 5));
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

  const debouncedFetchPredictions = useDebouncedCallback(
    (input: string) => {
      fetchPredictions(input);
    },
    300
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      onChange(newValue);
      setIsValidated(false);
      debouncedFetchPredictions(newValue);
    },
    [onChange, debouncedFetchPredictions]
  );

  const handleSelectPlace = useCallback(
    (prediction: AutocompletePrediction) => {
      if (!placesServiceRef.current) return;

      setIsLoading(true);
      placesServiceRef.current.getDetails(
        {
          placeId: prediction.place_id,
          fields: ["address_components", "geometry", "formatted_address", "place_id", "name"],
        },
        (place: PlaceDetailsResult | null, status: string) => {
          if (status === "OK" && place) {
            const formattedAddress = place.formatted_address || prediction.description;
            
            setInputValue(formattedAddress);
            onChange(formattedAddress);
            setShowDropdown(false);
            setPredictions([]);
            setIsValidated(true);

            if (onPlaceSelect) {
              const placeResult: PlaceResult = {
                formatted_address: formattedAddress,
                name: place.name,
                geometry: place.geometry ? {
                  location: place.geometry.location ? {
                    lat: () => place.geometry!.location!.lat(),
                    lng: () => place.geometry!.location!.lng(),
                  } : undefined,
                } : undefined,
                address_components: place.address_components,
                place_id: place.place_id || prediction.place_id,
              };
              onPlaceSelect(placeResult);
            }
          }
          setIsLoading(false);
        }
      );
    },
    [onChange, onPlaceSelect]
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    onChange("");
    setPredictions([]);
    setShowDropdown(false);
    setIsValidated(false);
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        setShowDropdown(false);
      }
    },
    []
  );

  return (
    <div className="relative flex items-center">
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => predictions.length > 0 && setShowDropdown(true)}
        placeholder={placeholder}
        className={`pr-12 ${className}`}
        data-testid={testId}
      />
      {/* Right side controls - X button and loading spinner */}
      <div className="absolute right-3 flex items-center gap-1">
        {isLoading && (
          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-white/50" />
        )}
        {inputValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-white/10 p-0"
            onClick={handleClear}
            data-testid="button-clear-address"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-white/60" />
          </Button>
        )}
      </div>

      {showDropdown && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg overflow-hidden"
        >
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              type="button"
              className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-start gap-3"
              onClick={() => handleSelectPlace(prediction)}
            >
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {prediction.structured_formatting?.main_text || prediction.description}
                </p>
                {prediction.structured_formatting?.secondary_text && (
                  <p className="text-xs text-muted-foreground truncate">
                    {prediction.structured_formatting.secondary_text}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FallbackInput({
  value,
  onChange,
  placeholder = "Enter property address",
  className = "",
  "data-testid": testId,
}: Omit<AddressAutocompleteProps, "onPlaceSelect">) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

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

export default function AddressAutocomplete(props: AddressAutocompleteProps) {
  const apiKey = useGoogleMapsApiKey();

  if (!apiKey) {
    return <FallbackInput {...props} />;
  }

  return <GoogleMapsAutocomplete {...props} />;
}

export type { PlaceResult };
