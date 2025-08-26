import { QuizForm } from "@/components/forms/quiz-form";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { describe } from "node:test";
import React from "react";

async function getQuiz(quizId: string) {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        topic: true,
      },
    });
    return quiz;
  } catch (error) {
    console.info("Fetching quiz failed", quizId, error);
  }
}

interface EditQuizProps {
  params: Promise<{
    quizId: string;
  }>;
}

export default async function EditQuizPage({ params }: EditQuizProps) {
  const { quizId } = await params;
  const quiz = await getQuiz(quizId);

  if (!quiz) {
    notFound();
  }

  return (
    <AdminLayout
      title={`Update ${quiz.title}`}
      description={`${quiz.description}`}
    >
      <QuizForm
        topicId={quiz.topic.id}
        topic={quiz.topic}
        quiz={quiz}
        // onSuccess={}
        isEdit={true}
      />
    </AdminLayout>
  );
}

/**
 * 
 * 
 export function QuizForm({
   topicId,
   topic,
   quiz,
   onSuccess,
   isEdit = false,
 }: QuizFormProps) {

 * */
