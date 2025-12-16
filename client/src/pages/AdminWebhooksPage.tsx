import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Webhook,
  Plus,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  ExternalLink,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { WebhookEndpoint, WebhookDeliveryLog } from "@shared/schema";

const availableEvents = [
  { id: "fundedDeal.created", label: "Funded Deal Created", category: "Deals" },
  { id: "fundedDeal.updated", label: "Funded Deal Updated", category: "Deals" },
  { id: "fundedDeal.deleted", label: "Funded Deal Deleted", category: "Deals" },
  { id: "application.submitted", label: "Application Submitted", category: "Applications" },
  { id: "application.approved", label: "Application Approved", category: "Applications" },
  { id: "application.funded", label: "Application Funded", category: "Applications" },
  { id: "document.uploaded", label: "Document Uploaded", category: "Documents" },
  { id: "payment.received", label: "Payment Received", category: "Payments" },
  { id: "draw.submitted", label: "Draw Request Submitted", category: "Draws" },
  { id: "draw.approved", label: "Draw Approved", category: "Draws" },
];

const statusConfig = {
  success: { icon: CheckCircle2, color: "text-green-600", label: "Success" },
  failed: { icon: XCircle, color: "text-red-600", label: "Failed" },
  pending: { icon: Clock, color: "text-yellow-600", label: "Pending" },
  retrying: { icon: RefreshCw, color: "text-blue-600", label: "Retrying" },
};

function formatDate(dateString: string | Date | null): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminWebhooksPage() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<WebhookEndpoint | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  
  const [newEndpoint, setNewEndpoint] = useState({
    name: "",
    targetUrl: "",
    subscribedEvents: [] as string[],
  });

  const { data: endpoints, isLoading: endpointsLoading } = useQuery<WebhookEndpoint[]>({
    queryKey: ["/api/admin/webhooks/endpoints"],
  });

  const { data: deliveries, isLoading: deliveriesLoading } = useQuery<WebhookDeliveryLog[]>({
    queryKey: ["/api/admin/webhooks/deliveries"],
  });

  const createEndpointMutation = useMutation({
    mutationFn: async (data: typeof newEndpoint) => {
      return apiRequest("POST", "/api/admin/webhooks/endpoints", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/webhooks/endpoints"] });
      toast({ title: "Webhook Created", description: "New webhook endpoint has been created." });
      setCreateDialogOpen(false);
      setNewEndpoint({ name: "", targetUrl: "", subscribedEvents: [] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create webhook endpoint.", variant: "destructive" });
    },
  });

  const toggleEndpointMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/admin/webhooks/endpoints/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/webhooks/endpoints"] });
      toast({ title: "Webhook Updated", description: "Webhook status has been updated." });
    },
  });

  const deleteEndpointMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/webhooks/endpoints/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/webhooks/endpoints"] });
      toast({ title: "Webhook Deleted", description: "Webhook endpoint has been deleted." });
    },
  });

  const regenerateSecretMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/admin/webhooks/endpoints/${id}/regenerate-secret`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/webhooks/endpoints"] });
      toast({ title: "Secret Regenerated", description: "Webhook secret has been regenerated." });
    },
  });

  const testEndpointMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/admin/webhooks/endpoints/${id}/test`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/webhooks/deliveries"] });
      toast({ title: "Test Sent", description: "Test webhook has been sent." });
    },
    onError: () => {
      toast({ title: "Test Failed", description: "Failed to send test webhook.", variant: "destructive" });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Copied to clipboard." });
  };

  const toggleEventSelection = (eventId: string) => {
    setNewEndpoint((prev) => ({
      ...prev,
      subscribedEvents: prev.subscribedEvents.includes(eventId)
        ? prev.subscribedEvents.filter((e) => e !== eventId)
        : [...prev.subscribedEvents, eventId],
    }));
  };

  if (endpointsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Webhook className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Webhooks</h1>
            <p className="text-muted-foreground">Manage webhook endpoints and deliveries</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Webhook className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Webhooks</h1>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-webhook">
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Webhook Endpoint</DialogTitle>
              <DialogDescription>
                Configure a new webhook endpoint to receive event notifications.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-name">Name</Label>
                <Input
                  id="webhook-name"
                  placeholder="e.g., CRM Integration"
                  value={newEndpoint.name}
                  onChange={(e) => setNewEndpoint({ ...newEndpoint, name: e.target.value })}
                  data-testid="input-webhook-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Endpoint URL</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder="https://api.example.com/webhooks"
                  value={newEndpoint.targetUrl}
                  onChange={(e) => setNewEndpoint({ ...newEndpoint, targetUrl: e.target.value })}
                  data-testid="input-webhook-url"
                />
              </div>
              <div className="space-y-2">
                <Label>Events to Subscribe</Label>
                <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                  {availableEvents.map((event) => (
                    <div key={event.id} className="flex items-center gap-2">
                      <Checkbox
                        id={event.id}
                        checked={newEndpoint.subscribedEvents.includes(event.id)}
                        onCheckedChange={() => toggleEventSelection(event.id)}
                      />
                      <label htmlFor={event.id} className="text-sm cursor-pointer flex-1">
                        {event.label}
                        <span className="text-muted-foreground ml-2">({event.category})</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createEndpointMutation.mutate(newEndpoint)}
                disabled={!newEndpoint.name || !newEndpoint.targetUrl || newEndpoint.subscribedEvents.length === 0 || createEndpointMutation.isPending}
                data-testid="button-save-webhook"
              >
                {createEndpointMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Webhook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="endpoints">
        <TabsList>
          <TabsTrigger value="endpoints">Endpoints ({endpoints?.length || 0})</TabsTrigger>
          <TabsTrigger value="deliveries">Recent Deliveries</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="mt-4">
          {!endpoints || endpoints.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Webhook className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground mb-4">No webhook endpoints configured</p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Webhook
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {endpoints.map((endpoint) => (
                <Card key={endpoint.id} data-testid={`card-webhook-${endpoint.id}`}>
                  <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${endpoint.isActive ? "bg-green-500/10" : "bg-muted"}`}>
                        <Webhook className={`h-5 w-5 ${endpoint.isActive ? "text-green-600" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {endpoint.name}
                          <Badge variant={endpoint.isActive ? "default" : "secondary"}>
                            {endpoint.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <ExternalLink className="h-3 w-3" />
                          {endpoint.targetUrl}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={endpoint.isActive}
                        onCheckedChange={(checked) => toggleEndpointMutation.mutate({ id: endpoint.id, isActive: checked })}
                        data-testid={`switch-active-${endpoint.id}`}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`button-actions-${endpoint.id}`}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => testEndpointMutation.mutate(endpoint.id)}>
                            <Send className="h-4 w-4 mr-2" />
                            Send Test
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => regenerateSecretMutation.mutate(endpoint.id)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Regenerate Secret
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteEndpointMutation.mutate(endpoint.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Signing Secret</p>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                            {showSecrets[endpoint.id] ? endpoint.secret : "••••••••••••••••"}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowSecrets({ ...showSecrets, [endpoint.id]: !showSecrets[endpoint.id] })}
                          >
                            {showSecrets[endpoint.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(endpoint.secret)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Subscribed Events</p>
                        <div className="flex flex-wrap gap-1">
                          {(endpoint.subscribedEvents as string[]).slice(0, 3).map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                          {(endpoint.subscribedEvents as string[]).length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(endpoint.subscribedEvents as string[]).length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="deliveries" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Webhook Deliveries</CardTitle>
              <CardDescription>View the status of recent webhook deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              {deliveriesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : !deliveries || deliveries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No recent webhook deliveries</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Sent At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveries.map((delivery) => {
                      const status = statusConfig[delivery.status as keyof typeof statusConfig] || statusConfig.pending;
                      const StatusIcon = status.icon;
                      
                      return (
                        <TableRow key={delivery.id} data-testid={`row-delivery-${delivery.id}`}>
                          <TableCell>
                            <Badge variant="outline">{delivery.eventId}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground truncate max-w-[200px]">
                            {delivery.endpointId}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <StatusIcon className={`h-4 w-4 ${status.color}`} />
                              <span className={status.color}>{status.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {delivery.responseCode ? (
                              <Badge variant={delivery.responseCode >= 200 && delivery.responseCode < 300 ? "default" : "destructive"}>
                                {delivery.responseCode}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{delivery.attemptCount}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(delivery.lastAttemptAt)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
