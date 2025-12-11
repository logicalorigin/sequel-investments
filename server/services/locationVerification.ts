import type { PhotoVerificationStatus } from "@shared/schema";

// GPS verification thresholds in meters
const VERIFICATION_THRESHOLDS = {
  GPS_MATCH_THRESHOLD: 50,        // Browser and EXIF GPS must be within 50m to "match"
  PROPERTY_GEOFENCE: 100,         // Photo must be within 100m of property
  INDOOR_THRESHOLD: 150,          // Allow larger threshold for indoor photos (weaker GPS)
  MAX_AGE_HOURS: 24,              // Photos older than 24 hours are "stale"
  BROWSER_MAX_AGE_MINUTES: 5,     // Browser GPS must be captured within 5 minutes of upload
} as const;

interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  timestamp?: Date | null;
}

interface VerificationResult {
  status: PhotoVerificationStatus;
  distanceExifToBrowserMeters: number | null;
  distanceExifToPropertyMeters: number | null;
  distanceBrowserToPropertyMeters: number | null;
  verificationDetails: string;
  gpsMatchConfidence: "high" | "medium" | "low" | "none";
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c); // Distance in meters
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function parseGPSCoordinate(value: string | null | undefined): number | null {
  if (!value) return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

export function verifyPhotoLocation(
  browserGPS: GPSCoordinates | null,
  exifGPS: GPSCoordinates | null,
  propertyGPS: GPSCoordinates | null,
  photoTimestamp?: Date
): VerificationResult {
  const details: string[] = [];
  let distanceExifToBrowser: number | null = null;
  let distanceExifToProperty: number | null = null;
  let distanceBrowserToProperty: number | null = null;
  let gpsMatchConfidence: "high" | "medium" | "low" | "none" = "none";

  // Case 1: No GPS data at all
  if (!browserGPS && !exifGPS) {
    return {
      status: "no_gps_data",
      distanceExifToBrowserMeters: null,
      distanceExifToPropertyMeters: null,
      distanceBrowserToPropertyMeters: null,
      verificationDetails: JSON.stringify({
        message: "No GPS data available from browser or photo EXIF",
        recommendation: "Please enable location services and take a new photo at the property"
      }),
      gpsMatchConfidence: "none",
    };
  }

  // Case 2: Only browser GPS available
  if (browserGPS && !exifGPS) {
    if (propertyGPS) {
      distanceBrowserToProperty = haversineDistance(
        browserGPS.latitude,
        browserGPS.longitude,
        propertyGPS.latitude,
        propertyGPS.longitude
      );
      details.push(`Browser GPS ${distanceBrowserToProperty}m from property`);
      
      if (distanceBrowserToProperty <= VERIFICATION_THRESHOLDS.PROPERTY_GEOFENCE) {
        gpsMatchConfidence = "medium";
        details.push("Browser GPS within property geofence");
      } else {
        gpsMatchConfidence = "low";
        details.push("Browser GPS outside property geofence");
      }
    }

    return {
      status: "browser_gps_only",
      distanceExifToBrowserMeters: null,
      distanceExifToPropertyMeters: null,
      distanceBrowserToPropertyMeters: distanceBrowserToProperty,
      verificationDetails: JSON.stringify({
        message: "Only browser GPS available - photo may have been taken from gallery or GPS stripped",
        browserAccuracy: browserGPS.accuracy,
        distanceToProperty: distanceBrowserToProperty,
        details,
      }),
      gpsMatchConfidence,
    };
  }

  // Case 3: Only EXIF GPS available (browser denied)
  if (!browserGPS && exifGPS) {
    if (propertyGPS) {
      distanceExifToProperty = haversineDistance(
        exifGPS.latitude,
        exifGPS.longitude,
        propertyGPS.latitude,
        propertyGPS.longitude
      );
      details.push(`EXIF GPS ${distanceExifToProperty}m from property`);
      
      if (distanceExifToProperty <= VERIFICATION_THRESHOLDS.PROPERTY_GEOFENCE) {
        gpsMatchConfidence = "medium";
        details.push("EXIF GPS within property geofence");
      } else {
        gpsMatchConfidence = "low";
        details.push("EXIF GPS outside property geofence");
      }
    }

    return {
      status: "exif_gps_only",
      distanceExifToBrowserMeters: null,
      distanceExifToPropertyMeters: distanceExifToProperty,
      distanceBrowserToPropertyMeters: null,
      verificationDetails: JSON.stringify({
        message: "Only EXIF GPS available - browser location was denied or unavailable",
        distanceToProperty: distanceExifToProperty,
        details,
      }),
      gpsMatchConfidence,
    };
  }

  // Case 4: Both GPS sources available - perform double verification
  if (browserGPS && exifGPS) {
    // Calculate distance between browser and EXIF GPS
    distanceExifToBrowser = haversineDistance(
      browserGPS.latitude,
      browserGPS.longitude,
      exifGPS.latitude,
      exifGPS.longitude
    );
    details.push(`Browser-to-EXIF distance: ${distanceExifToBrowser}m`);

    // Calculate distances to property if available
    if (propertyGPS) {
      distanceExifToProperty = haversineDistance(
        exifGPS.latitude,
        exifGPS.longitude,
        propertyGPS.latitude,
        propertyGPS.longitude
      );
      distanceBrowserToProperty = haversineDistance(
        browserGPS.latitude,
        browserGPS.longitude,
        propertyGPS.latitude,
        propertyGPS.longitude
      );
      details.push(`EXIF to property: ${distanceExifToProperty}m`);
      details.push(`Browser to property: ${distanceBrowserToProperty}m`);
    }

    // Check if GPS sources match
    const gpsMatch = distanceExifToBrowser <= VERIFICATION_THRESHOLDS.GPS_MATCH_THRESHOLD;
    
    // Determine confidence based on accuracy and match
    if (gpsMatch) {
      if (browserGPS.accuracy && browserGPS.accuracy <= 20) {
        gpsMatchConfidence = "high";
      } else if (browserGPS.accuracy && browserGPS.accuracy <= 50) {
        gpsMatchConfidence = "medium";
      } else {
        gpsMatchConfidence = "medium";
      }
    } else {
      gpsMatchConfidence = "low";
    }

    // GPS sources don't match - potential issue
    if (!gpsMatch) {
      return {
        status: "gps_mismatch",
        distanceExifToBrowserMeters: distanceExifToBrowser,
        distanceExifToPropertyMeters: distanceExifToProperty,
        distanceBrowserToPropertyMeters: distanceBrowserToProperty,
        verificationDetails: JSON.stringify({
          message: `GPS mismatch detected: Browser and photo EXIF locations differ by ${distanceExifToBrowser}m`,
          warning: "Photo may have been taken at a different location than where uploaded",
          browserCoords: { lat: browserGPS.latitude, lng: browserGPS.longitude },
          exifCoords: { lat: exifGPS.latitude, lng: exifGPS.longitude },
          threshold: VERIFICATION_THRESHOLDS.GPS_MATCH_THRESHOLD,
          details,
        }),
        gpsMatchConfidence: "low",
      };
    }

    // GPS matches - check property geofence
    if (propertyGPS) {
      const withinGeofence = 
        (distanceExifToProperty ?? Infinity) <= VERIFICATION_THRESHOLDS.PROPERTY_GEOFENCE ||
        (distanceBrowserToProperty ?? Infinity) <= VERIFICATION_THRESHOLDS.PROPERTY_GEOFENCE;

      if (!withinGeofence) {
        return {
          status: "outside_geofence",
          distanceExifToBrowserMeters: distanceExifToBrowser,
          distanceExifToPropertyMeters: distanceExifToProperty,
          distanceBrowserToPropertyMeters: distanceBrowserToProperty,
          verificationDetails: JSON.stringify({
            message: "Photo was taken outside the property geofence",
            propertyDistance: Math.min(distanceExifToProperty ?? Infinity, distanceBrowserToProperty ?? Infinity),
            geofenceRadius: VERIFICATION_THRESHOLDS.PROPERTY_GEOFENCE,
            details,
          }),
          gpsMatchConfidence,
        };
      }
    }

    // Check timestamp staleness if available
    if (photoTimestamp) {
      const ageHours = (Date.now() - photoTimestamp.getTime()) / (1000 * 60 * 60);
      if (ageHours > VERIFICATION_THRESHOLDS.MAX_AGE_HOURS) {
        return {
          status: "stale_timestamp",
          distanceExifToBrowserMeters: distanceExifToBrowser,
          distanceExifToPropertyMeters: distanceExifToProperty,
          distanceBrowserToPropertyMeters: distanceBrowserToProperty,
          verificationDetails: JSON.stringify({
            message: `Photo is ${Math.round(ageHours)} hours old, exceeds ${VERIFICATION_THRESHOLDS.MAX_AGE_HOURS} hour limit`,
            photoTimestamp: photoTimestamp.toISOString(),
            details,
          }),
          gpsMatchConfidence,
        };
      }
    }

    // All checks passed - verified!
    return {
      status: "verified",
      distanceExifToBrowserMeters: distanceExifToBrowser,
      distanceExifToPropertyMeters: distanceExifToProperty,
      distanceBrowserToPropertyMeters: distanceBrowserToProperty,
      verificationDetails: JSON.stringify({
        message: "Photo location verified - GPS double-check passed",
        gpsMatchDistance: distanceExifToBrowser,
        propertyDistance: Math.min(distanceExifToProperty ?? Infinity, distanceBrowserToProperty ?? Infinity),
        confidence: gpsMatchConfidence,
        details,
      }),
      gpsMatchConfidence,
    };
  }

  // Fallback (shouldn't reach here)
  return {
    status: "pending",
    distanceExifToBrowserMeters: null,
    distanceExifToPropertyMeters: null,
    distanceBrowserToPropertyMeters: null,
    verificationDetails: JSON.stringify({ message: "Verification pending" }),
    gpsMatchConfidence: "none",
  };
}

export function getVerificationStatusLabel(status: PhotoVerificationStatus): string {
  const labels: Record<PhotoVerificationStatus, string> = {
    pending: "Pending Review",
    verified: "Verified",
    gps_match: "GPS Match",
    gps_mismatch: "GPS Mismatch",
    outside_geofence: "Outside Geofence",
    stale_timestamp: "Photo Too Old",
    metadata_missing: "Missing Metadata",
    browser_gps_only: "Browser GPS Only",
    exif_gps_only: "EXIF GPS Only",
    no_gps_data: "No GPS Data",
    manual_approved: "Manually Approved",
    manual_rejected: "Rejected",
  };
  return labels[status] || status;
}

export function getVerificationStatusColor(status: PhotoVerificationStatus): "green" | "yellow" | "red" | "gray" {
  switch (status) {
    case "verified":
    case "gps_match":
    case "manual_approved":
      return "green";
    case "pending":
    case "browser_gps_only":
    case "exif_gps_only":
      return "yellow";
    case "gps_mismatch":
    case "outside_geofence":
    case "stale_timestamp":
    case "manual_rejected":
      return "red";
    default:
      return "gray";
  }
}

export { VERIFICATION_THRESHOLDS };
