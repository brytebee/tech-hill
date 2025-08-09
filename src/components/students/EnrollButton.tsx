// components/student/EnrollButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface EnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function EnrollButton({ 
  courseId, 
  isEnrolled, 
  children, 
  variant = 'default',
  size = 'default',
  className 
}: EnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEnrollment = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: isEnrolled ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (isEnrolled) {
        toast.success('Successfully unenrolled from course');
      } else {
        toast.success('Successfully enrolled in course');
      }

      // Refresh the page to update the UI
      router.refresh();
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleEnrollment}
      disabled={isLoading}
      variant={isEnrolled ? 'outline' : variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        children
      )}
    </Button>
  );
}