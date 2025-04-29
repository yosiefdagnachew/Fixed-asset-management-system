"use client";

<<<<<<< HEAD
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
//import toast from "react-hot-toast";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
=======
import React from 'react';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
>>>>>>> 56d1f01 (user management)

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

import { useSession } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();

  React.useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      console.log('signIn result:', result);

      if (result?.error) {
        toast.error("Invalid credentials");
        return;
      }

<<<<<<< HEAD
      toast.success("Signed in successfully");
      router.push("/dashboard");
      router.refresh();
=======
      if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      }
>>>>>>> 56d1f01 (user management)
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-center text-2xl font-bold text-red-600">
          Fixed Asset Management System
        </h2>
        <p className="text-center text-sm text-gray-600 mt-2">
          Sign in to your account
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <input
              {...register("email")}
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Email address"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <input
              {...register("password")}
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
}
