import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const metadata: Metadata = {
  title: "Notification Preferences",
};

export default async function NotificationSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const preferences = [
    { id: "enrollment", label: "Enrollment updates", description: "When you enroll in or complete a course" },
    { id: "course_update", label: "Course updates", description: "When courses you're enrolled in are updated" },
    { id: "review", label: "Reviews", description: "When someone reviews your course" },
    { id: "payment", label: "Payment notifications", description: "Receipts and billing updates" },
    { id: "certificate", label: "Certificates", description: "When a certificate is issued" },
    { id: "marketing", label: "Marketing emails", description: "New courses and special offers" },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Notification Preferences</h1>
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Choose what email notifications you want to receive.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {preferences.map((pref) => (
            <div key={pref.id} className="flex items-start space-x-3">
              <Checkbox id={pref.id} defaultChecked />
              <div className="space-y-1">
                <Label htmlFor={pref.id} className="font-medium cursor-pointer">
                  {pref.label}
                </Label>
                <p className="text-sm text-muted-foreground">{pref.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
