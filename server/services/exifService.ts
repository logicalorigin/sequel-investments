import exifr from "exifr";

export interface ParsedExifData {
  latitude: number | null;
  longitude: number | null;
  timestamp: Date | null;
  cameraModel: string | null;
}

export async function parseExifFromBuffer(buffer: Buffer): Promise<ParsedExifData> {
  try {
    const exifData = await exifr.parse(buffer, {
      gps: true,
      xmp: true,
      pick: ["GPSLatitude", "GPSLongitude", "DateTimeOriginal", "CreateDate", "Model", "Make"],
    });

    if (!exifData) {
      return {
        latitude: null,
        longitude: null,
        timestamp: null,
        cameraModel: null,
      };
    }

    let latitude: number | null = null;
    let longitude: number | null = null;

    if (exifData.latitude !== undefined && exifData.longitude !== undefined) {
      latitude = exifData.latitude;
      longitude = exifData.longitude;
    }

    let timestamp: Date | null = null;
    if (exifData.DateTimeOriginal) {
      timestamp = new Date(exifData.DateTimeOriginal);
    } else if (exifData.CreateDate) {
      timestamp = new Date(exifData.CreateDate);
    }

    let cameraModel: string | null = null;
    if (exifData.Model) {
      cameraModel = exifData.Make ? `${exifData.Make} ${exifData.Model}` : exifData.Model;
    }

    return {
      latitude,
      longitude,
      timestamp,
      cameraModel,
    };
  } catch (error) {
    console.error("Error parsing EXIF data:", error);
    return {
      latitude: null,
      longitude: null,
      timestamp: null,
      cameraModel: null,
    };
  }
}

export async function parseExifFromUrl(imageUrl: string): Promise<ParsedExifData> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      return {
        latitude: null,
        longitude: null,
        timestamp: null,
        cameraModel: null,
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return parseExifFromBuffer(buffer);
  } catch (error) {
    console.error("Error fetching image for EXIF parsing:", error);
    return {
      latitude: null,
      longitude: null,
      timestamp: null,
      cameraModel: null,
    };
  }
}
