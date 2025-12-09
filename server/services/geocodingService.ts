import { storage } from "../storage";
import type { PropertyLocation, InsertPropertyLocation } from "@shared/schema";

interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  // Use server-side env var, fallback to VITE_ prefix for dev convenience
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.error("Google Maps API key not configured (set GOOGLE_MAPS_API_KEY)");
    return null;
  }
  
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      console.error("Geocoding failed:", data.status, data.error_message);
      return null;
    }
    
    const result = data.results[0];
    const location = result.geometry.location;
    
    return {
      latitude: location.lat,
      longitude: location.lng,
      formattedAddress: result.formatted_address,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

export async function getOrCreatePropertyLocation(
  servicedLoanId: string,
  address: string,
  geofenceRadiusMeters: number = 100
): Promise<PropertyLocation | null> {
  const existing = await storage.getPropertyLocation(servicedLoanId);
  if (existing) {
    return existing;
  }
  
  const geocoded = await geocodeAddress(address);
  if (!geocoded) {
    return null;
  }
  
  const locationData: InsertPropertyLocation = {
    servicedLoanId,
    latitude: geocoded.latitude.toString(),
    longitude: geocoded.longitude.toString(),
    geofenceRadiusMeters,
    geocodedAddress: geocoded.formattedAddress,
    geocodedAt: new Date(),
    geocodeSource: "google",
  };
  
  return await storage.createPropertyLocation(locationData);
}

export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export interface PhotoVerificationResult {
  status: "verified" | "outside_geofence" | "stale_timestamp" | "metadata_missing";
  distanceMeters?: number;
  details: string;
}

export function verifyPhotoLocation(
  photoLat: number | null,
  photoLon: number | null,
  photoTimestamp: Date | null,
  propertyLat: number,
  propertyLon: number,
  geofenceRadiusMeters: number,
  maxPhotoAgeHours: number = 72
): PhotoVerificationResult {
  if (photoLat === null || photoLon === null) {
    return {
      status: "metadata_missing",
      details: "Photo does not contain GPS coordinates in EXIF data",
    };
  }
  
  if (photoTimestamp === null) {
    return {
      status: "metadata_missing",
      details: "Photo does not contain timestamp in EXIF data",
    };
  }
  
  const now = new Date();
  const photoAge = (now.getTime() - photoTimestamp.getTime()) / (1000 * 60 * 60);
  
  if (photoAge > maxPhotoAgeHours) {
    return {
      status: "stale_timestamp",
      distanceMeters: Math.round(calculateHaversineDistance(photoLat, photoLon, propertyLat, propertyLon)),
      details: `Photo was taken ${Math.round(photoAge)} hours ago, which exceeds the ${maxPhotoAgeHours} hour limit`,
    };
  }
  
  const distance = calculateHaversineDistance(photoLat, photoLon, propertyLat, propertyLon);
  const distanceRounded = Math.round(distance);
  
  if (distance > geofenceRadiusMeters) {
    return {
      status: "outside_geofence",
      distanceMeters: distanceRounded,
      details: `Photo was taken ${distanceRounded}m from the property, which exceeds the ${geofenceRadiusMeters}m geofence radius`,
    };
  }
  
  return {
    status: "verified",
    distanceMeters: distanceRounded,
    details: `Photo verified: taken ${distanceRounded}m from property, within the last ${Math.round(photoAge)} hours`,
  };
}
