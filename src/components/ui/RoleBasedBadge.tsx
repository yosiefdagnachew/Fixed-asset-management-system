import { Role } from "@/types/auth";
import { cn } from "@/lib/utils";

interface RoleBasedBadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'default';
  className?: string;
  status?: string;
}

export function RoleBasedBadge({ label, variant = 'default', className }: RoleBasedBadgeProps) {
  const badgeStyles = {
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    default: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        badgeStyles[variant],
        className
      )}
    >
      {label}
    </span>
  );
}