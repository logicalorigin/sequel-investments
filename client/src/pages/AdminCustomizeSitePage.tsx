import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Palette, Building2, Phone, Mail, MapPin, Type, RotateCcw, Save, Eye, Image, LayoutTemplate, Sparkles } from "lucide-react";
import { EditorLayout } from "@/components/page-builder/EditorLayout";
import { siteTemplates, type SiteTemplate } from "@/data/siteTemplates";
import type { WhiteLabelSettings } from "@shared/schema";

interface WhiteLabelSettingsWithMeta extends Partial<WhiteLabelSettings> {
  isDemoMode: boolean;
}

const PAGE_LABELS: Record<string, string> = {
  home: "Home Page",
  dscr: "DSCR Loan Page",
  fix_flip: "Fix & Flip Page",
  construction: "Construction Page",
  about: "About Page",
  contact: "Contact Page",
  resources: "Resources Page",
};

export default function AdminCustomizeSitePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [selectedPageId, setSelectedPageId] = useState("home");

  const [formData, setFormData] = useState({
    companyName: "SEQUEL INVESTMENTS",
    logoUrl: "",
    primaryColor: "#D4A01D",
    secondaryColor: "#1a1a1a",
    contactPhone: "302.388.8860",
    contactEmail: "josh@fundwithsequel.com",
    contactAddress: "800 5th Avenue, Suite 4100, Miami Beach, FL 33139",
    footerText: "",
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<WhiteLabelSettingsWithMeta>({
    queryKey: ["/api/white-label"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        companyName: settings.companyName || "SEQUEL INVESTMENTS",
        logoUrl: settings.logoUrl || "",
        primaryColor: settings.primaryColor || "#D4A01D",
        secondaryColor: settings.secondaryColor || "#1a1a1a",
        contactPhone: settings.contactPhone || "302.388.8860",
        contactEmail: settings.contactEmail || "josh@fundwithsequel.com",
        contactAddress: settings.contactAddress || "800 5th Avenue, Suite 4100, Miami Beach, FL 33139",
        footerText: settings.footerText || "",
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("PUT", "/api/admin/white-label", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/white-label"] });
      toast({
        title: "Settings Saved",
        description: "Site customization has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings.",
        variant: "destructive",
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", "/api/admin/white-label");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/white-label"] });
      setFormData({
        companyName: "SEQUEL INVESTMENTS",
        logoUrl: "",
        primaryColor: "#D4A01D",
        secondaryColor: "#1a1a1a",
        contactPhone: "302.388.8860",
        contactEmail: "josh@fundwithsequel.com",
        contactAddress: "800 5th Avenue, Suite 4100, Miami Beach, FL 33139",
        footerText: "",
      });
      toast({
        title: "Settings Reset",
        description: "Branding has been reset to Sequel Investments defaults.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset settings.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset to default Sequel Investments branding?")) {
      resetMutation.mutate();
    }
  };

  const handleApplyTemplate = (template: SiteTemplate) => {
    setFormData((prev) => ({
      ...prev,
      primaryColor: template.colors.primary,
      secondaryColor: template.colors.secondary,
    }));
    toast({
      title: "Template Applied",
      description: `"${template.name}" colors have been applied. Click Save to keep these changes.`,
    });
  };

  if (authLoading || settingsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== "admin" && user?.role !== "staff")) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You must be an admin to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/admin/login")} data-testid="button-admin-login">
              Go to Admin Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="branding" className="flex-1 flex flex-col">
        <div className="border-b px-6 py-3">
          <TabsList data-testid="customize-tabs">
            <TabsTrigger value="branding" data-testid="tab-branding">
              <Palette className="h-4 w-4 mr-2" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="pages" data-testid="tab-pages">
              <LayoutTemplate className="h-4 w-4 mr-2" />
              Pages
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="branding" className="flex-1 m-0 overflow-auto">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Quick Start Templates
                </CardTitle>
                <CardDescription>
                  Choose a pre-designed color scheme to quickly customize your site
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {siteTemplates.map((template) => (
                    <Card 
                      key={template.id} 
                      className="hover-elevate"
                      data-testid={`card-template-${template.id}`}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border shadow-sm"
                            style={{ backgroundColor: template.colors.primary }}
                            title="Primary"
                          />
                          <div
                            className="w-6 h-6 rounded-full border shadow-sm"
                            style={{ backgroundColor: template.colors.secondary }}
                            title="Secondary"
                          />
                          <div
                            className="w-6 h-6 rounded-full border shadow-sm"
                            style={{ backgroundColor: template.colors.accent }}
                            title="Accent"
                          />
                        </div>
                      </CardContent>
                      <CardContent className="pt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleApplyTemplate(template)}
                          data-testid={`button-apply-template-${template.id}`}
                        >
                          Apply
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Enter company name"
                        data-testid="input-company-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logoUrl">Logo URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="logoUrl"
                          value={formData.logoUrl}
                          onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                          placeholder="https://example.com/logo.png"
                          data-testid="input-logo-url"
                        />
                        <Button type="button" variant="outline" size="icon" disabled>
                          <Image className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Enter a URL to your company logo</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Brand Colors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            id="primaryColor"
                            value={formData.primaryColor}
                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                            className="w-12 h-9 p-1 cursor-pointer"
                            data-testid="input-primary-color"
                          />
                          <Input
                            value={formData.primaryColor}
                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                            placeholder="#D4A01D"
                            className="flex-1 font-mono uppercase"
                            data-testid="input-primary-color-hex"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secondaryColor">Secondary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            id="secondaryColor"
                            value={formData.secondaryColor}
                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                            className="w-12 h-9 p-1 cursor-pointer"
                            data-testid="input-secondary-color"
                          />
                          <Input
                            value={formData.secondaryColor}
                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                            placeholder="#1a1a1a"
                            className="flex-1 font-mono uppercase"
                            data-testid="input-secondary-color-hex"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone Number</Label>
                      <Input
                        id="contactPhone"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        placeholder="555-123-4567"
                        data-testid="input-contact-phone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email Address</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        placeholder="contact@example.com"
                        data-testid="input-contact-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactAddress">Address</Label>
                      <Textarea
                        id="contactAddress"
                        value={formData.contactAddress}
                        onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                        placeholder="123 Main Street, City, State 12345"
                        rows={2}
                        data-testid="input-contact-address"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Type className="h-5 w-5" />
                      Custom Footer Text
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="footerText">Footer Text (Optional)</Label>
                      <Textarea
                        id="footerText"
                        value={formData.footerText}
                        onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                        placeholder="Custom footer message or disclaimer..."
                        rows={3}
                        data-testid="input-footer-text"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={saveMutation.isPending}
                    data-testid="button-save-settings"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveMutation.isPending ? "Saving..." : "Save Settings"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleReset}
                    disabled={resetMutation.isPending}
                    data-testid="button-reset-defaults"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Defaults
                  </Button>
                </div>
              </form>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Live Preview
                    </CardTitle>
                    <CardDescription>
                      Preview how the branding will appear on the site
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground">Header</h4>
                      <div className="border rounded-md p-4 bg-card">
                        <div className="flex items-center">
                          {formData.logoUrl ? (
                            <img 
                              src={formData.logoUrl} 
                              alt="Logo preview" 
                              className="h-8 max-w-[150px] object-contain"
                              data-testid="preview-logo"
                            />
                          ) : (
                            <div className="flex items-center" data-testid="preview-company-name">
                              <span 
                                className="text-xl font-bold" 
                                style={{ color: formData.primaryColor }}
                              >
                                {formData.companyName.split(" ")[0]}
                              </span>
                              <span className="text-xl font-light text-foreground ml-1">
                                {formData.companyName.split(" ").slice(1).join(" ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground">Primary Color</h4>
                      <div className="flex gap-3">
                        <div 
                          className="w-16 h-16 rounded-md shadow-sm border"
                          style={{ backgroundColor: formData.primaryColor }}
                          data-testid="preview-primary-swatch"
                        />
                        <div className="flex-1">
                          <Button 
                            className="w-full"
                            style={{ 
                              backgroundColor: formData.primaryColor,
                              borderColor: formData.primaryColor,
                            }}
                            data-testid="preview-button-primary"
                          >
                            Sample Button
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            Buttons, links, and accents will use this color
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground">Contact Info</h4>
                      <div className="border rounded-md p-4 bg-muted/30 text-sm space-y-1">
                        <p className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span data-testid="preview-phone">{formData.contactPhone}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span data-testid="preview-email">{formData.contactEmail}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span data-testid="preview-address">{formData.contactAddress}</span>
                        </p>
                      </div>
                    </div>

                    {formData.footerText && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Footer Text</h4>
                        <div className="border rounded-md p-4 bg-muted/30 text-sm text-muted-foreground">
                          <p data-testid="preview-footer-text">{formData.footerText}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Demo Mode</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          When custom branding is active, a "Demo Mode" banner will appear at the top of the site 
                          indicating this is a broker demonstration with "Powered by Sequel Investments" attribution.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="flex-1 m-0 flex flex-col overflow-hidden">
          <div className="border-b px-6 py-3 bg-muted/30">
            <div className="flex items-center gap-4">
              <Label htmlFor="page-select" className="text-sm font-medium">
                Select Page:
              </Label>
              <Select value={selectedPageId} onValueChange={setSelectedPageId}>
                <SelectTrigger id="page-select" className="w-64" data-testid="select-page">
                  <SelectValue placeholder="Select a page to edit" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAGE_LABELS).map(([id, label]) => (
                    <SelectItem key={id} value={id} data-testid={`option-page-${id}`}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <EditorLayout pageId={selectedPageId} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
