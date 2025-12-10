import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Camera, 
  Upload, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Building2, 
  MapPin,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  RefreshCw,
  Loader2,
  X,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown
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

const PROPERTY_PHOTO_CATEGORIES = {
  exterior: {
    label: "Property Exterior",
    shortLabel: "Exterior",
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
    shortLabel: "Interior",
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
};

type CategoryKey = keyof typeof PROPERTY_PHOTO_CATEGORIES;

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
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showPhotoList, setShowPhotoList] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { data: application, isLoading: loadingApp } = useQuery<LoanApplication>({
    queryKey: ["/api/applications", applicationId],
  });
  
  const { data: photos = [], isLoading: loadingPhotos } = useQuery<VerificationPhoto[]>({
    queryKey: ["/api/applications", applicationId, "verification-photos"],
    enabled: !!applicationId,
  });

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
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
      
      const currentCategory = PROPERTY_PHOTO_CATEGORIES[activeCategory];
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
      setLocationError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setBrowserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError("Location access denied. Photos will be uploaded without GPS verification.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);
  
  const startCamera = useCallback(async () => {
    try {
      requestLocation();
      setIsCapturing(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: "environment" }, 
          width: { ideal: 1280, max: 1920 }, 
          height: { ideal: 960, max: 1440 } 
        },
        audio: false,
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
        };
      }
    } catch (error) {
      console.error("Camera error:", error);
      setIsCapturing(false);
      toast({ 
        title: "Camera access denied", 
        description: "Please allow camera access or use the upload button instead", 
        variant: "destructive" 
      });
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
      const dpr = window.devicePixelRatio || 1;
      const maxWidth = 1920;
      const maxHeight = 1080;
      
      let width = video.videoWidth / dpr;
      let height = video.videoHeight / dpr;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" });
          setCapturedFile(file);
          setCapturedImage(canvas.toDataURL("image/jpeg"));
        }
      }, "image/jpeg", 0.85);
      
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
    if (event.target) {
      event.target.value = '';
    }
  }, [requestLocation]);
  
  const handleUpload = useCallback(() => {
    if (capturedFile) {
      const currentPhoto = PROPERTY_PHOTO_CATEGORIES[activeCategory].photos[activePhotoIndex];
      uploadMutation.mutate({
        file: capturedFile,
        photoType: currentPhoto.type,
        notes,
      });
    }
  }, [capturedFile, activeCategory, activePhotoIndex, notes, uploadMutation]);
  
  const getPhotoForType = useCallback((photoType: string): VerificationPhoto | undefined => {
    return photos.find(p => p.photoType === photoType);
  }, [photos]);
  
  const getCategoryProgress = useCallback((category: CategoryKey): number => {
    const categoryPhotos = PROPERTY_PHOTO_CATEGORIES[category].photos;
    const uploadedCount = categoryPhotos.filter(p => getPhotoForType(p.type)).length;
    return Math.round((uploadedCount / categoryPhotos.length) * 100);
  }, [getPhotoForType]);
  
  const totalProgress = useMemo(() => {
    const allPhotos = Object.values(PROPERTY_PHOTO_CATEGORIES).flatMap(c => c.photos);
    const uploadedCount = allPhotos.filter(p => getPhotoForType(p.type)).length;
    return Math.round((uploadedCount / allPhotos.length) * 100);
  }, [getPhotoForType]);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
      case "manual_approved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" aria-label="Verified" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" aria-label="Pending review" />;
      case "failed":
      case "manual_rejected":
        return <AlertCircle className="h-5 w-5 text-red-500" aria-label="Failed verification" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" aria-label="Awaiting upload" />;
    }
  };

  const handleCategoryChange = useCallback((key: CategoryKey) => {
    setActiveCategory(key);
    setActivePhotoIndex(0);
    setCapturedImage(null);
    setCapturedFile(null);
    stopCamera();
    setShowPhotoList(false);
  }, [stopCamera]);

  const handlePhotoSelect = useCallback((index: number) => {
    setActivePhotoIndex(index);
    setCapturedImage(null);
    setCapturedFile(null);
    stopCamera();
    setShowPhotoList(false);
  }, [stopCamera]);

  const navigatePhoto = useCallback((direction: 'prev' | 'next') => {
    const currentCategory = PROPERTY_PHOTO_CATEGORIES[activeCategory];
    if (direction === 'prev' && activePhotoIndex > 0) {
      handlePhotoSelect(activePhotoIndex - 1);
    } else if (direction === 'next' && activePhotoIndex < currentCategory.photos.length - 1) {
      handlePhotoSelect(activePhotoIndex + 1);
    }
  }, [activeCategory, activePhotoIndex, handlePhotoSelect]);
  
  if (loadingApp || loadingPhotos) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Loading">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <p className="text-lg text-center">Application not found</p>
        <Button 
          onClick={() => navigate("/portal/applications")} 
          data-testid="button-back-to-applications"
          className="min-h-12 px-6"
        >
          Back to Applications
        </Button>
      </div>
    );
  }
  
  const currentCategory = PROPERTY_PHOTO_CATEGORIES[activeCategory];
  const currentPhoto = currentCategory.photos[activePhotoIndex];
  const existingPhoto = getPhotoForType(currentPhoto.type);
  
  const propertyAddress = [application.propertyAddress, application.propertyCity, application.propertyState]
    .filter(Boolean)
    .join(", ");
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b safe-area-inset-top">
        <div className="flex items-center gap-2 px-3 py-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(`/portal/applications/${applicationId}`)}
            data-testid="button-back"
            className="min-h-11 min-w-11 shrink-0"
            aria-label="Go back to application"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold truncate">Photo Verification</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{propertyAddress || "No address"}</span>
            </p>
          </div>
          <div className="text-right shrink-0">
            <Badge 
              variant={totalProgress === 100 ? "default" : "secondary"} 
              className="text-xs"
              aria-label={`${totalProgress}% complete`}
            >
              {totalProgress}%
            </Badge>
          </div>
        </div>
        
        <div className="border-t">
          <ScrollArea className="w-full">
            <div className="flex p-2 gap-2" role="tablist" aria-label="Photo categories">
              {(Object.entries(PROPERTY_PHOTO_CATEGORIES) as [CategoryKey, typeof PROPERTY_PHOTO_CATEGORIES[CategoryKey]][]).map(([key, category]) => {
                const Icon = category.icon;
                const progress = getCategoryProgress(key);
                const isActive = activeCategory === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleCategoryChange(key)}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${key}`}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-colors min-h-11 ${
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted hover-elevate"
                    }`}
                    data-testid={`button-category-${key}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{category.shortLabel}</span>
                    <Badge 
                      variant={progress === 100 ? "default" : "outline"} 
                      className={`text-xs ml-1 ${isActive ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30" : ""}`}
                    >
                      {progress}%
                    </Badge>
                  </button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col overflow-hidden" id={`panel-${activeCategory}`} role="tabpanel">
        <div className="p-3 border-b bg-muted/30">
          <div className="flex items-center justify-between gap-2 min-h-11">
            <button 
              onClick={() => setShowPhotoList(!showPhotoList)}
              className="flex items-center gap-3 min-w-0 flex-1"
              aria-expanded={showPhotoList}
              aria-controls="photo-list"
              data-testid="button-toggle-photo-list"
            >
              {existingPhoto ? (
                getStatusIcon(existingPhoto.verificationStatus)
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0" aria-hidden="true" />
              )}
              <div className="text-left min-w-0">
                <p className="font-medium text-sm truncate">{currentPhoto.label}</p>
                <p className="text-xs text-muted-foreground">
                  {activePhotoIndex + 1} of {currentCategory.photos.length}
                </p>
              </div>
              {showPhotoList ? <ChevronUp className="h-5 w-5 shrink-0" /> : <ChevronDown className="h-5 w-5 shrink-0" />}
            </button>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigatePhoto('prev')}
                disabled={activePhotoIndex === 0}
                className="min-h-11 min-w-11"
                aria-label="Previous photo"
                data-testid="button-prev-photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigatePhoto('next')}
                disabled={activePhotoIndex === currentCategory.photos.length - 1}
                className="min-h-11 min-w-11"
                aria-label="Next photo"
                data-testid="button-next-photo"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {showPhotoList && (
            <div id="photo-list" className="mt-3 space-y-1 max-h-48 overflow-y-auto" role="listbox">
              {currentCategory.photos.map((photo, index) => {
                const existing = getPhotoForType(photo.type);
                const isActive = index === activePhotoIndex;
                return (
                  <button
                    key={photo.type}
                    onClick={() => handlePhotoSelect(index)}
                    role="option"
                    aria-selected={isActive}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left min-h-12 ${
                      isActive ? "bg-primary/10" : "hover-elevate"
                    }`}
                    data-testid={`button-photo-${photo.type}`}
                  >
                    {existing ? (
                      getStatusIcon(existing.verificationStatus)
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                    )}
                    <span className={`text-sm ${existing ? "text-foreground" : "text-muted-foreground"}`}>
                      {photo.label}
                    </span>
                    {existing && (
                      <Check className="h-4 w-4 text-green-500 ml-auto shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-sm text-muted-foreground mb-3">{currentPhoto.description}</p>
          
          {locationError && (
            <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2" role="alert">
              <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700 dark:text-yellow-400">{locationError}</p>
            </div>
          )}
          
          {existingPhoto && !capturedImage && !isCapturing ? (
            <div className="space-y-3">
              <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                <img
                  src={existingPhoto.fileKey.startsWith("/") ? existingPhoto.fileKey : `/objects/${existingPhoto.fileKey}`}
                  alt={currentPhoto.label}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3 bg-background/80 backdrop-blur rounded-full p-1.5">
                  {getStatusIcon(existingPhoto.verificationStatus)}
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 min-w-0">
                  <ImageIcon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{existingPhoto.fileName}</span>
                </div>
                {existingPhoto.exifTimestamp && (
                  <span className="text-xs shrink-0">{new Date(existingPhoto.exifTimestamp).toLocaleDateString()}</span>
                )}
              </div>
              
              {existingPhoto.notes && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{existingPhoto.notes}</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 min-h-12"
                  onClick={() => deleteMutation.mutate(existingPhoto.id)}
                  disabled={deleteMutation.isPending}
                  data-testid="button-delete-photo"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Delete
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 min-h-12"
                  onClick={() => startCamera()}
                  data-testid="button-retake-photo"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Retake
                </Button>
              </div>
            </div>
          ) : isCapturing ? (
            <div className="fixed inset-0 z-[100] bg-black flex flex-col">
              <div className="relative flex-1 flex items-center justify-center overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-white">
                      <p className="text-lg font-semibold">{currentPhoto.label}</p>
                      <p className="text-sm text-white/80">{currentPhoto.description}</p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="bg-white/20 text-white border-white/30 shrink-0"
                    >
                      {activePhotoIndex + 1}/{currentCategory.photos.length}
                    </Badge>
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white/80 text-sm">{currentCategory.label}</p>
                    <div className="flex gap-1.5">
                      {currentCategory.photos.map((photo, idx) => {
                        const hasPhoto = !!getPhotoForType(photo.type);
                        const isCurrent = idx === activePhotoIndex;
                        return (
                          <div 
                            key={photo.type}
                            className={`w-2.5 h-2.5 rounded-full transition-colors ${
                              hasPhoto ? 'bg-green-500' : 
                              isCurrent ? 'bg-white' : 'bg-white/30'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-black safe-area-inset-bottom">
                <div className="flex items-center justify-center gap-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-14 w-14 rounded-full bg-white/10 text-white hover:bg-white/20"
                    onClick={stopCamera}
                    data-testid="button-cancel-camera"
                    aria-label="Cancel"
                  >
                    <X className="h-7 w-7" />
                  </Button>
                  <button
                    onClick={capturePhoto}
                    data-testid="button-capture-photo"
                    className="h-20 w-20 rounded-full bg-white flex items-center justify-center hover-elevate active:scale-95 transition-transform"
                    aria-label="Take photo"
                  >
                    <div className="h-16 w-16 rounded-full border-4 border-black/20" />
                  </button>
                  <div className="h-14 w-14" />
                </div>
              </div>
            </div>
          ) : capturedImage ? (
            <div className="space-y-3">
              <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                <img
                  src={capturedImage}
                  alt="Captured preview"
                  className="w-full h-full object-contain"
                />
              </div>
              
              <Textarea
                placeholder="Add notes about this photo (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-20 text-base"
                data-testid="input-photo-notes"
              />
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="min-h-14 min-w-14"
                  size="icon"
                  onClick={() => {
                    setCapturedImage(null);
                    setCapturedFile(null);
                    setNotes("");
                  }}
                  data-testid="button-discard-photo"
                  aria-label="Discard photo"
                >
                  <X className="h-6 w-6" />
                </Button>
                <Button
                  className="flex-1 min-h-14 text-lg"
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  data-testid="button-save-photo"
                >
                  {uploadMutation.isPending ? (
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  ) : (
                    <Check className="h-6 w-6 mr-2" />
                  )}
                  {uploadMutation.isPending ? "Uploading..." : "Save Photo"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <Camera className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-center text-muted-foreground">
                Take a photo or upload an image
              </p>
            </div>
          )}
        </div>
      </main>
      
      {!isCapturing && !capturedImage && !existingPhoto && (
        <footer className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-3 safe-area-inset-bottom">
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="input-file-upload"
            />
            <Button
              variant="outline"
              className="flex-1 min-h-14 text-base"
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-upload-file"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload
            </Button>
            <Button
              className="flex-1 min-h-14 text-base"
              onClick={startCamera}
              data-testid="button-start-camera"
            >
              <Camera className="h-5 w-5 mr-2" />
              Camera
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}
