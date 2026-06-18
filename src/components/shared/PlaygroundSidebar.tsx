"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Play,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Terminal,
  Cpu,
  Loader2,
  AlertTriangle,
  Monitor,
} from "lucide-react";

interface PlaygroundSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const DEFAULT_TEMPLATES = {
  html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Inter', sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      color: white;
      margin: 0;
    }
    .card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 32px;
      text-align: center;
      backdrop-filter: blur(12px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      max-width: 320px;
    }
    h2 {
      margin-top: 0;
      color: #3b82f6;
    }
    button {
      background: linear-gradient(to right, #3b82f6, #6366f1);
      border: none;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      margin-top: 16px;
      transition: all 0.3s;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>Live Playground</h2>
    <p>Edit HTML, CSS, and JS on the left. See updates here!</p>
    <button id="action-btn">Click Me</button>
  </div>
  
  <script>
    const btn = document.getElementById('action-btn');
    btn.addEventListener('click', () => {
      btn.innerText = 'Clicked! 🎉';
      setTimeout(() => {
        btn.innerText = 'Click Me';
      }, 1500);
    });
  </script>
</body>
</html>`,

  javascript: `// JavaScript Coding Snippet
// Let's implement a recursive Fibonacci generator

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("--- Starting Fibonacci Sequence ---");
for (let i = 0; i < 8; i++) {
  console.log(\`Fibonacci(\${i}) = \${fibonacci(i)}\`);
}
console.log("--- Execution Completed ---");`,

  typescript: `// TypeScript Coding Snippet
// Interfaces, Types, and strictly-typed operations

interface Student {
  id: string;
  name: string;
  enrolledCourses: string[];
  role: 'STUDENT' | 'ALUMNI';
}

function processEnrollment(student: Student, course: string): string {
  student.enrolledCourses.push(course);
  return \`Enrolled \${student.name} into: \${course}. Total enrolled: \${student.enrolledCourses.length}\`;
}

const currentStudent: Student = {
  id: "STU-982",
  name: "Jane Doe",
  enrolledCourses: ["Intro to Java"],
  role: "STUDENT"
};

console.log("Original student profile:", JSON.stringify(currentStudent, null, 2));
const message = processEnrollment(currentStudent, "Advanced Next.js & AI");
console.log(message);`,

  java: `// Java Coding Snippet
// Standard Main class with JDK runtime execution
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        System.out.println("Java Compilation & Execution on Tech Hill");
        
        List<String> modules = new ArrayList<>();
        modules.add("Variable Scopes");
        modules.add("Object-Oriented Inheritance");
        modules.add("Concurrent Threads");
        
        System.out.println("Syllabus Core Modules:");
        for (int i = 0; i < modules.size(); i++) {
            System.out.printf("  [%d] %s%n", i + 1, modules.get(i));
        }
    }
}`
};

type Language = "html" | "javascript" | "typescript" | "java";

export function PlaygroundSidebar({ isOpen, onToggle }: PlaygroundSidebarProps) {
  const [activeLang, setActiveLang] = useState<Language>("html");
  const [code, setCode] = useState<Record<Language, string>>(DEFAULT_TEMPLATES);
  const [fontSize, setFontSize] = useState<"text-xs" | "text-sm" | "text-base">("text-sm");
  const [isRunning, setIsRunning] = useState(false);
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [isIframeActive, setIsIframeActive] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleReset = () => {
    if (confirm("Reset current template to original code?")) {
      setCode((prev) => ({
        ...prev,
        [activeLang]: DEFAULT_TEMPLATES[activeLang],
      }));
      setStdout("");
      setStderr("");
      setIframeSrc("");
      setIsIframeActive(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const val = e.currentTarget.value;
      const newVal = val.substring(0, start) + "  " + val.substring(end);
      
      setCode((prev) => ({
        ...prev,
        [activeLang]: newVal,
      }));
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRunCode();
    }
  };

  const handleRunCode = async () => {
    const activeCode = code[activeLang];
    setStdout("");
    setStderr("");
    setIsRunning(true);
    setIsIframeActive(false);

    if (activeLang === "html") {
      setIframeSrc(activeCode);
      setIsIframeActive(true);
      setIsRunning(false);
      setConsoleOpen(true);
      return;
    }

    try {
      const response = await fetch("/api/playground/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: activeLang, code: activeCode }),
      });

      if (!response.ok) {
        throw new Error(`Execution request failed (status ${response.status})`);
      }

      const data = await response.json();
      setStdout(data.stdout || "");
      setStderr(data.stderr || "");
      setConsoleOpen(true);
    } catch (err: any) {
      if (activeLang === "javascript" || activeLang === "typescript") {
        let runnableJs = activeCode;
        if (activeLang === "typescript") {
          runnableJs = stripTypeScriptTypes(activeCode);
        }
        const result = runJavascriptClientSide(runnableJs);
        setStdout(result.stdout + "\n[Info] Sandbox executed in-browser.");
        setStderr(result.stderr);
      } else if (activeLang === "java") {
        setStderr(
          `Java execution failed on host server.\n\n` +
          `--- JDK LOCAL SETUP GUIDE ---\n` +
          `Ensure Java Development Kit (JDK 17+) is configured locally:\n` +
          `1. macOS: run 'brew install openjdk@17'\n` +
          `2. Windows: run 'winget install EclipseAdoptium.Temurin.17.JDK'\n` +
          `3. Linux: run 'sudo apt install default-jdk'\n\n` +
          `Error detail: ${err.message}`
        );
      }
      setConsoleOpen(true);
    } finally {
      setIsRunning(false);
    }
  };

  const runJavascriptClientSide = (jsCode: string) => {
    const logs: string[] = [];
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.log = (...args) => {
      logs.push(args.map(a => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" "));
    };
    console.error = (...args) => {
      logs.push("[ERROR] " + args.map(a => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" "));
    };
    console.warn = (...args) => {
      logs.push("[WARN] " + args.map(a => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" "));
    };

    try {
      const executor = new Function(jsCode);
      executor();
      return { stdout: logs.join("\n"), stderr: "" };
    } catch (e: any) {
      return { stdout: logs.join("\n"), stderr: e.stack || e.message };
    } finally {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    }
  };

  const stripTypeScriptTypes = (tsCode: string): string => {
    let js = tsCode;
    js = js.replace(/interface\s+\w+\s*\{[\s\S]*?\}/g, "");
    js = js.replace(/type\s+\w+\s*=\s*[\s\S]*?;/g, "");
    js = js.replace(/:\s*[A-Za-z0-9_<>|[\]\s'"]+(?=\s*=|;|\)|,)/g, "");
    return js;
  };

  // Folded (Closed) Symmetrical Right Panel
  if (!isOpen) {
    return (
      <div className="fixed inset-y-0 right-0 z-40 w-16 hidden lg:flex flex-col bg-white dark:bg-[#080e1a] border-l border-slate-200 dark:border-slate-800 transition-all duration-300 text-slate-900 dark:text-slate-100">
        {/* Toggle chevron */}
        <div className="flex items-center justify-center h-16 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white h-8 w-8 rounded-lg"
            title="Expand Code Playground"
          >
            <ChevronLeft className="w-5 h-5 animate-pulse" />
          </Button>
        </div>
        
        {/* Playground Icon Button in the middle */}
        <div className="flex-1 py-4 flex flex-col items-center justify-center">
          <button
            onClick={onToggle}
            title="Code Playground"
            className="flex items-center justify-center h-12 w-12 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 border border-slate-200/50 dark:border-slate-800/80 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 shadow-sm transition-all duration-200"
          >
            <Terminal className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

  const lineCount = code[activeLang].split("\n").length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1);

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[500px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col transition-all duration-300 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center border border-blue-500/20 text-blue-400 animate-pulse">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm leading-tight text-white">Code Playground</h2>
            <p className="text-xs text-slate-400">Draft, run, and preview snippets</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg h-8 w-8"
            title="Collapse Code Playground"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Editor Controls Bar */}
      <div className="flex flex-wrap items-center justify-between p-2 gap-2 border-b border-slate-800 bg-slate-950/30 shrink-0 text-xs">
        <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800 shrink-0">
          {(["html", "javascript", "typescript", "java"] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setActiveLang(lang);
                setStdout("");
                setStderr("");
                setIframeSrc("");
                setIsIframeActive(false);
              }}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all uppercase text-[10px] ${
                activeLang === lang
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {lang === "javascript" ? "JS" : lang === "typescript" ? "TS" : lang}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-md py-1 px-1.5 text-slate-300 font-semibold focus:outline-none focus:border-blue-500 text-[10px]"
          >
            <option value="text-xs">Small</option>
            <option value="text-sm">Medium</option>
            <option value="text-base">Large</option>
          </select>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            title="Reset code template"
            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-md h-7 w-7 border border-slate-800/60"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
          <Button
            onClick={handleRunCode}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-500 text-white gap-1 py-1 px-3 h-7 text-[10px] rounded-md font-bold shadow-md shadow-blue-900/30"
          >
            {isRunning ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3 fill-current" />
            )}
            Run
          </Button>
        </div>
      </div>

      {/* Main Editor & Console Container */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        <div className="flex-1 flex min-h-0 bg-slate-900 font-mono text-sm relative">
          <div className="select-none text-right py-4 pr-3 pl-4 text-slate-600 bg-slate-950/20 text-xs leading-6 border-r border-slate-800/40 shrink-0">
            {lineNumbers.map((n) => (
              <div key={n}>{n}</div>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            value={code[activeLang]}
            onChange={(e) => setCode((prev) => ({ ...prev, [activeLang]: e.target.value }))}
            onKeyDown={handleKeyDown}
            className={`flex-1 py-4 px-3 bg-transparent text-slate-100 leading-6 resize-none focus:outline-none font-mono ${fontSize}`}
            placeholder="// Write code here..."
            spellCheck={false}
          />
        </div>

        <div
          className={`border-t border-slate-800 bg-slate-950 flex flex-col transition-all duration-300 ${
            consoleOpen ? "h-[38%] min-h-[140px]" : "h-10"
          }`}
        >
          <div
            onClick={() => setConsoleOpen(!consoleOpen)}
            className="flex items-center justify-between px-4 py-2 border-b border-slate-900 bg-slate-950 hover:bg-slate-900/40 cursor-pointer select-none shrink-0"
          >
            <div className="flex items-center gap-2">
              {activeLang === "html" ? (
                <Monitor className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
              )}
              <span className="font-semibold text-xs text-slate-300 tracking-wide">
                {activeLang === "html" ? "LIVE PREVIEW" : "CONSOLE OUTPUT"}
              </span>
            </div>
            <button className="text-slate-400 hover:text-white rounded-md p-1">
              {consoleOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>

          {consoleOpen && (
            <div className="flex-1 overflow-auto bg-slate-950 font-mono text-xs p-4 leading-relaxed relative">
              {activeLang === "html" && isIframeActive ? (
                <div className="w-full h-full bg-white rounded-lg border border-slate-800 overflow-hidden">
                  <iframe
                    srcDoc={iframeSrc}
                    title="Live Preview"
                    sandbox="allow-scripts"
                    className="w-full h-full border-none"
                  />
                </div>
              ) : activeLang === "html" ? (
                <div className="text-slate-500 italic flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 animate-pulse" />
                  Click "Run" to render live preview.
                </div>
              ) : (
                <div className="space-y-2 select-text">
                  <div className="text-slate-500 font-semibold">
                    student@techhill:~$ <span className="text-blue-400 font-normal">run {activeLang}</span>
                  </div>
                  
                  {stdout && (
                    <pre className="text-slate-200 whitespace-pre-wrap break-all leading-5">
                      {stdout}
                    </pre>
                  )}
                  
                  {stderr && (
                    <div className="text-rose-400 bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg leading-5 whitespace-pre-wrap break-all flex gap-2.5 items-start">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                      <pre className="font-mono text-xs">{stderr}</pre>
                    </div>
                  )}

                  {!stdout && !stderr && !isRunning && (
                    <div className="text-slate-600 italic">
                      No logs. Click "Run" or press {navigator.platform.indexOf("Mac") !== -1 ? "Cmd" : "Ctrl"} + Enter to execute.
                    </div>
                  )}

                  {isRunning && (
                    <div className="flex items-center gap-2 text-blue-400 font-semibold animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                      Executing on local engine...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
