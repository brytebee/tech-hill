import EditTopic from "@/components/topics/edit-topic";
import { TopicService } from "@/lib/services/topicService";
import { notFound } from "next/navigation";
import React from "react";

async function getTopic(topicId: string) {
  try {
    const topic = await TopicService.getTopicById(topicId);
    return topic;
  } catch (error) {
    console.error("Error fetching topic:", error);
  }
}
interface EditTopicPageProps {
  params: Promise<{
    topicId: string;
  }>;
}

export default async function EditTopicPage({ params }: EditTopicPageProps) {
  const { topicId } = await params;
  const topic = await getTopic(topicId);

  if (!topic) {
    notFound();
  }

  return <EditTopic topic={topic} />;
}
