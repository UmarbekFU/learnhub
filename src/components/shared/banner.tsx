import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface BannerProps {
  label: string;
  variant?: "warning" | "success" | "info";
}

const variantMap = {
  warning: {
    icon: AlertTriangle,
    className: "border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  },
  success: {
    icon: CheckCircle,
    className: "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  info: {
    icon: Info,
    className: "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
};

export function Banner({ label, variant = "info" }: BannerProps) {
  const { icon: Icon, className } = variantMap[variant];

  return (
    <div
      className={cn(
        "flex items-center gap-x-2 rounded-md border p-4 text-sm",
        className
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </div>
  );
}
