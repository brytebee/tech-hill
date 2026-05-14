"use client";
// components/admin/CourseInjectionModal.tsx
// 2-step modal: 1) pick course, 2) pick topics

import { useState, useMemo } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Search, BookOpen, ChevronDown, CheckSquare, Square, Loader2,
  Video, FileText, Target, Award, ArrowLeft, BookPlus,
} from "lucide-react";

interface TopicOption { id: string; title: string; topicType: string; duration?: number; orderIndex: number; }
interface ModuleOption { id: string; title: string; order: number; topics: TopicOption[]; }
interface CourseOption {
  id: string; title: string; shortDescription?: string; difficulty: string;
  duration: number; thumbnail?: string; status: string;
  modules: ModuleOption[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  existingCourseIds: string[];
  allCourses: CourseOption[];
  nextOrder: number;
  trackId: string;
  onSuccess: () => void;
}

function topicIcon(type: string) {
  switch (type) {
    case "VIDEO":      return <Video className="h-3 w-3" />;
    case "PRACTICE":   return <Target className="h-3 w-3" />;
    case "ASSESSMENT": return <Award className="h-3 w-3" />;
    case "RESOURCE":   return <FileText className="h-3 w-3" />;
    default:           return <BookOpen className="h-3 w-3" />;
  }
}

export function CourseInjectionModal({
  open, onClose, existingCourseIds, allCourses, nextOrder, trackId, onSuccess,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CourseOption | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());
  const [wholeFlag, setWholeFlag] = useState(true); // "Whole Course" toggle
  const [loading, setLoading] = useState(false);

  const available = useMemo(() =>
    allCourses.filter(c =>
      !existingCourseIds.includes(c.id) &&
      c.status === "PUBLISHED" &&
      (!query || c.title.toLowerCase().includes(query.toLowerCase()))
    ), [allCourses, existingCourseIds, query]);

  const allTopicIds = useMemo(() =>
    selected?.modules.flatMap(m => m.topics.map(t => t.id)) ?? [], [selected]);
  const totalTopics = allTopicIds.length;
  const selectedCount = wholeFlag ? totalTopics : selectedTopics.size;

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => {
      const next = new Set(prev);
      next.has(moduleId) ? next.delete(moduleId) : next.add(moduleId);
      return next;
    });
  };

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev => {
      const next = new Set(prev);
      next.has(topicId) ? next.delete(topicId) : next.add(topicId);
      return next;
    });
  };

  const toggleModuleTopics = (module: ModuleOption) => {
    const ids = module.topics.map(t => t.id);
    const allSelected = ids.every(id => selectedTopics.has(id));
    setSelectedTopics(prev => {
      const next = new Set(prev);
      ids.forEach(id => allSelected ? next.delete(id) : next.add(id));
      return next;
    });
  };

  const handleSelectCourse = (course: CourseOption) => {
    setSelected(course);
    setSelectedTopics(new Set());
    setWholeFlag(true);
    setOpenModules(new Set(course.modules.map(m => m.id)));
    setStep(2);
  };

  const handleBack = () => { setStep(1); setSelected(null); };

  const handleInject = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const includedTopicIds = wholeFlag ? [] : Array.from(selectedTopics);
      const res = await fetch(`/api/admin/tracks/${trackId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: selected.id, order: nextOrder, includedTopicIds }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Injection failed");
      }
      onSuccess();
      handleClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1); setQuery(""); setSelected(null);
    setSelectedTopics(new Set()); setWholeFlag(true);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0 overflow-hidden">
        <DialogHeader className="px-8 pt-8 pb-4 shrink-0 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button onClick={handleBack} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <ArrowLeft className="h-4 w-4 text-slate-500" />
              </button>
            )}
            <div>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">
                {step === 1 ? "Inject Course" : selected?.title}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs font-medium mt-1">
                {step === 1 ? "Select a course to add to this career path" : "Choose which topics to include"}
              </DialogDescription>
            </div>
          </div>
          {step === 1 && (
            <div className="relative mt-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search courses…"
                className="pl-10 h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
            </div>
          )}
        </DialogHeader>

        {/* Step 1 — Course list */}
        {step === 1 && (
          <div className="flex-1 overflow-y-auto px-8 py-4 space-y-2">
            {available.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-bold text-sm">No available courses found</p>
              </div>
            ) : available.map(course => (
              <button key={course.id} onClick={() => handleSelectCourse(course)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-left group">
                <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-blue-500/10">
                  <BookOpen className="h-5 w-5 text-slate-400 group-hover:text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm truncate">{course.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="text-[9px] font-black uppercase">{course.difficulty}</Badge>
                    <span className="text-[10px] text-slate-400 font-medium">{course.modules.length} modules · {course.modules.flatMap(m => m.topics).length} topics</span>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-300 group-hover:text-blue-500 -rotate-90 shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* Step 2 — Topic selector */}
        {step === 2 && selected && (
          <div className="flex-1 overflow-y-auto px-8 py-4 space-y-3">
            {/* Whole Course toggle */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <Checkbox id="whole-course" checked={wholeFlag}
                onCheckedChange={v => { setWholeFlag(!!v); if (v) setSelectedTopics(new Set()); }} />
              <label htmlFor="whole-course" className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white cursor-pointer flex-1">
                Include Whole Course
              </label>
              <span className="text-[10px] font-black text-slate-400 uppercase">{totalTopics} topics</span>
            </div>

            {/* Module / topic accordion */}
            {!wholeFlag && (
              <div className="space-y-2">
                {selected.modules.map(module => {
                  const moduleTopicIds = module.topics.map(t => t.id);
                  const allModSelected = moduleTopicIds.every(id => selectedTopics.has(id));
                  const someModSelected = moduleTopicIds.some(id => selectedTopics.has(id));
                  return (
                    <Collapsible key={module.id} open={openModules.has(module.id)}
                      onOpenChange={() => toggleModule(module.id)}>
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                          <Checkbox checked={allModSelected} data-indeterminate={!allModSelected && someModSelected}
                            onCheckedChange={() => toggleModuleTopics(module)}
                            onClick={e => e.stopPropagation()} />
                          <span className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white flex-1">{module.title}</span>
                          <span className="text-[10px] text-slate-400">{moduleTopicIds.filter(id => selectedTopics.has(id)).length}/{module.topics.length}</span>
                          <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${openModules.has(module.id) ? "rotate-180" : ""}`} />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 pl-3">
                          {module.topics.map(topic => (
                            <label key={topic.id}
                              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                              <Checkbox checked={selectedTopics.has(topic.id)}
                                onCheckedChange={() => toggleTopic(topic.id)} />
                              <span className="flex items-center gap-1.5 text-slate-400">{topicIcon(topic.topicType)}</span>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex-1">{topic.title}</span>
                              {topic.duration && <span className="text-[9px] text-slate-400">{topic.duration}m</span>}
                            </label>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <DialogFooter className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between gap-4">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              {wholeFlag ? "All topics included" : `${selectedTopics.size} of ${totalTopics} topics selected`}
            </span>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} disabled={loading} className="rounded-xl font-black uppercase text-xs">Cancel</Button>
              <Button onClick={handleInject} disabled={loading || (!wholeFlag && selectedTopics.size === 0)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs h-10 px-6 rounded-xl shadow-lg shadow-blue-500/20">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BookPlus className="h-4 w-4 mr-2" />}
                {loading ? "Injecting…" : "Inject Course"}
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
