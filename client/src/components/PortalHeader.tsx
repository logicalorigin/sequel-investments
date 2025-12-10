import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Calculator, ChevronDown, Home, Hammer, HardHat, Bell, Check, FileText, AlertCircle, Users, DollarSign, X, ArrowLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@shared/schema";

interface PortalHeaderProps {
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    profileImageUrl?: string | null;
  } | null | undefined;
  title?: string;
  titleExtra?: React.ReactNode;
  backHref?: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "status_change":
      return <AlertCircle className="h-4 w-4 text-blue-500" />;
    case "document_required":
      return <FileText className="h-4 w-4 text-orange-500" />;
    case "document_approved":
      return <Check className="h-4 w-4 text-green-500" />;
    case "co_borrower_invite":
    case "co_borrower_accepted":
      return <Users className="h-4 w-4 text-purple-500" />;
    case "funding_complete":
      return <DollarSign className="h-4 w-4 text-green-600" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

export function PortalHeader({ user, title, titleExtra, backHref }: PortalHeaderProps) {
  const [location, navigate] = useLocation();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/borrower/logout");
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.assign("/");
    },
    onError: (error) => {
      console.error("Logout error:", error);
      queryClient.clear();
      window.location.assign("/");
    },
  });

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  const isPortfolio = location === "/portal";
  const isAnalysis = location === "/portal/investment-analysis" || 
    location === "/portal/dscr-analyzer" || 
    location === "/portal/fixflip-analyzer" || 
    location === "/portal/construction-analyzer";
  const isProfile = location === "/portal/profile";

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/notifications/mark-all-read"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Link href="/">
            <div className="flex items-center cursor-pointer hover-elevate active-elevate-2 px-1 py-1 rounded-md -ml-1 shrink-0">
              <span className="text-base sm:text-lg font-bold text-primary">SEQUEL</span>
              <span className="text-base sm:text-lg font-light text-foreground ml-1 hidden sm:inline">INVESTMENTS</span>
            </div>
          </Link>
          
          {title && (
            <div className="flex items-center gap-1.5 min-w-0">
              {backHref && (
                <Link href={backHref}>
                  <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7" data-testid="button-back">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <h1 className="text-xs sm:text-sm lg:text-lg font-bold truncate" data-testid="text-page-title">
                {title}
              </h1>
              {titleExtra && (
                <div className="shrink-0">
                  {titleExtra}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Link href="/portal">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`hidden sm:flex ${isPortfolio ? "bg-primary/10" : ""}`} 
              data-testid="link-portfolio"
            >
              Portfolio
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className={`sm:w-auto sm:px-3 ${isAnalysis ? "bg-primary/10" : ""}`}
                data-testid="link-investment-analysis"
              >
                <Calculator className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline text-sm">Analyzers</span>
                <ChevronDown className="h-3 w-3 hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/portal/dscr-analyzer" className="flex items-center gap-2 cursor-pointer" data-testid="link-dscr-analyzer">
                  <Home className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">DSCR Analyzer</p>
                    <p className="text-xs text-muted-foreground">Rental property cash flow</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/portal/fixflip-analyzer" className="flex items-center gap-2 cursor-pointer" data-testid="link-fixflip-analyzer">
                  <Hammer className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="font-medium">Fix & Flip Analyzer</p>
                    <p className="text-xs text-muted-foreground">Rehab deal profitability</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/portal/construction-analyzer" className="flex items-center gap-2 cursor-pointer" data-testid="link-construction-analyzer">
                  <HardHat className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Construction Analyzer</p>
                    <p className="text-xs text-muted-foreground">Ground-up build analysis</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative" 
                data-testid="button-notifications"
              >
                <Bell className="h-5 w-5" />
                {(unreadCount?.count ?? 0) > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                    {(unreadCount?.count ?? 0) > 9 ? "9+" : unreadCount?.count}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0" data-testid="notifications-dropdown">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Notifications</h3>
                {(unreadCount?.count ?? 0) > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-7"
                    onClick={() => markAllReadMutation.mutate()}
                    data-testid="button-mark-all-read"
                  >
                    Mark all read
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover-elevate cursor-pointer relative group ${
                          notification.isRead === "false" ? "bg-primary/5" : ""
                        }`}
                        onClick={() => {
                          if (notification.isRead === "false") {
                            markReadMutation.mutate(notification.id);
                          }
                          if (notification.relatedApplicationId) {
                            window.location.href = `/portal/application/${notification.relatedApplicationId}`;
                          }
                        }}
                        data-testid={`notification-item-${notification.id}`}
                      >
                        <button
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotificationMutation.mutate(notification.id);
                          }}
                          data-testid={`button-delete-notification-${notification.id}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${notification.isRead === "false" ? "font-medium" : ""}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          {notification.isRead === "false" && (
                            <div className="flex-shrink-0">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2 p-1" data-testid="button-user-menu">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden md:inline">
                  {user?.firstName || user?.email || "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild className="sm:hidden">
                <Link href="/portal" className="flex items-center gap-2 cursor-pointer">
                  <Home className="h-4 w-4" />
                  Portfolio
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/portal/profile" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onSelect={(e) => {
                  e.preventDefault();
                  // Clear query cache and redirect to home page
                  queryClient.clear();
                  fetch("/api/borrower/logout", { method: "POST", credentials: "include" })
                    .finally(() => {
                      // Use assign for reliable navigation
                      window.location.assign("/");
                    });
                }}
                className="flex items-center gap-2 cursor-pointer text-destructive"
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
