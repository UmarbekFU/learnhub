import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/profile-form";

export const metadata: Metadata = {
  title: "Profile Settings",
};

export default async function ProfileSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Profile Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            user={{
              name: session.user.name || "",
              email: session.user.email || "",
              image: session.user.image || "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
