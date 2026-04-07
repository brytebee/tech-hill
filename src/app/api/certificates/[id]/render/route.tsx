import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { ModernDarkTheme, ClassicGoldTheme } from "@/components/certificates/themes/ThemeRegistry";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        user: true,
        course: {
          include: { template: true },
        },
        track: {
          include: { template: true },
        },
      },
    });

    if (!certificate) {
      return new Response("Certificate not found", { status: 404 });
    }

    const template = certificate.course?.template || certificate.track?.template;
    
    // Default theme settings if no template exists
    const themeName = template?.themeName || "ClassicGold";
    const primaryColor = template?.primaryColor || undefined;
    const logoUrl = template?.logoUrl || undefined;
    const signatureUrl = template?.signatureUrl || undefined;
    
    const courseName = certificate.course?.title || certificate.track?.title || certificate.title;
    const studentName = `${certificate.user.firstName} ${certificate.user.lastName}`;
    const date = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const ThemeComponent = themeName === "ModernDark" ? ModernDarkTheme : ClassicGoldTheme;

    return new ImageResponse(
      (
        <ThemeComponent
          studentName={studentName}
          courseName={courseName}
          date={date}
          primaryColor={primaryColor}
          logoUrl={logoUrl}
          signatureUrl={signatureUrl}
        />
      ),
      {
        width: 1122,
        height: 794,
      }
    );
  } catch (error) {
    console.error("Error generating certificate image:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
