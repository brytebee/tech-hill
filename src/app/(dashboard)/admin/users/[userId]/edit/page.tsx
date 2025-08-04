// app/(dashboard)/admin/courses/[courseId]/edit/page.tsx
import { UserForm } from "@/components/forms/user-form";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { UserService } from "@/lib/services/userService";
import { notFound } from "next/navigation";
import React from "react";

async function getUser(userId: string) {
  try {
    const user = await UserService.getUserById(userId);
    return user;
  } catch (error) {
    console.error("Fetching user error", error);
    return null;
  }
}

interface EditUserPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { userId } = await params;
  const user = await getUser(userId);

  if (!user) {
    return notFound;
  }

  return (
    <AdminLayout title="" description="">
      <UserForm isEdit={true} user={user} />
    </AdminLayout>
  );
}
