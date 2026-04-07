"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { importCourseAction } from "@/app/actions/importCourse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UploadCloud, FileType, CheckCircle, AlertTriangle, Download, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CourseImportTool() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const tempCsvContent = `course_title,course_description,course_difficulty,course_price,module_title,module_order,topic_title,topic_type,topic_content,topic_video_url,topic_order,topic_required,quiz_title,quiz_passing_score,question_text,question_type,question_points,option_1,option_2,option_3,option_4,correct_option
"Sample Python Course","Learn Python from scratch",BEGINNER,0,"Module 1: Basics",1,"What is Python?",LESSON,"Python is a popular programming language.",,1,true,,,,,,,,,,,
"Sample Python Course","Learn Python from scratch",BEGINNER,0,"Module 1: Basics",1,"Python Quiz 1",ASSESSMENT,, ,2,true,"Python Basics Quiz",80,"What is Python?","MULTIPLE_CHOICE",10,"A snake","A language","A game","A car",2
`;

  const handleDownloadTemplate = () => {
    const blob = new Blob([tempCsvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "course_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            toast.error("Error parsing CSV file");
            console.error(results.errors);
            return;
          }
          setParsedData(results.data as any[]);
        },
      });
    }
  };

  const handleImport = async () => {
    if (!parsedData || parsedData.length === 0) return;
    
    setIsImporting(true);
    try {
      const result = await importCourseAction(parsedData);
      
      if (result.success) {
        toast.success("Course imported successfully!");
        router.push(`/admin/courses/${result.courseId}`);
      } else {
        toast.error(result.error || "Failed to import course");
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred during import");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-black">Bulk Import Course</CardTitle>
        <CardDescription>
          Upload a predefined CSV file containing course modules, topics, and quizzes to rapidly build out a full course.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Start with the template</h3>
            <p className="text-sm text-slate-500 max-w-md">Download the precise CSV format needed by the pipeline. Contains an example course structure.</p>
          </div>
          <Button variant="outline" onClick={handleDownloadTemplate} className="shrink-0 bg-white dark:bg-slate-950 font-bold">
            <Download className="mr-2 h-4 w-4" /> Download Template
          </Button>
        </div>

        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 text-center transition-all hover:bg-slate-50 dark:hover:bg-slate-900/50 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".csv" 
            className="hidden" 
          />
          
          {file ? (
             <div className="flex flex-col items-center gap-3">
               <div className="p-4 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full">
                 <FileType className="h-10 w-10" />
               </div>
               <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">{file.name}</h3>
                  <p className="text-slate-500 text-sm">{parsedData ? `${parsedData.length} records parsed` : "Parsing..."}</p>
               </div>
             </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
               <div className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full group-hover:scale-110 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all duration-300">
                 <UploadCloud className="h-10 w-10" />
               </div>
               <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-blue-600 transition-colors">Click to upload CSV</h3>
                  <p className="text-slate-500 text-sm">Valid .csv format only</p>
               </div>
             </div>
          )}
        </div>

        {parsedData && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 p-5 rounded-xl flex items-start gap-3">
             <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-500 mt-0.5 shrink-0" />
             <div>
                <h4 className="font-bold text-emerald-900 dark:text-emerald-400">Ready to import</h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-500/80 mb-2">We found the following structure in your file:</p>
                <div className="text-xs font-mono bg-white/50 dark:bg-black/20 p-2 rounded text-emerald-800 dark:text-emerald-300 max-h-32 overflow-y-auto">
                    {Array.from(new Set(parsedData.map(r => r.module_title))).filter(Boolean).map(mod => (
                        <div key={mod as string} className="mb-1">
                          • {mod as string} ({parsedData.filter(r => r.module_title === mod && !!r.topic_title).length} topics)
                        </div>
                    ))}
                </div>
             </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex justify-between border-t border-slate-100 dark:border-slate-800">
        <Button variant="ghost" onClick={() => {setFile(null); setParsedData(null);}} disabled={!file || isImporting}>
          Clear selection
        </Button>
        <Button onClick={handleImport} disabled={!parsedData || isImporting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-full sm:w-auto shadow-md">
           {isImporting ? (
             <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing Pipeline...</>
           ) : (
             <><ArrowRight className="mr-2 h-4 w-4" /> Start Bulk Import</>
           )}
        </Button>
      </CardFooter>
    </Card>
  );
}
