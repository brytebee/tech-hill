import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { TopicService } from "@/lib/services/topicService";
import { StudentTopicViewer } from "@/components/students/StudentTopicViewer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye } from "lucide-react";

async function getTopic(topicId: string) {
  try {
    const topic = await TopicService.getTopicById(topicId);
    return topic;
  } catch (error: any) {
    console.error("Error fetching topic for preview:", error);
    return null;
  }
}

interface TopicPreviewPageProps {
  params: Promise<{
    topicId: string;
  }>;
}

export default async function TopicPreviewPage({
  params,
}: TopicPreviewPageProps) {
  const { topicId } = await params;
  const topic: any = await getTopic(topicId);

  if (!topic) {
    notFound();
  }

  return (
    <AdminLayout
      title={`Preview: ${topic.title}`}
      description="Viewing this topic exactly as a student would see it"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <Link href={`/admin/topics/${topic.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Details
              </Button>
            </Link>
            <div className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500 rounded-full text-xs font-semibold flex items-center shadow-sm">
              <Eye className="w-3 h-3 mr-1" />
              STUDENT PREVIEW MODE
            </div>
          </div>
        </div>

        {/* The Student Viewer renders the standard student experience */}
        <div className="bg-slate-50 dark:bg-[#0a0a0a] min-h-[500px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative p-2 md:p-6 lg:p-8">
            <StudentTopicViewer topic={topic} />
        </div>
      </div>
    </AdminLayout>
  );
}
