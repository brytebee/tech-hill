// app/(dashboard)/student/quiz/[quizId]/results/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { QuizResults } from "@/components/students/QuizResults";

interface PageProps {
  params: Promise<{ quizId: string }>;
  searchParams: Promise<{ attempt?: string; topicId?: string }>;
}

// Mock quiz results data
async function getQuizResultsData(quizId: string, userId: string, attemptId?: string) {
  try {
    // Mock data - in real app this would come from QuizAttempt service
    const attempt = {
      id: "attempt-1",
      score: 85,
      totalPoints: 60,
      earnedPoints: 51,
      passed: true,
      completedAt: new Date(),
      timeSpent: 1234, // seconds
      answers: [
        {
          questionId: "q1",
          questionText: "What does CPU stand for?",
          questionType: "MULTIPLE_CHOICE",
          points: 5,
          earnedPoints: 5,
          userAnswer: "opt1",
          correctAnswer: "opt1",
          isCorrect: true,
          feedback: "Correct! CPU stands for Central Processing Unit."
        },
        {
          questionId: "q2",
          questionText: "Which of the following are input devices?",
          questionType: "MULTIPLE_SELECT",
          points: 10,
          earnedPoints: 7,
          userAnswer: ["opt1", "opt2"], // Keyboard, Mouse (missed Microphone)
          correctAnswer: ["opt1", "opt2", "opt4"],
          isCorrect: false,
          feedback: "Partially correct. You missed Microphone, which is also an input device."
        },
        {
          questionId: "q3",
          questionText: "RAM stands for Random Access Memory.",
          questionType: "TRUE_FALSE",
          points: 5,
          earnedPoints: 5,
          userAnswer: "opt1",
          correctAnswer: "opt1",
          isCorrect: true,
          feedback: "Correct! RAM does stand for Random Access Memory."
        },
        {
          questionId: "q4",
          questionText: "Explain the difference between hardware and software.",
          questionType: "SHORT_ANSWER",
          points: 15,
          earnedPoints: 12,
          userAnswer: "Hardware is physical parts and software is programs.",
          correctAnswer: "Hardware refers to physical components of a computer system, while software refers to programs and applications that run on the hardware.",
          isCorrect: true,
          feedback: "Good answer! You could have been more detailed about the definitions."
        },
        {
          questionId: "q5",
          questionText: "Write a brief essay about the importance of computer literacy.",
          questionType: "ESSAY",
          points: 25,
          earnedPoints: 22,
          userAnswer: "Computer literacy is very important in today's world because almost everything uses computers now. People need to know how to use computers for work, school, and personal tasks. Without computer skills, it's hard to get good jobs or do many daily activities. Schools should teach more computer skills to help students succeed in the future.",
          correctAnswer: null,
          isCorrect: true,
          feedback: "Well-written essay that covers the key points about computer literacy importance. Consider adding specific examples of how computer literacy impacts different industries."
        }
      ]
    };

    const quiz = {
      id: quizId,
      title: "Introduction to Computer Basics Quiz",
      passingScore: 80,
      allowRetakes: true,
      maxAttempts: 3,
      topic: {
        id: "topic-1",
        title: "Computer Fundamentals",
        module: {
          id: "module-1",
          title: "Introduction Module",
          course: {
            id: "course-1",
            title: "Computer Literacy Basics"
          }
        }
      }
    };

    const allAttempts = [attempt]; // In real app, get all attempts for this quiz

    return {
      attempt,
      quiz,
      allAttempts,
    };
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    return null;
  }
}

export default async function QuizResultsPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { quizId } = await params;
  const { attempt: attemptParam, topicId } = await searchParams;
  
  const data = await getQuizResultsData(quizId, session.user.id, attemptParam);

  if (!data) {
    notFound();
  }

  const { attempt, quiz, allAttempts } = data;

  return (
    <StudentLayout>
      <QuizResults
        attempt={attempt}
        quiz={quiz}
        allAttempts={allAttempts}
        userId={session.user.id}
        topicId={topicId}
      />
    </StudentLayout>
  )
}
