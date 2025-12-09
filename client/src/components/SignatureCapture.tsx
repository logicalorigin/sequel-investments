import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Eraser, Pen, Type, Upload, Check, RotateCcw, Eye } from "lucide-react";

interface SignatureCaptureProps {
  onSignatureComplete: (signatureDataUrl: string, type: "draw" | "type" | "upload") => void;
  signerName?: string;
  width?: number;
  height?: number;
}

export function SignatureCapture({
  onSignatureComplete,
  signerName = "",
  width = 500,
  height = 150,
}: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [typedName, setTypedName] = useState(signerName);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [previewSignature, setPreviewSignature] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"draw" | "type" | "upload">("draw");

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawnSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    setHasDrawnSignature(false);
    setPreviewSignature(null);
  };

  const generateTypedSignature = (): string | null => {
    if (!typedName.trim()) return null;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `italic 48px "Brush Script MT", "Segoe Script", cursive`;
    ctx.fillStyle = "#1a1a2e";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(typedName.trim(), canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL("image/png");
  };

  const handlePreview = () => {
    let signature: string | null = null;

    if (activeTab === "draw") {
      const canvas = canvasRef.current;
      if (canvas && hasDrawnSignature) {
        signature = canvas.toDataURL("image/png");
      }
    } else if (activeTab === "type") {
      signature = generateTypedSignature();
    } else if (activeTab === "upload") {
      signature = uploadedImage;
    }

    setPreviewSignature(signature);
  };

  const handleSubmit = () => {
    let signature: string | null = null;

    if (activeTab === "draw") {
      const canvas = canvasRef.current;
      if (canvas && hasDrawnSignature) {
        signature = canvas.toDataURL("image/png");
      }
    } else if (activeTab === "type") {
      signature = generateTypedSignature();
    } else if (activeTab === "upload") {
      signature = uploadedImage;
    }

    if (signature) {
      onSignatureComplete(signature, activeTab);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const scale = Math.min(
          (canvas.width * 0.9) / img.width,
          (canvas.height * 0.9) / img.height
        );
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        setUploadedImage(canvas.toDataURL("image/png"));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const isValid = () => {
    if (activeTab === "draw") return hasDrawnSignature;
    if (activeTab === "type") return typedName.trim().length > 0;
    if (activeTab === "upload") return !!uploadedImage;
    return false;
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as typeof activeTab); setPreviewSignature(null); }}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="draw" className="gap-2" data-testid="tab-signature-draw">
            <Pen className="h-4 w-4" />
            Draw
          </TabsTrigger>
          <TabsTrigger value="type" className="gap-2" data-testid="tab-signature-type">
            <Type className="h-4 w-4" />
            Type
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2" data-testid="tab-signature-upload">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="mt-4">
          <Card className="p-1 bg-white">
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full cursor-crosshair touch-none border border-dashed border-muted-foreground/30 rounded-md"
              style={{ maxWidth: width }}
              data-testid="canvas-signature-draw"
            />
          </Card>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Pen className="h-3 w-3" />
            <span>Draw your signature above using your mouse or finger</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCanvas}
            disabled={!hasDrawnSignature}
            className="mt-2"
            data-testid="button-clear-signature"
          >
            <Eraser className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </TabsContent>

        <TabsContent value="type" className="mt-4 space-y-4">
          <div>
            <Label htmlFor="typed-signature" className="text-sm">Type your name</Label>
            <Input
              id="typed-signature"
              value={typedName}
              onChange={(e) => { setTypedName(e.target.value); setPreviewSignature(null); }}
              placeholder="Your full name"
              className="mt-1"
              data-testid="input-signature-typed"
            />
          </div>
          {typedName.trim() && (
            <Card className="p-4 bg-white text-center">
              <p
                style={{ fontFamily: '"Brush Script MT", "Segoe Script", cursive', fontSize: "2.5rem", color: "#1a1a2e" }}
                data-testid="text-typed-signature-preview"
              >
                {typedName.trim()}
              </p>
            </Card>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Type className="h-3 w-3" />
            <span>Your name will be rendered in a signature-style font</span>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="mt-4 space-y-4">
          <div>
            <Label htmlFor="upload-signature" className="text-sm">Upload signature image</Label>
            <Input
              id="upload-signature"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="mt-1"
              data-testid="input-signature-upload"
            />
          </div>
          {uploadedImage && (
            <Card className="p-2 bg-white">
              <img
                src={uploadedImage}
                alt="Uploaded signature"
                className="max-w-full h-auto mx-auto"
                style={{ maxHeight: height }}
                data-testid="img-uploaded-signature"
              />
            </Card>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Upload className="h-3 w-3" />
            <span>Upload a PNG or JPG image of your signature</span>
          </div>
          {uploadedImage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUploadedImage(null)}
              data-testid="button-clear-upload"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </TabsContent>
      </Tabs>

      {previewSignature && (
        <Card className="p-4 border-primary/20 bg-primary/5">
          <p className="text-sm font-medium mb-2">Signature Preview</p>
          <div className="bg-white rounded-md p-2">
            <img
              src={previewSignature}
              alt="Signature preview"
              className="max-w-full h-auto mx-auto"
              style={{ maxHeight: height }}
              data-testid="img-signature-preview"
            />
          </div>
        </Card>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          onClick={handlePreview}
          disabled={!isValid()}
          data-testid="button-preview-signature"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isValid()}
          data-testid="button-accept-signature"
        >
          <Check className="h-4 w-4 mr-2" />
          Accept Signature
        </Button>
      </div>
    </div>
  );
}
