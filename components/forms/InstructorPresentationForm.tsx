"use client";
import React, { useState, useRef, useMemo, FormEvent, useEffect } from "react";
// --- UPDATED ---
// Import formatContent and TemplateContext
import { previewContent, formatContent, type TemplateType, type TemplateContext } from "@/lib/formatters";

interface CanvasModule {
  id: string;
  name: string;
  position: number;
}

// --- UPDATED ---
// This is the data the form will collect
export interface InstructorPresentationFormData {
  title: string;
  rawContent: string;
  template: TemplateType;
  published: boolean;
  moduleNumber?: string;
  courseName?: string;
  videoTitle?: string;
}

// --- UPDATED ---
// Removed onSubmit prop, but kept the props from app/page.tsx
// to prevent build errors.
interface InstructorPresentationFormProps {
  isLoading?: boolean;
  modules?: CanvasModule[];
  isLoadingModules?: boolean;
  onRefreshModules?: () => void;
  baseUrl?: string;
  courseId?: string;
}

export default function InstructorPresentationForm({
  isLoading: isAppLoading = false, // Renamed to avoid conflict
  baseUrl = "",
  courseId = "",
  // We accept these props but will not use them
  modules,
  isLoadingModules,
  onRefreshModules
}: InstructorPresentationFormProps) {
  
  const [formData, setFormData] = useState<InstructorPresentationFormData>({
    title: "",
    rawContent: "",
    template: "wfuInstructorPresentation",
    published: false,
    moduleNumber: "1",
    courseName: "",
    videoTitle: "",
  });

  // ...existing code...
  const rawContentRef = React.useRef<HTMLTextAreaElement | null>(null);

  // --- REMOVED ---
  // All state related to overwrite, pages, and selectedModuleId is gone

  // --- NEW STATE for HTML Modal ---
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [showModal, setShowModal] = useState(false);
  const htmlTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleChange = (f: keyof InstructorPresentationFormData, v: any) =>
    setFormData((p) => ({ ...p, [f]: v }));

  // ...existing code...

  const submitDisabled = useMemo(() => {
    if (isAppLoading) return true;
    if (!formData.courseName?.trim() || !formData.videoTitle?.trim()) return true;
    return false;
  }, [isAppLoading, formData.courseName, formData.videoTitle]);

  // --- REMOVED fetchPages and its useEffect ---

  // --- UPDATED ---
  // This now generates HTML and shows the modal
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // 1. Build the context for the formatter
    const context: TemplateContext = {
      ...formData,
      title: `${formData.moduleNumber || "1"}.1 Instructor Presentation: ${formData.videoTitle || "Video Title"}`,
      baseUrl,
      courseId,
    };

    // 2. Generate the final HTML
    const finalHtml = formatContent(formData.rawContent, "wfuInstructorPresentation", context);
    
    // 3. Show the modal
    setGeneratedHtml(finalHtml);
    setShowModal(true);
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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="moduleNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Module Number *
          </label>
          <select
            id="moduleNumber"
            value={formData.moduleNumber}
            onChange={(e) => handleChange("moduleNumber", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <option key={i + 1} value={String(i + 1)}>
                Module {i + 1}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-1">
            Course Name *
          </label>
          <input
            id="courseName"
            type="text"
            value={formData.courseName}
            onChange={(e) => handleChange("courseName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
            placeholder="Foundations of Disruptive Innovation"
          />
        </div>
        <div>
          <label htmlFor="videoTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Video Title *
          </label>
          <input
            id="videoTitle"
            type="text"
            value={formData.videoTitle}
            onChange={(e) => handleChange("videoTitle", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
            placeholder="Disruptive Innovation in Fintech"
          />
        </div>
        <div>
          <div>
            <label htmlFor="rawContent" className="block text-sm font-medium text-gray-700">
              Video Summary
            </label>
            <textarea
              id="rawContent"
              ref={rawContentRef}
              value={formData.rawContent}
              onChange={(e) => handleChange("rawContent", e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-canvas-blue"
              placeholder="Video summary content (optional)..."
            />
          </div>
        </div>

        {/* --- REMOVED ---
          - Overwrite Checkbox
          - Overwrite Dropdown
          - Module Dropdown
        --- */}

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.published}
            onChange={e => handleChange("published", e.target.checked)}
            className="h-4 w-4 text-canvas-blue border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Set as Published</span>
        </label>
        
        <div>
          <button
            type="submit"
            disabled={submitDisabled}
            className="w-full px-4 py-2 bg-canvas-blue text-white rounded-md disabled:opacity-50"
          >
            {isAppLoading ? "Generating..." : "Generate HTML"}
          </button>
        </div>
      </form>

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
};