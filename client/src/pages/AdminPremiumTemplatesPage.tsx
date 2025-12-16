import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "@/components/AdminLayout";
import { Plus, Palette, Crown, Trash2, Edit, Eye, Loader2, LayoutTemplate, ChevronUp, ChevronDown, Check, X } from "lucide-react";
import type { PremiumTemplate, InsertPremiumTemplate } from "@shared/schema";

const TEMPLATE_CATEGORIES = [
  { value: "modern", label: "Modern" },
  { value: "classic", label: "Classic" },
  { value: "minimal", label: "Minimal" },
  { value: "bold", label: "Bold" },
];

const BUTTON_STYLES = [
  { value: "rounded", label: "Rounded" },
  { value: "square", label: "Square" },
  { value: "pill", label: "Pill" },
];

const DEFAULT_TEMPLATE: Partial<InsertPremiumTemplate> = {
  name: "",
  slug: "",
  description: "",
  category: "modern",
  colorScheme: {
    primary: "#D4AF37",
    secondary: "#1A1A1A",
    accent: "#FFD700",
    background: "#0A0A0A",
    foreground: "#FFFFFF",
    muted: "#2D2D2D",
    card: "#141414",
  },
  typography: {
    headingFont: "Inter",
    bodyFont: "Inter",
    headingWeight: "600",
  },
  buttonStyle: "rounded",
  borderRadius: "0.5rem",
  themePreference: "dark",
  isPremium: true,
  isActive: true,
};

export default function AdminPremiumTemplatesPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PremiumTemplate | null>(null);
  const [formData, setFormData] = useState<Partial<InsertPremiumTemplate>>(DEFAULT_TEMPLATE);

  const { data: templates, isLoading } = useQuery<PremiumTemplate[]>({
    queryKey: ["/api/admin/premium-templates"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<InsertPremiumTemplate>) => {
      return await apiRequest("POST", "/api/admin/premium-templates", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/premium-templates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/premium-templates"] });
      setIsCreateDialogOpen(false);
      setFormData(DEFAULT_TEMPLATE);
      toast({ title: "Template Created", description: "Premium template has been created." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPremiumTemplate> }) => {
      return await apiRequest("PUT", `/api/admin/premium-templates/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/premium-templates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/premium-templates"] });
      setEditingTemplate(null);
      setFormData(DEFAULT_TEMPLATE);
      toast({ title: "Template Updated", description: "Premium template has been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/premium-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/premium-templates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/premium-templates"] });
      toast({ title: "Template Deleted", description: "Premium template has been deleted." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      return await apiRequest("PATCH", "/api/admin/premium-templates/reorder", { orderedIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/premium-templates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/premium-templates"] });
    },
  });

  const handleMoveUp = (index: number) => {
    if (!templates || index === 0) return;
    const newOrder = [...templates];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    reorderMutation.mutate(newOrder.map((t) => t.id));
  };

  const handleMoveDown = (index: number) => {
    if (!templates || index === templates.length - 1) return;
    const newOrder = [...templates];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    reorderMutation.mutate(newOrder.map((t) => t.id));
  };

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!editingTemplate) return;
    updateMutation.mutate({ id: editingTemplate.id, data: formData });
  };

  const handleDelete = (template: PremiumTemplate) => {
    if (window.confirm(`Delete "${template.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(template.id);
    }
  };

  const openEditDialog = (template: PremiumTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      slug: template.slug,
      description: template.description || "",
      category: template.category || "modern",
      colorScheme: template.colorScheme || DEFAULT_TEMPLATE.colorScheme,
      typography: template.typography || DEFAULT_TEMPLATE.typography,
      buttonStyle: template.buttonStyle || "rounded",
      borderRadius: template.borderRadius || "0.5rem",
      themePreference: template.themePreference || "dark",
      isPremium: template.isPremium,
      isActive: template.isActive,
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const updateColor = (key: keyof NonNullable<InsertPremiumTemplate["colorScheme"]>, value: string) => {
    setFormData((prev) => ({
      ...prev,
      colorScheme: {
        ...prev.colorScheme!,
        [key]: value,
      },
    }));
  };

  if (authLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    navigate("/admin/login");
    return null;
  }

  const TemplateForm = ({ isEditing = false }: { isEditing?: boolean }) => (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                    slug: isEditing ? prev.slug : generateSlug(e.target.value),
                  }));
                }}
                placeholder="Template name"
                data-testid="input-template-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="template-slug"
                data-testid="input-template-slug"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the template..."
              className="min-h-[80px]"
              data-testid="input-template-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category || "modern"}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value as any }))}
              >
                <SelectTrigger data-testid="select-template-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="themePreference">Theme</Label>
              <Select
                value={formData.themePreference || "dark"}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, themePreference: value as any }))}
              >
                <SelectTrigger data-testid="select-template-theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buttonStyle">Button Style</Label>
              <Select
                value={formData.buttonStyle || "rounded"}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, buttonStyle: value as any }))}
              >
                <SelectTrigger data-testid="select-button-style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUTTON_STYLES.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="borderRadius">Border Radius</Label>
              <Input
                id="borderRadius"
                value={formData.borderRadius || "0.5rem"}
                onChange={(e) => setFormData((prev) => ({ ...prev, borderRadius: e.target.value }))}
                placeholder="0.5rem"
                data-testid="input-border-radius"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2">
              <Switch
                id="isPremium"
                checked={formData.isPremium}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPremium: checked }))}
                data-testid="switch-is-premium"
              />
              <Label htmlFor="isPremium">Premium Template</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                data-testid="switch-is-active"
              />
              <Label htmlFor="isActive">Active (visible to users)</Label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="colors" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "primary", label: "Primary" },
              { key: "secondary", label: "Secondary" },
              { key: "accent", label: "Accent" },
              { key: "background", label: "Background" },
              { key: "foreground", label: "Foreground" },
              { key: "muted", label: "Muted" },
              { key: "card", label: "Card" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={(formData.colorScheme as any)?.[key] || "#000000"}
                    onChange={(e) => updateColor(key as any, e.target.value)}
                    className="w-12 h-9 p-1 cursor-pointer"
                    data-testid={`input-color-${key}`}
                  />
                  <Input
                    value={(formData.colorScheme as any)?.[key] || ""}
                    onChange={(e) => updateColor(key as any, e.target.value)}
                    placeholder="#FFFFFF"
                    className="flex-1 font-mono uppercase"
                    data-testid={`input-color-${key}-hex`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 rounded-lg border" style={{
            backgroundColor: formData.colorScheme?.background,
            color: formData.colorScheme?.foreground,
          }}>
            <h3 className="font-semibold mb-2">Color Preview</h3>
            <div className="flex gap-2 flex-wrap">
              <div className="px-4 py-2 rounded" style={{ backgroundColor: formData.colorScheme?.primary, color: "#fff" }}>
                Primary
              </div>
              <div className="px-4 py-2 rounded" style={{ backgroundColor: formData.colorScheme?.secondary, color: "#fff" }}>
                Secondary
              </div>
              <div className="px-4 py-2 rounded" style={{ backgroundColor: formData.colorScheme?.accent, color: "#000" }}>
                Accent
              </div>
              <div className="px-4 py-2 rounded border" style={{ backgroundColor: formData.colorScheme?.card }}>
                Card
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Heading Font</Label>
              <Input
                value={formData.typography?.headingFont || "Inter"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    typography: { ...prev.typography!, headingFont: e.target.value },
                  }))
                }
                placeholder="Inter"
                data-testid="input-heading-font"
              />
            </div>
            <div className="space-y-2">
              <Label>Body Font</Label>
              <Input
                value={formData.typography?.bodyFont || "Inter"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    typography: { ...prev.typography!, bodyFont: e.target.value },
                  }))
                }
                placeholder="Inter"
                data-testid="input-body-font"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Heading Weight</Label>
            <Select
              value={formData.typography?.headingWeight || "600"}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  typography: { ...prev.typography!, headingWeight: value },
                }))
              }
            >
              <SelectTrigger data-testid="select-heading-weight">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="400">Regular (400)</SelectItem>
                <SelectItem value="500">Medium (500)</SelectItem>
                <SelectItem value="600">Semibold (600)</SelectItem>
                <SelectItem value="700">Bold (700)</SelectItem>
                <SelectItem value="800">Extra Bold (800)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold" data-testid="text-page-title">Premium Templates</h1>
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-template">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Premium Template</DialogTitle>
                <DialogDescription>
                  Design a new template with custom colors and typography
                </DialogDescription>
              </DialogHeader>
              <TemplateForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending} data-testid="button-save-template">
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : templates && templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template, index) => (
              <Card
                key={template.id}
                className={`relative ${!template.isActive ? "opacity-60" : ""}`}
                data-testid={`card-admin-template-${template.slug}`}
              >
                {template.isPremium && (
                  <Badge className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-0">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{template.category}</Badge>
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center gap-1">
                    {template.colorScheme &&
                      Object.entries(template.colorScheme).map(([key, value]) => (
                        <div
                          key={key}
                          className="w-6 h-6 rounded-full border shadow-sm"
                          style={{ backgroundColor: value }}
                          title={key}
                        />
                      ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0 gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(template)}
                    data-testid={`button-edit-template-${template.slug}`}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(template)}
                    className="text-destructive hover:text-destructive"
                    data-testid={`button-delete-template-${template.slug}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === templates.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Palette className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg">No Templates Yet</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Create your first premium template to get started
              </p>
              <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </CardContent>
          </Card>
        )}

        <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
              <DialogDescription>
                Update template settings and branding
              </DialogDescription>
            </DialogHeader>
            <TemplateForm isEditing />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending} data-testid="button-update-template">
                {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}