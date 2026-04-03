"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for component to mount
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full opacity-50">
        <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700 animate-pulse" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-slate-700" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-300" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 rounded-xl shadow-xl dark:border-slate-800">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={`cursor-pointer rounded-lg mx-1 my-1 text-xs font-medium flex gap-2 items-center ${theme === 'light' ? 'bg-slate-100 text-slate-900' : 'text-slate-600'}`}
        >
          <Sun className="h-3.5 w-3.5" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={`cursor-pointer rounded-lg mx-1 my-1 text-xs font-medium flex gap-2 items-center ${theme === 'dark' ? 'bg-slate-800 text-slate-50' : 'text-slate-300'}`}
        >
          <Moon className="h-3.5 w-3.5" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className={`cursor-pointer rounded-lg mx-1 my-1 text-xs font-medium flex gap-2 items-center ${theme === 'system' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}
        >
          <Monitor className="h-3.5 w-3.5" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
