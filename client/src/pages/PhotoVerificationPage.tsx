import { useState, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Camera, 
  Upload, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Building2, 
  Hammer, 
  MapPin,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  RefreshCw,
  Loader2,
  X,
  Image as ImageIcon
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VerificationPhoto {
  id: string;
  loanApplicationId: string;
  uploadedByUserId: string;
  photoType: string;
  fileKey: string;
  fileName: string;
  fileSizeBytes?: number;
  mimeType?: string;
  exifLatitude?: string;
  exifLongitude?: string;
  exifTimestamp?: string;
  exifCameraModel?: string;
  browserLatitude?: string;
  browserLongitude?: string;
  notes?: string;
  verificationStatus: string;
  verificationDetails?: string;
  createdAt: string;
  updatedAt: string;
}

interface LoanApplication {
  id: string;
  userId: string;
  loanType: string;
  propertyAddress?: string;
  propertyCity?: string;
  propertyState?: string;
  propertyZip?: string;
  status: string;
}

const PHOTO_CATEGORIES = {
  exterior: {
    label: "Property Exterior",
    icon: Home,
    description: "Take photos of the outside of the property from all angles",
    photos: [
      { type: "exterior_front", label: "Front of Property", description: "Clear view of front facade with address visible if possible" },
      { type: "exterior_back", label: "Back of Property", description: "Clear view of rear of the property" },
      { type: "exterior_left", label: "Left Side", description: "Left side of property from the street" },
      { type: "exterior_right", label: "Right Side", description: "Right side of property from the street" },
      { type: "street_view", label: "Street View", description: "View from across the street showing neighborhood" },
      { type: "property_signage", label: "Property Signage", description: "Any for-sale signs or property markers" },
    ]
  },
  interior: {
    label: "Property Interior",
    icon: Building2,
    description: "Take photos of each major room in the property",
    photos: [
      { type: "kitchen", label: "Kitchen", description: "Full view of kitchen showing cabinets and counter space" },
      { type: "kitchen_appliances", label: "Kitchen Appliances", description: "Close-up of appliances (stove, refrigerator, dishwasher)" },
      { type: "bathroom_1", label: "Primary Bathroom", description: "Full view of primary bathroom" },
      { type: "bathroom_2", label: "Secondary Bathroom", description: "Full view of secondary bathroom (if applicable)" },
      { type: "living_room", label: "Living Room", description: "Full view of main living area" },
      { type: "master_bedroom", label: "Master Bedroom", description: "Full view of master bedroom" },
      { type: "bedroom_2", label: "Bedroom 2", description: "Secondary bedroom (if applicable)" },
      { type: "bedroom_3", label: "Bedroom 3", description: "Third bedroom (if applicable)" },
    ]
  },
  renovation: {
    label: "Renovation Areas",
    icon: Hammer,
    description: "Document areas that require or are undergoing renovation",
    photos: [
      { type: "renovation_area_1", label: "Renovation Area 1", description: "Primary area requiring work" },
      { type: "renovation_area_2", label: "Renovation Area 2", description: "Secondary area requiring work" },
      { type: "renovation_area_3", label: "Renovation Area 3", description: "Additional renovation area" },
      { type: "hvac_system", label: "HVAC System", description: "Heating/cooling equipment" },
      { type: "electrical_panel", label: "Electrical Panel", description: "Main electrical panel" },
      { type: "plumbing", label: "Plumbing", description: "Visible plumbing infrastructure" },
      { type: "roof", label: "Roof", description: "Roof condition (if visible)" },
      { type: "foundation", label: "Foundation", description: "Foundation condition (if visible)" },
    ]
  },
};

type CategoryKey = keyof typeof PHOTO_CATEGORIES;

export default function PhotoVerificationPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("exterior");
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [browserLocation, setBrowserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { data: application, isLoading: loadingApp } = useQuery<LoanApplication>({
    queryKey: ["/api/loan-applications", applicationId],
  });
  
  const { data: photos = [], isLoading: loadingPhotos } = useQuery<VerificationPhoto[]>({
    queryKey: ["/api/applications", applicationId, "verification-photos"],
    enabled: !!applicationId,
  });
  
  const uploadMutation = useMutation({
    mutationFn: async (data: { file: File; photoType: string; notes: string }) => {
      const urlResponse = await apiRequest("POST", `/api/applications/${applicationId}/verification-photos/upload-url`, {
        fileName: data.file.name,
        photoType: data.photoType,
      }) as unknown as { uploadURL: string };
      
      const { uploadURL } = urlResponse;
      
      await fetch(uploadURL, {
        method: "PUT",
        body: data.file,
        headers: {
          "Content-Type": data.file.type,
        },
      });
      
      const fileKey = uploadURL.split("?")[0];
      
      return apiRequest("POST", `/api/applications/${applicationId}/verification-photos`, {
        photoType: data.photoType,
        fileKey,
        fileName: data.file.name,
        fileSizeBytes: data.file.size,
        mimeType: data.file.type,
        browserLatitude: browserLocation?.lat?.toString(),
        browserLongitude: browserLocation?.lng?.toString(),
        notes: data.notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications", applicationId, "verification-photos"] });
      setCapturedImage(null);
      setCapturedFile(null);
      setNotes("");
      toast({ title: "Photo uploaded successfully" });
      
      const currentCategory = PHOTO_CATEGORIES[activeCategory];
      if (activePhotoIndex < currentCategory.photos.length - 1) {
        setActivePhotoIndex(prev => prev + 1);
      }
    },
    onError: (error: Error) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (photoId: string) => {
      return apiRequest("DELETE", `/api/verification-photos/${photoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications", applicationId, "verification-photos"] });
      toast({ title: "Photo deleted" });
    },
  });
  
  const requestLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setBrowserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);
  
  const startCamera = useCallback(async () => {
    try {
      requestLocation();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCapturing(true);
    } catch (error) {
      console.error("Camera error:", error);
      toast({ title: "Camera access denied", description: "Please allow camera access or use file upload", variant: "destructive" });
    }
  }, [requestLocation, toast]);
  
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  }, []);
  
  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" });
          setCapturedFile(file);
          setCapturedImage(canvas.toDataURL("image/jpeg"));
        }
      }, "image/jpeg", 0.9);
      
      stopCamera();
    }
  }, [stopCamera]);
  
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      requestLocation();
      setCapturedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [requestLocation]);
  
  const handleUpload = useCallback(() => {
    if (capturedFile) {
      const currentPhoto = PHOTO_CATEGORIES[activeCategory].photos[activePhotoIndex];
      uploadMutation.mutate({
        file: capturedFile,
        photoType: currentPhoto.type,
        notes,
      });
    }
  }, [capturedFile, activeCategory, activePhotoIndex, notes, uploadMutation]);
  
  const getPhotoForType = (photoType: string): VerificationPhoto | undefined => {
    return photos.find(p => p.photoType === photoType);
  };
  
  const getCategoryProgress = (category: CategoryKey): number => {
    const categoryPhotos = PHOTO_CATEGORIES[category].photos;
    const uploadedCount = categoryPhotos.filter(p => getPhotoForType(p.type)).length;
    return Math.round((uploadedCount / categoryPhotos.length) * 100);
  };
  
  const getTotalProgress = (): number => {
    const allPhotos = Object.values(PHOTO_CATEGORIES).flatMap(c => c.photos);
    const requiredPhotos = allPhotos.slice(0, 12);
    const uploadedCount = requiredPhotos.filter(p => getPhotoForType(p.type)).length;
    return Math.round((uploadedCount / requiredPhotos.length) * 100);
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
      case "manual_approved":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
      case "manual_rejected":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  if (loadingApp || loadingPhotos) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg">Application not found</p>
        <Button onClick={() => navigate("/portal/applications")} data-testid="button-back-to-applications">
          Back to Applications
        </Button>
      </div>
    );
  }
  
  const currentCategory = PHOTO_CATEGORIES[activeCategory];
  const currentPhoto = currentCategory.photos[activePhotoIndex];
  const existingPhoto = getPhotoForType(currentPhoto.type);
  
  const propertyAddress = [application.propertyAddress, application.propertyCity, application.propertyState]
    .filter(Boolean)
    .join(", ");
  
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(`/portal/applications/${applicationId}`)}
                data-testid="button-back"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Photo Verification</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {propertyAddress || "No address"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">{getTotalProgress()}% Complete</p>
                <Progress value={getTotalProgress()} className="w-32 h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1 p-3 pt-0">
                  {(Object.entries(PHOTO_CATEGORIES) as [CategoryKey, typeof PHOTO_CATEGORIES[CategoryKey]][]).map(([key, category]) => {
                    const Icon = category.icon;
                    const progress = getCategoryProgress(key);
                    const isActive = activeCategory === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setActiveCategory(key);
                          setActivePhotoIndex(0);
                          setCapturedImage(null);
                          setCapturedFile(null);
                          stopCamera();
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                          isActive ? "bg-primary/10 text-primary" : "hover-elevate"
                        }`}
                        data-testid={`button-category-${key}`}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{category.label}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={progress} className="h-1.5 flex-1" />
                            <span className="text-xs text-muted-foreground">{progress}%</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Photos in {currentCategory.label}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-64">
                  <div className="space-y-1 p-3 pt-0">
                    {currentCategory.photos.map((photo, index) => {
                      const existing = getPhotoForType(photo.type);
                      const isActive = index === activePhotoIndex;
                      return (
                        <button
                          key={photo.type}
                          onClick={() => {
                            setActivePhotoIndex(index);
                            setCapturedImage(null);
                            setCapturedFile(null);
                            stopCamera();
                          }}
                          className={`w-full flex items-center gap-2 p-2 rounded-md transition-colors text-left text-sm ${
                            isActive ? "bg-primary/10" : "hover-elevate"
                          }`}
                          data-testid={`button-photo-${photo.type}`}
                        >
                          {existing ? (
                            getStatusIcon(existing.verificationStatus)
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                          )}
                          <span className={existing ? "text-foreground" : "text-muted-foreground"}>
                            {photo.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-9">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant={existingPhoto ? "default" : "secondary"} className="mb-2">
                      {activePhotoIndex + 1} of {currentCategory.photos.length}
                    </Badge>
                    <CardTitle>{currentPhoto.label}</CardTitle>
                    <CardDescription>{currentPhoto.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={activePhotoIndex === 0}
                      onClick={() => {
                        setActivePhotoIndex(prev => prev - 1);
                        setCapturedImage(null);
                        setCapturedFile(null);
                        stopCamera();
                      }}
                      data-testid="button-prev-photo"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={activePhotoIndex === currentCategory.photos.length - 1}
                      onClick={() => {
                        setActivePhotoIndex(prev => prev + 1);
                        setCapturedImage(null);
                        setCapturedFile(null);
                        stopCamera();
                      }}
                      data-testid="button-next-photo"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {existingPhoto && !capturedImage && !isCapturing ? (
                  <div className="space-y-4">
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                      <img
                        src={existingPhoto.fileKey.startsWith("/") ? existingPhoto.fileKey : `/objects/${existingPhoto.fileKey}`}
                        alt={currentPhoto.label}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-3 right-3">
                        {getStatusIcon(existingPhoto.verificationStatus)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                        <span>{existingPhoto.fileName}</span>
                        {existingPhoto.exifTimestamp && (
                          <span>• {new Date(existingPhoto.exifTimestamp).toLocaleString()}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            deleteMutation.mutate(existingPhoto.id);
                          }}
                          disabled={deleteMutation.isPending}
                          data-testid="button-delete-photo"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startCamera()}
                          data-testid="button-retake-photo"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Retake
                        </Button>
                      </div>
                    </div>
                    
                    {existingPhoto.notes && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">{existingPhoto.notes}</p>
                      </div>
                    )}
                  </div>
                ) : isCapturing ? (
                  <div className="space-y-4">
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                    
                    <div className="flex justify-center gap-3">
                      <Button
                        variant="outline"
                        onClick={stopCamera}
                        data-testid="button-cancel-capture"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        size="lg"
                        onClick={capturePhoto}
                        className="px-8"
                        data-testid="button-capture"
                      >
                        <Camera className="h-5 w-5 mr-2" />
                        Capture
                      </Button>
                    </div>
                  </div>
                ) : capturedImage ? (
                  <div className="space-y-4">
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                      <img
                        src={capturedImage}
                        alt="Captured"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    <Textarea
                      placeholder="Add notes about this photo (optional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="resize-none"
                      data-testid="input-photo-notes"
                    />
                    
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCapturedImage(null);
                          setCapturedFile(null);
                          setNotes("");
                        }}
                        data-testid="button-discard"
                      >
                        Discard
                      </Button>
                      <Button
                        onClick={handleUpload}
                        disabled={uploadMutation.isPending}
                        data-testid="button-upload"
                      >
                        {uploadMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Photo
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center gap-4 border-2 border-dashed border-muted-foreground/25">
                      <Camera className="h-16 w-16 text-muted-foreground/50" />
                      <p className="text-muted-foreground text-center max-w-sm">
                        Take a photo using your camera or upload an existing image
                      </p>
                    </div>
                    
                    <div className="flex justify-center gap-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        data-testid="button-upload-file"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </Button>
                      <Button
                        onClick={startCamera}
                        data-testid="button-start-camera"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Use Camera
                      </Button>
                    </div>
                    
                    {browserLocation && (
                      <p className="text-center text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        Location: {browserLocation.lat.toFixed(4)}, {browserLocation.lng.toFixed(4)}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {getTotalProgress() >= 100 && (
              <Card className="mt-4 border-green-500/50 bg-green-500/5">
                <CardContent className="flex items-center gap-4 py-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-400">
                      All required photos uploaded!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your photos are being reviewed. You will be notified when verification is complete.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
