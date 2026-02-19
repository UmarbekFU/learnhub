import { Metadata } from "next";
import { getNotifications } from "@/actions/notifications";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import Link from "next/link";
import { NotificationActions } from "@/components/notifications/notification-actions";

export const metadata: Metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {notifications.length > 0 && (
          <NotificationActions type="mark-all" />
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-16">
          <Bell className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No notifications</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            You&apos;re all caught up!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.isRead ? "opacity-70" : ""}
            >
              <CardContent className="flex items-start gap-4 p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{notification.title}</h3>
                    {!notification.isRead && (
                      <Badge variant="default" className="h-2 w-2 rounded-full p-0" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!notification.isRead && (
                    <NotificationActions type="mark-one" notificationId={notification.id} />
                  )}
                  {notification.link && (
                    <Link
                      href={notification.link}
                      className="text-sm text-primary hover:underline"
                    >
                      View
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
