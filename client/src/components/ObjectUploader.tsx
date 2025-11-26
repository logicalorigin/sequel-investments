import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, File, X, Loader2 } from "lucide-react";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (result: { successful: Array<{ uploadURL: string; name: string; size: number; type: string }> }) => void;
  buttonClassName?: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  children: ReactNode;
}

export function ObjectUploader({
  maxFileSize = 10485760,
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  buttonVariant = "outline",
  buttonSize = "sm",
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > maxFileSize) {
        setUploadError(`File size exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit`);
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const result = await onGetUploadParameters();
      const url = result.url;
      
      if (!url) {
        throw new Error("Failed to get upload URL");
      }
      
      const response = await fetch(url, {
        method: "PUT",
        body: selectedFile,
        headers: {
          "Content-Type": selectedFile.type,
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.error("Upload response error:", response.status, errorText);
        throw new Error(`Upload failed: ${response.status}`);
      }

      onComplete?.({
        successful: [{
          uploadURL: url.split("?")[0],
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
        }],
      });

      setShowModal(false);
      setSelectedFile(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMessage = error.message?.includes("503") || error.message?.includes("storage")
        ? "File storage is temporarily unavailable. Please try again later."
        : "Failed to upload file. Please try again.";
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedFile(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <Button 
        onClick={() => setShowModal(true)} 
        className={buttonClassName}
        variant={buttonVariant}
        size={buttonSize}
        data-testid="button-upload-trigger"
      >
        {children}
      </Button>

      <Dialog open={showModal} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Select a file to upload. Maximum file size is {Math.round(maxFileSize / 1024 / 1024)}MB.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select File</Label>
              <Input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xls,.xlsx"
                disabled={isUploading}
                data-testid="input-file-upload"
              />
            </div>

            {selectedFile && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <File className="h-4 w-4 text-primary" />
                <span className="flex-1 text-sm truncate">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {uploadError && (
              <div className="text-sm text-destructive">{uploadError}</div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading}
              data-testid="button-confirm-upload"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
