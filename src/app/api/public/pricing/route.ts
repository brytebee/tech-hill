import { NextResponse } from "next/server";
import { CourseService } from "@/lib/services/courseService";
import { PromotionService } from "@/lib/services/promotionService";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { courses } = await CourseService.getCourses({ status: "PUBLISHED" });
    
    const pricingData = await Promise.all(
      courses.map(async (course: any) => {
        const pricing = await PromotionService.getCurrentPrice(course.id);
        return {
          id: course.id,
          title: course.title,
          slug: course.slug,
          basePrice: pricing.originalPrice,
          currentPrice: pricing.currentPrice,
          discountPercentage: pricing.discountPercentage,
          activeFlashSale: pricing.activeFlashSale ? {
            name: pricing.activeFlashSale.name,
            endTime: pricing.activeFlashSale.endTime,
          } : null,
          difficulty: course.difficulty,
          duration: course.duration,
          thumbnail: course.thumbnail,
        };
      })
    );

    return NextResponse.json({
      success: true,
      pricing: pricingData,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("public:pricing", "[PUBLIC_PRICING_API_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch pricing data" },
      { status: 500 }
    );
  }
}
