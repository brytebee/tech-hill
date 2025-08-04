// app/(dashboard)/admin/users/create/page.tsx
import { UserForm } from "@/components/forms/user-form";
import { AdminLayout } from "@/components/layout/AdminLayout";
import React from "react";

export default function CreateUserPage() {
  return (
    <AdminLayout
      title="Create User"
      description="Add a new user to the platform"
    >
      <UserForm />
    </AdminLayout>
  );
}
