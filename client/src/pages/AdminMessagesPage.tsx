import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Mail, 
  Send, 
  Loader2,
  Search,
  Building2,
  Clock,
  Star,
  Archive,
  ArchiveRestore,
  Inbox,
  MoreVertical,
  CheckCircle2,
  Circle,
  ChevronRight,
  User,
  FileText,
  DollarSign,
  MapPin,
  Phone,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  Copy,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import type { ApplicationMessage, MessageTemplate } from "@shared/schema";

interface MessageThread {
  applicationId: string;
  propertyAddress: string | null;
  loanType: string;
  applicationStatus: string;
  borrowerName: string | null;
  borrowerEmail: string | null;
  loanAmount: number | null;
  messages: ApplicationMessage[];
  unreadCount: number;
  latestMessage: ApplicationMessage | null;
}

interface ApplicationDetails {
  id: string;
  propertyAddress: string | null;
  propertyCity: string | null;
  propertyState: string | null;
  loanType: string;
  status: string;
  loanAmount: number | null;
  userId: string;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
}

const loanTypeLabels: Record<string, string> = {
  dscr: "DSCR",
  fix_flip: "Fix & Flip",
  new_construction: "New Construction",
};

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  in_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  funded: "bg-primary/20 text-primary",
  denied: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  withdrawn: "bg-muted text-muted-foreground",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  normal: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function AdminMessagesPage() {
  const { toast } = useToast();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "starred" | "archived">("all");
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateContent, setNewTemplateContent] = useState("");
  const [newTemplateCategory, setNewTemplateCategory] = useState<string>("general");
  const [isInternalNote, setIsInternalNote] = useState(false);

  useEffect(() => {
    document.title = "Messages | Admin Portal";
  }, []);

  const { data: threads = [], isLoading: threadsLoading, refetch: refetchThreads } = useQuery<MessageThread[]>({
    queryKey: ["/api/admin/message-threads"],
    refetchInterval: 30000,
  });

  const { data: templates = [], isLoading: templatesLoading } = useQuery<MessageTemplate[]>({
    queryKey: ["/api/admin/message-templates"],
  });

  const { data: applicationDetails } = useQuery<ApplicationDetails>({
    queryKey: ["/api/admin/applications", selectedThreadId],
    enabled: !!selectedThreadId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ applicationId, content, isInternal }: { applicationId: string; content: string; isInternal: boolean }) => {
      const res = await apiRequest("POST", `/api/applications/${applicationId}/messages`, { 
        content,
        isInternalNote: isInternal
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/message-threads"] });
      setNewMessage("");
      setIsInternalNote(false);
      toast({
        title: "Message sent",
        description: isInternalNote ? "Internal note added." : "Your message has been sent to the borrower.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMessageMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<{ isStarred: boolean; isArchived: boolean; isRead: boolean; priority: string }> }) => {
      const res = await apiRequest("PATCH", `/api/admin/messages/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/message-threads"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update message.",
        variant: "destructive",
      });
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: async ({ ids, action }: { ids: string[]; action: string }) => {
      const res = await apiRequest("POST", `/api/admin/messages/bulk`, { ids, action });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/message-threads"] });
      setSelectedMessages(new Set());
      toast({
        title: "Success",
        description: `${variables.ids.length} message(s) updated.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update messages.",
        variant: "destructive",
      });
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: { name: string; content: string; category: string }) => {
      const res = await apiRequest("POST", `/api/admin/message-templates`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/message-templates"] });
      setNewTemplateName("");
      setNewTemplateContent("");
      setNewTemplateCategory("general");
      toast({ title: "Template created" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create template.", variant: "destructive" });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<{ name: string; content: string; category: string }> }) => {
      const res = await apiRequest("PATCH", `/api/admin/message-templates/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/message-templates"] });
      setEditingTemplate(null);
      toast({ title: "Template updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update template.", variant: "destructive" });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/message-templates/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/message-templates"] });
      toast({ title: "Template deleted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete template.", variant: "destructive" });
    },
  });

  const useTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/admin/message-templates/${id}/use`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/message-templates"] });
    },
  });

  const filteredThreads = threads.filter(thread => {
    let matchesFilter = true;
    if (activeFilter === "unread") {
      matchesFilter = thread.unreadCount > 0;
    } else if (activeFilter === "starred") {
      matchesFilter = thread.messages.some(m => m.isStarred);
    } else if (activeFilter === "archived") {
      matchesFilter = thread.messages.some(m => m.isArchived);
    }

    if (!matchesFilter) return false;

    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      thread.propertyAddress?.toLowerCase().includes(search) ||
      thread.borrowerName?.toLowerCase().includes(search) ||
      thread.borrowerEmail?.toLowerCase().includes(search) ||
      loanTypeLabels[thread.loanType]?.toLowerCase().includes(search) ||
      thread.messages.some(m => m.content.toLowerCase().includes(search))
    );
  });

  const selectedThread = selectedThreadId 
    ? threads.find(t => t.applicationId === selectedThreadId)
    : null;

  const totalUnread = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  const handleSelectMessage = (messageId: string, checked: boolean) => {
    const newSelected = new Set(selectedMessages);
    if (checked) {
      newSelected.add(messageId);
    } else {
      newSelected.delete(messageId);
    }
    setSelectedMessages(newSelected);
  };

  const handleSelectAllInThread = (checked: boolean) => {
    if (!selectedThread) return;
    const newSelected = new Set(selectedMessages);
    selectedThread.messages.forEach(m => {
      if (checked) {
        newSelected.add(m.id);
      } else {
        newSelected.delete(m.id);
      }
    });
    setSelectedMessages(newSelected);
  };

  const handleBulkAction = (action: string) => {
    if (selectedMessages.size === 0) return;
    bulkActionMutation.mutate({ ids: Array.from(selectedMessages), action });
  };

  const handleUseTemplate = (template: MessageTemplate) => {
    setNewMessage(template.content);
    useTemplateMutation.mutate(template.id);
    setIsTemplatesOpen(false);
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Mail className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Messages</h1>
          {totalUnread > 0 && (
            <Badge className="bg-red-500 text-white" data-testid="badge-total-unread">
              {totalUnread} unread
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedMessages.size > 0 && (
            <div className="flex items-center gap-2 mr-4">
              <span className="text-sm text-muted-foreground">{selectedMessages.size} selected</span>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction("mark_read")} data-testid="button-bulk-mark-read">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Mark Read
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction("star")} data-testid="button-bulk-star">
                <Star className="h-4 w-4 mr-1" />
                Star
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction("archive")} data-testid="button-bulk-archive">
                <Archive className="h-4 w-4 mr-1" />
                Archive
              </Button>
            </div>
          )}

          <Dialog open={isTemplatesOpen} onOpenChange={setIsTemplatesOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-manage-templates">
                <FileText className="h-4 w-4 mr-1" />
                Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Message Templates</DialogTitle>
                <DialogDescription>
                  Create and manage reusable message templates for quick responses.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-sm">Create New Template</h4>
                  <Input
                    placeholder="Template name"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    data-testid="input-template-name"
                  />
                  <Textarea
                    placeholder="Template content..."
                    value={newTemplateContent}
                    onChange={(e) => setNewTemplateContent(e.target.value)}
                    className="min-h-[80px]"
                    data-testid="input-template-content"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={newTemplateCategory}
                      onChange={(e) => setNewTemplateCategory(e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                      data-testid="select-template-category"
                    >
                      <option value="general">General</option>
                      <option value="status_update">Status Update</option>
                      <option value="document_request">Document Request</option>
                      <option value="follow_up">Follow Up</option>
                      <option value="closing">Closing</option>
                    </select>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (newTemplateName && newTemplateContent) {
                          createTemplateMutation.mutate({
                            name: newTemplateName,
                            content: newTemplateContent,
                            category: newTemplateCategory,
                          });
                        }
                      }}
                      disabled={!newTemplateName || !newTemplateContent || createTemplateMutation.isPending}
                      data-testid="button-create-template"
                    >
                      {createTemplateMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-1" />
                      )}
                      Add
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {templatesLoading ? (
                      <div className="text-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </div>
                    ) : templates.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No templates yet</p>
                      </div>
                    ) : (
                      templates.map((template) => (
                        <div
                          key={template.id}
                          className="border rounded-lg p-3 space-y-2"
                          data-testid={`template-${template.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{template.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {template.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Used {template.usageCount || 0} times
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUseTemplate(template)}
                                data-testid={`button-use-template-${template.id}`}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingTemplate(template)}
                                data-testid={`button-edit-template-${template.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteTemplateMutation.mutate(template.id)}
                                data-testid={`button-delete-template-${template.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {template.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Thread List */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-3 border-b space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-threads"
              />
            </div>
            
            <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as typeof activeFilter)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" data-testid="tab-all">
                  <Inbox className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="unread" data-testid="tab-unread">
                  <Circle className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="starred" data-testid="tab-starred">
                  <Star className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="archived" data-testid="tab-archived">
                  <Archive className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <ScrollArea className="flex-1">
            {threadsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages found</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredThreads.map((thread) => (
                  <div
                    key={thread.applicationId}
                    onClick={() => setSelectedThreadId(thread.applicationId)}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedThreadId === thread.applicationId
                        ? "bg-primary/10"
                        : "hover-elevate"
                    } ${thread.unreadCount > 0 ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}`}
                    data-testid={`thread-${thread.applicationId}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium text-sm truncate ${thread.unreadCount > 0 ? "font-semibold" : ""}`}>
                            {thread.borrowerName || "Unknown Borrower"}
                          </span>
                          {thread.messages.some(m => m.isStarred) && (
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 mb-1">
                          <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">
                            {thread.propertyAddress || "Property TBD"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mb-1">
                          <Badge variant="outline" className="text-[10px] px-1 py-0">
                            {loanTypeLabels[thread.loanType] || thread.loanType}
                          </Badge>
                          <Badge className={`text-[10px] px-1 py-0 ${statusColors[thread.applicationStatus] || ""}`}>
                            {thread.applicationStatus}
                          </Badge>
                        </div>
                        {thread.latestMessage && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {thread.latestMessage.senderRole === "borrower" ? "Borrower: " : "Staff: "}
                            {thread.latestMessage.content}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {thread.unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white text-[10px] min-w-[18px] h-4 flex items-center justify-center">
                            {thread.unreadCount}
                          </Badge>
                        )}
                        {thread.latestMessage && (
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(thread.latestMessage.createdAt), { addSuffix: false })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Center Panel - Message Thread */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedThread ? (
            <>
              <div className="p-3 border-b flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedThread.messages.length > 0 && selectedThread.messages.every(m => selectedMessages.has(m.id))}
                    onCheckedChange={(checked) => handleSelectAllInThread(!!checked)}
                    data-testid="checkbox-select-all"
                  />
                  <span className="font-medium">{selectedThread.borrowerName || "Unknown"}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground text-sm truncate">
                    {selectedThread.propertyAddress || "Property TBD"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const latestMsg = selectedThread.latestMessage;
                      if (latestMsg) {
                        updateMessageMutation.mutate({
                          id: latestMsg.id,
                          updates: { isStarred: !latestMsg.isStarred }
                        });
                      }
                    }}
                    data-testid="button-star-thread"
                  >
                    <Star className={`h-4 w-4 ${selectedThread.messages.some(m => m.isStarred) ? "fill-yellow-400 text-yellow-400" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      selectedThread.messages.forEach(m => {
                        updateMessageMutation.mutate({
                          id: m.id,
                          updates: { isArchived: !m.isArchived }
                        });
                      });
                    }}
                    data-testid="button-archive-thread"
                  >
                    {selectedThread.messages.some(m => m.isArchived) ? (
                      <ArchiveRestore className="h-4 w-4" />
                    ) : (
                      <Archive className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {[...selectedThread.messages]
                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                    .map((message) => {
                      const isBorrower = message.senderRole === "borrower";
                      const isInternal = message.isInternalNote;
                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${isInternal ? "opacity-75" : ""}`}
                          data-testid={`message-${message.id}`}
                        >
                          <Checkbox
                            checked={selectedMessages.has(message.id)}
                            onCheckedChange={(checked) => handleSelectMessage(message.id, !!checked)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{message.senderName}</span>
                              <Badge
                                className={`text-[10px] px-1.5 py-0 ${
                                  isBorrower
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                                    : message.senderRole === "admin"
                                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                }`}
                              >
                                {isBorrower ? "Borrower" : message.senderRole === "admin" ? "Admin" : "Staff"}
                              </Badge>
                              {isInternal && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  Internal Note
                                </Badge>
                              )}
                              {message.priority && message.priority !== "normal" && (
                                <Badge className={`text-[10px] px-1.5 py-0 ${priorityColors[message.priority]}`}>
                                  {message.priority}
                                </Badge>
                              )}
                              {message.isStarred && (
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              )}
                              <span className="text-[10px] text-muted-foreground ml-auto">
                                {format(new Date(message.createdAt), "MMM d, yyyy h:mm a")}
                              </span>
                            </div>
                            <div className={`rounded-lg px-3 py-2 ${
                              isInternal
                                ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                                : isBorrower
                                ? "bg-muted"
                                : "bg-primary/10"
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => updateMessageMutation.mutate({ id: message.id, updates: { isStarred: !message.isStarred } })}
                              >
                                <Star className={`h-4 w-4 mr-2 ${message.isStarred ? "fill-yellow-400" : ""}`} />
                                {message.isStarred ? "Unstar" : "Star"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateMessageMutation.mutate({ id: message.id, updates: { isArchived: !message.isArchived } })}
                              >
                                <Archive className="h-4 w-4 mr-2" />
                                {message.isArchived ? "Unarchive" : "Archive"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => updateMessageMutation.mutate({ id: message.id, updates: { priority: "low" } })}
                              >
                                Priority: Low
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateMessageMutation.mutate({ id: message.id, updates: { priority: "normal" } })}
                              >
                                Priority: Normal
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateMessageMutation.mutate({ id: message.id, updates: { priority: "high" } })}
                              >
                                Priority: High
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateMessageMutation.mutate({ id: message.id, updates: { priority: "urgent" } })}
                              >
                                Priority: Urgent
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      );
                    })}
                </div>
              </ScrollArea>

              <div className="p-3 border-t space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    variant={isInternalNote ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsInternalNote(!isInternalNote)}
                    data-testid="button-toggle-internal"
                  >
                    {isInternalNote ? (
                      <>
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Internal Note
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-1" />
                        Reply to Borrower
                      </>
                    )}
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" data-testid="button-insert-template">
                        <FileText className="h-4 w-4 mr-1" />
                        Insert Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Select a Template</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {templates.map((template) => (
                            <div
                              key={template.id}
                              onClick={() => handleUseTemplate(template)}
                              className="p-3 border rounded-lg cursor-pointer hover-elevate"
                              data-testid={`select-template-${template.id}`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{template.name}</span>
                                <Badge variant="outline" className="text-xs">{template.category}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">{template.content}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
                <Textarea
                  placeholder={isInternalNote ? "Write an internal note (not visible to borrower)..." : "Write a reply..."}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className={`min-h-[80px] ${isInternalNote ? "border-yellow-400" : ""}`}
                  data-testid="input-reply"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      if (newMessage.trim() && selectedThreadId) {
                        sendMessageMutation.mutate({
                          applicationId: selectedThreadId,
                          content: newMessage.trim(),
                          isInternal: isInternalNote
                        });
                      }
                    }}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    data-testid="button-send-reply"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {isInternalNote ? "Add Note" : "Send"}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Application Context */}
        <div className="w-72 border-l flex flex-col">
          {selectedThread ? (
            <>
              <div className="p-3 border-b">
                <h3 className="font-medium text-sm">Application Details</h3>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-4">
                  <Card>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{selectedThread.borrowerName || "Unknown"}</span>
                      </div>
                      {selectedThread.borrowerEmail && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{selectedThread.borrowerEmail}</span>
                        </div>
                      )}
                      {applicationDetails?.user?.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{applicationDetails.user.phone}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{selectedThread.propertyAddress || "Property TBD"}</span>
                      </div>
                      {applicationDetails?.propertyCity && applicationDetails?.propertyState && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{applicationDetails.propertyCity}, {applicationDetails.propertyState}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatCurrency(selectedThread.loanAmount)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Loan Type</span>
                      <Badge variant="outline">
                        {loanTypeLabels[selectedThread.loanType] || selectedThread.loanType}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge className={statusColors[selectedThread.applicationStatus] || ""}>
                        {selectedThread.applicationStatus}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <Link href={`/admin/application/${selectedThread.applicationId}`}>
                      <Button variant="outline" className="w-full" data-testid="button-view-application">
                        <FileText className="h-4 w-4 mr-2" />
                        View Full Application
                      </Button>
                    </Link>
                  </div>

                  {applicationDetails?.userId && (
                    <Link href={`/admin/borrower/${applicationDetails.userId}`}>
                      <Button variant="outline" className="w-full" data-testid="button-view-borrower">
                        <User className="h-4 w-4 mr-2" />
                        View Borrower Profile
                      </Button>
                    </Link>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a conversation to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
