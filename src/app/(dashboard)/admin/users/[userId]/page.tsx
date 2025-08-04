// app/(dashboard)/admin/users/[courseId]/page.tsx
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserService } from "@/lib/services/userService";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

async function getUserDetails(userId: string) {
  try {
    const user = await UserService.getUserById(userId);
    return user;
  } catch (error) {
    console.error("Fetching user error", error);
    return null;
  }
}

interface UserDetailsPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function UserDetailsPage({
  params,
}: UserDetailsPageProps) {
  const { userId } = await params;
  const user = await getUserDetails(userId);

  if (!user) {
    return notFound;
  }

  return (
    <AdminLayout title={user.firstName} description="Details of a user">
      <div className="space-y-8">
        {/* Header Actions */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant={"default"}>{user.status}</Badge>
              <Badge variant={"default"}>{user.email}</Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href={`/admin/users/${user.id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Course
              </Button>
            </Link>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
