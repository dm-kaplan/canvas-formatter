"use client";
import { useState, useMemo, FormEvent, useRef } from "react";
// --- UPDATED ---
// Import formatContent and TemplateContext
import {
  getAvailableTemplates,
  previewContent,
  formatContent,
  type TemplateType,
  type TemplateContext,
} from "@/lib/formatters";
export type ImportType = "page" | "assignment" | "discussion" | "syllabus";
interface CanvasModule {
  id: string;
  name: string;
  position: number;
}
export interface PageSummary {
  url: string;
  title: string;
  html_url: string;
  published?: boolean;
  front_page?: boolean;
}
export interface DiscussionSummary {
  id: string;
  title: string;
  html_url: string;
  published?: boolean;
}
export interface AssignmentSummary {
  id: number | string;
  name: string;
  html_url: string;
  due_at?: string;
  published?: boolean;
}
export interface ImportFormData {
  title: string;
  rawContent: string;
  template: TemplateType;
  published: boolean; // We still keep this in the type, even if not in the form
  moduleId?: string;
  overwrite?: boolean;
  pageUrl?: string;
  discussionId?: string;
  assignmentId?: string;
  gettingStartedModuleId?: string;
  instructorName?: string;
  instructorCredentials?: string;
  instructorEmail?: string;
  syllabusFileName?: string;
  syllabusFileUrl?: string;
  pointsPossible?: number;
  dueAt?: string;
  assignmentGroupId?: number;
  requireInitialPost?: boolean;
  allowRating?: boolean;
  frontPage?: boolean;
  objectives?: string[];
  courseName?: string;
  courseCode?: string;
  checklist?: string[];
  videoTitle?: string;
  discussionTitle?: string;
  assignmentTitle?: string;
  facultyName?: string;
  facultyImageUrl?: string;
  moduleTitles?: string[];
}

// --- UPDATED ---
// Removed onSubmit, but kept other props from app/page.tsx
// to prevent build errors, even if they are not used.
interface Props {
  importType: ImportType;
  isLoading?: boolean;
  modules?: CanvasModule[];
  isLoadingModules?: boolean;
  onRefreshModules?: () => Promise<void>;
  pages?: PageSummary[];
  isLoadingPages?: boolean;
  discussions?: DiscussionSummary[];
  isLoadingDiscussions?: boolean;
  onRefreshDiscussions?: () => Promise<void>;
  assignments?: AssignmentSummary[];
  isLoadingAssignments?: boolean;
  onRefreshAssignments?: () => Promise<void>;
  baseUrl: string;
  courseId: string;
}

function getDefaultTemplate(type: ImportType): TemplateType {
  if (type === "assignment") return "wfuAssignment";
  if (type === "discussion") return "wfuDiscussion";
  if (type === "syllabus") return "wfuCourseSyllabus";
  if (type === "page") return "wfuCourseWelcome";
  return "wfuModule";
}

// (parseCombinedModuleInput is not used by the Assignment form, redacting for brevity)
function parseCombinedModuleInput(text: string) {
  // ...
  const lines = text.split(/\r?\n/);
  const idx = (re: RegExp) => lines.findIndex((l) => re.test(l));
  const iDesc = idx(/^\s*Module\s+Description\s*:/i);
  const iObj =
    idx(/^\s*Module\s+Learning\s+Objectives/i) ||
    idx(/\bMLOs\b/i) ||
    idx(/^\s*After\s+completing\s+this\s+module/i);
  const iChecklist = idx(/^\s*Module\s+Checklist\s*:/i);
  const next = [iObj, iChecklist].filter((i) => i >= 0).sort((a, b) => a - b);
  const descStart = iDesc >= 0 ? iDesc + 1 : 0;
  const descEnd = next.length ? next[0] : lines.length;
  const description = lines.slice(descStart, descEnd).join("\n").trim();
  let obj: string[] = [];
  if (iObj >= 0) {
    const objEnd = iChecklist >= 0 ? iChecklist : lines.length;
    obj = lines
      .slice(iObj + 1, objEnd)
      .filter((l) => !/^\s*After\s+completing/i.test(l))
      .map((l) => l.trim())
      .filter(Boolean);
  }
  let checklist: string[] = [];
  if (iChecklist >= 0) {
    checklist = lines
      .slice(iChecklist + 1)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.replace(/^[●•\-\*]\s+/, '').replace(/^\d+[\.)]\s+/, ''));
  }
  return { description, parsedObjectives: obj, parsedChecklist: checklist };
}

export default function CleanImportForm({
  importType, // This will be "assignment"
  isLoading: isAppLoading = false, // Renamed
  // The rest of the props are accepted but not used
  modules = [],
  isLoadingModules = false,
  onRefreshModules,
  pages = [],
  isLoadingPages = false,
  discussions = [],
  isLoadingDiscussions = false,
  onRefreshDiscussions,
  assignments = [],
  isLoadingAssignments = false,
  onRefreshAssignments,
  baseUrl,
  courseId,
}: Props) {
  // Ref to the raw content textarea so we can control caret position on paste
  const rawContentRef = useRef<HTMLTextAreaElement | null>(null);

  const [formData, setFormData] = useState<ImportFormData>({
    title: "",
    rawContent: "",
    template: getDefaultTemplate(importType),
    published: false,
    // pointsPossible: 100, // Removed
  });

  // --- REMOVED ---
  // All state related to moduleNumber, courseName, videoTitle,
  // facultyName, instructorName, combinedModuleText,
  // filters, overwrite, etc. is gone.

  // --- NEW STATE for HTML Modal ---
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [showModal, setShowModal] = useState(false);
  const htmlTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Simplified state for the assignment form
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [showPreview, setShowPreview] = useState(false);


  const templates = getAvailableTemplates();
  
  // Simplified preview logic just for assignment
  const preview = useMemo(() => {
    if (!formData.rawContent.trim()) return "";
    return previewContent(formData.rawContent, "wfuAssignment", {
      title: assignmentTitle || "Assignment Title",
      assignmentTitle: assignmentTitle || "Assignment Title",
      // pointsPossible: formData.pointsPossible, // Removed
      baseUrl,
      courseId,
    });
  }, [
    formData.rawContent,
    // formData.pointsPossible, // Removed
    assignmentTitle,
    baseUrl,
    courseId,
  ]);

  const handleChange = (f: keyof ImportFormData, v: any) =>
    setFormData((p) => ({ ...p, [f]: v }));

  // Simplified submit validation
  const submitDisabled = useMemo(() => {
    if (isAppLoading) return true;
    if (
      !assignmentTitle.trim() ||
      !formData.rawContent.trim()
    ) {
      return true;
    }
    return false;
  }, [isAppLoading, formData.rawContent, assignmentTitle]);

  // --- UPDATED ---
  // This now generates HTML and shows the modal
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // 1. Build the context for the formatter
    const context: TemplateContext = {
      ...formData,
      title: assignmentTitle || "Assignment Title",
      assignmentTitle: assignmentTitle || "Assignment Title",
      baseUrl,
      courseId,
    };

    // 2. Generate the final HTML
    const finalHtml = formatContent(formData.rawContent, "wfuAssignment", context);
    
    // 3. Show the modal
    setGeneratedHtml(finalHtml);
    setShowModal(true);
  };

  // Convert rich HTML from clipboard
  // (This logic is fine, redacting for brevity)
  const htmlToPlainWithLinks = (html: string): string => {
    // ... same as your current file ...
    const container = document.createElement('div');
    container.innerHTML = html;
    const isBlock = (tag: string) => /^(P|DIV|LI|UL|OL|H1|H2|H3|H4|H5|H6|TR|BLOCKQUOTE)$/i.test(tag);
    let currentListDepth = 0;
    const lines: string[] = [];
    const serialize = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) { return (node as Text).data; }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.tagName === 'BR') return '\n';
        if (el.tagName === 'STRONG' || el.tagName === 'B' || (el.style && el.style.fontWeight && el.style.fontWeight !== 'normal' && el.style.fontWeight !== '400')) {
          const inner = serializeChildren(el); return inner ? `<strong>${inner}</strong>` : '';
        }
        if (el.tagName === 'EM' || el.tagName === 'I' || (el.style && el.style.fontStyle && el.style.fontStyle === 'italic')) {
          const inner = serializeChildren(el); return inner ? `<em>${inner}</em>` : '';
        }
        if (el.tagName === 'A') {
          const label = (el.textContent || '').trim(); const href = (el.getAttribute('href') || '').trim(); return href ? `${label} ${href}` : label;
        }
        if (el.tagName === 'OL') {
          currentListDepth++; const content = serializeChildren(el); currentListDepth--; return content;
        }
        if (el.tagName === 'UL') {
          currentListDepth++; const content = serializeChildren(el); currentListDepth--; return content;
        }
        if (el.tagName === 'LI') {
          const indent = '  '.repeat(Math.max(0, currentListDepth - 1));
          let text = '';
          for (let i = 0; i < el.childNodes.length; i++) { text += serialize(el.childNodes[i]); }
          const allLines = text.split('\n');
          const lines = allLines.filter(l => l.trim());
          if (lines.length === 0) return '';
          const mainText: string[] = [];
          const nestedBullets: string[] = [];
          for (const originalLine of allLines) {
            const trimmed = originalLine.trim(); if (!trimmed) continue;
            if (trimmed.startsWith('-')) { nestedBullets.push(originalLine); } else { mainText.push(trimmed); }
          }
          let result = `${indent}- ${mainText.join(' ')}\n`;
          if (nestedBullets.length > 0) { result += nestedBullets.join('\n') + '\n'; }
          return result;
        }
        if (isBlock(el.tagName)) {
          const content = serializeChildren(el).trim(); return content ? content + '\n' : '';
        }
        return serializeChildren(el);
      }
      return '';
    };
    const serializeChildren = (el: HTMLElement): string => {
      let text = '';
      for (let i = 0; i < el.childNodes.length; i++) { text += serialize(el.childNodes[i]); }
      return text;
    };
    let out = serialize(container);
    out = out.replace(/\r/g, '').replace(/\u00A0/g, ' ').replace(/\n{3,}/g, '\n\n');
    const outLines = out.split('\n');
    out = outLines.map(line => {
      const match = line.match(/^(\s*)(.*)/); if (!match) return line;
      const [, leadingSpaces, rest] = match;
      const collapsedRest = rest.replace(/[ ]{3,}/g, ' ');
      return leadingSpaces + collapsedRest;
    }).join('\n').trim();
    const rawLines = out.split(/\n/);
    const processed: string[] = [];
    for (let i = 0; i < rawLines.length; i++) {
      let line = rawLines[i];
      const t = line.trim();
      if (!t) { processed.push(line); continue; }
      if (/^<strong>[^<]+<\/strong>:\s*$/.test(t)) {
        line = t.replace(/^<strong>([^<]+)<\/strong>:\s*$/, '$1:');
        processed.push(line); continue;
      }
      if (/^<strong><strong>[^<]+<\/strong>:/.test(t)) {
        line = t.replace(/^<strong><strong>([^<]+)<\/strong>:(.*)/, '$1:$2');
        processed.push(line); continue;
      }
      processed.push(line);
    }
    return processed.join('\n');
  };

  const handlePasteRawContent = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    if (!html) {
      const plain = e.clipboardData.getData('text/plain');
      setFormData({ ...formData, rawContent: plain });
      return;
    }
    const parsed = htmlToPlainWithLinks(html);
    setFormData({ ...formData, rawContent: parsed });
  };

  // --- NEW ---
  // Function for the "Copy" button
  const copyToClipboard = () => {
    if (htmlTextareaRef.current) {
      htmlTextareaRef.current.select();
      document.execCommand('copy'); // Use execCommand for iframe compatibility
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 capitalize">
          Format {importType}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* This form is ONLY for assignments now */}
          
          <div>
            <label htmlFor="assignmentTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Assignment Title *
            </label>
            <input
              id="assignmentTitle"
              type="text"
              value={assignmentTitle}
              onChange={(e) => setAssignmentTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
              placeholder="Incident Response Plan"
            />
          </div>

          {/* --- REMOVED "Points Possible" field --- */}
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="rawContent"
                className="block text-sm font-medium text-gray-700"
              >
                Assignment Content * (Markdown)
              </label>
              <button
                type="button"
                onClick={() => setShowPreview((p) => !p)}
                className="text-sm text-canvas-blue"
              >
                {showPreview ? "Hide" : "Show"} Preview
              </button>
            </div>
            <div className={showPreview ? "grid grid-cols-2 gap-4" : ""}>
              <div>
                <textarea
                  id="rawContent"
                  ref={rawContentRef}
                  value={formData.rawContent}
                  onChange={(e) => handleChange("rawContent", e.target.value)}
                  onPaste={handlePasteRawContent}
                  rows={10}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-canvas-blue"
                  placeholder={`Paste assignment content here...`}
                />
              </div>
              {showPreview && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Preview:</div>
                  <div 
                    className="border border-gray-200 rounded-md p-3 bg-gray-50 text-sm max-h-80 overflow-y-auto"
                    // We render a plain text preview
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {preview || "Preview will appear here..."}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* --- REMOVED ---
            - Overwrite Checkbox
            - Overwrite Dropdown
            - Module Dropdown
            - "Set as Published" Checkbox
          --- */}
          
          <div className="pt-2">
            {/* --- UPDATED --- Button text changed */}
            <button
              type="submit"
              disabled={submitDisabled}
              className="w-full px-4 py-2 bg-canvas-blue text-white rounded-md disabled:opacity-50"
            >
              {isAppLoading ? `Generating...` : `Generate HTML`}
            </button>
          </div>
        </form>
      </div>

      {/* --- NEW HTML MODAL --- */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="relative mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Generated HTML</h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                1. Click "Copy HTML".<br/>
                2. Go to Canvas, create a new assignment.<br/>
                3. Click the <strong>&lt;/&gt;</strong> (HTML Editor) button.<br/>
                4. Paste this code into the editor.
              </p>
              <textarea
                ref={htmlTextareaRef}
                readOnly
                className="w-full h-64 p-2 border border-gray-300 rounded-md font-mono text-xs bg-gray-50"
                value={generatedHtml}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-canvas-blue text-white rounded-md"
                >
                  Copy HTML
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}