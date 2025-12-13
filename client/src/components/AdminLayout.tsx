import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutGrid,
  BarChart3,
  Briefcase,
  DollarSign,
  Calendar,
  CreditCard,
  Settings,
  MessageSquare,
  LogOut,
  Building2,
  Webhook,
  Users,
  ArrowLeft,
  HardHat,
  LayoutTemplate,
  Search,
} from "lucide-react";
import { InlineSearch } from "@/components/InlineSearch";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User as UserType } from "@shared/schema";
import AdminMessenger from "./AdminMessenger";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const mainNavItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutGrid },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { title: "Portfolio", href: "/admin/portfolio", icon: Briefcase },
];

const operationsNavItems = [
  { title: "Loan Servicing", href: "/admin/servicing", icon: DollarSign },
  { title: "Draw Requests", href: "/admin/draw-requests", icon: HardHat, hasBadge: true },
  { title: "Appointments", href: "/admin/appointments", icon: Calendar },
  { title: "Financials", href: "/admin/financials", icon: CreditCard },
  { title: "Messages", href: "/admin/messages", icon: MessageSquare },
];

const settingsNavItems = [
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Webhooks", href: "/admin/webhooks", icon: Webhook },
  { title: "Page Builder", href: "/admin/page-builder", icon: LayoutTemplate },
  { title: "Customize Site", href: "/admin/customize-site", icon: Settings },
];

function AdminSidebar() {
  const [location] = useLocation();

  const { data: pendingDrawCount } = useQuery<{ count: number }>({
    queryKey: ["/api/admin/draw-requests/pending-count"],
  });

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location === "/admin";
    }
    return location.startsWith(href);
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Sequel Admin</span>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.href)}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.href)}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.href} className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </span>
                      {item.hasBadge && (pendingDrawCount?.count ?? 0) > 0 && (
                        <Badge variant="destructive" className="text-xs h-5 min-w-5 flex items-center justify-center" data-testid="badge-pending-draws">
                          {pendingDrawCount.count}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.href)}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-testid="nav-back-to-site">
              <Link href="/">
                <Building2 className="h-4 w-4" />
                <span>Back to Site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, navigate] = useLocation();

  const { data: currentUser } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
  });

  // Show back button on detail pages (pages with IDs or deeper paths)
  const showBackButton = /\/admin\/(application|servicing|borrower|users)\/\d+/.test(location) ||
    (location !== "/admin" && location.split("/").length > 3);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      navigate("/admin/login");
    },
  });

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full bg-background">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between px-4 py-2 border-b bg-card shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (window.history.length > 1) {
                      window.history.back();
                    } else {
                      navigate("/admin");
                    }
                  }}
                  data-testid="button-back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
                {currentUser?.role === "admin" ? "Administrator" : "Staff"} Portal
              </span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <InlineSearch context="admin" className="hidden sm:block w-48 lg:w-64" placeholder="Search..." />
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="capitalize text-xs">
                  {currentUser?.role || "staff"}
                </Badge>
                <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                  {currentUser?.firstName} {currentUser?.lastName}
                </span>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
        <AdminMessenger />
      </div>
    </SidebarProvider>
  );
}
