import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  AlertCircle,
  Calendar
} from "lucide-react";
import type { Leave, LeaveStats } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getInitialsColor = (name: string) => {
  const colors = [
    "bg-blue-100 text-blue-600",
    "bg-green-100 text-green-600", 
    "bg-purple-100 text-purple-600",
    "bg-orange-100 text-orange-600",
    "bg-pink-100 text-pink-600"
  ];
  return colors[name.length % colors.length];
};

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allLeaves = [], isLoading } = useQuery<Leave[]>({
    queryKey: ["/api/leaves"],
  });

  const { data: pendingLeaves = [] } = useQuery<Leave[]>({
    queryKey: ["/api/leaves", "?status=Pending"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PUT", `/api/leaves/${id}/approve`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaves"] });
      toast({
        title: "Approved!",
        description: "Leave request has been approved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve leave request.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PUT", `/api/leaves/${id}/reject`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaves"] });
      toast({
        title: "Rejected!",
        description: "Leave request has been rejected.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject leave request.",
        variant: "destructive",
      });
    },
  });

  const stats: LeaveStats = {
    pending: allLeaves.filter(leave => leave.status === "Pending").length,
    approved: allLeaves.filter(leave => leave.status === "Approved").length,
    rejected: allLeaves.filter(leave => leave.status === "Rejected").length,
    total: allLeaves.length,
  };

  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-blue-600 mr-2" />
            <CardTitle>Admin Panel</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              <CardTitle className="text-xl font-medium text-gray-900">Admin Panel</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <Clock className="w-3 h-3 mr-1" />
                {stats.pending} Pending Approvals
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Leave Requests</h3>
            
            {pendingLeaves.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
                <p className="mt-1 text-sm text-gray-500">All leave requests have been processed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingLeaves.map((leave) => (
                  <Card key={leave.id} className="border border-gray-200 hover:bg-gray-50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${getInitialsColor(leave.employeeName)}`}>
                              <span className="font-medium">
                                {getInitials(leave.employeeName)}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                {leave.employeeName}
                              </h4>
                              <p className="text-xs text-gray-500">
                                Applied on {format(new Date(leave.createdAt), "MMM dd, yyyy")}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <span className="text-xs font-medium text-gray-500">Leave Type</span>
                              <p className="text-sm text-gray-900">
                                {leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)} Leave
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500">Duration</span>
                              <p className="text-sm text-gray-900">
                                {format(new Date(leave.fromDate), "MMM dd")} - {format(new Date(leave.toDate), "MMM dd, yyyy")}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500">Status</span>
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                Pending Review
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <span className="text-xs font-medium text-gray-500">Reason</span>
                            <p className="text-sm text-gray-900 mt-1">{leave.reason}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="flex items-center justify-end space-x-3">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              disabled={rejectMutation.isPending}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
                                Confirm Rejection
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to reject this leave request from {leave.employeeName}? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => rejectMutation.mutate(leave.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Reject Request
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                Confirm Approval
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to approve this leave request from {leave.employeeName}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => approveMutation.mutate(leave.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve Request
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-900">Leave Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-blue-600">Pending</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-600">Approved</p>
                    <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-red-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-purple-600">Total</p>
                    <p className="text-2xl font-bold text-purple-900">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
