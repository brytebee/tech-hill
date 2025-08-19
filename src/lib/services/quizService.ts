// lib/services/quizService.ts
export class QuizService {

  static async completeQuizAttempt(
    userId: string,
    quizId: string,
    answers: any[],
    score: number,
    passed: boolean
  ) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        topic: true,
        questions: true,
      },
    });

    if (!quiz) throw new Error("Quiz not found");

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        passed,
        questionsCorrect: answers.filter(a => a.isCorrect).length,
        questionsTotal: quiz.questions.length,
        completedAt: new Date(),
        answers: {
          create: answers.map(answer => ({
            questionId: answer.questionId,
            selectedOptions: answer.selectedOptions,
            textAnswer: answer.textAnswer,
            isCorrect: answer.isCorrect,
            pointsAwarded: answer.pointsAwarded,
          })),
        },
      },
      include: {
        answers: true,
      },
    });

    // Update topic progress after quiz completion
    if (passed) {
      await ProgressService.updateTopicProgress(userId, quiz.topicId);
    }

    return attempt;
  }
}

// app/api/student/quiz/[quizId]/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { QuizService } from "@/lib/services/quizService";

export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId } = params;
    const body = await request.json();
    const { answers, score, passed } = body;

    const attempt = await QuizService.completeQuizAttempt(
      session.user.id,
      quizId,
      answers,
      score,
      passed
    );

    return NextResponse.json({
      success: true,
      attempt,
      message: passed ? "Quiz passed successfully!" : "Quiz completed. You can retake if attempts remain.",
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}

// Updated getTopicData function for topic page
async function getTopicData(topicId: string, userId: string) {
  try {
    const topic = await TopicService.getTopicById(topicId);

    if (!topic) {
      return null;
    }

    // Check if user is enrolled in the course
    const enrollment = await EnrollmentService.getEnrollment(
      userId,
      topic.module.course.id
    );

    if (!enrollment || enrollment.status !== "ACTIVE") {
      return null;
    }

    // Check if topic is accessible using ProgressService
    const canAccess = await ProgressService.canAccessTopic(userId, topicId);

    // Get or create topic progress to track access
    await ProgressService.getOrCreateTopicProgress(userId, topicId);

    return {
      topic,
      enrollment,
      canAccess,
    };
  } catch (error) {
    console.error("Error fetching topic data:", error);
    return null;
  }
}

// Update the StudentCourseOverview component to use progress data
// Add this to the component where you calculate module progress:

// In the StudentCourseOverview component, update the render function:
export function StudentCourseOverview({
  course,
  enrollment,
  userId,
  progressData, // Add this prop
}: StudentCourseOverviewProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  // Create maps for quick lookup of progress data
  const moduleProgressMap = new Map();
  const topicProgressMap = new Map();

  if (progressData) {
    progressData.moduleProgresses.forEach(progress => {
      moduleProgressMap.set(progress.moduleId, progress);
    });

    progressData.topicProgresses.forEach(progress => {
      topicProgressMap.set(progress.topicId, progress);
    });
  }

  // Determine which modules are locked based on prerequisites and actual progress
  const getLockedModules = () => {
    const locked = new Set<string>();

    course.modules.forEach((module) => {
      if (module.prerequisiteModuleId) {
        const prereqProgress = moduleProgressMap.get(module.prerequisiteModuleId);
        if (!prereqProgress || prereqProgress.status !== "COMPLETED") {
          locked.add(module.id);
        }
      }
    });

    return locked;
  };

  const lockedModules = getLockedModules();

  return (
    <div className="space-y-6">
      {/* ... existing header content */}

      {/* Course Modules - Updated with real progress data */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Course Content</h2>

        {course.modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            isLocked={lockedModules.has(module.id)}
            isExpanded={expandedModules.has(module.id)}
            onToggle={() => toggleModule(module.id)}
            courseId={course.id}
            moduleProgress={moduleProgressMap.get(module.id)}
            topicProgresses={progressData?.topicProgresses || []}
          />
        ))}
      </div>

      {/* ... rest of the component */}
    </div>
  );
}

// Also update the page to pass progressData to the component:
// In the page component, update the return statement:

return (
  <StudentLayout
    title={serializedCourse.title}
    description={serializedCourse.shortDescription as string}
  >
    <StudentCourseOverview
      course={serializedCourse}
      enrollment={serializedEnrollment}
      userId={session.user.id}
      progressData={data.progressData} // Pass the progress data
    />
  </StudentLayout>
);// lib/services/quizService.ts - Add this method to existing QuizService
export class QuizService {
  // ... existing methods

  static async completeQuizAttempt(
    userId: string,
    quizId: string,
    answers: any[],
    score: number,
    passed: boolean
  ) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        topic: true,
        questions: true,
      },
    });

    if (!quiz) throw new Error("Quiz not found");

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        passed,
        questionsCorrect: answers.filter(a => a.isCorrect).length,
        questionsTotal: quiz.questions.length,
        completedAt: new Date(),
        answers: {
          create: answers.map(answer => ({
            questionId: answer.questionId,
            selectedOptions: answer.selectedOptions,
            textAnswer: answer.textAnswer,
            isCorrect: answer.isCorrect,
            pointsAwarded: answer.pointsAwarded,
          })),
        },
      },
      include: {
        answers: true,
      },
    });

    // Update topic progress after quiz completion
    if (passed) {
      await ProgressService.updateTopicProgress(userId, quiz.topicId);
    }

    return attempt;
  }
}

// app/api/student/quiz/[quizId]/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { QuizService } from "@/lib/services/quizService";
import { prisma } from "../db";

export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId } = params;
    const body = await request.json();
    const { answers, score, passed } = body;

    const attempt = await QuizService.completeQuizAttempt(
      session.user.id,
      quizId,
      answers,
      score,
      passed
    );

    return NextResponse.json({
      success: true,
      attempt,
      message: passed ? "Quiz passed successfully!" : "Quiz completed. You can retake if attempts remain.",
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}

// Updated getTopicData function for topic page
async function getTopicData(topicId: string, userId: string) {
  try {
    const topic = await TopicService.getTopicById(topicId);

    if (!topic) {
      return null;
    }

    // Check if user is enrolled in the course
    const enrollment = await EnrollmentService.getEnrollment(
      userId,
      topic.module.course.id
    );

    if (!enrollment || enrollment.status !== "ACTIVE") {
      return null;
    }

    // Check if topic is accessible using ProgressService
    const canAccess = await ProgressService.canAccessTopic(userId, topicId);

    // Get or create topic progress to track access
    await ProgressService.getOrCreateTopicProgress(userId, topicId);

    return {
      topic,
      enrollment,
      canAccess,
    };
  } catch (error) {
    console.error("Error fetching topic data:", error);
    return null;
  }
}

// Update the StudentCourseOverview component to use progress data
// Add this to the component where you calculate module progress:

// In the StudentCourseOverview component, update the render function:
export function StudentCourseOverview({
  course,
  enrollment,
  userId,
  progressData, // Add this prop
}: StudentCourseOverviewProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  // Create maps for quick lookup of progress data
  const moduleProgressMap = new Map();
  const topicProgressMap = new Map();

  if (progressData) {
    progressData.moduleProgresses.forEach(progress => {
      moduleProgressMap.set(progress.moduleId, progress);
    });

    progressData.topicProgresses.forEach(progress => {
      topicProgressMap.set(progress.topicId, progress);
    });
  }

  // Determine which modules are locked based on prerequisites and actual progress
  const getLockedModules = () => {
    const locked = new Set<string>();

    course.modules.forEach((module) => {
      if (module.prerequisiteModuleId) {
        const prereqProgress = moduleProgressMap.get(module.prerequisiteModuleId);
        if (!prereqProgress || prereqProgress.status !== "COMPLETED") {
          locked.add(module.id);
        }
      }
    });

    return locked;
  };

  const lockedModules = getLockedModules();

  return (
    <div className="space-y-6">
      {/* ... existing header content */}

      {/* Course Modules - Updated with real progress data */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Course Content</h2>

        {course.modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            isLocked={lockedModules.has(module.id)}
            isExpanded={expandedModules.has(module.id)}
            onToggle={() => toggleModule(module.id)}
            courseId={course.id}
            moduleProgress={moduleProgressMap.get(module.id)}
            topicProgresses={progressData?.topicProgresses || []}
          />
        ))}
      </div>

      {/* ... rest of the component */}
    </div>
  );
}

// Also update the page to pass progressData to the component:
// In the page component, update the return statement:

return (
  <StudentLayout
    title={serializedCourse.title}
    description={serializedCourse.shortDescription as string}
  >
    <StudentCourseOverview
      course={serializedCourse}
      enrollment={serializedEnrollment}
      userId={session.user.id}
      progressData={data.progressData} // Pass the progress data
    />
  </StudentLayout>
);