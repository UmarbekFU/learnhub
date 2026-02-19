import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Library,
  Award,
  Settings,
  Bell,
  Users,
  BarChart3,
  CreditCard,
  FolderTree,
  DollarSign,
  PlusCircle,
} from "lucide-react";

export const studentNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Browse Courses", href: "/browse", icon: BookOpen },
  { label: "My Courses", href: "/my-courses", icon: Library },
  { label: "Certificates", href: "/certificates", icon: Award },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const instructorNavItems = [
  { label: "Dashboard", href: "/instructor", icon: LayoutDashboard },
  { label: "My Courses", href: "/instructor/courses", icon: BookOpen },
  { label: "Create Course", href: "/instructor/courses/new", icon: PlusCircle },
  { label: "Analytics", href: "/instructor/analytics", icon: BarChart3 },
  { label: "Earnings", href: "/instructor/earnings", icon: DollarSign },
];

export const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Courses", href: "/admin/courses", icon: GraduationCap },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: DollarSign },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
