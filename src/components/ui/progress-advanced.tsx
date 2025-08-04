
// components/ui/progress-advanced.tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface ProgressWithLabelProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  showValue?: boolean
  animated?: boolean
  className?: string
  size?: "sm" | "default" | "lg"
  variant?: "default" | "secondary" | "success" | "warning" | "destructive"
}

export function ProgressWithLabel({
  value,
  max = 100,
  label,
  showPercentage = true,
  showValue = false,
  animated = false,
  className,
  size = "default",
  variant = "default"
}: ProgressWithLabelProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const [displayValue, setDisplayValue] = React.useState(animated ? 0 : value)

  React.useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(value)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [value, animated])

  return (
    <div className={cn("space-y-2", className)}>
      {(label || showPercentage || showValue) && (
        <div className="flex justify-between items-center text-sm">
          {label && <span className="font-medium">{label}</span>}
          <div className="flex items-center space-x-2">
            {showValue && (
              <span className="text-muted-foreground">
                {Math.round(displayValue)}/{max}
              </span>
            )}
            {showPercentage && (
              <span className="font-medium">
                {Math.round((displayValue / max) * 100)}%
              </span>
            )}
          </div>
        </div>
      )}
      <Progress 
        value={displayValue} 
        max={max} 
        size={size} 
        variant={variant}
        className={animated ? "transition-all duration-1000 ease-out" : ""}
      />
    </div>
  )
}

// Circular Progress Component
// components/ui/progress-circular.tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  className?: string
  showValue?: boolean
  variant?: "default" | "success" | "warning" | "destructive"
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className,
  showValue = true,
  variant = "default"
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const variantColors = {
    default: "stroke-primary",
    success: "stroke-green-500",
    warning: "stroke-yellow-500",
    destructive: "stroke-red-500"
  }

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn("transition-all duration-300 ease-in-out", variantColors[variant])}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  )
}
