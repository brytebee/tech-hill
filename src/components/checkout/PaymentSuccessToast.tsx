"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useModal } from "@/hooks/use-modal";

export function PaymentSuccessToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showAlert } = useModal();

  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      toast.success("Payment Successful!");
      showAlert({
        title: "Payment Confirmed",
        description: "Your transaction was successful. Welcome to the course!",
        variant: "success",
      });

      // Remove the query param so it doesn't trigger again on reload
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    }
  }, [searchParams, router, showAlert]);

  return null;
}
