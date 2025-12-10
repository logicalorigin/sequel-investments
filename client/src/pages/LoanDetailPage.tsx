import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { format, differenceInDays, addMonths } from "date-fns";
import { 
  Building2, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  ArrowLeft,
  Home,
  HardHat,
  Hammer,
  Clock,
  Check,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileText,
  Download,
  Percent,
  MapPin,
  Wallet,
  Calculator,
  Plus,
  ChevronDown,
  ChevronUp,
  Send,
  Trash2,
  BarChart3,
  PiggyBank,
  TrendingDown,
  Activity,
  Camera,
  ImagePlus,
  X,
  Upload,
  Loader2,
  Eye,
  ShieldCheck,
  ShieldX,
  ShieldAlert
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PortalHeader } from "@/components/PortalHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { 
  ServicedLoan, 
  LoanPayment, 
  LoanDraw, 
  LoanEscrowItem, 
  LoanDocument, 
  LoanMilestone,
  AmortizationRow,
  ScopeOfWorkItem,
  DrawLineItem,
  ScopeOfWorkCategory,
  DrawPhoto,
  PhotoVerificationStatus
} from "@shared/schema";
import { calculateAmortizationSchedule, calculateInterestOnlyPayment, SCOPE_OF_WORK_CATEGORY_NAMES } from "@shared/schema";

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCurrencyPrecise = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const getLoanTypeLabel = (type: string): string => {
  switch (type) {
    case "dscr": return "DSCR";
    case "fix_flip": return "Fix & Flip";
    case "new_construction": return "New Construction";
    case "bridge": return "Bridge";
    default: return type;
  }
};

const getLoanTypeIcon = (type: string) => {
  switch (type) {
    case "dscr": return Building2;
    case "fix_flip": return Hammer;
    case "new_construction": return HardHat;
    case "bridge": return TrendingUp;
    default: return Home;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "current":
      return <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle2 className="h-3 w-3 mr-1" /> Current</Badge>;
    case "grace_period":
      return <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Clock className="h-3 w-3 mr-1" /> Grace Period</Badge>;
    case "late":
      return <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30"><AlertTriangle className="h-3 w-3 mr-1" /> Late</Badge>;
    case "default":
      return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Default</Badge>;
    case "paid_off":
      return <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30"><CheckCircle2 className="h-3 w-3 mr-1" /> Paid Off</Badge>;
    case "matured":
      return <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30"><Clock className="h-3 w-3 mr-1" /> Matured</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">Paid</Badge>;
    case "scheduled":
      return <Badge variant="outline">Scheduled</Badge>;
    case "late":
      return <Badge variant="destructive">Late</Badge>;
    case "partial":
      return <Badge variant="secondary" className="bg-amber-500/20 text-amber-400">Partial</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getDrawStatusBadge = (status: string) => {
  switch (status) {
    case "draft":
      return <Badge variant="outline">Draft</Badge>;
    case "submitted":
      return <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">Submitted</Badge>;
    case "inspection_scheduled":
      return <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">Inspection Scheduled</Badge>;
    case "inspection_complete":
      return <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400">Inspected</Badge>;
    case "approved":
      return <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">Approved</Badge>;
    case "funded":
      return <Badge variant="secondary" className="bg-green-500/20 text-green-400">Funded</Badge>;
    case "denied":
      return <Badge variant="destructive">Denied</Badge>;
    case "cancelled":
      return <Badge variant="secondary" className="bg-gray-500/20 text-gray-400">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const isHardMoneyLoan = (type: string): boolean => {
  return type === "fix_flip" || type === "new_construction" || type === "bridge";
};

const getPhotoVerificationBadge = (status: PhotoVerificationStatus) => {
  switch (status) {
    case "verified":
      return <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><ShieldCheck className="h-3 w-3 mr-1" /> Verified</Badge>;
    case "outside_geofence":
      return <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30"><ShieldAlert className="h-3 w-3 mr-1" /> Outside Area</Badge>;
    case "stale_timestamp":
      return <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Clock className="h-3 w-3 mr-1" /> Photo Too Old</Badge>;
    case "metadata_missing":
      return <Badge variant="secondary" className="bg-gray-500/20 text-gray-400 border-gray-500/30"><ShieldX className="h-3 w-3 mr-1" /> No GPS Data</Badge>;
    case "manual_approved":
      return <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>;
    case "manual_rejected":
      return <Badge variant="destructive"><X className="h-3 w-3 mr-1" /> Rejected</Badge>;
    case "pending":
    default:
      return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
  }
};

function DrawPhotoUpload({ draw, loanId, scopeOfWorkItems }: { draw: LoanDraw; loanId: string; scopeOfWorkItems: ScopeOfWorkItem[] }) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedScopeItemId, setSelectedScopeItemId] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);

  const { data: photos = [], isLoading: photosLoading } = useQuery<DrawPhoto[]>({
    queryKey: ["/api/loan-draws", draw.id, "photos"],
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      setUploadProgress(10);

      // Get upload URL
      const uploadUrlRes = await apiRequest("POST", `/api/loan-draws/${draw.id}/photos/upload-url`, {
        fileName: file.name,
      });
      const { uploadURL } = uploadUrlRes as { uploadURL: string };
      setUploadProgress(30);

      // Upload file to storage
      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });
      
      if (!uploadRes.ok) {
        throw new Error("Failed to upload file");
      }
      setUploadProgress(70);

      // Extract file key from upload URL
      const urlParts = new URL(uploadURL);
      const fileKey = urlParts.pathname;

      // Get browser location if available
      let browserLatitude: string | undefined;
      let browserLongitude: string | undefined;
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          browserLatitude = position.coords.latitude.toString();
          browserLongitude = position.coords.longitude.toString();
        } catch (e) {
          // Browser location not available, that's OK
        }
      }

      setUploadProgress(85);

      // Create photo record (server will parse EXIF and verify)
      const photo = await apiRequest("POST", `/api/loan-draws/${draw.id}/photos`, {
        fileKey,
        fileName: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type,
        browserLatitude,
        browserLongitude,
        scopeOfWorkItemId: selectedScopeItemId || undefined,
        caption: caption || undefined,
      });

      setUploadProgress(100);
      return photo;
    },
    onSuccess: (photo: DrawPhoto) => {
      queryClient.invalidateQueries({ queryKey: ["/api/loan-draws", draw.id, "photos"] });
      setIsUploading(false);
      setUploadProgress(0);
      setSelectedFile(null);
      setPreviewUrl(null);
      setSelectedScopeItemId("");
      setCaption("");
      setShowUploadDialog(false);
      
      // Show appropriate toast based on verification result
      if (photo.verificationStatus === "verified") {
        toast({ title: "Photo uploaded and verified", description: "GPS location confirmed at property" });
      } else if (photo.verificationStatus === "metadata_missing") {
        toast({ title: "Photo uploaded", description: "No GPS data found - staff review required", variant: "default" });
      } else if (photo.verificationStatus === "outside_geofence") {
        toast({ title: "Photo uploaded", description: "Photo taken outside property area - staff review required", variant: "default" });
      } else if (photo.verificationStatus === "stale_timestamp") {
        toast({ title: "Photo uploaded", description: "Photo is older than allowed - staff review required", variant: "default" });
      } else {
        toast({ title: "Photo uploaded successfully" });
      }
    },
    onError: (error: Error) => {
      setIsUploading(false);
      setUploadProgress(0);
      toast({ title: "Failed to upload photo", description: error.message, variant: "destructive" });
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      return apiRequest("DELETE", `/api/draw-photos/${photoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loan-draws", draw.id, "photos"] });
      toast({ title: "Photo deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete photo", variant: "destructive" });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ["image/jpeg", "image/png", "image/heic", "image/heif"];
      if (!allowedTypes.includes(file.type)) {
        toast({ title: "Invalid file type", description: "Please upload a JPEG, PNG, or HEIC image", variant: "destructive" });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Maximum file size is 10MB", variant: "destructive" });
        return;
      }
      
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadPhotoMutation.mutate(selectedFile);
    }
  };

  const verifiedCount = photos.filter(p => p.verificationStatus === "verified" || p.verificationStatus === "manual_approved").length;
  const pendingCount = photos.filter(p => p.verificationStatus === "pending").length;
  const issueCount = photos.filter(p => ["outside_geofence", "stale_timestamp", "metadata_missing"].includes(p.verificationStatus)).length;

  return (
    <div className="flex items-center gap-2">
      {/* Photo count summary */}
      {photos.length > 0 && (
        <div className="flex items-center gap-1">
          {verifiedCount > 0 && (
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 text-xs" data-testid={`badge-verified-count-${draw.id}`}>
              <ShieldCheck className="h-3 w-3 mr-1" />{verifiedCount}
            </Badge>
          )}
          {pendingCount > 0 && (
            <Badge variant="outline" className="text-xs" data-testid={`badge-pending-count-${draw.id}`}>
              <Clock className="h-3 w-3 mr-1" />{pendingCount}
            </Badge>
          )}
          {issueCount > 0 && (
            <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 text-xs" data-testid={`badge-issue-count-${draw.id}`}>
              <ShieldAlert className="h-3 w-3 mr-1" />{issueCount}
            </Badge>
          )}
        </div>
      )}

      {/* View gallery button */}
      {photos.length > 0 && (
        <Dialog open={showGalleryDialog} onOpenChange={setShowGalleryDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" data-testid={`button-view-photos-${draw.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              {photos.length}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Draw #{draw.drawNumber} Photos</DialogTitle>
              <DialogDescription>
                {verifiedCount} verified, {pendingCount} pending review, {issueCount} need attention
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group rounded-lg overflow-hidden border" data-testid={`photo-card-${photo.id}`}>
                  <img 
                    src={photo.fileKey.startsWith('/') ? photo.fileKey : `/objects/${photo.fileKey}`} 
                    alt={photo.fileName}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                    <div className="flex items-center justify-between">
                      {getPhotoVerificationBadge(photo.verificationStatus)}
                      {draw.status === "draft" && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="text-white hover:text-red-400 opacity-0 group-hover:opacity-100"
                          onClick={() => deletePhotoMutation.mutate(photo.id)}
                          data-testid={`button-delete-photo-${photo.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {photo.caption && (
                      <p className="text-xs text-white/80 mt-1 truncate">{photo.caption}</p>
                    )}
                  </div>
                  {photo.distanceFromPropertyMeters !== null && photo.distanceFromPropertyMeters !== undefined && (
                    <div className="absolute top-2 right-2 bg-black/60 rounded px-1.5 py-0.5 text-[10px] text-white">
                      {photo.distanceFromPropertyMeters}m away
                    </div>
                  )}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Upload button - only for draft draws */}
      {draw.status === "draft" && (
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" data-testid={`button-upload-photo-${draw.id}`}>
              <Camera className="h-4 w-4 mr-1" />
              Add Photo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Progress Photo</DialogTitle>
              <DialogDescription>
                Take a photo at the property to verify work completion. Photos should include GPS location data.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* File input with camera capture for mobile */}
              {!selectedFile ? (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/heic,image/heif"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                    id={`photo-upload-${draw.id}`}
                    data-testid={`input-photo-file-${draw.id}`}
                  />
                  <label 
                    htmlFor={`photo-upload-${draw.id}`}
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <div className="p-4 rounded-full bg-primary/10">
                      <Camera className="h-8 w-8 text-primary" />
                    </div>
                    <p className="font-medium">Take Photo or Choose File</p>
                    <p className="text-xs text-muted-foreground">
                      JPEG, PNG, or HEIC up to 10MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden">
                    <img 
                      src={previewUrl!} 
                      alt="Preview" 
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      data-testid={`button-clear-preview-${draw.id}`}
                    >
                      <X className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                  
                  {/* Scope of work item selector */}
                  {scopeOfWorkItems.length > 0 && (
                    <div>
                      <Label htmlFor="scopeItem">Link to work item (optional)</Label>
                      <select
                        id="scopeItem"
                        value={selectedScopeItemId}
                        onChange={(e) => setSelectedScopeItemId(e.target.value)}
                        className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                        data-testid={`select-scope-item-${draw.id}`}
                      >
                        <option value="">Select work item...</option>
                        {scopeOfWorkItems.map((item) => (
                          <option key={item.id} value={item.id}>{item.itemName}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="caption">Caption (optional)</Label>
                    <Input
                      id="caption"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Describe the work shown..."
                      className="mt-1"
                      data-testid={`input-photo-caption-${draw.id}`}
                    />
                  </div>
                  
                  {isUploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-center text-muted-foreground">
                        {uploadProgress < 30 ? "Preparing upload..." : 
                         uploadProgress < 70 ? "Uploading photo..." : 
                         uploadProgress < 100 ? "Verifying location..." : "Complete!"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowUploadDialog(false);
                setSelectedFile(null);
                setPreviewUrl(null);
                setSelectedScopeItemId("");
                setCaption("");
              }} data-testid={`button-cancel-upload-${draw.id}`}>Cancel</Button>
              <Button 
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                data-testid={`button-confirm-upload-${draw.id}`}
              >
                {isUploading ? (
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
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface LoanDetailsResponse extends ServicedLoan {
  payments: LoanPayment[];
  draws: LoanDraw[];
  escrowItems: LoanEscrowItem[];
  documents: LoanDocument[];
  milestones: LoanMilestone[];
}

function AmortizationCalculator({ loan }: { loan: ServicedLoan }) {
  const [extraPayment, setExtraPayment] = useState(0);
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  
  const schedule = useMemo(() => {
    if (!loan.originalLoanAmount || !loan.interestRate || !loan.amortizationMonths || !loan.firstPaymentDate) {
      return [];
    }
    return calculateAmortizationSchedule(
      loan.originalLoanAmount,
      parseFloat(loan.interestRate),
      loan.amortizationMonths,
      new Date(loan.firstPaymentDate)
    );
  }, [loan]);
  
  const paidPayments = loan.totalPrincipalPaid && loan.originalLoanAmount
    ? Math.floor((loan.totalPrincipalPaid / loan.originalLoanAmount) * schedule.length)
    : 0;
  
  const remainingSchedule = schedule.slice(paidPayments);
  const displaySchedule = showFullSchedule ? remainingSchedule : remainingSchedule.slice(0, 12);
  
  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
  const remainingInterest = remainingSchedule.reduce((sum, row) => sum + row.interest, 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Amortization Schedule
        </CardTitle>
        <CardDescription>
          {loan.amortizationMonths ? `${loan.amortizationMonths / 12}-year` : ''} amortization at {loan.interestRate}% interest
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-primary">{formatCurrency(loan.monthlyPayment)}</p>
            <p className="text-xs text-muted-foreground">Monthly P&I</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{formatCurrency(loan.totalPrincipalPaid)}</p>
            <p className="text-xs text-muted-foreground">Principal Paid</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{formatCurrency(loan.totalInterestPaid)}</p>
            <p className="text-xs text-muted-foreground">Interest Paid</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{formatCurrency(remainingInterest)}</p>
            <p className="text-xs text-muted-foreground">Remaining Interest</p>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Loan Progress</span>
            <span>{((1 - (loan.currentBalance / loan.originalLoanAmount)) * 100).toFixed(1)}% paid</span>
          </div>
          <Progress value={(1 - (loan.currentBalance / loan.originalLoanAmount)) * 100} className="h-2" />
        </div>
        
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Payment</TableHead>
                <TableHead className="text-right">Principal</TableHead>
                <TableHead className="text-right">Interest</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displaySchedule.map((row, idx) => (
                <TableRow key={row.paymentNumber} data-testid={`row-amortization-${row.paymentNumber}`}>
                  <TableCell className="font-mono text-xs">{row.paymentNumber}</TableCell>
                  <TableCell className="text-sm">{format(row.paymentDate, "MMM yyyy")}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(row.payment)}</TableCell>
                  <TableCell className="text-right text-emerald-500">{formatCurrency(row.principal)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatCurrency(row.interest)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {remainingSchedule.length > 12 && (
          <Button 
            variant="ghost" 
            className="w-full mt-2"
            onClick={() => setShowFullSchedule(!showFullSchedule)}
          >
            {showFullSchedule ? (
              <>Show Less <ChevronUp className="ml-2 h-4 w-4" /></>
            ) : (
              <>Show All {remainingSchedule.length} Payments <ChevronDown className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface ScopeOfWorkWithFunding extends ScopeOfWorkItem {
  totalFunded: number;
}

interface CategorySummary {
  category: ScopeOfWorkCategory;
  totalBudget: number;
  totalFunded: number;
  items: ScopeOfWorkWithFunding[];
}

function DrawManagement({ loan, draws }: { loan: ServicedLoan; draws: LoanDraw[] }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"scope" | "draws">("scope");
  const [newDrawOpen, setNewDrawOpen] = useState(false);
  const [newDrawDescription, setNewDrawDescription] = useState("");
  const [drawLineAmounts, setDrawLineAmounts] = useState<Record<string, number>>({});
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [editBudgetValue, setEditBudgetValue] = useState("");
  const [draftStatus, setDraftStatus] = useState<"saved" | "saving" | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<{ description: string; lineAmounts: Record<string, number> } | null>(null);

  // Auto-save draft key
  const draftKey = `draw_draft_${loan.id}`;

  // Save draft function
  const saveDraftNow = useCallback(() => {
    const data = pendingDataRef.current;
    if (!data) return;
    
    const hasData = data.description || Object.values(data.lineAmounts).some(v => v > 0);
    if (!hasData) {
      localStorage.removeItem(draftKey);
      setDraftStatus(null);
      return;
    }
    
    try {
      localStorage.setItem(draftKey, JSON.stringify({
        description: data.description,
        lineAmounts: data.lineAmounts,
        savedAt: Date.now(),
      }));
      setDraftStatus("saved");
    } catch (e) {
      console.error("Failed to save draft:", e);
    }
  }, [draftKey]);

  // Load draft when dialog opens
  useEffect(() => {
    if (newDrawOpen) {
      try {
        const saved = localStorage.getItem(draftKey);
        if (saved) {
          const draft = JSON.parse(saved);
          if (draft.description) setNewDrawDescription(draft.description);
          if (draft.lineAmounts) setDrawLineAmounts(draft.lineAmounts);
          setDraftStatus("saved");
        }
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    } else {
      // Flush pending draft when dialog closes
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      saveDraftNow();
    }
  }, [newDrawOpen, draftKey, saveDraftNow]);

  // Auto-save draft with debounce - update pending data ref and schedule save
  useEffect(() => {
    if (!newDrawOpen) return;
    
    // Update pending data
    pendingDataRef.current = { description: newDrawDescription, lineAmounts: drawLineAmounts };
    
    // Check if there's anything to save
    const hasData = newDrawDescription || Object.values(drawLineAmounts).some(v => v > 0);
    if (!hasData) {
      localStorage.removeItem(draftKey);
      setDraftStatus(null);
      return;
    }

    setDraftStatus("saving");
    
    // Clear previous timeout and schedule new one
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveDraftNow();
      saveTimeoutRef.current = null;
    }, 500);
  }, [newDrawDescription, drawLineAmounts, newDrawOpen, draftKey, saveDraftNow]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Clear draft after successful submission
  const clearDraft = useCallback(() => {
    localStorage.removeItem(draftKey);
    pendingDataRef.current = null;
    setDraftStatus(null);
  }, [draftKey]);

  const { data: scopeOfWorkItems = [], isLoading: scopeLoading } = useQuery<ScopeOfWorkItem[]>({
    queryKey: ["/api/serviced-loans", loan.id, "scope-of-work"],
  });

  const { data: allDrawLineItems = [] } = useQuery<DrawLineItem[]>({
    queryKey: ["/api/serviced-loans", loan.id, "all-draw-line-items"],
    enabled: draws.length > 0,
  });

  const initializeScopeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/serviced-loans/${loan.id}/scope-of-work/initialize`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/serviced-loans", loan.id, "scope-of-work"] });
      toast({ title: "Scope of work initialized with default line items" });
    },
    onError: () => {
      toast({ title: "Failed to initialize scope of work", variant: "destructive" });
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async ({ id, budgetAmount }: { id: string; budgetAmount: number }) => {
      return apiRequest("PATCH", `/api/scope-of-work-items/${id}`, { budgetAmount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/serviced-loans", loan.id, "scope-of-work"] });
      setEditingBudget(null);
      setEditBudgetValue("");
      toast({ title: "Budget updated" });
    },
    onError: () => {
      toast({ title: "Failed to update budget", variant: "destructive" });
    },
  });

  const createDrawMutation = useMutation({
    mutationFn: async (data: { requestedAmount: number; description: string }) => {
      return await apiRequest("POST", `/api/serviced-loans/${loan.id}/draws`, data);
    },
    onSuccess: async (draw: any) => {
      const lineItemPromises = Object.entries(drawLineAmounts)
        .filter(([_, amount]) => amount > 0)
        .map(([scopeOfWorkItemId, requestedAmount]) =>
          apiRequest("POST", `/api/loan-draws/${draw.id}/line-items`, {
            scopeOfWorkItemId,
            requestedAmount,
          })
        );
      await Promise.all(lineItemPromises);
      queryClient.invalidateQueries({ queryKey: ["/api/serviced-loans", loan.id, "details"] });
      queryClient.invalidateQueries({ queryKey: ["/api/serviced-loans", loan.id, "scope-of-work"] });
      queryClient.invalidateQueries({ queryKey: ["/api/serviced-loans", loan.id, "all-draw-line-items"] });
      clearDraft();
      setNewDrawOpen(false);
      setNewDrawDescription("");
      setDrawLineAmounts({});
      toast({ title: "Draw request created" });
    },
    onError: () => {
      toast({ title: "Failed to create draw request", variant: "destructive" });
    },
  });

  const submitDrawMutation = useMutation({
    mutationFn: async (drawId: string) => {
      return apiRequest("POST", `/api/loan-draws/${drawId}/submit`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/serviced-loans", loan.id, "details"] });
      toast({ title: "Draw submitted for review" });
    },
  });

  const deleteDrawMutation = useMutation({
    mutationFn: async (drawId: string) => {
      return apiRequest("DELETE", `/api/loan-draws/${drawId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/serviced-loans", loan.id, "details"] });
      toast({ title: "Draw deleted" });
    },
  });

  const fundedDrawIds = draws.filter(d => d.status === "funded").map(d => d.id);
  const fundedLineItems = allDrawLineItems.filter(li => fundedDrawIds.includes(li.loanDrawId));

  const scopeWithFunding: ScopeOfWorkWithFunding[] = scopeOfWorkItems.map(item => {
    const totalFunded = fundedLineItems
      .filter(li => li.scopeOfWorkItemId === item.id)
      .reduce((sum, li) => sum + (li.fundedAmount || 0), 0);
    return { ...item, totalFunded };
  });

  const categoryOrder: ScopeOfWorkCategory[] = ["soft_costs", "demo_foundation", "hvac_plumbing_electrical", "interior", "exterior"];
  const categorySummaries: CategorySummary[] = categoryOrder.map(category => {
    const items = scopeWithFunding.filter(i => i.category === category).sort((a, b) => a.sortOrder - b.sortOrder);
    return {
      category,
      totalBudget: items.reduce((sum, i) => sum + i.budgetAmount, 0),
      totalFunded: items.reduce((sum, i) => sum + i.totalFunded, 0),
      items,
    };
  }).filter(cs => cs.items.length > 0);

  const grandTotalBudget = categorySummaries.reduce((sum, cs) => sum + cs.totalBudget, 0);
  const grandTotalFunded = categorySummaries.reduce((sum, cs) => sum + cs.totalFunded, 0);

  const fundedDraws = draws.filter(d => d.status === "funded");
  const pendingDraws = draws.filter(d => ["submitted", "inspection_scheduled", "inspection_complete", "approved"].includes(d.status));

  const totalFunded = fundedDraws.reduce((sum, d) => sum + (d.fundedAmount || 0), 0);
  const remaining = (loan.totalRehabBudget || 0) - totalFunded;
  const progressPercent = loan.totalRehabBudget ? (totalFunded / loan.totalRehabBudget) * 100 : 0;

  const canEditBudget = user?.role === "admin" || user?.role === "staff";

  const newDrawTotal = Object.values(drawLineAmounts).reduce((sum, amt) => sum + amt, 0);

  const handleSaveBudget = (itemId: string) => {
    const value = parseInt(editBudgetValue) || 0;
    updateBudgetMutation.mutate({ id: itemId, budgetAmount: value });
  };

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Draw Management
            </CardTitle>
            <CardDescription>Scope of work budget and draw requests</CardDescription>
          </div>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "scope" | "draws")}>
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="scope" className="flex-1 sm:flex-none text-xs sm:text-sm" data-testid="tab-scope-of-work">Scope of Work</TabsTrigger>
              <TabsTrigger value="draws" className="flex-1 sm:flex-none text-xs sm:text-sm" data-testid="tab-draw-requests">Draw Requests</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-xl font-bold" data-testid="text-total-budget">{formatCurrency(grandTotalBudget || loan.totalRehabBudget)}</p>
            <p className="text-xs text-muted-foreground">Total Budget</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xl font-bold text-emerald-400" data-testid="text-total-funded">{formatCurrency(totalFunded)}</p>
            <p className="text-xs text-muted-foreground">Total Funded</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xl font-bold text-amber-400" data-testid="text-pending-amount">{formatCurrency(pendingDraws.reduce((s, d) => s + d.requestedAmount, 0))}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-xl font-bold" data-testid="text-remaining">{formatCurrency(remaining)}</p>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Budget Progress</span>
            <span>{progressPercent.toFixed(0)}% drawn</span>
          </div>
          <Progress value={progressPercent} className="h-2" data-testid="progress-budget" />
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(totalFunded)} of {formatCurrency(loan.totalRehabBudget)} budget
          </p>
        </div>

        <Separator className="my-4" />

        {activeTab === "scope" && (
          <div className="space-y-4">
            {scopeLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : scopeOfWorkItems.length === 0 ? (
              <div className="text-center py-8">
                <HardHat className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground mb-2">No scope of work items defined</p>
                <p className="text-xs text-muted-foreground mb-4">Initialize the scope of work to create default line items</p>
                <Button
                  onClick={() => initializeScopeMutation.mutate()}
                  disabled={initializeScopeMutation.isPending}
                  data-testid="button-initialize-scope"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Initialize Scope of Work
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-start mb-4">
                  <Dialog open={newDrawOpen} onOpenChange={setNewDrawOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-new-draw">
                        <Plus className="h-4 w-4 mr-2" />
                        New Draw Request
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <div className="flex items-center justify-between gap-2">
                          <DialogTitle>Request New Draw</DialogTitle>
                          {draftStatus && (
                            <Badge variant="outline" className="text-xs shrink-0" data-testid="badge-draft-status">
                              {draftStatus === "saving" ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Check className="h-3 w-3 mr-1 text-green-500" />
                                  Draft saved
                                </>
                              )}
                            </Badge>
                          )}
                        </div>
                        <DialogDescription>
                          Enter amounts for each scope item to include in this draw. Maximum available: {formatCurrency(remaining)}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="drawDescription">Description (optional)</Label>
                          <Textarea
                            id="drawDescription"
                            value={newDrawDescription}
                            onChange={(e) => setNewDrawDescription(e.target.value)}
                            placeholder="Describe the work completed for this draw..."
                            data-testid="input-draw-description"
                          />
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          {categorySummaries.map((cs) => (
                            <div key={cs.category}>
                              <h4 className="font-medium text-sm mb-2">{SCOPE_OF_WORK_CATEGORY_NAMES[cs.category]}</h4>
                              <div className="space-y-2">
                                {cs.items.map((item) => {
                                  const itemRemaining = item.budgetAmount - item.totalFunded;
                                  return (
                                    <div key={item.id} className="flex items-center justify-between gap-4">
                                      <div className="flex-1">
                                        <span className="text-sm">{item.itemName}</span>
                                        <span className="text-xs text-muted-foreground ml-2">
                                          (Remaining: {formatCurrency(itemRemaining)})
                                        </span>
                                      </div>
                                      <Input
                                        type="number"
                                        min={0}
                                        max={itemRemaining}
                                        value={drawLineAmounts[item.id] || ""}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value) || 0;
                                          setDrawLineAmounts(prev => ({
                                            ...prev,
                                            [item.id]: Math.min(val, itemRemaining)
                                          }));
                                        }}
                                        placeholder="0"
                                        className="w-[6.5rem] text-right"
                                        data-testid={`input-draw-line-${item.id}`}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <span className="font-medium">Draw Total:</span>
                          <span className="text-xl font-bold text-primary" data-testid="text-draw-total">
                            {formatCurrency(newDrawTotal)}
                          </span>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {
                          setNewDrawOpen(false);
                          setDrawLineAmounts({});
                          setNewDrawDescription("");
                        }}>Cancel</Button>
                        <Button 
                          onClick={() => createDrawMutation.mutate({
                            requestedAmount: newDrawTotal,
                            description: newDrawDescription,
                          })}
                          disabled={newDrawTotal === 0 || createDrawMutation.isPending}
                          data-testid="button-create-draw"
                        >
                          Create Draw Request
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <Accordion type="multiple" defaultValue={categoryOrder} className="space-y-2">
                  {categorySummaries.map((cs) => {
                    const categoryPercent = cs.totalBudget > 0 ? (cs.totalFunded / cs.totalBudget) * 100 : 0;
                    return (
                      <AccordionItem key={cs.category} value={cs.category} className="border rounded-lg">
                        <AccordionTrigger className="px-3 sm:px-4 hover:no-underline" data-testid={`accordion-category-${cs.category}`}>
                          <div className="flex items-center justify-between w-full pr-2 sm:pr-4 gap-2">
                            <span className="font-medium text-sm sm:text-base truncate">{SCOPE_OF_WORK_CATEGORY_NAMES[cs.category]}</span>
                            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                              <div className="hidden sm:block w-24 md:w-32">
                                <Progress value={categoryPercent} className="h-2" />
                              </div>
                              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                                {formatCurrency(cs.totalFunded)} / {formatCurrency(cs.totalBudget)}
                              </span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-0 pb-0">
                          <div className="overflow-x-auto">
                          <Table className="min-w-[400px]">
                            <TableHeader>
                              <TableRow>
                                <TableHead className="pl-4">Item</TableHead>
                                <TableHead className="text-right">Budget</TableHead>
                                <TableHead className="text-right">Funded</TableHead>
                                <TableHead className="text-right pr-4">Remaining</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {cs.items.map((item) => (
                                <TableRow key={item.id} data-testid={`row-scope-item-${item.id}`}>
                                  <TableCell className="pl-4 font-medium">{item.itemName}</TableCell>
                                  <TableCell className="text-right">
                                    {editingBudget === item.id ? (
                                      <div className="flex items-center justify-end gap-1">
                                        <Input
                                          type="number"
                                          value={editBudgetValue}
                                          onChange={(e) => setEditBudgetValue(e.target.value)}
                                          className="w-24 h-8 text-right"
                                          autoFocus
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") handleSaveBudget(item.id);
                                            if (e.key === "Escape") {
                                              setEditingBudget(null);
                                              setEditBudgetValue("");
                                            }
                                          }}
                                          data-testid={`input-budget-${item.id}`}
                                        />
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleSaveBudget(item.id)}
                                          disabled={updateBudgetMutation.isPending}
                                        >
                                          <CheckCircle2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <span
                                        className={canEditBudget ? "cursor-pointer hover:underline" : ""}
                                        onClick={() => {
                                          if (canEditBudget) {
                                            setEditingBudget(item.id);
                                            setEditBudgetValue(item.budgetAmount.toString());
                                          }
                                        }}
                                        data-testid={`text-budget-${item.id}`}
                                      >
                                        {formatCurrency(item.budgetAmount)}
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right text-emerald-500" data-testid={`text-funded-${item.id}`}>
                                    {formatCurrency(item.totalFunded)}
                                  </TableCell>
                                  <TableCell className="text-right pr-4" data-testid={`text-remaining-${item.id}`}>
                                    {formatCurrency(item.budgetAmount - item.totalFunded)}
                                  </TableCell>
                                </TableRow>
                              ))}
                              <TableRow className="bg-muted/30 font-medium">
                                <TableCell className="pl-4">Category Total</TableCell>
                                <TableCell className="text-right">{formatCurrency(cs.totalBudget)}</TableCell>
                                <TableCell className="text-right text-emerald-500">{formatCurrency(cs.totalFunded)}</TableCell>
                                <TableCell className="text-right pr-4">{formatCurrency(cs.totalBudget - cs.totalFunded)}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </>
            )}
          </div>
        )}

        {activeTab === "draws" && (
          <>
            {draws.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">No draws yet</p>
                <p className="text-xs text-muted-foreground">Request your first draw when work is completed</p>
              </div>
            ) : (
              <div className="space-y-3">
                {draws.map((draw) => (
                  <div 
                    key={draw.id} 
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    data-testid={`card-draw-${draw.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <span className="text-sm font-bold text-primary">#{draw.drawNumber}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{formatCurrency(draw.requestedAmount)}</p>
                          {getDrawStatusBadge(draw.status)}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {draw.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DrawPhotoUpload draw={draw} loanId={loan.id} scopeOfWorkItems={scopeOfWorkItems} />
                      {draw.status === "draft" && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => submitDrawMutation.mutate(draw.id)}
                            disabled={submitDrawMutation.isPending}
                            data-testid={`button-submit-draw-${draw.id}`}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Submit
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => deleteDrawMutation.mutate(draw.id)}
                            disabled={deleteDrawMutation.isPending}
                            data-testid={`button-delete-draw-${draw.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                      {draw.status === "funded" && draw.fundedDate && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(draw.fundedDate), "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function InterestPaymentTracker({ loan, payments }: { loan: ServicedLoan; payments: LoanPayment[] }) {
  const monthlyInterest = calculateInterestOnlyPayment(loan.currentBalance, parseFloat(loan.interestRate));
  
  const completedPayments = payments.filter(p => p.status === "completed");
  const scheduledPayments = payments.filter(p => p.status === "scheduled");
  const overduePayments = payments.filter(p => p.status === "late");
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Interest Payments
        </CardTitle>
        <CardDescription>Interest-only payment tracking (no principal paydown)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-2xl font-bold text-primary">{formatCurrency(monthlyInterest)}</p>
            <p className="text-xs text-muted-foreground">Monthly Interest</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-2xl font-bold text-emerald-400">{completedPayments.length}</p>
            <p className="text-xs text-muted-foreground">Payments Made</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{scheduledPayments.length}</p>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </div>
          {overduePayments.length > 0 && (
            <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-2xl font-bold text-red-400">{overduePayments.length}</p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          )}
        </div>
        
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.slice(0, 12).map((payment) => (
                <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                  <TableCell>{format(new Date(payment.dueDate), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(payment.scheduledAmount)}</TableCell>
                  <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {payment.paidDate ? format(new Date(payment.paidDate), "MMM d, yyyy") : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentHistoryPanel({ payments, loan }: { payments: LoanPayment[]; loan: ServicedLoan }) {
  const [sortField, setSortField] = useState<"paymentNumber" | "paidDate" | "paidAmount">("paymentNumber");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const completedPayments = payments.filter(p => p.status === "completed" || p.status === "partial");
  
  const sortedPayments = useMemo(() => {
    return [...completedPayments].sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;
      
      if (sortField === "paymentNumber") {
        aVal = a.paymentNumber || 0;
        bVal = b.paymentNumber || 0;
      } else if (sortField === "paidDate") {
        aVal = a.paidDate ? new Date(a.paidDate).getTime() : 0;
        bVal = b.paidDate ? new Date(b.paidDate).getTime() : 0;
      } else if (sortField === "paidAmount") {
        aVal = a.paidAmount || 0;
        bVal = b.paidAmount || 0;
      }
      
      if (sortDir === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
  }, [completedPayments, sortField, sortDir]);
  
  const totalPages = Math.ceil(sortedPayments.length / pageSize);
  const paginatedPayments = sortedPayments.slice((page - 1) * pageSize, page * pageSize);
  
  const totalPaid = completedPayments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  const totalPrincipal = completedPayments.reduce((sum, p) => sum + (p.principalAmount || 0), 0);
  const totalInterest = completedPayments.reduce((sum, p) => sum + (p.interestAmount || 0), 0);
  
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };
  
  const SortIndicator = ({ field }: { field: typeof sortField }) => (
    sortField === field ? (
      sortDir === "asc" ? <ChevronUp className="h-3 w-3 ml-1 inline" /> : <ChevronDown className="h-3 w-3 ml-1 inline" />
    ) : null
  );
  
  return (
    <Card data-testid="payment-history-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Payment History
        </CardTitle>
        <CardDescription>{completedPayments.length} payments on record</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xl font-bold text-emerald-400" data-testid="stat-total-paid">{formatCurrency(totalPaid)}</p>
            <p className="text-xs text-muted-foreground">Total Paid</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xl font-bold text-primary" data-testid="stat-remaining-balance">{formatCurrency(loan.currentBalance)}</p>
            <p className="text-xs text-muted-foreground">Remaining Balance</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xl font-bold text-amber-400">{formatCurrency(totalPrincipal)}</p>
            <p className="text-xs text-muted-foreground">Principal Paid</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-xl font-bold">{formatCurrency(totalInterest)}</p>
            <p className="text-xs text-muted-foreground">Interest Paid</p>
          </div>
        </div>
        
        {loan.nextPaymentDate && (
          <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              <span className="text-sm">Next Payment Due:</span>
            </div>
            <div className="text-right">
              <span className="font-medium">{format(new Date(loan.nextPaymentDate), "MMM d, yyyy")}</span>
              <span className="text-muted-foreground ml-2">({formatCurrency(loan.nextPaymentAmount || loan.monthlyPayment)})</span>
            </div>
          </div>
        )}
        
        {completedPayments.length === 0 ? (
          <div className="text-center py-8">
            <PiggyBank className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">No payment history yet</p>
          </div>
        ) : (
          <>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover-elevate"
                      onClick={() => handleSort("paymentNumber")}
                      data-testid="sort-payment-number"
                    >
                      # <SortIndicator field="paymentNumber" />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover-elevate"
                      onClick={() => handleSort("paidDate")}
                      data-testid="sort-paid-date"
                    >
                      Date Paid <SortIndicator field="paidDate" />
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover-elevate"
                      onClick={() => handleSort("paidAmount")}
                      data-testid="sort-paid-amount"
                    >
                      Amount <SortIndicator field="paidAmount" />
                    </TableHead>
                    <TableHead className="text-right">Principal</TableHead>
                    <TableHead className="text-right">Interest</TableHead>
                    <TableHead className="text-right">Balance After</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPayments.map((payment) => (
                    <TableRow key={payment.id} data-testid={`row-payment-history-${payment.id}`}>
                      <TableCell className="font-mono text-xs">{payment.paymentNumber}</TableCell>
                      <TableCell>{payment.paidDate ? format(new Date(payment.paidDate), "MMM d, yyyy") : "-"}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(payment.paidAmount)}</TableCell>
                      <TableCell className="text-right text-emerald-500">{formatCurrency(payment.principalAmount)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(payment.interestAmount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(payment.balanceAfterPayment)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sortedPayments.length)} of {sortedPayments.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    data-testid="button-prev-page"
                  >
                    Previous
                  </Button>
                  <span className="text-sm">Page {page} of {totalPages}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    data-testid="button-next-page"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function PayoffCalculator({ loan }: { loan: ServicedLoan }) {
  const { toast } = useToast();
  const [payoffDate, setPayoffDate] = useState(format(new Date(), "yyyy-MM-dd"));
  
  const { data: payoffData, isLoading, refetch } = useQuery<{
    payoffDate: string;
    daysUntilPayoff: number;
    outstandingPrincipal: number;
    perDiemInterest: number;
    accruedInterest: number;
    outstandingFees: number;
    totalPayoff: number;
    validUntil: string;
  }>({
    queryKey: ["/api/servicing", loan.id, "payoff", payoffDate],
    queryFn: async () => {
      const res = await fetch(`/api/servicing/${loan.id}/payoff?payoffDate=${payoffDate}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to calculate payoff");
      return res.json();
    },
    enabled: !!loan.id,
  });
  
  const requestPayoffMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/servicing/${loan.id}/payoff-request`, { payoffDate });
    },
    onSuccess: () => {
      toast({ title: "Payoff statement requested", description: "You will be notified when it's ready." });
    },
    onError: () => {
      toast({ title: "Failed to request payoff statement", variant: "destructive" });
    },
  });
  
  return (
    <Card data-testid="payoff-calculator">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Payoff Calculator
        </CardTitle>
        <CardDescription>Calculate total payoff amount for a specific date</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Label htmlFor="payoffDate">Payoff Date</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="payoffDate"
              type="date"
              value={payoffDate}
              onChange={(e) => setPayoffDate(e.target.value)}
              className="max-w-xs"
              data-testid="input-payoff-date"
            />
            <Button variant="outline" onClick={() => refetch()} data-testid="button-recalculate">
              Calculate
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : payoffData ? (
          <>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 mb-6">
              <p className="text-xs text-muted-foreground mb-1">Total Payoff Amount</p>
              <p className="text-3xl font-bold text-primary" data-testid="stat-total-payoff">
                {formatCurrencyPrecise(payoffData.totalPayoff)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Good through {format(new Date(payoffData.validUntil), "MMM d, yyyy")}
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-muted-foreground">Outstanding Principal</span>
                <span className="font-medium" data-testid="payoff-principal">{formatCurrency(payoffData.outstandingPrincipal)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <span className="text-muted-foreground">Accrued Interest</span>
                  <p className="text-xs text-muted-foreground">
                    ({payoffData.daysUntilPayoff} days @ {formatCurrencyPrecise(payoffData.perDiemInterest)}/day)
                  </p>
                </div>
                <span className="font-medium" data-testid="payoff-interest">{formatCurrency(payoffData.accruedInterest)}</span>
              </div>
              {payoffData.outstandingFees > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                  <span className="text-amber-400">Outstanding Fees</span>
                  <span className="font-medium text-amber-400" data-testid="payoff-fees">{formatCurrency(payoffData.outstandingFees)}</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 p-3 rounded-lg bg-muted/30 border">
              <div className="flex items-center gap-2 text-sm">
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                <span>Daily Interest Accrual: <span className="font-medium text-amber-400" data-testid="stat-per-diem">{formatCurrencyPrecise(payoffData.perDiemInterest)}</span>/day</span>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <Button 
              className="w-full" 
              onClick={() => requestPayoffMutation.mutate()}
              disabled={requestPayoffMutation.isPending}
              data-testid="button-request-payoff"
            >
              <FileText className="h-4 w-4 mr-2" />
              Request Official Payoff Statement
            </Button>
          </>
        ) : (
          <div className="text-center py-8">
            <Calculator className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">Select a date to calculate payoff</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EscrowSummary({ loan, escrowItems }: { loan: ServicedLoan; escrowItems: LoanEscrowItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5" />
          Escrow Account
        </CardTitle>
        <CardDescription>Taxes, insurance, and HOA reserves</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xl font-bold text-primary">{formatCurrency(loan.escrowBalance)}</p>
            <p className="text-xs text-muted-foreground">Current Balance</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xl font-bold">{formatCurrency(loan.monthlyEscrowAmount)}</p>
            <p className="text-xs text-muted-foreground">Monthly Collection</p>
          </div>
        </div>
        
        {escrowItems.length > 0 ? (
          <div className="space-y-2">
            {escrowItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded border">
                <div>
                  <p className="font-medium capitalize">{item.itemType.replace("_", " ")}</p>
                  <p className="text-xs text-muted-foreground">{item.vendorName || item.notes}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(item.monthlyAmount)}/mo</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(item.annualAmount)}/yr</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="p-2 rounded bg-muted/30">
              <p className="text-muted-foreground">Taxes</p>
              <p className="font-medium">{formatCurrency(loan.annualTaxes)}/yr</p>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <p className="text-muted-foreground">Insurance</p>
              <p className="font-medium">{formatCurrency(loan.annualInsurance)}/yr</p>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <p className="text-muted-foreground">HOA</p>
              <p className="font-medium">{formatCurrency(loan.annualHOA)}/yr</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function LoanDetailPage() {
  const { user } = useAuth();
  const [, params] = useRoute("/portal/loans/:id");
  const [, setLocation] = useLocation();
  const loanId = params?.id;
  
  const { data: loanDetails, isLoading, error } = useQuery<LoanDetailsResponse>({
    queryKey: ["/api/serviced-loans", loanId, "details"],
    queryFn: async () => {
      const res = await fetch(`/api/serviced-loans/${loanId}/details`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch loan details");
      return res.json();
    },
    enabled: !!loanId,
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PortalHeader user={user} title="Loading..." backHref="/portal/loans" />
        <main className="container max-w-7xl mx-auto px-4 py-6">
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <div className="grid md:grid-cols-2 gap-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  if (error || !loanDetails) {
    return (
      <div className="min-h-screen bg-background">
        <PortalHeader user={user} title="Loan Not Found" backHref="/portal/loans" />
        <main className="container max-w-7xl mx-auto px-4 py-6">
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Loan Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The loan you're looking for doesn't exist or you don't have access to it.
              </p>
              <Button onClick={() => setLocation("/portal/loans")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Active Loans
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }
  
  const loan = loanDetails;
  const isHardMoney = isHardMoneyLoan(loan.loanType);
  const LoanIcon = getLoanTypeIcon(loan.loanType);
  
  const daysToMaturity = loan.maturityDate 
    ? differenceInDays(new Date(loan.maturityDate), new Date())
    : null;

  return (
    <div className="min-h-screen bg-background">
      <PortalHeader 
        user={user}
        title={loan.propertyAddress} 
        backHref="/portal/loans"
      />
      
      <main className="container max-w-7xl mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <LoanIcon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold">{loan.propertyAddress}</h1>
                    {getStatusBadge(loan.loanStatus)}
                  </div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {loan.propertyCity}, {loan.propertyState} {loan.propertyZip}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Loan #{loan.loanNumber} • {getLoanTypeLabel(loan.loanType)}
                    {loan.isInterestOnly && " • Interest Only"}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="text-center md:text-right">
                  <p className="text-2xl font-bold text-primary">{formatCurrency(loan.currentBalance)}</p>
                  <p className="text-xs text-muted-foreground">Current Balance</p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-2xl font-bold">{formatCurrency(loan.monthlyPayment)}</p>
                  <p className="text-xs text-muted-foreground">Monthly Payment</p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-2xl font-bold">{loan.interestRate}%</p>
                  <p className="text-xs text-muted-foreground">Interest Rate</p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-2xl font-bold">{loan.loanTermMonths}mo</p>
                  <p className="text-xs text-muted-foreground">Term</p>
                </div>
              </div>
            </div>
            
            {daysToMaturity !== null && daysToMaturity <= 90 && daysToMaturity > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <span className="text-amber-400 font-medium">
                  {daysToMaturity} days until maturity ({format(new Date(loan.maturityDate!), "MMM d, yyyy")})
                </span>
              </div>
            )}
          </CardContent>
        </Card>
        
        {isHardMoney ? (
          <Tabs defaultValue="draws" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="draws" className="text-[10px] sm:text-sm px-1 sm:px-3" data-testid="tab-draws">Draws</TabsTrigger>
              <TabsTrigger value="payments" className="text-[10px] sm:text-sm px-1 sm:px-3" data-testid="tab-payments">Pays</TabsTrigger>
              <TabsTrigger value="payoff" className="text-[10px] sm:text-sm px-1 sm:px-3" data-testid="tab-payoff">Payoff</TabsTrigger>
              <TabsTrigger value="milestones" className="text-[10px] sm:text-sm px-1 sm:px-3" data-testid="tab-milestones">Miles</TabsTrigger>
              <TabsTrigger value="documents" className="text-[10px] sm:text-sm px-1 sm:px-3" data-testid="tab-documents">Docs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="draws">
              <DrawManagement loan={loan} draws={loanDetails.draws} />
            </TabsContent>
            
            <TabsContent value="payments">
              <InterestPaymentTracker loan={loan} payments={loanDetails.payments} />
            </TabsContent>
            
            <TabsContent value="payoff">
              <PayoffCalculator loan={loan} />
            </TabsContent>
            
            <TabsContent value="milestones">
              <Card>
                <CardHeader>
                  <CardTitle>Project Milestones</CardTitle>
                  <CardDescription>Track construction/renovation progress</CardDescription>
                </CardHeader>
                <CardContent>
                  {loanDetails.milestones.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-muted-foreground">No milestones defined</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {loanDetails.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-center gap-3 p-3 rounded-lg border">
                          <div className={`p-2 rounded-full ${
                            milestone.status === "completed" ? "bg-emerald-500/20" : "bg-muted"
                          }`}>
                            {milestone.status === "completed" ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{milestone.title}</p>
                            {milestone.description && (
                              <p className="text-xs text-muted-foreground">{milestone.description}</p>
                            )}
                          </div>
                          {milestone.budgetAmount && (
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(milestone.budgetAmount)}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Loan Documents</CardTitle>
                  <CardDescription>Closing docs, inspection reports, and correspondence</CardDescription>
                </CardHeader>
                <CardContent>
                  {loanDetails.documents.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-muted-foreground">No documents uploaded</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {loanDetails.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.documentType} • {format(new Date(doc.createdAt), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" asChild>
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs defaultValue="amortization" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="amortization" className="text-[10px] sm:text-sm px-1 sm:px-3" data-testid="tab-amortization">Amort</TabsTrigger>
              <TabsTrigger value="payments" className="text-[10px] sm:text-sm px-1 sm:px-3" data-testid="tab-payments">Pays</TabsTrigger>
              <TabsTrigger value="payoff" className="text-[10px] sm:text-sm px-1 sm:px-3" data-testid="tab-payoff">Payoff</TabsTrigger>
              <TabsTrigger value="escrow" className="text-[10px] sm:text-sm px-1 sm:px-3" data-testid="tab-escrow">Escrow</TabsTrigger>
              <TabsTrigger value="documents" className="text-[10px] sm:text-sm px-1 sm:px-3" data-testid="tab-documents">Docs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="amortization">
              <AmortizationCalculator loan={loan} />
            </TabsContent>
            
            <TabsContent value="payments">
              <PaymentHistoryPanel payments={loanDetails.payments} loan={loan} />
            </TabsContent>
            
            <TabsContent value="payoff">
              <PayoffCalculator loan={loan} />
            </TabsContent>
            
            <TabsContent value="escrow">
              <EscrowSummary loan={loan} escrowItems={loanDetails.escrowItems} />
            </TabsContent>
            
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Loan Documents</CardTitle>
                  <CardDescription>Closing docs, statements, and correspondence</CardDescription>
                </CardHeader>
                <CardContent>
                  {loanDetails.documents.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-muted-foreground">No documents uploaded</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {loanDetails.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.documentType} • {format(new Date(doc.createdAt), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" asChild>
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
