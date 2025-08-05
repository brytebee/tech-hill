// components/layout/ManagerLayout.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  FileText,
  UserCheck,
  LogOut,
  Menu,
  X,
  Home,
  BarChart3,
  Shield,
} from "lucide-react";
import { useState } from "react";

interface ManagerLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const navigation = [
  { name: "Dashboard", href: "/manager", icon: Home },
  { name: "My Courses", href: "/manager/courses", icon: BookOpen },
  { name: "Students", href: "/manager/students", icon: Users },
  { name: "Reports", href: "/manager/reports", icon: BarChart3 },
  { name: "Submissions", href: "/manager/submissions", icon: FileText },
];

export function ManagerLayout({
  children,
  title,
  description,
}: ManagerLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle redirect in useEffect to avoid render-time side effects
  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (
      !session ||
      (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")
    ) {
      router.push("/unauthorized");
    }
  }, [session, status, router]);

  // Show loading state while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Don't render content if not authorized
  if (
    !session ||
    (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")
  ) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? "" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold text-blue-600">
              Tech Hill Manager
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="mt-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center px-4 py-4 border-b">
            <UserCheck className="h-8 w-8 text-blue-500 mr-2" />
            <h1 className="text-xl font-bold text-blue-600">
              Tech Hill Manager
            </h1>
          </div>
          <nav className="mt-4 flex-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden mr-2"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {title || "Manager Dashboard"}
                  </h1>
                  {description && (
                    <p className="text-gray-600 mt-1">{description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">
                    {session.user.firstName} {session.user.lastName}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
