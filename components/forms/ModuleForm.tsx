"use client";
import React, { useState, useMemo, FormEvent, useEffect, useRef } from "react";
import { formatContent, type TemplateType, type TemplateContext } from "@/lib/formatters";

export interface ModuleFormData {
  title: string;
  rawContent: string;
  template: TemplateType;
  moduleNumber?: string;
  courseName?: string;
  courseId?: string;
  combinedModuleText?: string;
  objectives?: string[];
  checklist?: string[];
}

interface CanvasModule {
  id: string;
  name: string;
  position: number;
}
// --- UPDATED ---
// Removed onSubmit prop
interface ModuleFormProps {
  isLoading?: boolean;
  baseUrl?: string;
  courseId?: string;
  modules?: CanvasModule[];
  isLoadingModules?: boolean;
  onRefreshModules?: () => Promise<void>;
}

function parseCombinedModuleInput(text: string) {
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

// --- UPDATED ---
// Renamed isLoading to isAppLoading, removed onSubmit
export default function ModuleForm({ 
  isLoading: isAppLoading = false, 
  baseUrl = "", 
  courseId = "", 
  modules = [], 
  isLoadingModules = false, 
  onRefreshModules 
}: ModuleFormProps) {
  const [formData, setFormData] = useState<ModuleFormData>({
    title: "",
    rawContent: "",
    template: "wfuModule",
    moduleNumber: "1",
    courseName: "",
    courseId: "",
    // courseCode: "", // Removed
    combinedModuleText: "",
  });
  // ...existing code...
  
  // --- REMOVED ---
  // All state related to overwrite, pages, and selectedModuleId is gone

  // --- NEW STATE for HTML Modal ---
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [showModal, setShowModal] = useState(false);
  const htmlTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleChange = (f: keyof ModuleFormData, v: any) =>
    setFormData((p) => ({ ...p, [f]: v }));

  // ...existing code...

  // --- REMOVED fetchPages and its useEffect ---

  // --- UPDATED ---
  // This now generates HTML and shows the modal instead of submitting
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = parseCombinedModuleInput(formData.combinedModuleText || "");
    
    // 1. Build the context for the formatter
    const context: TemplateContext = {
      ...formData,
      rawContent: parsed.description,
      objectives: parsed.parsedObjectives,
      checklist: parsed.parsedChecklist,
      title: `${formData.moduleNumber || "1"}.0 Overview`,
      baseUrl,
      courseId,
    };

    // 2. Generate the final HTML
    const finalHtml = formatContent(parsed.description, "wfuModule", context);
    
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 capitalize">
        Format Module Overview
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="moduleNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Module Number *
            </label>
            <select
              id="moduleNumber"
              value={formData.moduleNumber || "1"}
              onChange={e => handleChange("moduleNumber", e.target.value)}
              required
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
              value={formData.courseName || ""}
              onChange={e => handleChange("courseName", e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
              placeholder="Cybersecurity Fundamentals"
            />
          </div>
          <div>
            <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">
              Course ID *
            </label>
            <input
              id="courseId"
              type="text"
              value={formData.courseId || ""}
              onChange={e => handleChange("courseId", e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
              placeholder="e.g. 77056"
            />
          </div>
        </div>
        <div>
          <label htmlFor="combinedModuleText" className="block text-sm font-medium text-gray-700 mb-1">
            Combined Module Text *
          </label>
          <textarea
            id="combinedModuleText"
            value={formData.combinedModuleText}
            onChange={e => handleChange("combinedModuleText", e.target.value)}
            rows={10}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-canvas-blue"
            placeholder={"Paste the full module overview, objectives, and checklist here..."}
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

      {/* --- NEW HTML MODAL --- */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="relative mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white"
            onClick={e => e.stopPropagation()} // Prevent click inside modal from closing it
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Generated HTML</h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Click "Copy HTML".<br/>
                Go to a Canvas Page.<br/>
                Click the <strong>&lt;/&gt;</strong> (HTML Editor) button.<br/>
                Paste this code into the editor.
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
    </div>
  );
}