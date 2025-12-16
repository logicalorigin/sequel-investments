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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { HardHat, Eye, Check, X, Clock, FileText, Camera, ListChecks, MapPin, DollarSign, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { LoanDraw } from "@shared/schema";

interface DrawWithLoanInfo extends LoanDraw {
  loan: {
    id: string;
    loanNumber: string;
    propertyAddress: string;
    propertyCity?: string;
    propertyState?: string;
    loanType: string;
  } | null;
  borrower: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  lineItemsSummary: {
    count: number;
    approved: number;
    total: number;
  };
  photosSummary: {
    count: number;
    verified: number;
  };
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

  const totalRequested = filteredDraws.reduce((sum, d) => sum + d.requestedAmount, 0);

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
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

  // Calculate stats
  const stats = {
    total: draws?.length || 0,
    pending: pendingCount,
    approved: draws?.filter(d => d.status === "approved").length || 0,
    funded: draws?.filter(d => d.status === "funded").length || 0,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <HardHat className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Draw Requests</h1>
        </div>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="text-sm" data-testid="badge-pending-count">
            <AlertCircle className="h-3 w-3 mr-1" />
            {pendingCount} Pending Review
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="stat-total">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Draws</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600" data-testid="stat-pending">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-green-500/10">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600" data-testid="stat-approved">{stats.approved}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="stat-funded">{stats.funded}</p>
                <p className="text-xs text-muted-foreground">Funded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg">All Draw Requests</CardTitle>
            {filteredDraws.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Total requested: {formatCurrency(totalRequested)}
              </p>
            )}
          </div>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Draw</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Borrower</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Line Items</TableHead>
                    <TableHead>Photos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDraws.map((draw) => (
                    <TableRow key={draw.id} data-testid={`row-draw-${draw.id}`}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">Draw #{draw.drawNumber}</span>
                          {draw.loan && (
                            <Link href={`/admin/servicing/${draw.loan.id}`}>
                              <span className="text-xs text-primary hover:underline cursor-pointer" data-testid={`link-loan-${draw.loan.id}`}>
                                {draw.loan.loanNumber}
                              </span>
                            </Link>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {draw.loan ? (
                          <div className="flex items-start gap-2 max-w-[200px]">
                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-sm truncate" title={draw.loan.propertyAddress}>
                                {draw.loan.propertyAddress}
                              </p>
                              {(draw.loan.propertyCity || draw.loan.propertyState) && (
                                <p className="text-xs text-muted-foreground">
                                  {[draw.loan.propertyCity, draw.loan.propertyState].filter(Boolean).join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {draw.borrower ? (
                          <div>
                            <Link href={`/admin/borrower/${draw.borrower.id}`}>
                              <span className="text-primary hover:underline cursor-pointer text-sm">
                                {draw.borrower.firstName} {draw.borrower.lastName}
                              </span>
                            </Link>
                            <p className="text-xs text-muted-foreground">{draw.borrower.email}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{formatCurrency(draw.requestedAmount)}</span>
                          {draw.lineItemsSummary && draw.lineItemsSummary.total > 0 && (
                            <span className="text-xs text-muted-foreground">
                              Items: {formatCurrency(draw.lineItemsSummary.total)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {draw.lineItemsSummary ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5 cursor-help">
                                <ListChecks className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {draw.lineItemsSummary.approved}/{draw.lineItemsSummary.count}
                                </span>
                                {draw.lineItemsSummary.count > 0 && draw.lineItemsSummary.approved === draw.lineItemsSummary.count && (
                                  <Check className="h-3 w-3 text-green-600" />
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{draw.lineItemsSummary.approved} of {draw.lineItemsSummary.count} line items approved</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {draw.photosSummary ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5 cursor-help">
                                <Camera className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {draw.photosSummary.verified}/{draw.photosSummary.count}
                                </span>
                                {draw.photosSummary.count > 0 && draw.photosSummary.verified === draw.photosSummary.count && (
                                  <Check className="h-3 w-3 text-green-600" />
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{draw.photosSummary.verified} of {draw.photosSummary.count} photos verified</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[draw.status] as any} data-testid={`badge-status-${draw.id}`}>
                          {statusLabels[draw.status] || draw.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(draw.requestedDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {draw.loan && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/admin/servicing/${draw.loan.id}`}>
                                  <Button variant="ghost" size="icon" data-testid={`button-view-${draw.id}`}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>View Loan</TooltipContent>
                            </Tooltip>
                          )}
                          {["submitted", "inspection_complete"].includes(draw.status) && draw.loan && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
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
                                </TooltipTrigger>
                                <TooltipContent>Approve Draw</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
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
                                </TooltipTrigger>
                                <TooltipContent>Deny Draw</TooltipContent>
                              </Tooltip>
                            </>
                          )}
                          {draw.status === "submitted" && draw.loan && (
                            <Tooltip>
                              <TooltipTrigger asChild>
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
                              </TooltipTrigger>
                              <TooltipContent>Schedule Inspection</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
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
  );
}
