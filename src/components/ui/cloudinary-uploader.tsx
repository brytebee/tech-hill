"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CloudinaryUploaderProps {
  onUploadSuccess: (url: string) => void;
  buttonText?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export function CloudinaryUploader({ onUploadSuccess, buttonText = "Upload Image", className, variant = "outline" }: CloudinaryUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary credentials are not configured in system environment variables.");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      
      if (data.secure_url) {
        onUploadSuccess(data.secure_url);
        toast.success("Image uploaded successfully!");
      } else {
        throw new Error("Invalid response from Cloudinary");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An error occurred during upload. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset the input
      }
    }
  };

  return (
    <div className={`relative ${className || ""}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <Button 
        type="button" 
        variant={variant} 
        size="sm"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="w-full h-10 border-dashed"
      >
        {isUploading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
        ) : (
          <><UploadCloud className="w-4 h-4 mr-2" /> {buttonText}</>
        )}
      </Button>
    </div>
  );
}
