import { StudentCourseService } from "@/lib/services/student/courseService";

export const handleMarkComplete = async (userId: string, topicId: string) => {
  try {
    const res = await StudentCourseService.completeTopic(userId, topicId);
    if (res.status === "COMPLETED") {
      console.log("Marking topic as completed:", topicId);
    }
  } catch (error) {
    console.error("Failed to mark topic as completed:", error);
  }
};
