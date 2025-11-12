import { formatContent, type TemplateType, type TemplateContext } from "@/lib/formatters";
"use client";
import React, { useState, useRef, useMemo, FormEvent, useEffect } from "react";
// --- UPDATED ---
// Import formatContent and TemplateContext
import { previewContent, formatContent, type TemplateType, type TemplateContext } from "@/lib/formatters";

export interface AssessmentOverviewFormData {
  title: string;
  rawContent: string;
  template: TemplateType;
  courseName?: string;
}

interface CanvasModule {
  id: string;
  name: string;
  position: number;
}
// --- UPDATED ---
// Removed onSubmit prop
interface AssessmentOverviewFormProps {
  isLoading?: boolean;
  baseUrl?: string;
  courseId?: string;
  modules?: CanvasModule[];
  isLoadingModules?: boolean;
  onRefreshModules?: () => Promise<void>;
  onRefreshPages?: () => Promise<void>;
  pages?: any[];
  isLoadingPages?: boolean;
}

// --- UPDATED ---
// Renamed isLoading, removed onSubmit
export default function AssessmentOverviewForm({ 
  isLoading: isAppLoading = false, 
  baseUrl = "", 
  courseId = "", 
  modules = [], 
  isLoadingModules = false, 
  onRefreshModules, 
  onRefreshPages, 
  pages = [], 
  isLoadingPages = false 
}: AssessmentOverviewFormProps) {
  const rawContentRef = useRef<HTMLTextAreaElement | null>(null);
  const [formData, setFormData] = useState<AssessmentOverviewFormData>({
    title: "",
    rawContent: "",
    template: "wfuAssessmentOverview",
    courseName: "",
  });
  // ...existing code...
  
  // --- REMOVED ---
  // All state related to overwrite, pages, and selectedModuleId is gone
  
  // --- NEW STATE for HTML Modal ---
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [showModal, setShowModal] = useState(false);
  const htmlTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleChange = (f: keyof AssessmentOverviewFormData, v: any) =>
    setFormData((p) => ({ ...p, [f]: v }));

  // Clean Word HTML, strip comments/styles, and convert Markdown bold to <strong>
  const cleanWordHtml = (html: string): string => {
    // ... (This logic is fine, redacting for brevity) ...
    let cleaned = html.replace(/<!--([\s\S]*?)-->/g, '');
    cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, '');
    cleaned = cleaned.replace(/\s*mso-[^:]+:[^;"']+;?/gi, '');
    cleaned = cleaned.replace(/class="[^"]*Mso[^"]*"/gi, '');
    cleaned = cleaned.replace(/<font[^>]*>/gi, '').replace(/<\/font>/gi, '');
    cleaned = cleaned.replace(/<span[^>]*>\s*<\/span>/gi, '');
    cleaned = cleaned.replace(/<\/?[a-z]+:[^>]*>/gi, '');
    cleaned = cleaned.replace(/\s{2,}/g, ' ');
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return cleaned;
  };

  const handlePasteRawContent = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    if (!html) {
      const plain = e.clipboardData.getData('text/plain');
      setFormData({ ...formData, rawContent: plain });
      return;
    }
    const cleaned = cleanWordHtml(html);
    const parsed = htmlToPlainWithLinks(cleaned);
    setFormData({ ...formData, rawContent: parsed });
  };

  // --- Assessment Overview-specific HTML to plain/markdown logic ---
  const htmlToPlainWithLinks = (html: string): string => {
    // ... (This logic is fine, redacting for brevity) ...
    const container = document.createElement('div');
    container.innerHTML = html;

    const isBlock = (tag: string) => /^(P|DIV|LI|UL|OL|H1|H2|H3|H4|H5|H6|TR|BLOCKQUOTE)$/i.test(tag);
    let currentListDepth = 0;

    const serialize = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return (node as Text).data;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.tagName === 'BR') return '\n';
        if (el.tagName === 'STRONG' || el.tagName === 'B' || (el.style && el.style.fontWeight && el.style.fontWeight !== 'normal' && el.style.fontWeight !== '400')) {
          const inner = serializeChildren(el);
          return inner ? `**${inner}**` : '';
        }
        if (el.tagName === 'EM' || el.tagName === 'I' || (el.style && el.style.fontStyle === 'italic')) {
          const inner = serializeChildren(el);
          return inner ? `*${inner}*` : '';
        }
        if (el.tagName === 'A') {
          const label = (el.textContent || '').trim();
          const href = (el.getAttribute('href') || '').trim();
          return href ? `${label} ${href}` : label;
        }
        if (el.tagName === 'OL') {
          currentListDepth++;
          const content = serializeChildren(el);
          currentListDepth--;
          return content;
        }
        if (el.tagName === 'UL') {
          currentListDepth++;
          const content = serializeChildren(el);
          currentListDepth--;
          return content;
        }
        if (el.tagName === 'LI') {
          const indent = '  '.repeat(Math.max(0, currentListDepth - 1));
          let text = '';
          for (let i = 0; i < el.childNodes.length; i++) {
            text += serialize(el.childNodes[i]);
          }
          text = text.replace(/^\s+|\s+$/g, '');
          return `${indent}- ${text}\n`;
        }
        if (isBlock(el.tagName)) {
          const content = serializeChildren(el).trim();
          return content ? content + '\n' : '';
        }
        return serializeChildren(el);
      }
      return '';
    };

    const serializeChildren = (el: HTMLElement): string => {
      let text = '';
      for (let i = 0; i < el.childNodes.length; i++) {
        text += serialize(el.childNodes[i]);
      }
      return text;
    };

    let out = serialize(container);
    out = out.replace(/\r/g, '')
             .replace(/\u00A0/g, ' ')
             .replace(/\n{3,}/g, '\n\n');
    const outLines = out.split('\n');
    out = outLines.map(line => {
      const match = line.match(/^(\s*)(.*)/);
      if (!match) return line;
      const [, leadingSpaces, rest] = match;
      const collapsedRest = rest.replace(/[ ]{3,}/g, ' ');
      return leadingSpaces + collapsedRest;
    }).join('\n').trim();
    return out;
  };

  // --- REMOVED fetchPages and useEffect ---

  // --- UPDATED ---
  // This now generates HTML and shows the modal
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // 1. Build the context for the formatter
    const context: TemplateContext = {
      ...formData,
      title: `Overview of Assessments`,
      baseUrl,
      courseId,
    };
    
    // 2. Generate the final HTML
    const finalHtml = formatContent(formData.rawContent, "wfuAssessmentOverview", context);
    
    // 3. Show the modal
    setGeneratedHtml(finalHtml);
    setShowModal(true);
  };

  // ...existing code...

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
          Overview of Assessments
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-1">
              Course Name *
            </label>
            <input
              id="courseName"
              type="text"
              value={formData.courseName || ""}
              onChange={e => handleChange("courseName", e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
              placeholder="Cybersecurity Fundamentals"
            />
          </div>
          <div>
            <label htmlFor="rawContent" className="block text-sm font-medium text-gray-700 mb-1">
              Overview of Assessments *
            </label>
            <textarea
              id="rawContent"
              ref={rawContentRef}
              value={formData.rawContent}
              onChange={e => handleChange("rawContent", e.target.value)}
              onPaste={handlePasteRawContent}
              rows={10}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-canvas-blue"
              placeholder="Paste overview of assessments here..."
            />
          </div>

          {/* --- REMOVED ---
            - Overwrite Checkbox
            - Overwrite Dropdown
            - Module Dropdown
          --- */}

          {/* Removed 'Set as Published' checkbox */}
          
          <div className="pt-2">
            {/* --- UPDATED --- Button text changed */}
            <button
              type="submit"
              disabled={isAppLoading}
              className="w-full px-4 py-2 bg-canvas-blue text-white rounded-md disabled:opacity-50"
            >
              {isAppLoading ? `Generating...` : `Generate HTML`}
            </button>
          </div>
          {/* Preview removed */}
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
                2. Go to Canvas, create a new page.<br/>
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