"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";
import { useModal } from "@/hooks/use-modal";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";

interface EnrollButtonProps {
  courseId: string;
  courseTitle?: string;
  price?: number;
  isEnrolled: boolean;
  children: React.ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  hasSubscription?: boolean;
}

export function EnrollButton({
  courseId,
  courseTitle = "this course",
  price = 0,
  isEnrolled,
  children,
  variant = "default",
  size = "default",
  className,
  hasSubscription = false,
}: EnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const router = useRouter();

  const { showAlert, showConfirm } = useModal();

  const handleEnrollment = async () => {
    if (isEnrolled) {
      showConfirm({
        title: "Unenroll from Course",
        description:
          "Are you sure you want to unenroll? Your progress will be saved, but you will need to re-enroll to continue.",
        confirmText: "Unenroll",
        variant: "warning",
        onConfirm: async () => {
          await executeEnrollment();
        },
      });
    } else {
      // If course is paid, not enrolled, AND user has no active subscription, show checkout
      if (price > 0 && !hasSubscription) {
        setShowCheckout(true);
        return;
      }
      await executeEnrollment();
    }
  };

  const executeEnrollment = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: isEnrolled ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.includes("currently enrolled in")) {
          showAlert({
            title: "Course Limit Reached",
            description: data.error,
            variant: "warning",
          });
          return;
        }
        if (data.error?.includes("Payment required")) {
          setShowCheckout(true);
          return;
        }
        throw new Error(data.error || "Something went wrong");
      }

      if (isEnrolled) {
        toast.success("Successfully unenrolled from course");
        showAlert({
          title: "Unenrolled",
          description: "You have been successfully unenrolled from the course.",
          variant: "success",
        });
      } else {
        toast.success("Successfully enrolled in course");
        showAlert({
          title: "Enrolled",
          description: "You have successfully enrolled in the course.",
          variant: "success",
        });
      }

      // Refresh the page to update the UI
      router.refresh();
    } catch (error: any) {
      console.error("Enrollment error:", error);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleEnrollment}
        disabled={isLoading}
        variant={isEnrolled ? "outline" : variant}
        size={size}
        className={`transition-all duration-300 font-semibold ${
          !isEnrolled && variant === "default" 
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 dark:shadow-blue-900/40" 
            : ""
        } ${className || ""}`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {!isEnrolled && price > 0 && (
              <CreditCard className="w-4 h-4 mr-2" />
            )}
            {children}
          </>
        )}
      </Button>

      {showCheckout && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          courseId={courseId}
          courseTitle={courseTitle}
          price={price}
        />
      )}
    </>
  );
}
