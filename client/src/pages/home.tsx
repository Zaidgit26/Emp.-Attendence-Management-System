import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Briefcase, User } from "lucide-react";
import LeaveForm from "@/components/leave-form";
import LeaveTable from "@/components/leave-table";
import AdminPanel from "@/components/admin-panel";

export default function Home() {
  const [activeTab, setActiveTab] = useState("apply");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Briefcase className="h-6 w-6 text-blue-600 mr-3" />
              <h1 className="text-xl font-medium text-gray-900">Leave Management System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JD</span>
                </div>
                <span className="text-sm font-medium text-gray-700">John Doe</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="apply" className="text-sm font-medium">
              Apply Leave
            </TabsTrigger>
            <TabsTrigger value="records" className="text-sm font-medium">
              Leave Records
            </TabsTrigger>
            <TabsTrigger value="admin" className="text-sm font-medium">
              Admin Panel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="apply" className="space-y-6">
            <LeaveForm />
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            <LeaveTable />
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            <AdminPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
