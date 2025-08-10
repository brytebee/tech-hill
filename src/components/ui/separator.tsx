// components/ui/separator.tsx
"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }

// // Alternative Progress component without Radix UI dependency
// // components/ui/progress-simple.tsx
// "use client"

// import * as React from "react"
// import { cn } from "@/lib/utils"

// interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
//   value?: number
//   max?: number
//   size?: "sm" | "default" | "lg"
//   variant?: "default" | "secondary" | "success" | "warning" | "destructive"
// }

// const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
//   ({ className, value = 0, max = 100, size = "default", variant = "default", ...props }, ref) => {
//     const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
//     const sizeClasses = {
//       sm: "h-2",
//       default: "h-4",
//       lg: "h-6"
//     }
    
//     const variantClasses = {
//       default: "bg-primary",
//       secondary: "bg-secondary",
//       success: "bg-green-500",
//       warning: "bg-yellow-500",
//       destructive: "bg-destructive"
//     }

//     return (
//       <div
//         ref={ref}
//         className={cn(
//           "relative w-full overflow-hidden rounded-full bg-secondary/20",
//           sizeClasses[size],
//           className
//         )}
//         {...props}
//       >
//         <div
//           className={cn(
//             "h-full transition-all duration-300 ease-in-out rounded-full",
//             variantClasses[variant]
//           )}
//           style={{ width: `${percentage}%` }}
//         />
//       </div>
//     )
//   }
// )
// Progress.displayName = "Progress"

// // Alternative Separator component without Radix UI dependency
// // components/ui/separator-simple.tsx
// "use client"

// import * as React from "react"
// import { cn } from "@/lib/utils"

// interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
//   orientation?: "horizontal" | "vertical"
//   decorative?: boolean
// }

// const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
//   ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => {
//     return (
//       <div
//         ref={ref}
//         role={decorative ? "none" : "separator"}
//         aria-orientation={orientation}
//         className={cn(
//           "shrink-0 bg-border",
//           orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
//           className
//         )}
//         {...props}
//       />
//     )
//   }
// )
// Separator.displayName = "Separator"

// export { Progress, Separator }

// // Usage Examples and Variants
// // components/ui/progress-examples.tsx
// import { Progress } from "@/components/ui/progress"
// import { Separator } from "@/components/ui/separator"

// export function ProgressExamples() {
//   return (
//     <div className="space-y-6 p-6">
//       <div>
//         <h3 className="text-lg font-semibold mb-4">Progress Examples</h3>
        
//         {/* Basic Progress */}
//         <div className="space-y-4">
//           <div>
//             <label className="text-sm font-medium">Basic Progress (60%)</label>
//             <Progress value={60} className="mt-2" />
//           </div>
          
//           {/* Different sizes */}
//           <div>
//             <label className="text-sm font-medium">Small Progress</label>
//             <Progress value={45} size="sm" className="mt-2" />
//           </div>
          
//           <div>
//             <label className="text-sm font-medium">Large Progress</label>
//             <Progress value={80} size="lg" className="mt-2" />
//           </div>
          
//           {/* Different variants */}
//           <div>
//             <label className="text-sm font-medium">Success Progress</label>
//             <Progress value={100} variant="success" className="mt-2" />
//           </div>
          
//           <div>
//             <label className="text-sm font-medium">Warning Progress</label>
//             <Progress value={75} variant="warning" className="mt-2" />
//           </div>
          
//           <div>
//             <label className="text-sm font-medium">Destructive Progress</label>
//             <Progress value={25} variant="destructive" className="mt-2" />
//           </div>
//         </div>
//       </div>

//       <Separator />

//       <div>
//         <h3 className="text-lg font-semibold mb-4">Separator Examples</h3>
        
//         <div className="space-y-4">
//           <div>
//             <p>Content above separator</p>
//             <Separator className="my-4" />
//             <p>Content below separator</p>
//           </div>
          
//           <div className="flex items-center space-x-4 h-20">
//             <div>Left content</div>
//             <Separator orientation="vertical" />
//             <div>Right content</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
