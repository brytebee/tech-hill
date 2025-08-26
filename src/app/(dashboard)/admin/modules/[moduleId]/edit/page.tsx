import EditModuleForm from "@/components/forms/module-form";
import { ModuleService } from "@/lib/services/moduleService";
import { notFound } from "next/navigation";
import React from "react";

interface EditModulePageProps {
  params: Promise<{
    moduleId: string;
  }>;
}

const getModule = async (moduleId: string) => {
  // Fetch module data
  try {
    const module = await ModuleService.getModuleById(moduleId);
    return module;

    // await Promise.all([
    //   fetch(`/api/modules/${moduleId}`),
    //   fetch(`/api/courses/${moduleId}/modules`), // This will need to be updated to get courseId first
    // ]);

    // if (req.ok) {
    //   const moduleData = await moduleResponse.json();

    //   // Fetch prerequisites for the course
    //   const coursePrereqResponse = await fetch(
    //     `/api/courses/${moduleData.course.id}/modules`
    //   );
    //   if (coursePrereqResponse.ok) {
    //     const prereqData = await coursePrereqResponse.json();
    //     // Exclude current module from prerequisites
    //   }
    // }
  } catch (error) {
    console.error("Error fetching module:", error);
  } finally {
  }
};
export default async function EditModulePage({ params }: EditModulePageProps) {
  const { moduleId } = await params;
  const module = await getModule(moduleId);

  if (!module) {
    notFound();
  }

  return <EditModuleForm module={module} />;
}
