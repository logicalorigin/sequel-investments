import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Mail, Search, AlertCircle, CheckCircle, Info } from "lucide-react";
import { format } from "date-fns";

interface EmailLog {
  id: string;
  recipientEmail: string;
  subject: string;
  emailType: string;
  status: "sent" | "failed" | "demo";
  errorMessage?: string;
  sentAt: string;
  relatedApplicationId?: string;
  relatedLoanId?: string;
  metadata?: Record<string, any>;
}

export default function AdminEmailLogPage() {
  const [, navigate] = useLocation();
  const [searchEmail, setSearchEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading } = useQuery<{ logs: EmailLog[]; total: number }>({
    queryKey: ["/api/admin/email-logs", { recipientEmail: searchEmail, startDate, endDate }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchEmail) params.set("recipientEmail", searchEmail);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const response = await fetch(`/api/admin/email-logs?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch email logs");
      return response.json();
    },
  });

  const getStatusBadge = (status: EmailLog["status"]) => {
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

  const formatEmailType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="h-full">
      <div className="container mx-auto px-4 py-8">
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
                <label className="text-sm font-medium mb-1 block">Recipient Email</label>
                <Input
                  placeholder="Search by email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  data-testid="input-search-email"
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
              <Mail className="h-4 w-4" />
              Email History
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
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No emails found</p>
                <p className="text-sm mt-1">
                  Emails will appear here when notifications are sent
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.logs.map((log) => (
                      <TableRow key={log.id} data-testid={`row-email-${log.id}`}>
                        <TableCell className="font-mono text-sm">
                          {log.recipientEmail}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={log.subject}>
                          {log.subject}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {formatEmailType(log.emailType)}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
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
