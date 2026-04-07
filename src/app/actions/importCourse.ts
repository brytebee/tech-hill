"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TopicType } from "@prisma/client";

interface ImportRow {
  course_title: string;
  course_description?: string;
  course_difficulty?: string;
  course_price?: string;
  module_title: string;
  module_order: string;
  topic_title: string;
  topic_type: string;
  topic_content?: string;
  topic_video_url?: string;
  topic_order: string;
  topic_required?: string;
  quiz_title?: string;
  quiz_passing_score?: string;
  question_text?: string;
  question_type?: string;
  question_points?: string;
  option_1?: string;
  option_2?: string;
  option_3?: string;
  option_4?: string;
  correct_option?: string;
}

export async function importCourseAction(parsedData: ImportRow[]) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    if (!parsedData || parsedData.length === 0) {
      return { success: false, error: "Empty import data" };
    }

    const firstRow = parsedData[0];
    if (!firstRow.course_title) {
        return { success: false, error: "course_title is required on the first row at least." };
    }

    // Process data to structured format
    const courseTitle = firstRow.course_title;
    const courseDescription = firstRow.course_description || "";
    const courseDifficulty = firstRow.course_difficulty || "BEGINNER";
    const coursePrice = firstRow.course_price ? Number(firstRow.course_price) : 0;

    const modulesMap = new Map();

    for (const row of parsedData) {
      if (!row.module_title) continue;

      const modKey = row.module_title;
      if (!modulesMap.has(modKey)) {
        modulesMap.set(modKey, {
          title: modKey,
          order: Number(row.module_order) || 1,
          topicsMap: new Map(),
        });
      }

      const mod = modulesMap.get(modKey);
      if (!row.topic_title) continue;

      const topKey = row.topic_title;
      if (!mod.topicsMap.has(topKey)) {
        mod.topicsMap.set(topKey, {
          title: topKey,
          type: (row.topic_type as TopicType) || "LESSON",
          content: row.topic_content || "",
          videoUrl: row.topic_video_url || null,
          orderIndex: Number(row.topic_order) || 1,
          isRequired: row.topic_required ? row.topic_required.toLowerCase() === 'true' : true,
          quizMap: new Map(),
        });
      }

      const top = mod.topicsMap.get(topKey);
      if (!row.quiz_title) continue;

      const qzKey = row.quiz_title;
      if (!top.quizMap.has(qzKey)) {
        top.quizMap.set(qzKey, {
          title: qzKey,
          passingScore: Number(row.quiz_passing_score) || 80,
          questions: [],
        });
      }

      const qz = top.quizMap.get(qzKey);
      if (!row.question_text) continue;

      const options = [];
      if (row.option_1) options.push({ text: row.option_1, isCorrect: Number(row.correct_option) === 1 });
      if (row.option_2) options.push({ text: row.option_2, isCorrect: Number(row.correct_option) === 2 });
      if (row.option_3) options.push({ text: row.option_3, isCorrect: Number(row.correct_option) === 3 });
      if (row.option_4) options.push({ text: row.option_4, isCorrect: Number(row.correct_option) === 4 });

      qz.questions.push({
        questionText: row.question_text,
        questionType: row.question_type || "MULTIPLE_CHOICE",
        points: Number(row.question_points) || 10,
        options,
      });
    }

    // Now insert
    const createdCourse = await prisma.course.create({
      data: {
        title: courseTitle,
        description: courseDescription,
        shortDescription: courseDescription.substring(0, 150),
        difficulty: courseDifficulty as any,
        status: "DRAFT",
        price: coursePrice,
        duration: 5, // Default total duration
        passingScore: 80, // Default passing score
        creatorId: session.user.id,
      },
    });

    for (const mod of Array.from(modulesMap.values()) as any[]) {
      const createdMod = await prisma.module.create({
        data: {
          courseId: createdCourse.id,
          title: mod.title,
          order: mod.order,
          duration: 30, // Default duration
        },
      });

      for (const top of Array.from(mod.topicsMap.values()) as any[]) {
        const createdTop = await prisma.topic.create({
          data: {
            moduleId: createdMod.id,
            title: top.title,
            slug: top.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).substring(2, 6),
            content: top.content,
            topicType: top.type,
            videoUrl: top.videoUrl,
            orderIndex: top.orderIndex,
            isRequired: top.isRequired,
          },
        });

        for (const qz of Array.from(top.quizMap.values()) as any[]) {
          const createdQz = await prisma.quiz.create({
            data: {
              topicId: createdTop.id,
              title: qz.title,
              passingScore: qz.passingScore,
              isActive: true,
            },
          });

          for (let qIdx = 0; qIdx < qz.questions.length; qIdx++) {
            const q = qz.questions[qIdx];
            const createdQ = await prisma.question.create({
              data: {
                quizId: createdQz.id,
                questionText: q.questionText,
                questionType: q.questionType,
                points: q.points,
                orderIndex: qIdx + 1,
              },
            });

            if (q.options && q.options.length > 0) {
              await prisma.option.createMany({
                data: q.options.map((opt: any, oIdx: number) => ({
                  questionId: createdQ.id,
                  text: opt.text,
                  isCorrect: opt.isCorrect,
                  orderIndex: oIdx + 1,
                })),
              });
            }
          }
        }
      }
    }

    return { success: true, courseId: createdCourse.id };
  } catch (error: any) {
    console.error("Import error details:", error);
    return { success: false, error: error.message || "Failed to import course" };
  }
}
