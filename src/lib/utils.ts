import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Role } from "@/types/auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRoleColor(role: Role) {
  const colors = {
    [Role.ADMIN]: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-300",
    },
    [Role.MANAGER]: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-300",
    },
    [Role.USER]: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-300",
    },
  };

  return colors[role];
}

export function getRoleLabel(role: Role) {
  const labels = {
    [Role.ADMIN]: "Administrator",
    [Role.MANAGER]: "Manager",
    [Role.USER]: "User",
  };

  return labels[role];
} 