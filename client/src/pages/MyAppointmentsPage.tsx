import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation, Link } from "wouter";
import { PortalHeader } from "@/components/PortalHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Calendar,
  Clock,
  User,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Video,
  FileText,
  Loader2,
} from "lucide-react";

type Appointment = {
  id: string;
  borrowerUserId: string;
  staffUserId: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  durationMinutes: number;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  meetingUrl: string | null;
  relatedApplicationId: string | null;
  notes: string | null;
  createdAt: string;
  staff?: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    profileImageUrl: string | null;
    staffRole: string | null;
  };
};

export default function MyAppointmentsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    enabled: isAuthenticated,
  });

  const cancelMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await apiRequest("PATCH", `/api/appointments/${appointmentId}`, {
        status: "cancelled",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled successfully.",
      });
      setCancellingId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Cancel",
        description: error.message || "Could not cancel the appointment.",
        variant: "destructive",
      });
      setCancellingId(null);
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    setLocation("/login");
    return null;
  }

  const now = new Date();
  const upcomingAppointments = appointments.filter(
    (a) => new Date(a.scheduledAt) >= now && a.status === "scheduled"
  );
  const pastAppointments = appointments.filter(
    (a) => new Date(a.scheduledAt) < now || a.status !== "scheduled"
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="default" className="bg-blue-500">Scheduled</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      case "no_show":
        return <Badge variant="destructive">No Show</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStaffDisplayName = (staff: Appointment["staff"]) => {
    if (!staff) return "Staff Member";
    if (staff.firstName && staff.lastName) {
      return `${staff.firstName} ${staff.lastName}`;
    }
    return staff.firstName || staff.email.split("@")[0];
  };

  const getStaffInitials = (staff: Appointment["staff"]) => {
    if (!staff) return "SM";
    if (staff.firstName && staff.lastName) {
      return `${staff.firstName[0]}${staff.lastName[0]}`.toUpperCase();
    }
    return staff.email[0].toUpperCase();
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const AppointmentCard = ({ appointment, showCancel = false }: { appointment: Appointment; showCancel?: boolean }) => {
    const { date, time } = formatDateTime(appointment.scheduledAt);
    
    return (
      <Card className="overflow-hidden" data-testid={`appointment-card-${appointment.id}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={appointment.staff?.profileImageUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getStaffInitials(appointment.staff)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{appointment.title}</h3>
                  {getStatusBadge(appointment.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  with {getStaffDisplayName(appointment.staff)}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {time}
                  </span>
                </div>
                {appointment.notes && (
                  <p className="text-sm text-muted-foreground mt-2 flex items-start gap-1">
                    <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{appointment.notes}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {appointment.meetingUrl && appointment.status === "scheduled" && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  data-testid={`button-join-${appointment.id}`}
                >
                  <a href={appointment.meetingUrl} target="_blank" rel="noopener noreferrer">
                    <Video className="h-4 w-4 mr-1" />
                    Join
                  </a>
                </Button>
              )}
              {showCancel && appointment.status === "scheduled" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`button-cancel-${appointment.id}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel your appointment on {date} at {time}? 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          setCancellingId(appointment.id);
                          cancelMutation.mutate(appointment.id);
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-testid="button-confirm-cancel"
                      >
                        {cancellingId === appointment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Cancel Appointment"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <PortalHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
              My Appointments
            </h1>
            <p className="text-muted-foreground">
              Manage your scheduled consultations
            </p>
          </div>
          <Link href="/portal/book-consultation">
            <Button data-testid="button-book-new">
              <Plus className="h-4 w-4 mr-2" />
              Book Consultation
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Appointments Yet</h3>
              <p className="text-muted-foreground mb-6">
                Schedule a consultation with one of our loan officers to discuss your needs.
              </p>
              <Link href="/portal/book-consultation">
                <Button data-testid="button-book-empty">
                  <Plus className="h-4 w-4 mr-2" />
                  Book Your First Consultation
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {upcomingAppointments.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Upcoming Appointments
                </h2>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      showCancel
                    />
                  ))}
                </div>
              </section>
            )}

            {pastAppointments.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Past Appointments
                </h2>
                <div className="space-y-4">
                  {pastAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
