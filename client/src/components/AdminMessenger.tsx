import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  X,
  User,
  Building2,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ApplicationMessage } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface MessageThread {
  applicationId: string;
  propertyAddress: string | null;
  loanType: string;
  status: string;
  borrowerName: string;
  borrowerEmail: string | null;
  latestMessage: ApplicationMessage | null;
  unreadCount: number;
  totalMessages: number;
}

export default function AdminMessenger() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Send heartbeat every 30 seconds
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await apiRequest("POST", "/api/admin/presence/heartbeat");
      } catch (error) {
        console.error("Failed to send heartbeat:", error);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch total unread count
  const { data: unreadData } = useQuery<{ unreadCount: number }>({
    queryKey: ["/api/admin/messages/unread-count"],
    refetchInterval: 15000,
  });

  // Fetch message threads
  const { data: threads = [], isLoading: threadsLoading } = useQuery<MessageThread[]>({
    queryKey: ["/api/admin/message-threads"],
    enabled: isExpanded,
    refetchInterval: 10000,
  });

  // Fetch messages for selected thread
  const { data: messages = [] } = useQuery<ApplicationMessage[]>({
    queryKey: ["/api/applications", selectedThread, "messages"],
    enabled: !!selectedThread,
    refetchInterval: 5000,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ applicationId, content }: { applicationId: string; content: string }) => {
      return apiRequest("POST", `/api/applications/${applicationId}/messages`, { content });
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ["/api/applications", selectedThread, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/message-threads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages/unread-count"] });
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedThread) return;
    sendMessageMutation.mutate({
      applicationId: selectedThread,
      content: messageInput.trim(),
    });
  };

  const selectedThreadData = threads.find(t => t.applicationId === selectedThread);

  const totalUnread = unreadData?.unreadCount || 0;

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          className="relative rounded-full h-14 w-14 shadow-lg"
          data-testid="button-open-messenger"
        >
          <MessageSquare className="h-6 w-6" />
          {totalUnread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalUnread > 9 ? "9+" : totalUnread}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[600px] bg-card border rounded-lg shadow-xl flex flex-col">
      <div className="flex items-center justify-between p-3 border-b bg-muted/50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="font-medium">Messages</span>
          {totalUnread > 0 && (
            <Badge variant="destructive" className="text-xs">
              {totalUnread}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(false)}
            data-testid="button-minimize-messenger"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsExpanded(false);
              setSelectedThread(null);
            }}
            data-testid="button-close-messenger"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {selectedThread ? (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedThread(null)}
              data-testid="button-back-to-threads"
            >
              <ChevronUp className="h-4 w-4 rotate-[-90deg]" />
            </Button>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {selectedThreadData?.borrowerName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {selectedThreadData?.propertyAddress || selectedThreadData?.loanType}
              </p>
            </div>
          </div>

          <ScrollArea className="flex-1 p-3 max-h-80">
            <div className="space-y-3">
              {messages.map((msg) => {
                const isStaff = msg.senderRole === "staff" || msg.senderRole === "admin";
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${isStaff ? "flex-row-reverse" : ""}`}
                    data-testid={`message-${msg.id}`}
                  >
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className={isStaff ? "bg-primary text-primary-foreground" : "bg-muted"}>
                        {isStaff ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg px-3 py-2 max-w-[75%] ${
                        isStaff
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm break-words">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isStaff ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {msg.createdAt
                          ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })
                          : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-2 border-t flex gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              data-testid="input-message"
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || sendMessageMutation.isPending}
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 max-h-96">
          {threadsLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading conversations...
            </div>
          ) : threads.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No message threads yet
            </div>
          ) : (
            <div className="divide-y">
              {threads.map((thread) => (
                <button
                  key={thread.applicationId}
                  onClick={() => setSelectedThread(thread.applicationId)}
                  className="w-full p-3 text-left hover-elevate flex items-start gap-3"
                  data-testid={`thread-${thread.applicationId}`}
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-muted">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate">
                        {thread.borrowerName}
                      </p>
                      {thread.unreadCount > 0 && (
                        <Badge variant="destructive" className="shrink-0 text-xs">
                          {thread.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {thread.propertyAddress || thread.loanType}
                    </p>
                    {thread.latestMessage && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {thread.latestMessage.content}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
}
