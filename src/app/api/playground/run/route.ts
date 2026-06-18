import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const execPromise = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const { language, code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const reqId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const tempDir = path.join(process.cwd(), "tmp", "playground", reqId);

    // Create temp directory
    fs.mkdirSync(tempDir, { recursive: true });

    let command = "";
    let fileName = "";

    if (language === "java") {
      const classMatch = code.match(/public\s+class\s+(\w+)/);
      const className = classMatch ? classMatch[1] : "Main";
      fileName = `${className}.java`;
      fs.writeFileSync(path.join(tempDir, fileName), code);
      command = `javac ${fileName} && java ${className}`;
    } else if (language === "typescript") {
      fileName = "index.ts";
      fs.writeFileSync(path.join(tempDir, fileName), code);
      command = `npx ts-node ${fileName}`;
    } else if (language === "javascript") {
      fileName = "index.js";
      fs.writeFileSync(path.join(tempDir, fileName), code);
      command = `node ${fileName}`;
    } else {
      return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
    }

    try {
      const { stdout, stderr } = await execPromise(command, {
        cwd: tempDir,
        timeout: 6000, // 6 seconds execution timeout limit
      });

      // Cleanup
      fs.rmSync(tempDir, { recursive: true, force: true });

      return NextResponse.json({ stdout, stderr });
    } catch (execError: any) {
      // Cleanup on error
      fs.rmSync(tempDir, { recursive: true, force: true });

      let stderrOutput = execError.stderr || execError.message;
      
      // If error is due to timeout
      if (execError.killed || execError.signal === "SIGTERM") {
        stderrOutput = "Execution timed out (limit: 6 seconds). Check for infinite loops.";
      }

      // Check if command itself wasn't found (e.g. javac not installed, though checked on user system)
      if (execError.code === "ENOENT" || execError.message.includes("not found")) {
        stderrOutput = `Compiler/runtime error: command not found. Ensure the appropriate runtime is configured.\n${execError.message}`;
      }

      return NextResponse.json({
        stdout: execError.stdout || "",
        stderr: stderrOutput,
        error: true,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
