"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { isValidEmail, isStrongPassword } from "@/lib/utils";
import { useLoader } from "@/hooks/use-loader";

interface RegisterFormProps {
  className?: string;
}

export function RegisterForm({ className }: RegisterFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("redirect") || searchParams.get("from") || "";
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState(false);
  const { showLoader, hideLoader } = useLoader();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!isStrongPassword(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters with uppercase, lowercase, and number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = "You must agree to the Terms of Service";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    if (!validateForm()) return;

    setIsLoading(true);
    showLoader("Creating your account...");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.field) {
          setErrors({ [data.field]: data.message });
        } else {
          setGeneralError(data.message || "Registration failed");
        }
        return;
      }

      setSuccess(true);

      // We no longer redirect automatically so the user can read the verification instructions
    } catch (error: any) {
      setGeneralError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      hideLoader();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing / clicking
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Clear general error
    if (generalError) {
      setGeneralError("");
    }
  };

  if (success) {
    return (
      <Card className={`border-0 overflow-hidden ${className}`}>
        <CardContent className="pt-8 pb-8 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Check your inbox!
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              We've sent a verification link to <span className="font-medium text-slate-900 dark:text-white">{formData.email}</span>. 
              Please verify your email before signing in.
            </p>
            <Button
              className="mt-6 w-full max-w-[200px]"
              onClick={() => router.push("/login")}
            >
              Go to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                First name
              </label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                placeholder="John"
                disabled={isLoading}
                className="h-11 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Last name
              </label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                placeholder="Doe"
                disabled={isLoading}
                className="h-11 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
              />
            </div>
          </div>

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
            <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Create a strong password"
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
            {errors.password && (
              <p className="text-xs text-red-500 dark:text-red-400 opacity-90 mt-1">
                {errors.password}
              </p>
            )}
            {!errors.password && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Confirm password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="Confirm your password"
                disabled={isLoading}
                className="pr-10 h-11 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-start space-x-3 pt-2">
            <input
              type="checkbox"
              id="agreedToTerms"
              name="agreedToTerms"
              checked={formData.agreedToTerms}
              onChange={handleChange}
              disabled={isLoading}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:ring-offset-slate-950"
            />
            <div className="space-y-1 leading-none">
              <label
                htmlFor="agreedToTerms"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Accept terms and conditions
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You agree to our Terms of Service and Privacy Policy.
              </p>
              {errors.agreedToTerms && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                  {errors.agreedToTerms}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 transition-all font-semibold mt-4"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </Button>

          <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6 pt-2">
            Already have an account?{" "}
            <button
              type="button"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-500 font-semibold transition-colors"
              onClick={() => router.push("/login")}
            >
              Sign in back
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
