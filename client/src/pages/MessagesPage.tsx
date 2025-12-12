import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
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
import { PortalHeader } from "@/components/PortalHeader";
import { 
  MessageSquare, 
  Send, 
  Loader2,
  ChevronRight,
  Search,
  Building2,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ApplicationMessage } from "@shared/schema";

interface MessageGroup {
  loan: {
    id: string;
    propertyAddress: string | null;
    loanType: string;
    status: string;
  };
  messages: ApplicationMessage[];
  unreadCount: number;
  latestMessage: ApplicationMessage | null;
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

export default function MessagesPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    document.title = "Messages | Sequel Investments";
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to access messages.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 100);
    }
  }, [authLoading, isAuthenticated, toast]);

  const { data: messageGroups = [], isLoading: messagesLoading } = useQuery<MessageGroup[]>({
    queryKey: ["/api/my-messages"],
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ loanId, content }: { loanId: string; content: string }) => {
      const res = await apiRequest("POST", `/api/applications/${loanId}/messages`, { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-messages"] });
      setNewMessage("");
      toast({
        title: "Message sent",
        description: "Your message has been sent to the loan team.",
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const filteredGroups = messageGroups.filter(group => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      group.loan.propertyAddress?.toLowerCase().includes(search) ||
      loanTypeLabels[group.loan.loanType]?.toLowerCase().includes(search) ||
      group.messages.some(m => m.content.toLowerCase().includes(search))
    );
  });

  const selectedGroup = selectedLoanId 
    ? messageGroups.find(g => g.loan.id === selectedLoanId)
    : null;

  const totalUnread = messageGroups.reduce((sum, g) => sum + g.unreadCount, 0);

  return (
    <div className="min-h-screen bg-background">
      <PortalHeader user={user} title="Messages" backHref="/portal" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {messagesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : messageGroups.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
              <p className="text-muted-foreground mb-4">
                Start a conversation with your loan team by opening one of your applications
              </p>
              <Link href="/portal">
                <Button data-testid="button-go-to-portfolio">Go to Portfolio</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Conversations
                    </CardTitle>
                    {totalUnread > 0 && (
                      <Badge className="bg-red-500 text-white" data-testid="badge-total-unread">
                        {totalUnread} unread
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-messages"
                    />
                  </div>

                  <ScrollArea className="h-[400px] lg:h-[500px]">
                    <div className="space-y-2">
                      {filteredGroups.map((group) => (
                        <div
                          key={group.loan.id}
                          onClick={() => setSelectedLoanId(group.loan.id)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedLoanId === group.loan.id
                              ? "bg-primary/10 border border-primary/30"
                              : "hover-elevate bg-muted/30"
                          }`}
                          data-testid={`conversation-${group.loan.id}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="font-medium text-sm truncate">
                                  {group.loan.propertyAddress || "Property TBD"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {loanTypeLabels[group.loan.loanType] || group.loan.loanType}
                                </Badge>
                                <Badge className={`text-xs ${statusColors[group.loan.status] || ""}`}>
                                  {group.loan.status}
                                </Badge>
                              </div>
                              {group.latestMessage && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {group.latestMessage.senderRole !== "borrower" && (
                                    <span className="font-medium">{group.latestMessage.senderName}: </span>
                                  )}
                                  {group.latestMessage.content}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              {group.unreadCount > 0 && (
                                <Badge className="bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                                  {group.unreadCount}
                                </Badge>
                              )}
                              {group.latestMessage && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(group.latestMessage.createdAt), { addSuffix: true })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {filteredGroups.length === 0 && searchTerm && (
                        <div className="text-center py-8 text-muted-foreground">
                          <p className="text-sm">No messages matching "{searchTerm}"</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Message Thread */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                {selectedGroup ? (
                  <>
                    <CardHeader className="pb-3 border-b">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg">
                            {selectedGroup.loan.propertyAddress || "Property TBD"}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {loanTypeLabels[selectedGroup.loan.loanType] || selectedGroup.loan.loanType} Loan
                          </p>
                        </div>
                        <Link href={`/portal/application/${selectedGroup.loan.id}`}>
                          <Button variant="outline" size="sm" data-testid="button-view-application">
                            View Application
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ScrollArea className="h-[350px] lg:h-[400px] pr-4 mb-4">
                        {selectedGroup.messages.length > 0 ? (
                          <div className="space-y-4">
                            {[...selectedGroup.messages]
                              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                              .map((message) => {
                                const isOwnMessage = message.senderRole === "borrower";
                                return (
                                  <div 
                                    key={message.id} 
                                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                                    data-testid={`message-${message.id}`}
                                  >
                                    <div className={`max-w-[80%] ${isOwnMessage ? "items-end" : "items-start"}`}>
                                      <div className="flex items-center gap-2 mb-1">
                                        {!isOwnMessage && (
                                          <span className="text-xs font-medium">{message.senderName}</span>
                                        )}
                                        <Badge 
                                          className={`text-[10px] px-1.5 py-0 ${
                                            message.senderRole === "admin" 
                                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300" 
                                              : message.senderRole === "staff" 
                                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                              : "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                                          }`}
                                        >
                                          {message.senderRole === "admin" ? "Admin" : message.senderRole === "staff" ? "Staff" : "You"}
                                        </Badge>
                                      </div>
                                      <div className={`rounded-lg px-3 py-2 ${
                                        isOwnMessage 
                                          ? "bg-primary text-primary-foreground" 
                                          : "bg-muted"
                                      }`}>
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                      </div>
                                      <p className="text-[10px] text-muted-foreground mt-1">
                                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">No messages yet</p>
                            <p className="text-xs text-muted-foreground mt-1">Start a conversation with your loan team</p>
                          </div>
                        )}
                      </ScrollArea>

                      <div className="space-y-2 border-t pt-4">
                        <Textarea
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="resize-none min-h-[80px]"
                          data-testid="input-message"
                        />
                        <div className="flex justify-end">
                          <Button
                            onClick={() => {
                              if (newMessage.trim() && selectedLoanId) {
                                sendMessageMutation.mutate({
                                  loanId: selectedLoanId,
                                  content: newMessage.trim()
                                });
                              }
                            }}
                            disabled={!newMessage.trim() || sendMessageMutation.isPending}
                            data-testid="button-send-message"
                          >
                            {sendMessageMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4 mr-2" />
                            )}
                            Send
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="h-full flex items-center justify-center py-12">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-muted-foreground">Select a conversation to view messages</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
