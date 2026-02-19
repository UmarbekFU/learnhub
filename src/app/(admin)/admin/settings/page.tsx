import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings } from "lucide-react";

export const metadata: Metadata = { title: "Platform Settings" };

export default async function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Platform Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" /> General Settings
          </CardTitle>
          <CardDescription>Configure platform-wide settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start space-x-3">
            <Checkbox id="maintenance" />
            <div className="space-y-1">
              <Label htmlFor="maintenance" className="font-medium cursor-pointer">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">When enabled, only admins can access the platform.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Checkbox id="registration" defaultChecked />
            <div className="space-y-1">
              <Label htmlFor="registration" className="font-medium cursor-pointer">Allow Registration</Label>
              <p className="text-sm text-muted-foreground">Allow new users to create accounts.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Checkbox id="course-approval" defaultChecked />
            <div className="space-y-1">
              <Label htmlFor="course-approval" className="font-medium cursor-pointer">Require Course Approval</Label>
              <p className="text-sm text-muted-foreground">Courses must be approved by an admin before publishing.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
