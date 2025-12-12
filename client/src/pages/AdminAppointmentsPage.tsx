import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar,
  Clock,
  User,
  CheckCircle2,
  X,
  Video,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  UserCheck,
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
  borrower?: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    profileImageUrl: string | null;
    phone: string | null;
  };
  staff?: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    profileImageUrl: string | null;
    staffRole: string | null;
  };
};

export default function AdminAppointmentsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [selectedWeek, setSelectedWeek] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    return new Date(now.setDate(diff));
  });
  
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailNotes, setDetailNotes] = useState("");
  const [detailStatus, setDetailStatus] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    enabled: isAuthenticated && (user?.role === "admin" || user?.role === "staff"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/appointments/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment Updated",
        description: "The appointment has been updated successfully.",
      });
      setSelectedAppointment(null);
      setIsSaving(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Could not update the appointment.",
        variant: "destructive",
      });
      setIsSaving(false);
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== "admin" && user?.role !== "staff")) {
    setLocation("/admin/login");
    return null;
  }

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(selectedWeek);
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter((a) => {
      const appointmentDate = new Date(a.scheduledAt);
      return (
        appointmentDate.getFullYear() === date.getFullYear() &&
        appointmentDate.getMonth() === date.getMonth() &&
        appointmentDate.getDate() === date.getDate()
      );
    });
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(selectedWeek.getDate() + (direction === "next" ? 7 : -7));
    setSelectedWeek(newWeek);
  };

  const goToToday = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    setSelectedWeek(new Date(now.setDate(diff)));
  };

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

  const getPersonDisplayName = (person: { firstName: string | null; lastName: string | null; email: string } | undefined) => {
    if (!person) return "Unknown";
    if (person.firstName && person.lastName) {
      return `${person.firstName} ${person.lastName}`;
    }
    return person.firstName || person.email.split("@")[0];
  };

  const getInitials = (person: { firstName: string | null; lastName: string | null; email: string } | undefined) => {
    if (!person) return "??";
    if (person.firstName && person.lastName) {
      return `${person.firstName[0]}${person.lastName[0]}`.toUpperCase();
    }
    return person.email[0].toUpperCase();
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const handleOpenDetail = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailNotes(appointment.notes || "");
    setDetailStatus(appointment.status);
  };

  const handleSaveDetail = () => {
    if (!selectedAppointment) return;
    setIsSaving(true);
    updateMutation.mutate({
      id: selectedAppointment.id,
      updates: {
        notes: detailNotes,
        status: detailStatus,
      },
    });
  };

  const todayAppointments = appointments.filter((a) => {
    const appointmentDate = new Date(a.scheduledAt);
    const today = new Date();
    return (
      appointmentDate.getFullYear() === today.getFullYear() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getDate() === today.getDate() &&
      a.status === "scheduled"
    );
  });

  const upcomingCount = appointments.filter(
    (a) => a.status === "scheduled" && new Date(a.scheduledAt) >= new Date()
  ).length;

  return (
    <div className="h-full">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-today-count">
                    {todayAppointments.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Today's Appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-upcoming-count">
                    {upcomingCount}
                  </p>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-completed-count">
                    {appointments.filter((a) => a.status === "completed").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Weekly Calendar</CardTitle>
                <CardDescription>
                  {weekDays[0].toLocaleDateString("en-US", { month: "long", day: "numeric" })} - {weekDays[6].toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek("prev")}
                  data-testid="button-prev-week"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  data-testid="button-today"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek("next")}
                  data-testid="button-next-week"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, index) => (
                  <div key={index} className="min-h-[200px]">
                    <div
                      className={`text-center p-2 rounded-t-lg ${
                        isToday(day)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-xs font-medium">
                        {day.toLocaleDateString("en-US", { weekday: "short" })}
                      </p>
                      <p className="text-lg font-bold">{day.getDate()}</p>
                    </div>
                    <div className="border border-t-0 rounded-b-lg p-1 space-y-1 min-h-[160px]">
                      {getAppointmentsForDay(day).map((appointment) => (
                        <button
                          key={appointment.id}
                          onClick={() => handleOpenDetail(appointment)}
                          className={`w-full text-left p-2 rounded text-xs transition-all hover-elevate ${
                            appointment.status === "scheduled"
                              ? "bg-blue-500/10 border border-blue-500/20"
                              : appointment.status === "completed"
                              ? "bg-green-500/10 border border-green-500/20"
                              : appointment.status === "cancelled"
                              ? "bg-muted border border-muted-foreground/10 opacity-60"
                              : "bg-destructive/10 border border-destructive/20"
                          }`}
                          data-testid={`calendar-event-${appointment.id}`}
                        >
                          <p className="font-medium truncate">
                            {formatTime(appointment.scheduledAt)}
                          </p>
                          <p className="text-muted-foreground truncate">
                            {getPersonDisplayName(appointment.borrower)}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Appointments</CardTitle>
            <CardDescription>View and manage all scheduled consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming">
              <TabsList>
                <TabsTrigger value="upcoming" data-testid="tab-upcoming">
                  Upcoming
                </TabsTrigger>
                <TabsTrigger value="past" data-testid="tab-past">
                  Past
                </TabsTrigger>
                <TabsTrigger value="all" data-testid="tab-all">
                  All
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="mt-4">
                <AppointmentList
                  appointments={appointments.filter(
                    (a) => a.status === "scheduled" && new Date(a.scheduledAt) >= new Date()
                  )}
                  onSelect={handleOpenDetail}
                  getPersonDisplayName={getPersonDisplayName}
                  getInitials={getInitials}
                  getStatusBadge={getStatusBadge}
                />
              </TabsContent>

              <TabsContent value="past" className="mt-4">
                <AppointmentList
                  appointments={appointments.filter(
                    (a) => new Date(a.scheduledAt) < new Date() || a.status !== "scheduled"
                  )}
                  onSelect={handleOpenDetail}
                  getPersonDisplayName={getPersonDisplayName}
                  getInitials={getInitials}
                  getStatusBadge={getStatusBadge}
                />
              </TabsContent>

              <TabsContent value="all" className="mt-4">
                <AppointmentList
                  appointments={appointments}
                  onSelect={handleOpenDetail}
                  getPersonDisplayName={getPersonDisplayName}
                  getInitials={getInitials}
                  getStatusBadge={getStatusBadge}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>
                View and update appointment information
              </DialogDescription>
            </DialogHeader>

            {selectedAppointment && (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={selectedAppointment.borrower?.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(selectedAppointment.borrower)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {getPersonDisplayName(selectedAppointment.borrower)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedAppointment.borrower?.email}
                    </p>
                    {selectedAppointment.borrower?.phone && (
                      <p className="text-sm text-muted-foreground">
                        {selectedAppointment.borrower.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-muted/50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium text-foreground">
                      {new Date(selectedAppointment.scheduledAt).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium text-foreground">
                      {formatTime(selectedAppointment.scheduledAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium text-foreground">
                      {selectedAppointment.durationMinutes} minutes
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned To</p>
                    <p className="font-medium text-foreground">
                      {getPersonDisplayName(selectedAppointment.staff)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={detailStatus} onValueChange={setDetailStatus}>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no_show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={detailNotes}
                    onChange={(e) => setDetailNotes(e.target.value)}
                    placeholder="Add notes about this appointment..."
                    rows={4}
                    data-testid="input-detail-notes"
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveDetail} disabled={isSaving} data-testid="button-save-detail">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      </div>
    </div>
  );
}

function AppointmentList({
  appointments,
  onSelect,
  getPersonDisplayName,
  getInitials,
  getStatusBadge,
}: {
  appointments: Appointment[];
  onSelect: (a: Appointment) => void;
  getPersonDisplayName: (p: any) => string;
  getInitials: (p: any) => string;
  getStatusBadge: (s: string) => JSX.Element;
}) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No appointments found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          className="flex items-center justify-between p-4 border rounded-lg hover-elevate cursor-pointer"
          onClick={() => onSelect(appointment)}
          data-testid={`appointment-row-${appointment.id}`}
        >
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={appointment.borrower?.profileImageUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {getInitials(appointment.borrower)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">
                {getPersonDisplayName(appointment.borrower)}
              </p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(appointment.scheduledAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(appointment.scheduledAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(appointment.status)}
          </div>
        </div>
      ))}
    </div>
  );
}
