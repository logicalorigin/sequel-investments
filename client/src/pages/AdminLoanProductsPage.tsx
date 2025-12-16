import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package,
  Plus,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  DollarSign,
  Percent,
  Clock,
  Home,
  Building2,
  HardHat,
  CheckCircle,
  XCircle,
  Search,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { LoanProduct } from "@shared/schema";

const statusConfig = {
  active: { label: "Active", color: "bg-green-500/10 text-green-600 border-green-500/30", icon: CheckCircle },
  inactive: { label: "Inactive", color: "bg-gray-500/10 text-gray-600 border-gray-500/30", icon: XCircle },
  coming_soon: { label: "Coming Soon", color: "bg-amber-500/10 text-amber-600 border-amber-500/30", icon: Clock },
};

const iconOptions = [
  { value: "Home", label: "Home", icon: Home },
  { value: "Building2", label: "Building", icon: Building2 },
  { value: "HardHat", label: "Construction", icon: HardHat },
  { value: "DollarSign", label: "Dollar", icon: DollarSign },
];

function formatCurrency(amount: number | null): string {
  if (amount === null) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(value: number | string | null): string {
  if (value === null) return "-";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `${num.toFixed(2)}%`;
}

function ProductIcon({ iconName }: { iconName: string | null }) {
  const icons: Record<string, typeof Home> = { Home, Building2, HardHat, DollarSign };
  const IconComponent = icons[iconName || "Home"] || Home;
  return <IconComponent className="h-5 w-5" />;
}

interface ProductFormData {
  name: string;
  slug: string;
  shortName: string;
  status: "active" | "inactive" | "coming_soon";
  description: string;
  subtitle: string;
  icon: string;
  primaryColor: string;
  minRate: string;
  maxRate: string;
  minLoanAmount: string;
  maxLoanAmount: string;
  maxLTV: string;
  maxLTC: string;
  maxLTARV: string;
  minCreditScore: string;
  minDSCR: string;
  defaultTermMonths: string;
  amortizationMonths: string;
  features: string;
  showInQuoteFlow: boolean;
  showInCalculators: boolean;
  showInProductsSection: boolean;
  showInNavigation: boolean;
}

const defaultFormData: ProductFormData = {
  name: "",
  slug: "",
  shortName: "",
  status: "inactive",
  description: "",
  subtitle: "",
  icon: "Home",
  primaryColor: "#F59E0B",
  minRate: "",
  maxRate: "",
  minLoanAmount: "",
  maxLoanAmount: "",
  maxLTV: "",
  maxLTC: "",
  maxLTARV: "",
  minCreditScore: "",
  minDSCR: "",
  defaultTermMonths: "",
  amortizationMonths: "",
  features: "",
  showInQuoteFlow: true,
  showInCalculators: true,
  showInProductsSection: true,
  showInNavigation: true,
};

function productToFormData(product: LoanProduct): ProductFormData {
  return {
    name: product.name,
    slug: product.slug,
    shortName: product.shortName,
    status: product.status,
    description: product.description || "",
    subtitle: product.subtitle || "",
    icon: product.icon || "Home",
    primaryColor: product.primaryColor || "#F59E0B",
    minRate: product.minRate?.toString() || "",
    maxRate: product.maxRate?.toString() || "",
    minLoanAmount: product.minLoanAmount?.toString() || "",
    maxLoanAmount: product.maxLoanAmount?.toString() || "",
    maxLTV: product.maxLTV?.toString() || "",
    maxLTC: product.maxLTC?.toString() || "",
    maxLTARV: product.maxLTARV?.toString() || "",
    minCreditScore: product.minCreditScore?.toString() || "",
    minDSCR: product.minDSCR?.toString() || "",
    defaultTermMonths: product.defaultTermMonths?.toString() || "",
    amortizationMonths: product.amortizationMonths?.toString() || "",
    features: product.features?.join("\n") || "",
    showInQuoteFlow: product.showInQuoteFlow ?? true,
    showInCalculators: product.showInCalculators ?? true,
    showInProductsSection: product.showInProductsSection ?? true,
    showInNavigation: product.showInNavigation ?? true,
  };
}

function formDataToPayload(data: ProductFormData) {
  return {
    name: data.name,
    slug: data.slug,
    shortName: data.shortName,
    status: data.status,
    description: data.description || null,
    subtitle: data.subtitle || null,
    icon: data.icon,
    primaryColor: data.primaryColor,
    minRate: data.minRate || null,
    maxRate: data.maxRate || null,
    minLoanAmount: data.minLoanAmount ? parseInt(data.minLoanAmount) : null,
    maxLoanAmount: data.maxLoanAmount ? parseInt(data.maxLoanAmount) : null,
    maxLTV: data.maxLTV ? parseInt(data.maxLTV) : null,
    maxLTC: data.maxLTC ? parseInt(data.maxLTC) : null,
    maxLTARV: data.maxLTARV ? parseInt(data.maxLTARV) : null,
    minCreditScore: data.minCreditScore ? parseInt(data.minCreditScore) : null,
    minDSCR: data.minDSCR || null,
    defaultTermMonths: data.defaultTermMonths ? parseInt(data.defaultTermMonths) : null,
    amortizationMonths: data.amortizationMonths ? parseInt(data.amortizationMonths) : null,
    features: data.features.split("\n").filter(f => f.trim()),
    showInQuoteFlow: data.showInQuoteFlow,
    showInCalculators: data.showInCalculators,
    showInProductsSection: data.showInProductsSection,
    showInNavigation: data.showInNavigation,
  };
}

export default function AdminLoanProductsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingProduct, setEditingProduct] = useState<LoanProduct | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<LoanProduct | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [activeTab, setActiveTab] = useState("basic");

  const { data: products, isLoading } = useQuery<LoanProduct[]>({
    queryKey: ["/api/admin/loan-products"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/loan-products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loan-products"] });
      toast({ title: "Product Created", description: "Loan product has been created successfully." });
      setIsCreating(false);
      setFormData(defaultFormData);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create loan product.", 
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PUT", `/api/admin/loan-products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loan-products"] });
      toast({ title: "Product Updated", description: "Loan product has been updated successfully." });
      setEditingProduct(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update loan product.", 
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/loan-products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loan-products"] });
      toast({ title: "Product Deleted", description: "Loan product has been deleted." });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete loan product.", variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      return apiRequest("PATCH", "/api/admin/loan-products/reorder", { orderedIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loan-products"] });
      toast({ title: "Reordered", description: "Product order has been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reorder products.", variant: "destructive" });
    },
  });

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const stats = {
    total: products?.length || 0,
    active: products?.filter(p => p.status === "active").length || 0,
    inactive: products?.filter(p => p.status === "inactive").length || 0,
    comingSoon: products?.filter(p => p.status === "coming_soon").length || 0,
  };

  const handleOpenCreate = () => {
    setFormData(defaultFormData);
    setActiveTab("basic");
    setIsCreating(true);
  };

  const handleOpenEdit = (product: LoanProduct) => {
    setFormData(productToFormData(product));
    setActiveTab("basic");
    setEditingProduct(product);
  };

  const handleSubmit = () => {
    const payload = formDataToPayload(formData);
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleMoveUp = (index: number) => {
    if (!products || index === 0) return;
    const ids = products.map(p => p.id);
    [ids[index], ids[index - 1]] = [ids[index - 1], ids[index]];
    reorderMutation.mutate(ids);
  };

  const handleMoveDown = (index: number) => {
    if (!products || index === products.length - 1) return;
    const ids = products.map(p => p.id);
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    reorderMutation.mutate(ids);
  };

  const handleToggleStatus = (product: LoanProduct) => {
    const newStatus = product.status === "active" ? "inactive" : "active";
    updateMutation.mutate({ id: product.id, data: { status: newStatus } });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Loan Products</h1>
            <p className="text-muted-foreground">Manage loan product offerings</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 mb-4" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Loan Products</h1>
        </div>
        <Button onClick={handleOpenCreate} data-testid="button-create-product">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold" data-testid="text-total-count">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600" data-testid="text-active-count">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-gray-600" data-testid="text-inactive-count">{stats.inactive}</p>
              </div>
              <XCircle className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Coming Soon</p>
                <p className="text-2xl font-bold text-amber-600" data-testid="text-coming-soon-count">{stats.comingSoon}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>View and manage all loan products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="coming_soon">Coming Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">Order</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rate Range</TableHead>
                <TableHead>Loan Range</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product, index) => {
                const config = statusConfig[product.status];
                const StatusIcon = config.icon;
                return (
                  <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={index === 0 || reorderMutation.isPending}
                          onClick={() => handleMoveUp(index)}
                          data-testid={`button-move-up-${product.id}`}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={index === filteredProducts.length - 1 || reorderMutation.isPending}
                          onClick={() => handleMoveDown(index)}
                          data-testid={`button-move-down-${product.id}`}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: product.primaryColor + "20" }}
                        >
                          <ProductIcon iconName={product.icon} />
                        </div>
                        <div>
                          <div className="font-medium" data-testid={`text-product-name-${product.id}`}>
                            {product.name}
                          </div>
                          <div className="text-sm text-muted-foreground">{product.slug}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={config.color} data-testid={`badge-status-${product.id}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {formatPercent(product.minRate)} - {formatPercent(product.maxRate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatCurrency(product.minLoanAmount)} - {formatCurrency(product.maxLoanAmount)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {product.showInProductsSection && (
                          <Badge variant="outline" className="text-xs">Products</Badge>
                        )}
                        {product.showInCalculators && (
                          <Badge variant="outline" className="text-xs">Calculator</Badge>
                        )}
                        {product.showInQuoteFlow && (
                          <Badge variant="outline" className="text-xs">Quote</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`button-actions-${product.id}`}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEdit(product)} data-testid={`menu-edit-${product.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(product)} data-testid={`menu-toggle-${product.id}`}>
                            {product.status === "active" ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setProductToDelete(product);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-destructive"
                            data-testid={`menu-delete-${product.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={isCreating || !!editingProduct} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setEditingProduct(null);
        }
      }}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle data-testid="text-sheet-title">
              {editingProduct ? "Edit Loan Product" : "Create Loan Product"}
            </SheetTitle>
            <SheetDescription>
              {editingProduct 
                ? "Update the details for this loan product" 
                : "Add a new loan product to the catalog"}
            </SheetDescription>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" data-testid="tab-basic">Basic Info</TabsTrigger>
              <TabsTrigger value="terms" data-testid="tab-terms">Terms</TabsTrigger>
              <TabsTrigger value="features" data-testid="tab-features">Features</TabsTrigger>
              <TabsTrigger value="visibility" data-testid="tab-visibility">Visibility</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., DSCR Rental Loans"
                    data-testid="input-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortName">Short Name *</Label>
                  <Input
                    id="shortName"
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    placeholder="e.g., DSCR"
                    data-testid="input-short-name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                  placeholder="e.g., dscr"
                  data-testid="input-slug"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Short tagline for the product"
                  data-testid="input-subtitle"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Full description of the loan product"
                  rows={3}
                  data-testid="input-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                    <SelectTrigger data-testid="select-icon">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <opt.icon className="h-4 w-4" />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Brand Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="primaryColor"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-14 h-9 p-1"
                      data-testid="input-color"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="flex-1"
                      data-testid="input-color-text"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="coming_soon">Coming Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="terms" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minRate">Min Rate (%)</Label>
                  <Input
                    id="minRate"
                    type="text"
                    value={formData.minRate}
                    onChange={(e) => setFormData({ ...formData, minRate: e.target.value })}
                    placeholder="5.75"
                    data-testid="input-rate-min"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxRate">Max Rate (%)</Label>
                  <Input
                    id="maxRate"
                    type="text"
                    value={formData.maxRate}
                    onChange={(e) => setFormData({ ...formData, maxRate: e.target.value })}
                    placeholder="9.50"
                    data-testid="input-rate-max"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minLoanAmount">Min Loan Amount ($)</Label>
                  <Input
                    id="minLoanAmount"
                    type="number"
                    value={formData.minLoanAmount}
                    onChange={(e) => setFormData({ ...formData, minLoanAmount: e.target.value })}
                    placeholder="100000"
                    data-testid="input-loan-min"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoanAmount">Max Loan Amount ($)</Label>
                  <Input
                    id="maxLoanAmount"
                    type="number"
                    value={formData.maxLoanAmount}
                    onChange={(e) => setFormData({ ...formData, maxLoanAmount: e.target.value })}
                    placeholder="5000000"
                    data-testid="input-loan-max"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxLTV">Max LTV (%)</Label>
                  <Input
                    id="maxLTV"
                    type="number"
                    value={formData.maxLTV}
                    onChange={(e) => setFormData({ ...formData, maxLTV: e.target.value })}
                    placeholder="80"
                    data-testid="input-ltv-max"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLTC">Max LTC (%)</Label>
                  <Input
                    id="maxLTC"
                    type="number"
                    value={formData.maxLTC}
                    onChange={(e) => setFormData({ ...formData, maxLTC: e.target.value })}
                    placeholder="90"
                    data-testid="input-ltc-max"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLTARV">Max LTARV (%)</Label>
                  <Input
                    id="maxLTARV"
                    type="number"
                    value={formData.maxLTARV}
                    onChange={(e) => setFormData({ ...formData, maxLTARV: e.target.value })}
                    placeholder="75"
                    data-testid="input-ltarv-max"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minCreditScore">Min Credit Score</Label>
                  <Input
                    id="minCreditScore"
                    type="number"
                    value={formData.minCreditScore}
                    onChange={(e) => setFormData({ ...formData, minCreditScore: e.target.value })}
                    placeholder="660"
                    data-testid="input-credit-min"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minDSCR">Min DSCR</Label>
                  <Input
                    id="minDSCR"
                    type="text"
                    value={formData.minDSCR}
                    onChange={(e) => setFormData({ ...formData, minDSCR: e.target.value })}
                    placeholder="1.0"
                    data-testid="input-dscr-min"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultTermMonths">Default Term (months)</Label>
                  <Input
                    id="defaultTermMonths"
                    type="number"
                    value={formData.defaultTermMonths}
                    onChange={(e) => setFormData({ ...formData, defaultTermMonths: e.target.value })}
                    placeholder="360"
                    data-testid="input-default-term"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amortizationMonths">Amortization (months)</Label>
                  <Input
                    id="amortizationMonths"
                    type="number"
                    value={formData.amortizationMonths}
                    onChange={(e) => setFormData({ ...formData, amortizationMonths: e.target.value })}
                    placeholder="360"
                    data-testid="input-amortization"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="features">Product Features</Label>
                <p className="text-sm text-muted-foreground">Enter one feature per line</p>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="No income verification required
No employment verification
No DTI requirements
Close in entity name
Interest-only payment options"
                  rows={10}
                  data-testid="input-features"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {formData.features.split("\n").filter(f => f.trim()).length} features defined
              </div>
            </TabsContent>

            <TabsContent value="visibility" className="space-y-6 mt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show in Products Section</Label>
                  <p className="text-sm text-muted-foreground">Display this product in the products section on pages</p>
                </div>
                <Switch
                  checked={formData.showInProductsSection}
                  onCheckedChange={(checked) => setFormData({ ...formData, showInProductsSection: checked })}
                  data-testid="switch-products"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show in Navigation</Label>
                  <p className="text-sm text-muted-foreground">Include this product in site navigation</p>
                </div>
                <Switch
                  checked={formData.showInNavigation}
                  onCheckedChange={(checked) => setFormData({ ...formData, showInNavigation: checked })}
                  data-testid="switch-navigation"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show in Calculators</Label>
                  <p className="text-sm text-muted-foreground">Include this product in loan calculators</p>
                </div>
                <Switch
                  checked={formData.showInCalculators}
                  onCheckedChange={(checked) => setFormData({ ...formData, showInCalculators: checked })}
                  data-testid="switch-calculator"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show in Quote Flow</Label>
                  <p className="text-sm text-muted-foreground">Allow users to request quotes for this product</p>
                </div>
                <Switch
                  checked={formData.showInQuoteFlow}
                  onCheckedChange={(checked) => setFormData({ ...formData, showInQuoteFlow: checked })}
                  data-testid="switch-quote"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setEditingProduct(null);
              }}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending || !formData.name || !formData.slug || !formData.shortName}
              data-testid="button-save"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingProduct ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Loan Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-delete-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => productToDelete && deleteMutation.mutate(productToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-delete-confirm"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
