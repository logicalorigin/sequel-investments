import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { HardHat, Eye, Check, X, Clock, FileText } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { LoanDraw } from "@shared/schema";

interface DrawWithLoanInfo extends LoanDraw {
  loan: {
    id: string;
    loanNumber: string;
    propertyAddress: string;
    loanType: string;
  } | null;
  borrower: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

const statusColors: Record<string, string> = {
  draft: "secondary",
  submitted: "default",
  inspection_scheduled: "default",
  inspection_complete: "default",
  approved: "default",
  funded: "default",
  denied: "destructive",
  cancelled: "secondary",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  inspection_scheduled: "Inspection Scheduled",
  inspection_complete: "Inspection Complete",
  approved: "Approved",
  funded: "Funded",
  denied: "Denied",
  cancelled: "Cancelled",
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(date: string | Date | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminDrawRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: draws, isLoading } = useQuery<DrawWithLoanInfo[]>({
    queryKey: ["/api/admin/draw-requests"],
  });

  const updateDrawMutation = useMutation({
    mutationFn: async ({ loanId, drawId, status }: { loanId: string; drawId: string; status: string }) => {
      return apiRequest("PATCH", `/api/admin/serviced-loans/${loanId}/draws/${drawId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/draw-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/draw-requests/pending-count"] });
    },
  });

  const filteredDraws = draws?.filter((draw) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "pending") {
      return ["submitted", "inspection_scheduled", "inspection_complete"].includes(draw.status);
    }
    return draw.status === statusFilter;
  }) || [];

  const pendingCount = draws?.filter((d) => 
    ["submitted", "inspection_scheduled", "inspection_complete"].includes(d.status)
  ).length || 0;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <HardHat className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Draw Requests</h1>
            <p className="text-muted-foreground">Manage draw requests across all loans</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HardHat className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Draw Requests</h1>
            <p className="text-muted-foreground">Manage draw requests across all loans</p>
          </div>
        </div>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="text-sm" data-testid="badge-pending-count">
            {pendingCount} Pending
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
          <CardTitle className="text-lg">All Draw Requests</CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="inspection_scheduled">Inspection Scheduled</SelectItem>
              <SelectItem value="inspection_complete">Inspection Complete</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="funded">Funded</SelectItem>
              <SelectItem value="denied">Denied</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {filteredDraws.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No draw requests found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Draw #</TableHead>
                  <TableHead>Loan</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDraws.map((draw) => (
                  <TableRow key={draw.id} data-testid={`row-draw-${draw.id}`}>
                    <TableCell className="font-medium">
                      Draw #{draw.drawNumber}
                    </TableCell>
                    <TableCell>
                      {draw.loan ? (
                        <Link href={`/admin/servicing/${draw.loan.id}`}>
                          <span className="text-primary hover:underline cursor-pointer" data-testid={`link-loan-${draw.loan.id}`}>
                            {draw.loan.loanNumber}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {draw.borrower ? (
                        <Link href={`/admin/borrower/${draw.borrower.id}`}>
                          <span className="text-primary hover:underline cursor-pointer">
                            {draw.borrower.firstName} {draw.borrower.lastName}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(draw.requestedAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[draw.status] as any} data-testid={`badge-status-${draw.id}`}>
                        {statusLabels[draw.status] || draw.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(draw.requestedDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {draw.loan && (
                          <Link href={`/admin/servicing/${draw.loan.id}`}>
                            <Button variant="ghost" size="icon" data-testid={`button-view-${draw.id}`}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        {["submitted", "inspection_complete"].includes(draw.status) && draw.loan && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateDrawMutation.mutate({
                                loanId: draw.loan!.id,
                                drawId: draw.id,
                                status: "approved",
                              })}
                              disabled={updateDrawMutation.isPending}
                              data-testid={`button-approve-${draw.id}`}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateDrawMutation.mutate({
                                loanId: draw.loan!.id,
                                drawId: draw.id,
                                status: "denied",
                              })}
                              disabled={updateDrawMutation.isPending}
                              data-testid={`button-deny-${draw.id}`}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                        {draw.status === "submitted" && draw.loan && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateDrawMutation.mutate({
                              loanId: draw.loan!.id,
                              drawId: draw.id,
                              status: "inspection_scheduled",
                            })}
                            disabled={updateDrawMutation.isPending}
                            data-testid={`button-schedule-${draw.id}`}
                          >
                            <Clock className="h-4 w-4 text-blue-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
