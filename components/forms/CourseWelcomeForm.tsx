"use client";
import React, { useState, useRef, useMemo, FormEvent } from "react";
// --- UPDATED ---
// Import formatContent and TemplateContext
import { previewContent, formatContent, type TemplateType, type TemplateContext } from "@/lib/formatters";

export interface CourseWelcomeFormData {
  title: string;
  rawContent: string;
  template: TemplateType;
  published: boolean;
  courseName?: string;
  courseCode?: string;
  moduleTitles?: string[];
}

interface CanvasModule {
  id: string;
  name: string;
  position: number;
}
// --- UPDATED ---
// Removed onSubmit prop
interface CourseWelcomeFormProps {
  isLoading?: boolean;
  baseUrl?: string;
  courseId?: string;
  modules?: CanvasModule[]; // Kept to prevent build error, but not used
  isLoadingModules?: boolean; // Kept to prevent build error, but not used
  onRefreshModules?: () => Promise<void>; // Kept to prevent build error, but not used
}

// --- UPDATED ---
// Renamed isLoading, removed onSubmit
export default function CourseWelcomeForm({ 
  isLoading: isAppLoading = false, 
  baseUrl = "", 
  courseId = "", 
  modules = [], 
  isLoadingModules = false, 
  onRefreshModules 
}: CourseWelcomeFormProps) {
  const rawContentRef = useRef<HTMLTextAreaElement | null>(null);
  const [formData, setFormData] = useState<CourseWelcomeFormData>({
    title: "",
    rawContent: "",
    template: "wfuCourseWelcome",
    published: false,
    courseName: "",
    courseCode: "",
    moduleTitles: [],
  });
  const [moduleTitlesText, setModuleTitlesText] = useState("");
  // ...existing code...

  // --- REMOVED ---
  // overwrite and selectedModuleId state
  
  // --- NEW STATE for HTML Modal ---
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [showModal, setShowModal] = useState(false);
  const htmlTextareaRef = useRef<HTMLTextAreaElement | null>(null);


  // Sanitize input: remove all HTML tags and angle brackets
  const sanitizePlain = (input: string) => {
    // This logic is specific to this form, so we keep it.
    const container = document.createElement('div');
    container.innerHTML = input;
    let plain = container.textContent || container.innerText || '';
    plain = plain.replace(/[<>]/g, '');
    return plain;
  };

  const handleChange = (f: keyof CourseWelcomeFormData, v: any) => {
    if (f === 'rawContent') {
      setFormData((p) => ({ ...p, [f]: sanitizePlain(v) }));
    } else {
      setFormData((p) => ({ ...p, [f]: v }));
    }
  };

  const handlePasteRawContent = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    if (!html) {
      const plain = e.clipboardData.getData('text/plain');
      setFormData({ ...formData, rawContent: plain });
      return;
    }
    // Strip all HTML tags, keep only plain text, and remove any < or > characters
    const container = document.createElement('div');
    container.innerHTML = html;
    let plain = container.textContent || container.innerText || '';
    // Remove any remaining < and > characters
    plain = plain.replace(/[<>]/g, '');
    setFormData({ ...formData, rawContent: plain });
  };

  // --- UPDATED ---
  // This now generates HTML and shows the modal
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // 1. Build the context for the formatter
    const context: TemplateContext = {
      ...formData,
      rawContent: sanitizePlain(formData.rawContent),
      title: `Course Welcome`,
      moduleTitles: moduleTitlesText
        .split("\n")
        .map(t => t.trim())
        .filter(Boolean),
      baseUrl,
      courseId,
    };
    
    // 2. Generate the final HTML
    const finalHtml = formatContent(formData.rawContent, "wfuCourseWelcome", context);

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
          Course Welcome
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700 mb-1">
              Course Code *
            </label>
            <input
              id="courseCode"
              type="text"
              value={formData.courseCode || ""}
              onChange={e => handleChange("courseCode", e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
              placeholder="CYB 720"
            />
          </div>
          <div>
            <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-1">
              Course Title *
            </label>
            <input
              id="courseName"
              type="text"
              value={formData.courseName || ""}
              onChange={e => handleChange("courseName", e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
              placeholder="Foundations of Disruptive Innovation"
            />
          </div>
          <div>
            <label htmlFor="moduleTitlesText" className="block text-sm font-medium text-gray-700 mb-1">
              Module Titles (one per line, 8 required) *
            </label>
            <textarea
              id="moduleTitlesText"
              value={moduleTitlesText}
              onChange={e => setModuleTitlesText(e.target.value)}
              rows={8}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-canvas-blue"
              placeholder={"Introduction to Cybersecurity\nRisk Management\nIncident Response\nBusiness Continuity\nDisaster Recovery\nCrisis Communication\nTesting and Exercises\nCyber Resiliency"}
            />
            <p className="text-xs text-gray-500 mt-1">Enter exactly 8 module titles, one per line. These will appear as Module 1–8 links in the welcome page.</p>
          </div>
          <div>
            <label htmlFor="rawContent" className="block text-sm font-medium text-gray-700 mb-1">
              Course Description *
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
              placeholder="This course provides a comprehensive exploration of strategies and practices essential for responding to cybersecurity incidents and ensuring business continuity..."
            />
          </div>
          
          {/* --- REMOVED overwrite checkbox --- */}

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={e => handleChange("published", e.target.checked)}
              className="h-4 w-4 text-canvas-blue border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Set as Published</span>
          </label>
          {/* Canvas Module (Optional) removed for Course Welcome */}
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