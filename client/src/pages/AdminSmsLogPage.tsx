import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, MessageSquare, Search, AlertCircle, CheckCircle, Info, Smartphone } from "lucide-react";
import { format } from "date-fns";

interface SmsLog {
  id: string;
  recipientPhone: string;
  recipientUserId?: string;
  message: string;
  smsType: string;
  status: "sent" | "failed" | "demo";
  errorMessage?: string;
  sentAt: string;
  relatedApplicationId?: string;
  relatedLoanId?: string;
  twilioMessageSid?: string;
}

export default function AdminSmsLogPage() {
  const [, navigate] = useLocation();
  const [searchPhone, setSearchPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading } = useQuery<{ logs: SmsLog[]; total: number; smsConfigured: boolean }>({
    queryKey: ["/api/admin/sms-logs", { recipientPhone: searchPhone, startDate, endDate }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchPhone) params.set("recipientPhone", searchPhone);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const response = await fetch(`/api/admin/sms-logs?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch SMS logs");
      return response.json();
    },
  });

  const getStatusBadge = (status: SmsLog["status"]) => {
    switch (status) {
      case "sent":
        return (
          <Badge className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-3 h-3 mr-1" /> Sent
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" /> Failed
          </Badge>
        );
      case "demo":
        return (
          <Badge variant="secondary" className="bg-amber-600/20 text-amber-500 border-amber-600">
            <Info className="w-3 h-3 mr-1" /> Demo
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatSmsType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const truncateMessage = (message: string, maxLength = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
              SMS Logs
            </h1>
            <p className="text-muted-foreground">
              View sent SMS notifications and their status
            </p>
          </div>
        </div>

        {data?.smsConfigured === false && (
          <Card className="mb-6 border-amber-500/50 bg-amber-500/10">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-500">Demo Mode Active</p>
                  <p className="text-sm text-muted-foreground">
                    SMS notifications are logged to console but not delivered. Configure TWILIO_ACCOUNT_SID, 
                    TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables to enable actual SMS delivery.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Recipient Phone</label>
                <Input
                  placeholder="Search by phone number..."
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  data-testid="input-search-phone"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  data-testid="input-start-date"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  data-testid="input-end-date"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              SMS History
              {data?.total !== undefined && (
                <Badge variant="outline" className="ml-2">
                  {data.total} total
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : !data?.logs?.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No SMS messages found</p>
                <p className="text-sm mt-1">
                  SMS notifications will appear here when sent
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.logs.map((log) => (
                      <TableRow key={log.id} data-testid={`row-sms-${log.id}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                            <span data-testid={`text-phone-${log.id}`}>{log.recipientPhone}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <span 
                            className="text-sm text-muted-foreground" 
                            title={log.message}
                            data-testid={`text-message-${log.id}`}
                          >
                            {truncateMessage(log.message)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" data-testid={`badge-type-${log.id}`}>
                            {formatSmsType(log.smsType)}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`cell-status-${log.id}`}>
                          {getStatusBadge(log.status)}
                          {log.errorMessage && (
                            <p className="text-xs text-destructive mt-1">{log.errorMessage}</p>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap" data-testid={`text-date-${log.id}`}>
                          {format(new Date(log.sentAt), "MMM d, yyyy h:mm a")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
