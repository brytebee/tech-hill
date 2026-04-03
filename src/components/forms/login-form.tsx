"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { isValidEmail } from "@/lib/utils";
import { useLoader } from "@/hooks/use-loader";

interface LoginFormProps {
  className?: string;
}

export function LoginForm({ className }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const { showLoader, hideLoader } = useLoader();

  const from = searchParams.get("redirect") || searchParams.get("from") || "/dashboard";

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    if (!validateForm()) return;

    setIsLoading(true);
    showLoader("Signing you in...");

    try {
      const result = await signIn("credentials", {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setGeneralError(result.error);
      } else if (result?.ok) {
        // Successful login - redirect based on user role
        window.location.href = from.startsWith("/") ? from : "/from-login";
      }
    } catch (error: any) {
      setGeneralError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      hideLoader();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Clear general error
    if (generalError) {
      setGeneralError("");
    }
  };

  return (
    <Card className={`border-0 overflow-hidden ${className}`}>
      <CardContent className="pt-8 sm:px-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          {generalError && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-md">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {generalError}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="name@example.com"
              disabled={isLoading}
              className="h-11 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <button
                type="button"
                className="text-xs font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                onClick={() => router.push("/forgot-password")}
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="••••••••"
                disabled={isLoading}
                className="pr-10 h-11 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 transition-all font-semibold mt-2"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in to Dashboard"}
          </Button>

          <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6 pt-4">
            New to Tech Hill?{" "}
            <button
              type="button"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-500 font-semibold transition-colors"
              onClick={() => router.push("/register")}
            >
              Start learning for free
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
