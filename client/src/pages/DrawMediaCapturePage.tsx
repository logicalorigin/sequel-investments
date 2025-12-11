import { useState, useRef, useCallback, useEffect } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Camera, Video, X, Check, ChevronLeft, Upload, Trash2, Play, Pause, RotateCcw, Image as ImageIcon, Film, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  DRAW_MEDIA_CATEGORY_LABELS, 
  PHOTO_VERIFICATION_CONFIG,
  type DrawMediaCategory,
  type DrawPhoto,
  type LoanDraw
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
  browserLocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: Date;
  };
}

const CATEGORIES: DrawMediaCategory[] = [
  "site_overview",
  "exterior_progress",
  "interior_progress",
  "foundation",
  "framing",
  "roofing",
  "plumbing",
  "electrical",
  "hvac",
  "drywall",
  "flooring",
  "cabinets_counters",
  "fixtures",
  "paint_finish",
  "landscaping",
  "safety_compliance",
  "materials_delivery",
  "before",
  "during",
  "after",
  "other",
];

export default function DrawMediaCapturePage() {
  const [, params] = useRoute("/portal/loans/:loanId/draws/:drawId/capture");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const loanId = params?.loanId;
  const drawId = params?.drawId;
  
  const [selectedCategory, setSelectedCategory] = useState<DrawMediaCategory>("site_overview");
  const [captureMode, setCaptureMode] = useState<"photo" | "video">("photo");
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("environment");
  const [cameraActive, setCameraActive] = useState(false);
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: draw, isLoading: drawLoading } = useQuery<LoanDraw>({
    queryKey: ["/api/loan-draws", drawId],
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
  
  const startCamera = useCallback(async () => {
    try {
      // Stop any existing streams first to prevent multiple concurrent streams
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
            browserLocation: browserLocation || undefined,
          }]);
          
          toast({
            title: "Photo captured",
            description: `Added to ${DRAW_MEDIA_CATEGORY_LABELS[selectedCategory]} queue`,
          });
        }
        setIsCapturing(false);
      }, "image/jpeg", 0.9);
    }
  }, [selectedCategory, browserLocation, toast]);
  
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
        browserLocation: browserLocation || undefined,
      }]);
      
      toast({
        title: "Video recorded",
        description: `${recordingDuration}s video added to ${DRAW_MEDIA_CATEGORY_LABELS[selectedCategory]} queue`,
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
  }, [selectedCategory, browserLocation, recordingDuration, toast]);
  
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  }, [isRecording]);
  
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith("video/");
      const isPhoto = file.type.startsWith("image/");
      
      if (!isVideo && !isPhoto) {
        toast({
          title: "Invalid file type",
          description: "Please select photos or videos only",
          variant: "destructive",
        });
        return;
      }
      
      if (isPhoto && file.size > PHOTO_VERIFICATION_CONFIG.MAX_PHOTO_SIZE_MB * 1024 * 1024) {
        toast({
          title: "Photo too large",
          description: `Maximum photo size is ${PHOTO_VERIFICATION_CONFIG.MAX_PHOTO_SIZE_MB}MB`,
          variant: "destructive",
        });
        return;
      }
      
      if (isVideo && file.size > PHOTO_VERIFICATION_CONFIG.MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        toast({
          title: "Video too large",
          description: `Maximum video size is ${PHOTO_VERIFICATION_CONFIG.MAX_VIDEO_SIZE_MB}MB`,
          variant: "destructive",
        });
        return;
      }
      
      const id = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const previewUrl = URL.createObjectURL(file);
      
      setCapturedMedia(prev => [...prev, {
        id,
        file,
        type: isVideo ? "video" : "photo",
        category: selectedCategory,
        previewUrl,
        caption: "",
        uploadProgress: 0,
        uploadStatus: "pending",
        browserLocation: browserLocation || undefined,
      }]);
    });
    
    if (event.target) {
      event.target.value = "";
    }
  }, [selectedCategory, browserLocation, toast]);
  
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
  
  return (
    <div className="flex flex-col h-screen bg-black">
      <header className="flex items-center justify-between p-3 bg-background/95 backdrop-blur border-b z-10">
        <Button variant="ghost" size="icon" asChild data-testid="button-back">
          <Link href={`/portal/loans/${loanId}`}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="text-center">
          <h1 className="text-sm font-semibold">Draw #{draw?.drawNumber} Media</h1>
          <p className="text-xs text-muted-foreground">{existingPhotos.length} uploaded</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge variant="secondary" data-testid="badge-pending-count">{pendingCount}</Badge>
          )}
        </div>
      </header>
      
      <div className="px-2 py-2 bg-background/95 backdrop-blur border-b">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                className="shrink-0 text-xs"
                onClick={() => setSelectedCategory(cat)}
                data-testid={`button-category-${cat}`}
              >
                {DRAW_MEDIA_CATEGORY_LABELS[cat]}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      
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
                className="gap-2 h-14"
                onClick={() => fileInputRef.current?.click()}
                data-testid="button-upload-files"
              >
                <Upload className="h-5 w-5" />
                Upload from Device
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                data-testid="input-file"
              />
            </div>
            
            <p className="mt-4 text-xs text-muted-foreground text-center">
              Category: <span className="font-medium text-foreground">{DRAW_MEDIA_CATEGORY_LABELS[selectedCategory]}</span>
            </p>
            
            {browserLocation && (
              <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
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
            <span className="text-sm font-medium">Upload Queue ({capturedMedia.length})</span>
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
                  <Upload className="h-4 w-4" />
                )}
                Upload All
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
                        {DRAW_MEDIA_CATEGORY_LABELS[media.category]}
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
