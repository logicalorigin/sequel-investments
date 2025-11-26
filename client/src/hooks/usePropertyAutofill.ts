import { useState, useCallback } from "react";
import { useToast } from "./use-toast";

export interface PropertyLookupData {
  address: string;
  city: string;
  state: string;
  zip: string;
  propertyValue: number | null;
  rentEstimate: number | null;
  annualTaxes: number | null;
  annualInsurance: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  yearBuilt: number | null;
  propertyType: string | null;
  source: string;
  confidence: "high" | "medium" | "low";
}

interface UsePropertyAutofillOptions {
  onDataLoaded?: (data: PropertyLookupData) => void;
  showToast?: boolean;
}

export function usePropertyAutofill(options: UsePropertyAutofillOptions = {}) {
  const { onDataLoaded, showToast = true } = options;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PropertyLookupData | null>(null);

  const fetchPropertyData = useCallback(async (
    address: string,
    city?: string,
    state?: string,
    zip?: string
  ): Promise<PropertyLookupData | null> => {
    if (!address) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ address });
      if (city) params.append("city", city);
      if (state) params.append("state", state);
      if (zip) params.append("zip", zip);

      const response = await fetch(`/api/property-lookup?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch property data");
      }

      const propertyData: PropertyLookupData = await response.json();
      setData(propertyData);

      if (onDataLoaded) {
        onDataLoaded(propertyData);
      }

      if (showToast && propertyData.propertyValue) {
        const sourceLabel = propertyData.source === "rentcast" ? "RentCast" : "estimated";
        toast({
          title: "Property Data Loaded",
          description: `Found ${sourceLabel} data for this property`,
        });
      }

      return propertyData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch property data";
      setError(errorMessage);
      
      if (showToast) {
        toast({
          title: "Autofill Unavailable",
          description: "Using default estimates. You can enter values manually.",
          variant: "destructive",
        });
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onDataLoaded, showToast, toast]);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    fetchPropertyData,
    clearData,
    isLoading,
    error,
    data,
  };
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return value.toString();
}
