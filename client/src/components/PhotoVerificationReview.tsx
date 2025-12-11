import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Camera,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  Navigation,
  ExternalLink,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Loader2,
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
  exifAltitude?: string;
  browserLatitude?: string;
  browserLongitude?: string;
  browserAccuracyMeters?: number;
  browserCapturedAt?: string;
  distanceExifToBrowserMeters?: number;
  distanceExifToPropertyMeters?: number;
  distanceBrowserToPropertyMeters?: number;
  gpsPermissionDenied?: boolean;
  exifGpsMissing?: boolean;
  notes?: string;
  verificationStatus: string;
  verificationDetails?: string;
  verifiedByUserId?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PhotoVerificationReviewProps {
  photos: VerificationPhoto[];
  applicationId: string;
  propertyLatitude?: number;
  propertyLongitude?: number;
  propertyAddress?: string;
}

const PHOTO_TYPE_LABELS: Record<string, string> = {
  exterior_front: "Front of Property",
  exterior_back: "Back of Property",
  exterior_left: "Left Side",
  exterior_right: "Right Side",
  street_view: "Street View",
  neighborhood: "Neighborhood",
  interior_living: "Living Room",
  interior_kitchen: "Kitchen",
  interior_bathroom: "Main Bathroom",
  interior_bedroom: "Master Bedroom",
  interior_other: "Additional Interior",
  renovation_before: "Before Renovation",
  renovation_during: "Renovation Progress",
  renovation_after: "After Renovation",
  renovation_detail: "Renovation Details",
  foundation: "Foundation",
  framing: "Framing",
  plumbing: "Plumbing Rough-in",
  electrical: "Electrical Rough-in",
  hvac: "HVAC Installation",
  roofing: "Roofing",
  exterior_finish: "Exterior Finish",
  interior_finish: "Interior Finish",
  landscaping: "Landscaping",
};

const getVerificationStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "verified":
    case "gps_match":
    case "manual_approved":
      return "default";
    case "gps_mismatch":
    case "outside_geofence":
    case "stale_timestamp":
    case "manual_rejected":
      return "destructive";
    case "pending":
    case "browser_gps_only":
    case "exif_gps_only":
      return "secondary";
    default:
      return "outline";
  }
};

const getVerificationStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: "Pending",
    verified: "Verified",
    gps_match: "GPS Verified",
    gps_mismatch: "GPS Mismatch",
    outside_geofence: "Outside Area",
    stale_timestamp: "Photo Too Old",
    metadata_missing: "No Metadata",
    browser_gps_only: "Browser GPS Only",
    exif_gps_only: "Photo GPS Only",
    no_gps_data: "No GPS",
    manual_approved: "Approved",
    manual_rejected: "Rejected",
  };
  return labels[status] || status;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "verified":
    case "gps_match":
    case "manual_approved":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "gps_mismatch":
    case "outside_geofence":
    case "stale_timestamp":
    case "manual_rejected":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case "pending":
    case "browser_gps_only":
    case "exif_gps_only":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

export function PhotoVerificationReview({
  photos,
  applicationId,
  propertyLatitude,
  propertyLongitude,
  propertyAddress,
}: PhotoVerificationReviewProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<VerificationPhoto | null>(null);
  const [overrideNotes, setOverrideNotes] = useState("");
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const updateStatusMutation = useMutation({
    mutationFn: async ({ photoId, status, notes }: { photoId: string; status: string; notes?: string }) => {
      return apiRequest("PATCH", `/api/admin/verification-photos/${photoId}`, {
        verificationStatus: status,
        verificationNotes: notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications", applicationId, "verification-photos"] });
      toast({ title: "Photo status updated" });
      setSelectedPhoto(null);
      setShowApproveDialog(false);
      setShowRejectDialog(false);
      setOverrideNotes("");
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
    },
  });
  
  const handleApprove = () => {
    if (!selectedPhoto) return;
    updateStatusMutation.mutate({
      photoId: selectedPhoto.id,
      status: "manual_approved",
      notes: overrideNotes,
    });
  };
  
  const handleReject = () => {
    if (!selectedPhoto) return;
    updateStatusMutation.mutate({
      photoId: selectedPhoto.id,
      status: "manual_rejected",
      notes: overrideNotes,
    });
  };
  
  const openGoogleMaps = (lat: string, lng: string, label: string) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      "_blank"
    );
  };
  
  const getDistanceColor = (meters: number | undefined): string => {
    if (meters === undefined || meters === null) return "text-muted-foreground";
    if (meters <= 50) return "text-green-600";
    if (meters <= 100) return "text-yellow-600";
    return "text-red-600";
  };
  
  const formatDistance = (meters: number | undefined): string => {
    if (meters === undefined || meters === null) return "N/A";
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(2)}km`;
  };
  
  if (photos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Property Verification Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No verification photos uploaded yet</p>
        </CardContent>
      </Card>
    );
  }
  
  const groupedPhotos = photos.reduce((acc, photo) => {
    const category = photo.photoType.split("_")[0];
    if (!acc[category]) acc[category] = [];
    acc[category].push(photo);
    return acc;
  }, {} as Record<string, VerificationPhoto[]>);
  
  const categoryLabels: Record<string, string> = {
    exterior: "Exterior Photos",
    street: "Street/Neighborhood",
    interior: "Interior Photos",
    renovation: "Renovation Photos",
    foundation: "Construction - Foundation",
    framing: "Construction - Framing",
    plumbing: "Construction - Plumbing",
    electrical: "Construction - Electrical",
    hvac: "Construction - HVAC",
    roofing: "Construction - Roofing",
    landscaping: "Construction - Landscaping",
  };
  
  const verifiedCount = photos.filter(p => 
    ["verified", "gps_match", "manual_approved"].includes(p.verificationStatus)
  ).length;
  
  const pendingCount = photos.filter(p => 
    ["pending", "browser_gps_only", "exif_gps_only"].includes(p.verificationStatus)
  ).length;
  
  const failedCount = photos.filter(p => 
    ["gps_mismatch", "outside_geofence", "stale_timestamp", "manual_rejected", "no_gps_data", "metadata_missing"].includes(p.verificationStatus)
  ).length;
  
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Property Verification Photos
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="flex items-center gap-1" data-testid="badge-verified-count">
                <CheckCircle2 className="h-3 w-3" />
                {verifiedCount} Verified
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1" data-testid="badge-pending-count">
                <Clock className="h-3 w-3" />
                {pendingCount} Pending
              </Badge>
              {failedCount > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1" data-testid="badge-failed-count">
                  <AlertCircle className="h-3 w-3" />
                  {failedCount} Failed
                </Badge>
              )}
            </div>
          </div>
          {propertyAddress && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {propertyAddress}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(groupedPhotos).map(([category, categoryPhotos]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                {categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1)}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {categoryPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group rounded-lg overflow-hidden border bg-muted cursor-pointer hover-elevate"
                    onClick={() => setSelectedPhoto(photo)}
                    data-testid={`photo-card-${photo.id}`}
                  >
                    <div className="aspect-[4/3]">
                      <img
                        src={photo.fileKey.startsWith("/") ? photo.fileKey : `/objects/${photo.fileKey}`}
                        alt={PHOTO_TYPE_LABELS[photo.photoType] || photo.photoType}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge 
                        variant={getVerificationStatusBadgeVariant(photo.verificationStatus)}
                        className="text-[10px] px-1.5 py-0.5"
                      >
                        {getStatusIcon(photo.verificationStatus)}
                      </Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-xs text-white truncate">
                        {PHOTO_TYPE_LABELS[photo.photoType] || photo.photoType}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Dialog open={!!selectedPhoto && !showApproveDialog && !showRejectDialog} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-2 flex-wrap">
              <span>{selectedPhoto && (PHOTO_TYPE_LABELS[selectedPhoto.photoType] || selectedPhoto.photoType)}</span>
              {selectedPhoto && (
                <Badge variant={getVerificationStatusBadgeVariant(selectedPhoto.verificationStatus)}>
                  {getStatusIcon(selectedPhoto.verificationStatus)}
                  <span className="ml-1">{getVerificationStatusLabel(selectedPhoto.verificationStatus)}</span>
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPhoto && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={selectedPhoto.fileKey.startsWith("/") ? selectedPhoto.fileKey : `/objects/${selectedPhoto.fileKey}`}
                  alt={PHOTO_TYPE_LABELS[selectedPhoto.photoType] || selectedPhoto.photoType}
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      Browser GPS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    {selectedPhoto.browserLatitude && selectedPhoto.browserLongitude ? (
                      <>
                        <p className="text-muted-foreground">
                          {parseFloat(selectedPhoto.browserLatitude).toFixed(6)}, {parseFloat(selectedPhoto.browserLongitude).toFixed(6)}
                        </p>
                        {selectedPhoto.browserAccuracyMeters && (
                          <p className="text-xs text-muted-foreground">
                            Accuracy: ±{selectedPhoto.browserAccuracyMeters}m
                          </p>
                        )}
                        {selectedPhoto.browserCapturedAt && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(selectedPhoto.browserCapturedAt).toLocaleString()}
                          </p>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() => openGoogleMaps(selectedPhoto.browserLatitude!, selectedPhoto.browserLongitude!, "Browser")}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View on Map
                        </Button>
                      </>
                    ) : selectedPhoto.gpsPermissionDenied ? (
                      <p className="text-red-500 text-xs">GPS permission denied</p>
                    ) : (
                      <p className="text-muted-foreground text-xs">Not captured</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <Camera className="h-4 w-4 text-green-500" />
                      Photo EXIF GPS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    {selectedPhoto.exifLatitude && selectedPhoto.exifLongitude ? (
                      <>
                        <p className="text-muted-foreground">
                          {parseFloat(selectedPhoto.exifLatitude).toFixed(6)}, {parseFloat(selectedPhoto.exifLongitude).toFixed(6)}
                        </p>
                        {selectedPhoto.exifAltitude && (
                          <p className="text-xs text-muted-foreground">
                            Altitude: {parseFloat(selectedPhoto.exifAltitude).toFixed(1)}m
                          </p>
                        )}
                        {selectedPhoto.exifTimestamp && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(selectedPhoto.exifTimestamp).toLocaleString()}
                          </p>
                        )}
                        {selectedPhoto.exifCameraModel && (
                          <p className="text-xs text-muted-foreground">
                            {selectedPhoto.exifCameraModel}
                          </p>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() => openGoogleMaps(selectedPhoto.exifLatitude!, selectedPhoto.exifLongitude!, "EXIF")}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View on Map
                        </Button>
                      </>
                    ) : (
                      <p className="text-orange-500 text-xs">No EXIF GPS data</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <Navigation className="h-4 w-4" />
                    GPS Comparison Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Browser vs Photo</p>
                      <p className={`font-semibold ${getDistanceColor(selectedPhoto.distanceExifToBrowserMeters)}`}>
                        {formatDistance(selectedPhoto.distanceExifToBrowserMeters)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Photo vs Property</p>
                      <p className={`font-semibold ${getDistanceColor(selectedPhoto.distanceExifToPropertyMeters)}`}>
                        {formatDistance(selectedPhoto.distanceExifToPropertyMeters)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Browser vs Property</p>
                      <p className={`font-semibold ${getDistanceColor(selectedPhoto.distanceBrowserToPropertyMeters)}`}>
                        {formatDistance(selectedPhoto.distanceBrowserToPropertyMeters)}
                      </p>
                    </div>
                  </div>
                  
                  {selectedPhoto.verificationDetails && (
                    <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                      {selectedPhoto.verificationDetails}
                    </p>
                  )}
                </CardContent>
              </Card>
              
              {selectedPhoto.notes && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Borrower Notes:</p>
                  <p className="text-sm">{selectedPhoto.notes}</p>
                </div>
              )}
              
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPhoto(null)}
                  data-testid="button-close-photo"
                >
                  Close
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => setShowRejectDialog(true)}
                    data-testid="button-reject-photo"
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => setShowApproveDialog(true)}
                    data-testid="button-approve-photo"
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Photo</DialogTitle>
            <DialogDescription>
              Manually approve this photo verification. This will override any automatic GPS verification results.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Add approval notes (optional)"
            value={overrideNotes}
            onChange={(e) => setOverrideNotes(e.target.value)}
            className="min-h-20"
            data-testid="input-approval-notes"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowApproveDialog(false);
              setOverrideNotes("");
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={updateStatusMutation.isPending}
              data-testid="button-confirm-approve"
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ThumbsUp className="h-4 w-4 mr-2" />
              )}
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Photo</DialogTitle>
            <DialogDescription>
              Manually reject this photo verification. Please provide a reason for rejection.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection (required)"
            value={overrideNotes}
            onChange={(e) => setOverrideNotes(e.target.value)}
            className="min-h-20"
            data-testid="input-rejection-notes"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRejectDialog(false);
              setOverrideNotes("");
            }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={updateStatusMutation.isPending || !overrideNotes.trim()}
              data-testid="button-confirm-reject"
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ThumbsDown className="h-4 w-4 mr-2" />
              )}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
