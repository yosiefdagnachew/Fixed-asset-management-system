import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Role } from '@/types/auth';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRoleColor(role: Role) {
  const colors = {
<<<<<<< HEAD
    'ADMIN': {
=======
    ADMIN: {
>>>>>>> 56d1f01 (user management)
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-300",
    },
<<<<<<< HEAD
    'MANAGER': {
=======
    MANAGER: {
>>>>>>> 56d1f01 (user management)
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-300",
    },
<<<<<<< HEAD
    'USER': {
=======
    USER: {
>>>>>>> 56d1f01 (user management)
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-300",
    },
  } as const;

  return colors[role as keyof typeof colors];
}

export function getRoleLabel(role: Role) {
  const labels = {
<<<<<<< HEAD
    'ADMIN': "Administrator",
    'MANAGER': "Manager",
    'USER': "User",
  } as const;
=======
    ADMIN: "Administrator",
    MANAGER: "Manager",
    USER: "User",
  };
>>>>>>> 56d1f01 (user management)

  return labels[role as keyof typeof labels];
} 