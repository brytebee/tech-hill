"use client";
// components/admin/TrackTopicEditorSheet.tsx
// Dialog for editing includedTopicIds on an existing TrackCourse entry

import { useState, useMemo, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown, Save, Loader2, BookOpen,
  Video, FileText, Target, Award,
} from "lucide-react";

interface TopicOption { id: string; title: string; topicType: string; duration?: number; }
interface ModuleOption { id: string; title: string; order: number; topics: TopicOption[]; }
interface Props {
  open: boolean;
  onClose: () => void;
  trackId: string;
  trackCourseId: string;
  courseTitle: string;
  modules: ModuleOption[];
  currentIncludedTopicIds: string[];
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

export function TrackTopicEditorSheet({
  open, onClose, trackId, trackCourseId, courseTitle,
  modules, currentIncludedTopicIds, onSuccess,
}: Props) {
  const allTopicIds = useMemo(
    () => modules.flatMap(m => m.topics.map(t => t.id)), [modules]
  );
  const [wholeFlag, setWholeFlag]       = useState(currentIncludedTopicIds.length === 0);
  const [selectedTopics, setSelected]   = useState<Set<string>>(new Set(currentIncludedTopicIds));
  const [openModules, setOpenModules]   = useState<Set<string>>(new Set(modules.map(m => m.id)));
  const [loading, setLoading]           = useState(false);

  useEffect(() => {
    if (open) {
      setWholeFlag(currentIncludedTopicIds.length === 0);
      setSelected(new Set(currentIncludedTopicIds));
      setOpenModules(new Set(modules.map(m => m.id)));
    }
  }, [open, currentIncludedTopicIds, modules]);

  const toggleTopic = (id: string) => setSelected(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
  });

  const toggleModuleTopics = (module: ModuleOption) => {
    const ids = module.topics.map(t => t.id);
    const allSel = ids.every(id => selectedTopics.has(id));
    setSelected(prev => {
      const next = new Set(prev);
      ids.forEach(id => allSel ? next.delete(id) : next.add(id));
      return next;
    });
  };

  const toggleModuleOpen = (id: string) => setOpenModules(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const includedTopicIds = wholeFlag ? [] : Array.from(selectedTopics);
      const res = await fetch(`/api/admin/tracks/${trackId}/courses/${trackCourseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includedTopicIds }),
      });
      if (!res.ok) throw new Error("Save failed");
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally { setLoading(false); }
  };

  const selectedCount = wholeFlag ? allTopicIds.length : selectedTopics.size;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0 overflow-hidden">
        <DialogHeader className="px-8 pt-8 pb-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <DialogTitle className="text-lg font-black uppercase tracking-tight">{courseTitle}</DialogTitle>
          <DialogDescription className="text-slate-400 text-xs mt-1">
            Choose which topics are visible when students take this course via the career path.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8 py-5 space-y-3">
          {/* Whole course toggle */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <Checkbox id="whole" checked={wholeFlag}
              onCheckedChange={v => { setWholeFlag(!!v); if (v) setSelected(new Set()); }} />
            <label htmlFor="whole" className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white cursor-pointer flex-1">
              Include Whole Course
            </label>
            <span className="text-[10px] font-black text-slate-400 uppercase">{allTopicIds.length} topics</span>
          </div>

          {!wholeFlag && modules.map(module => {
            const ids = module.topics.map(t => t.id);
            const allModSel = ids.every(id => selectedTopics.has(id));
            return (
              <Collapsible key={module.id} open={openModules.has(module.id)}
                onOpenChange={() => toggleModuleOpen(module.id)}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                    <Checkbox checked={allModSel}
                      onCheckedChange={() => toggleModuleTopics(module)}
                      onClick={e => e.stopPropagation()} />
                    <span className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white flex-1">{module.title}</span>
                    <span className="text-[10px] text-slate-400">
                      {ids.filter(id => selectedTopics.has(id)).length}/{module.topics.length}
                    </span>
                    <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${openModules.has(module.id) ? "rotate-180" : ""}`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 pl-3">
                    {module.topics.map(topic => (
                      <label key={topic.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                        <Checkbox checked={selectedTopics.has(topic.id)}
                          onCheckedChange={() => toggleTopic(topic.id)} />
                        <span className="text-slate-400">{topicIcon(topic.topicType)}</span>
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

        <DialogFooter className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between gap-4">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            {selectedCount}/{allTopicIds.length} topics included
          </span>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading} className="rounded-xl font-black uppercase text-xs">Cancel</Button>
            <Button onClick={handleSave} disabled={loading || (!wholeFlag && selectedTopics.size === 0)}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest text-xs h-10 px-6 rounded-xl">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {loading ? "Saving…" : "Save Selection"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
