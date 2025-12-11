import { useState, useRef, useCallback, useEffect } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Camera, Video, X, Check, ChevronLeft, ChevronRight, Trash2, Play, Pause, RotateCcw, Image as ImageIcon, Film, Loader2, Menu, DollarSign, CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { 
  DRAW_MEDIA_CATEGORY_LABELS, 
  PHOTO_VERIFICATION_CONFIG,
  SCOPE_OF_WORK_CATEGORY_NAMES,
  type DrawMediaCategory,
  type DrawPhoto,
  type LoanDraw,
  type DrawLineItem,
  type ScopeOfWorkCategory
} from "@shared/schema";

interface CapturedMedia {
  id: string;
  file: File;
  type: "photo" | "video";
  category: DrawMediaCategory;
  previewUrl: string;
  caption: string;
  uploadProgress: number;
  uploadStatus: "pending" | "uploading" | "completed" | "error";
  durationSeconds?: number;
  scopeItemId?: string;
  browserLocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: Date;
  };
}

interface EnrichedDrawLineItem extends DrawLineItem {
  scopeItemName: string;
  scopeItemCategory: ScopeOfWorkCategory;
  scopeItemBudget: number;
}

const GENERIC_CATEGORIES: DrawMediaCategory[] = [
  "site_overview",
  "exterior_progress",
  "interior_progress",
  "safety_compliance",
  "materials_delivery",
  "before",
  "during",
  "after",
  "other",
];

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function scopeCategoryToMediaCategory(scopeCategory: ScopeOfWorkCategory): DrawMediaCategory {
  const mapping: Record<ScopeOfWorkCategory, DrawMediaCategory> = {
    soft_costs: "other",
    demo_foundation: "foundation",
    hvac_plumbing_electrical: "electrical",
    interior: "interior_progress",
    exterior: "exterior_progress",
  };
  return mapping[scopeCategory];
}

export default function DrawMediaCapturePage() {
  const [, params] = useRoute("/portal/loans/:loanId/draws/:drawId/capture");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const loanId = params?.loanId;
  const drawId = params?.drawId;
  
  const [selectedLineItemId, setSelectedLineItemId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<DrawMediaCategory>("site_overview");
  const [captureMode, setCaptureMode] = useState<"photo" | "video">("photo");
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("environment");
  const [cameraActive, setCameraActive] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [otherCategoriesOpen, setOtherCategoriesOpen] = useState(false);
  const [browserLocation, setBrowserLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: Date;
  } | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { data: draw, isLoading: drawLoading } = useQuery<LoanDraw>({
    queryKey: ["/api/loan-draws", drawId],
    enabled: !!drawId,
  });
  
  const { data: lineItems = [] } = useQuery<EnrichedDrawLineItem[]>({
    queryKey: ["/api/loan-draws", drawId, "line-items"],
    enabled: !!drawId,
  });
  
  const { data: existingPhotos = [] } = useQuery<DrawPhoto[]>({
    queryKey: ["/api/loan-draws", drawId, "photos"],
    enabled: !!drawId,
  });
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setBrowserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(),
          });
        },
        (error) => {
          console.warn("Geolocation error:", error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);
  
  useEffect(() => {
    if (lineItems.length > 0 && !selectedLineItemId) {
      setSelectedLineItemId(lineItems[0].id);
      const category = scopeCategoryToMediaCategory(lineItems[0].scopeItemCategory);
      setSelectedCategory(category);
    }
  }, [lineItems, selectedLineItemId]);
  
  const getPhotoCountForItem = (scopeOfWorkItemId: string) => {
    return capturedMedia.filter(m => m.scopeItemId === scopeOfWorkItemId).length + 
           existingPhotos.filter(p => p.scopeOfWorkItemId === scopeOfWorkItemId).length;
  };
  
  const getPhotoCountForCategory = (category: DrawMediaCategory) => {
    return capturedMedia.filter(m => m.category === category && !m.scopeItemId).length +
           existingPhotos.filter(p => p.category === category && !p.scopeOfWorkItemId).length;
  };
  
  const selectedLineItem = lineItems.find(li => li.id === selectedLineItemId);
  
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: captureMode === "video",
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      
      setCameraActive(true);
    } catch (err) {
      console.error("Camera error:", err);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
      setCameraActive(false);
    }
  }, [cameraFacing, captureMode, toast]);
  
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  }, []);
  
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);
  
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const id = `capture-${Date.now()}`;
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
          const previewUrl = URL.createObjectURL(blob);
          
          setCapturedMedia(prev => [...prev, {
            id,
            file,
            type: "photo",
            category: selectedCategory,
            previewUrl,
            caption: "",
            uploadProgress: 0,
            uploadStatus: "pending",
            scopeItemId: selectedLineItemId || undefined,
            browserLocation: browserLocation || undefined,
          }]);
          
          const itemLabel = selectedLineItem?.scopeItemName || DRAW_MEDIA_CATEGORY_LABELS[selectedCategory];
          toast({
            title: "Photo captured",
            description: `Added to ${itemLabel} queue`,
          });
        }
        setIsCapturing(false);
      }, "image/jpeg", 0.9);
    }
  }, [selectedCategory, selectedLineItemId, selectedLineItem, browserLocation, toast]);
  
  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    
    recordedChunksRef.current = [];
    setRecordingDuration(0);
    
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";
    
    const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: mimeType });
      const id = `capture-${Date.now()}`;
      const extension = mimeType.includes("webm") ? "webm" : "mp4";
      const file = new File([blob], `video-${Date.now()}.${extension}`, { type: mimeType });
      const previewUrl = URL.createObjectURL(blob);
      
      setCapturedMedia(prev => [...prev, {
        id,
        file,
        type: "video",
        category: selectedCategory,
        previewUrl,
        caption: "",
        uploadProgress: 0,
        uploadStatus: "pending",
        durationSeconds: recordingDuration,
        scopeItemId: selectedLineItemId || undefined,
        browserLocation: browserLocation || undefined,
      }]);
      
      const itemLabel = selectedLineItem?.scopeItemName || DRAW_MEDIA_CATEGORY_LABELS[selectedCategory];
      toast({
        title: "Video recorded",
        description: `${recordingDuration}s video added to ${itemLabel} queue`,
      });
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
    
    mediaRecorder.start(1000);
    setIsRecording(true);
    
    recordingIntervalRef.current = setInterval(() => {
      setRecordingDuration(prev => {
        const next = prev + 1;
        if (next >= PHOTO_VERIFICATION_CONFIG.MAX_VIDEO_DURATION_SECONDS) {
          stopRecording();
        }
        return next;
      });
    }, 1000);
  }, [selectedCategory, selectedLineItemId, selectedLineItem, browserLocation, recordingDuration, toast]);
  
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  }, [isRecording]);
  
  const removeMedia = useCallback((id: string) => {
    setCapturedMedia(prev => {
      const item = prev.find(m => m.id === id);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter(m => m.id !== id);
    });
  }, []);
  
  const updateCaption = useCallback((id: string, caption: string) => {
    setCapturedMedia(prev => 
      prev.map(m => m.id === id ? { ...m, caption } : m)
    );
  }, []);
  
  const uploadMedia = async (media: CapturedMedia) => {
    if (!drawId) return;
    
    setCapturedMedia(prev =>
      prev.map(m => m.id === media.id ? { ...m, uploadStatus: "uploading", uploadProgress: 10 } : m)
    );
    
    try {
      const uploadUrlRes = await apiRequest("POST", `/api/loan-draws/${drawId}/photos/upload-url`, {
        fileName: media.file.name,
      }) as unknown as { uploadURL: string };
      const { uploadURL } = uploadUrlRes;
      
      setCapturedMedia(prev =>
        prev.map(m => m.id === media.id ? { ...m, uploadProgress: 30 } : m)
      );
      
      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        body: media.file,
        headers: {
          "Content-Type": media.file.type,
        },
      });
      
      if (!uploadRes.ok) {
        throw new Error("Failed to upload file");
      }
      
      setCapturedMedia(prev =>
        prev.map(m => m.id === media.id ? { ...m, uploadProgress: 70 } : m)
      );
      
      const urlParts = new URL(uploadURL);
      const fileKey = urlParts.pathname;
      
      await apiRequest("POST", `/api/loan-draws/${drawId}/photos`, {
        fileKey,
        fileName: media.file.name,
        fileSizeBytes: media.file.size,
        mimeType: media.file.type,
        mediaType: media.type,
        category: media.category,
        caption: media.caption,
        durationSeconds: media.durationSeconds,
        scopeItemId: media.scopeItemId,
        browserLatitude: media.browserLocation?.latitude?.toString(),
        browserLongitude: media.browserLocation?.longitude?.toString(),
        browserAccuracyMeters: media.browserLocation ? Math.round(media.browserLocation.accuracy) : undefined,
        browserCapturedAt: media.browserLocation?.timestamp?.toISOString(),
      });
      
      setCapturedMedia(prev =>
        prev.map(m => m.id === media.id ? { ...m, uploadProgress: 100, uploadStatus: "completed" } : m)
      );
      
      queryClient.invalidateQueries({ queryKey: ["/api/loan-draws", drawId, "photos"] });
      
      setTimeout(() => {
        removeMedia(media.id);
      }, 1500);
      
    } catch (error) {
      console.error("Upload error:", error);
      setCapturedMedia(prev =>
        prev.map(m => m.id === media.id ? { ...m, uploadStatus: "error" } : m)
      );
      toast({
        title: "Upload failed",
        description: "Could not upload media. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const uploadAll = async () => {
    const pendingMedia = capturedMedia.filter(m => m.uploadStatus === "pending");
    for (const media of pendingMedia) {
      await uploadMedia(media);
    }
  };
  
  const pendingCount = capturedMedia.filter(m => m.uploadStatus === "pending").length;
  const uploadingCount = capturedMedia.filter(m => m.uploadStatus === "uploading").length;
  const totalCaptured = capturedMedia.length + existingPhotos.length;
  
  if (!loanId || !drawId) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Invalid draw reference</p>
          <Button asChild className="mt-4">
            <Link href="/portal/loans">Back to Loans</Link>
          </Button>
        </Card>
      </div>
    );
  }
  
  if (drawLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const LineItemPanel = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Draw #{draw?.drawNumber} Items</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select an item to capture photos
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {lineItems.map((item) => {
            const photoCount = getPhotoCountForItem(item.scopeOfWorkItemId);
            const isSelected = selectedLineItemId === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedLineItemId(item.id);
                  setSelectedCategory(scopeCategoryToMediaCategory(item.scopeItemCategory));
                  setPanelOpen(false);
                }}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  isSelected 
                    ? "bg-primary text-primary-foreground" 
                    : "hover-elevate"
                }`}
                data-testid={`button-line-item-${item.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {photoCount > 0 ? (
                        <CheckCircle2 className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary-foreground" : "text-green-600"}`} />
                      ) : (
                        <Circle className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary-foreground/60" : "text-muted-foreground"}`} />
                      )}
                      <span className="font-medium truncate">{item.scopeItemName}</span>
                    </div>
                    <div className={`text-xs mt-1 ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {SCOPE_OF_WORK_CATEGORY_NAMES[item.scopeItemCategory]}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-sm font-medium ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                      {formatCurrency(item.requestedAmount * 100)}
                    </span>
                    {photoCount > 0 && (
                      <Badge 
                        variant={isSelected ? "secondary" : "outline"} 
                        className="text-[10px] px-1.5"
                      >
                        {photoCount} {photoCount === 1 ? "photo" : "photos"}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        
        <Collapsible open={otherCategoriesOpen} onOpenChange={setOtherCategoriesOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between p-3 text-sm text-muted-foreground hover-elevate border-t mx-2" style={{ width: "calc(100% - 1rem)" }}>
              <span>Other Categories</span>
              {otherCategoriesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-2 space-y-1">
              {GENERIC_CATEGORIES.map((cat) => {
                const photoCount = getPhotoCountForCategory(cat);
                const isSelected = !selectedLineItemId && selectedCategory === cat;
                
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedLineItemId(null);
                      setSelectedCategory(cat);
                      setPanelOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isSelected 
                        ? "bg-primary text-primary-foreground" 
                        : "hover-elevate"
                    }`}
                    data-testid={`button-category-${cat}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{DRAW_MEDIA_CATEGORY_LABELS[cat]}</span>
                      {photoCount > 0 && (
                        <Badge 
                          variant={isSelected ? "secondary" : "outline"} 
                          className="text-[10px] px-1.5"
                        >
                          {photoCount}
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </ScrollArea>
      
      <div className="p-4 border-t space-y-2">
        <div className="text-center text-sm text-muted-foreground">
          {totalCaptured} total {totalCaptured === 1 ? "photo" : "photos"} captured
        </div>
        <Button 
          className="w-full gap-2" 
          size="lg"
          onClick={() => setLocation(`/portal/loans/${loanId}`)}
          data-testid="button-done-capture"
        >
          <Check className="h-5 w-5" />
          Done - Return to Loan
        </Button>
      </div>
    </div>
  );
  
  return (
    <div className="flex flex-col h-screen bg-black">
      <header className="flex items-center justify-between p-3 bg-background/95 backdrop-blur border-b z-10">
        <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-open-panel">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <LineItemPanel />
          </SheetContent>
        </Sheet>
        
        <div className="text-center flex-1 mx-2">
          <h1 className="text-sm font-semibold truncate">
            {selectedLineItem?.scopeItemName || DRAW_MEDIA_CATEGORY_LABELS[selectedCategory]}
          </h1>
          <p className="text-xs text-muted-foreground">
            {selectedLineItem 
              ? formatCurrency(selectedLineItem.requestedAmount * 100)
              : `Draw #${draw?.drawNumber}`
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge variant="secondary" data-testid="badge-pending-count">{pendingCount}</Badge>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            asChild 
            data-testid="button-back"
          >
            <Link href={`/portal/loans/${loanId}`}>
              <X className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </header>
      
      <div className="flex-1 relative overflow-hidden bg-black">
        {cameraActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: cameraFacing === "user" ? "scaleX(-1)" : "none" }}
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {isRecording && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-sm font-medium">
                  {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, "0")}
                </span>
                <span className="text-xs opacity-75">/ {Math.floor(PHOTO_VERIFICATION_CONFIG.MAX_VIDEO_DURATION_SECONDS / 60)}:{(PHOTO_VERIFICATION_CONFIG.MAX_VIDEO_DURATION_SECONDS % 60).toString().padStart(2, "0")}</span>
              </div>
            )}
            
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-6">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full bg-background/80 backdrop-blur"
                onClick={() => {
                  setCameraFacing(f => f === "user" ? "environment" : "user");
                  startCamera();
                }}
                data-testid="button-flip-camera"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
              
              {captureMode === "photo" ? (
                <Button
                  size="icon"
                  className="h-16 w-16 rounded-full bg-white hover:bg-white/90 text-black"
                  onClick={capturePhoto}
                  disabled={isCapturing}
                  data-testid="button-capture-photo"
                >
                  {isCapturing ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <Camera className="h-8 w-8" />
                  )}
                </Button>
              ) : (
                <Button
                  size="icon"
                  className={`h-16 w-16 rounded-full ${isRecording ? "bg-red-600 hover:bg-red-700" : "bg-white hover:bg-white/90"} text-black`}
                  onClick={isRecording ? stopRecording : startRecording}
                  data-testid="button-record-video"
                >
                  {isRecording ? (
                    <div className="h-6 w-6 rounded bg-white" />
                  ) : (
                    <Video className="h-8 w-8 text-red-600" />
                  )}
                </Button>
              )}
              
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full bg-background/80 backdrop-blur"
                onClick={stopCamera}
                data-testid="button-close-camera"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 bg-muted/5">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-1">
                {selectedLineItem?.scopeItemName || DRAW_MEDIA_CATEGORY_LABELS[selectedCategory]}
              </h2>
              {selectedLineItem && (
                <p className="text-sm text-muted-foreground">
                  Requesting {formatCurrency(selectedLineItem.requestedAmount * 100)}
                </p>
              )}
            </div>
            
            <div className="flex gap-4 mb-6">
              <Button
                variant={captureMode === "photo" ? "default" : "outline"}
                onClick={() => setCaptureMode("photo")}
                className="gap-2"
                data-testid="button-mode-photo"
              >
                <ImageIcon className="h-4 w-4" />
                Photo
              </Button>
              <Button
                variant={captureMode === "video" ? "default" : "outline"}
                onClick={() => setCaptureMode("video")}
                className="gap-2"
                data-testid="button-mode-video"
              >
                <Film className="h-4 w-4" />
                Video
              </Button>
            </div>
            
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Button
                size="lg"
                className="gap-2 h-14"
                onClick={startCamera}
                data-testid="button-open-camera"
              >
                <Camera className="h-5 w-5" />
                Open Camera
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => setPanelOpen(true)}
                data-testid="button-switch-item"
              >
                <Menu className="h-5 w-5" />
                Switch Item
              </Button>
            </div>
            
            {browserLocation && (
              <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                GPS Active (±{Math.round(browserLocation.accuracy)}m)
              </p>
            )}
          </div>
        )}
      </div>
      
      {capturedMedia.length > 0 && (
        <div className="bg-background border-t">
          <div className="p-3 border-b flex items-center justify-between">
            <span className="text-sm font-medium">Capture Queue ({capturedMedia.length})</span>
            {pendingCount > 0 && (
              <Button
                size="sm"
                onClick={uploadAll}
                disabled={uploadingCount > 0}
                className="gap-1"
                data-testid="button-upload-all"
              >
                {uploadingCount > 0 ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Save All
              </Button>
            )}
          </div>
          
          <ScrollArea className="max-h-48">
            <div className="p-2 space-y-2">
              {capturedMedia.map((media) => (
                <div
                  key={media.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                  data-testid={`queue-item-${media.id}`}
                >
                  <div className="relative w-16 h-16 rounded overflow-hidden shrink-0">
                    {media.type === "video" ? (
                      <video
                        src={media.previewUrl}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={media.previewUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                    {media.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    )}
                    {media.uploadStatus === "uploading" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      </div>
                    )}
                    {media.uploadStatus === "completed" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-green-600/60">
                        <Check className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px]">
                        {media.type === "video" ? <Film className="h-3 w-3 mr-1" /> : <ImageIcon className="h-3 w-3 mr-1" />}
                        {lineItems.find(li => li.id === media.scopeItemId)?.scopeItemName || DRAW_MEDIA_CATEGORY_LABELS[media.category]}
                      </Badge>
                      {media.durationSeconds && (
                        <span className="text-[10px] text-muted-foreground">{media.durationSeconds}s</span>
                      )}
                    </div>
                    
                    {media.uploadStatus === "pending" ? (
                      <Input
                        placeholder="Add caption..."
                        value={media.caption}
                        onChange={(e) => updateCaption(media.id, e.target.value)}
                        className="h-7 text-xs"
                        data-testid={`input-caption-${media.id}`}
                      />
                    ) : media.uploadStatus === "uploading" ? (
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${media.uploadProgress}%` }}
                        />
                      </div>
                    ) : media.uploadStatus === "completed" ? (
                      <span className="text-xs text-green-600 font-medium">Uploaded</span>
                    ) : (
                      <span className="text-xs text-destructive font-medium">Upload failed</span>
                    )}
                  </div>
                  
                  {media.uploadStatus === "pending" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => removeMedia(media.id)}
                      data-testid={`button-remove-${media.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
