// app/(dashboard)/student/quiz/[quizId]/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { QuizInterface } from "@/components/students/QuizInterface";

interface PageProps {
  params: Promise<{ quizId: string }>;
  searchParams: Promise<{ topicId?: string }>;
}

// Mock quiz data - in real app this would come from QuizService
async function getQuizData(quizId: string, userId: string) {
  try {
    // Mock data structure
    const quiz = {
      id: quizId,
      title: "Introduction to Computer Basics Quiz",
      description: "Test your understanding of computer fundamentals",
      passingScore: 80,
      timeLimit: 30, // minutes
      allowRetakes: true,
      maxAttempts: 3,
      shuffleQuestions: true,
      showResults: true,
      topic: {
        id: "topic-1",
        title: "Computer Fundamentals",
        module: {
          title: "Introduction Module",
          course: {
            id: "course-1",
            title: "Computer Literacy Basics",
          },
        },
      },
      questions: [
        {
          id: "q1",
          questionText: "What does CPU stand for?",
          questionType: "MULTIPLE_CHOICE",
          points: 5,
          required: true,
          options: [
            { id: "opt1", text: "Central Processing Unit", isCorrect: true },
            { id: "opt2", text: "Computer Personal Unit", isCorrect: false },
            { id: "opt3", text: "Central Program Unit", isCorrect: false },
            { id: "opt4", text: "Computer Processing Unit", isCorrect: false },
          ],
        },
        {
          id: "q2",
          questionText:
            "Which of the following are input devices? (Select all that apply)",
          questionType: "MULTIPLE_SELECT",
          points: 10,
          required: true,
          options: [
            { id: "opt1", text: "Keyboard", isCorrect: true },
            { id: "opt2", text: "Mouse", isCorrect: true },
            { id: "opt3", text: "Monitor", isCorrect: false },
            { id: "opt4", text: "Microphone", isCorrect: true },
            { id: "opt5", text: "Printer", isCorrect: false },
          ],
        },
        {
          id: "q3",
          questionText: "RAM stands for Random Access Memory.",
          questionType: "TRUE_FALSE",
          points: 5,
          required: true,
          options: [
            { id: "opt1", text: "True", isCorrect: true },
            { id: "opt2", text: "False", isCorrect: false },
          ],
        },
        {
          id: "q4",
          questionText: "Explain the difference between hardware and software.",
          questionType: "SHORT_ANSWER",
          points: 15,
          required: true,
          sampleAnswer:
            "Hardware refers to physical components of a computer system, while software refers to programs and applications that run on the hardware.",
        },
        {
          id: "q5",
          questionText:
            "Write a brief essay about the importance of computer literacy in today's world (minimum 100 words).",
          questionType: "ESSAY",
          points: 25,
          required: false,
          minWords: 100,
          maxWords: 500,
        },
      ],
    };

    // Check if user has attempts left
    const attempts = []; // Mock - would come from QuizAttempt service
    const canTakeQuiz = quiz.maxAttempts
      ? attempts.length < quiz.maxAttempts
      : true;

    return {
      quiz,
      attempts,
      canTakeQuiz,
    };
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    return null;
  }
}

export default async function QuizPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { quizId } = await params;
  const { topicId } = await searchParams;
  const data = await getQuizData(quizId, session.user.id);

  if (!data || !data.canTakeQuiz) {
    notFound();
  }

  const { quiz, attempts } = data;

  return (
    <StudentLayout>
      <QuizInterface
        quiz={quiz}
        attempts={attempts}
        userId={session.user.id}
        topicId={topicId}
      />
    </StudentLayout>
  );
}
