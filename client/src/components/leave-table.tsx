import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Eye, Edit, RefreshCw, ListCheck, User } from "lucide-react";
import type { Leave } from "@/lib/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "default";
    case "rejected":
      return "destructive";
    case "pending":
      return "secondary";
    default:
      return "outline";
  }
};

const getLeaveTypeBadgeVariant = (leaveType: string) => {
  switch (leaveType.toLowerCase()) {
    case "annual":
      return "default";
    case "sick":
      return "destructive";
    case "maternity":
    case "paternity":
      return "secondary";
    case "emergency":
      return "outline";
    default:
      return "outline";
  }
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function LeaveTable() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: leaves = [], isLoading, refetch } = useQuery<Leave[]>({
    queryKey: ["/api/leaves", statusFilter === "all" ? "" : `?status=${statusFilter}`],
  });

  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ListCheck className="h-5 w-5 text-blue-600 mr-2" />
              <CardTitle>Leave Records</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ListCheck className="h-5 w-5 text-blue-600 mr-2" />
            <CardTitle className="text-xl font-medium text-gray-900">Leave Records</CardTitle>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {leaves.length === 0 ? (
          <div className="text-center py-12">
            <ListCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No leave records</h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter === "all" 
                ? "No leave applications have been submitted yet." 
                : `No ${statusFilter.toLowerCase()} leave applications found.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee Name
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Type
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Range
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-200">
                {leaves.map((leave) => (
                  <TableRow key={leave.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-blue-600 text-sm font-medium">
                            {getInitials(leave.employeeName)}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {leave.employeeName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getLeaveTypeBadgeVariant(leave.leaveType)}>
                        {leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)} Leave
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(leave.fromDate), "MMM dd, yyyy")} - {format(new Date(leave.toDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {leave.reason}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(leave.status)}>
                        {leave.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          disabled={leave.status !== "Pending"}
                          className="text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
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
  );
}
