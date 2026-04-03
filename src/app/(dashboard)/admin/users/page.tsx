// app/(dashboard)/admin/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, MoreHorizontal, Eye, UserPlus, Loader2, Mail, Shield, UserCircle } from "lucide-react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
  _count: {
    enrollments: number;
  };
}

const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "firstName",
    header: "Identity",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-200 dark:border-slate-700">
            <UserCircle className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-white leading-none mb-1">
                {user.firstName} {user.lastName}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
                <Mail className="h-3 w-3" /> {user.email}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Access Level",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      if (role === "ADMIN") {
        return (
          <Badge className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-500/20 shadow-none font-bold px-2 py-0.5">
            <Shield className="h-3 w-3 mr-1" /> ADMIN
          </Badge>
        );
      }
      if (role === "MANAGER") {
        return (
          <Badge className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-500/20 shadow-none font-bold px-2 py-0.5">
            MANAGER
          </Badge>
        );
      }
      return (
        <Badge variant="outline" className="text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 font-bold px-2 py-0.5">
          STUDENT
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      if (status === "ACTIVE") {
        return (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Active</span>
          </div>
        );
      }
      return (
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
          <span className="text-sm font-bold text-slate-400 dark:text-slate-500">{status}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "_count.enrollments",
    header: "Activity",
    cell: ({ row }) => {
        const count = row.original._count.enrollments;
        return (
            <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">{count}</span>
                <span className="text-xs font-medium text-slate-500">courses</span>
            </div>
        );
    }
  },
  {
    accessorKey: "createdAt",
    header: "Join Date",
    cell: ({ row }) => (
        <span className="text-sm font-medium text-slate-500">
            {new Date(row.getValue("createdAt")).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return <UserActions user={user} />;
    },
  },
];

function UserActions({ user }: { user: User }) {
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <MoreHorizontal className="h-4 w-4 text-slate-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-slate-200 dark:border-slate-800">
        <DropdownMenuItem asChild className="cursor-pointer font-medium p-2 focus:bg-slate-50 dark:focus:bg-slate-800">
          <Link href={`/admin/users/${user.id}`}>
            <Eye className="h-4 w-4 mr-2 text-slate-400" />
            View Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer font-medium p-2 focus:bg-slate-50 dark:focus:bg-slate-800">
          <Link href={`/admin/users/${user.id}/edit`}>
            <Edit className="h-4 w-4 mr-2 text-slate-400" />
            Edit Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="cursor-pointer font-medium p-2 text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data.users);
      } catch (error: any) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Users" description="Manage platform user base and permissions">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="relative h-12 w-12">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin absolute" />
            <div className="h-12 w-12 border-4 border-blue-100 dark:border-blue-900/30 rounded-full" />
          </div>
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">
            Authenticating user base...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Users" description="Manage platform user base and permissions">
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none dark:backdrop-blur-sm">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">User Matrix</h2>
            <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1">
              {users.length} registered citizens detected
            </p>
          </div>
          <Link href="/admin/users/create">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 h-11 px-6 font-bold rounded-xl transition-all hover:scale-105 active:scale-95">
              <UserPlus className="h-5 w-5 mr-2" />
              Recruit User
            </Button>
          </Link>
        </div>

        <DataTable
          columns={userColumns}
          data={users}
          searchKey="firstName"
          searchPlaceholder="Identify by name..."
        />
      </div>
    </AdminLayout>
  );
}
