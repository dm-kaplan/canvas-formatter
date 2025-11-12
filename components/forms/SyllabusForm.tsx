"use client";
import React, { useState, useRef, useMemo, FormEvent } from "react";
import { formatContent, type TemplateType, type TemplateContext } from "@/lib/formatters";

export interface SyllabusFormData {
  title: string;
  rawContent: string;
  template: TemplateType;
  published: boolean;
  courseName?: string;
  courseCode?: string;
  instructorName?: string;
  instructorCredentials?: string;
  instructorEmail?: string;
  syllabusFileName?: string;
  syllabusFileUrl?: string; // This can be a Canvas file URL
}

// --- UPDATED ---
// Removed onSubmit prop
interface SyllabusFormProps {
  isLoading?: boolean;
  baseUrl?: string;
  courseId?: string;
}

// --- UPDATED ---
// Renamed isLoading, removed onSubmit
export default function SyllabusForm({ 
  isLoading: isAppLoading = false, 
  baseUrl = "", 
  courseId = "" 
}: SyllabusFormProps) {
  
  const [formData, setFormData] = useState<SyllabusFormData>({
    title: "",
    rawContent: "", // This form doesn't use rawContent, but it's part of the base type
    template: "wfuCourseSyllabus",
    published: false,
    courseName: "",
    courseCode: "",
    instructorName: "",
    instructorCredentials: "",
    instructorEmail: "",
    syllabusFileName: "",
    syllabusFileUrl: "",
  });

  // --- NEW STATE for HTML Modal ---
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [showModal, setShowModal] = useState(false);
  const htmlTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleChange = (f: keyof SyllabusFormData, v: any) =>
    setFormData((p) => ({ ...p, [f]: v }));

  // --- UPDATED ---
  // This now generates HTML and shows the modal
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // 1. Build the context for the formatter
    const context: TemplateContext = {
      ...formData,
      title: "Syllabus",
      baseUrl,
      courseId,
    };

    // 2. Generate the final HTML
    const finalHtml = formatContent(formData.rawContent, "wfuCourseSyllabus", context);
    
    // 3. Show the modal
    setGeneratedHtml(finalHtml);
    setShowModal(true);
  };

  const submitDisabled = useMemo(() => {
    if (isAppLoading) return true;
    if (
      !formData.courseName?.trim() || 
      !formData.instructorName?.trim() || 
      !formData.instructorEmail?.trim()
    ) {
      return true;
    }
    return false;
  }, [isAppLoading, formData]);

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
          Format Syllabus
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="courseNameCS" className="block text-sm font-medium text-gray-700 mb-1">
                Course Name *
              </label>
              <input
                id="courseNameCS"
                type="text"
                value={formData.courseName}
                onChange={(e) => handleChange("courseName", e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
                placeholder="Foundations of Disruptive Innovation"
              />
            </div>
            <div>
              <label htmlFor="courseCodeCS" className="block text-sm font-medium text-gray-700 mb-1">
                Course Code (optional)
              </label>
              <input
                id="courseCodeCS"
                type="text"
                value={formData.courseCode}
                onChange={(e) => handleChange("courseCode", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
                placeholder="CYB 720"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="instructorName" className="block text-sm font-medium text-gray-700 mb-1">
                  Instructor Name *
                </label>
                <input
                  id="instructorName"
                  type="text"
                  value={formData.instructorName}
                  onChange={(e) => handleChange("instructorName", e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
                  placeholder="First Last"
                />
              </div>
              <div>
                <label htmlFor="instructorCredentials" className="block text-sm font-medium text-gray-700 mb-1">
                  Instructor Credentials (optional)
                </label>
                <input
                  id="instructorCredentials"
                  type="text"
                  value={formData.instructorCredentials}
                  onChange={(e) => handleChange("instructorCredentials", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
                  placeholder="PhD, MBA"
                />
              </div>
            </div>
            <div>
              <label htmlFor="instructorEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Instructor Email *
              </label>
              <input
                id="instructorEmail"
                type="email"
                value={formData.instructorEmail}
                onChange={(e) => handleChange("instructorEmail", e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
                placeholder="name@wfu.edu"
              />
            </div>
            <div>
              <label htmlFor="syllabusFileName" className="block text-sm font-medium text-gray-700 mb-1">
                Syllabus File Name (optional)
              </label>
              <input
                id="syllabusFileName"
                type="text"
                value={formData.syllabusFileName}
                onChange={(e) => handleChange("syllabusFileName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
                placeholder="Course Syllabus.docx"
              />
            </div>
            <div>
              <label htmlFor="syllabusFileUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Syllabus File URL (optional)
              </label>
              <input
                id="syllabusFileUrl"
                type="text"
                value={formData.syllabusFileUrl}
                onChange={(e) => handleChange("syllabusFileUrl", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
                placeholder="Paste Canvas file URL here"
              />
               <p className="text-xs text-gray-500 mt-1">
                Go to Canvas Files, upload your syllabus, click it, and copy the URL from your browser.
              </p>
            </div>
          </div>
          
          {/* This template doesn't use rawContent, so no textarea */}

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
                2. Go to your Canvas course, click "Syllabus" in the navigation.<br/>
                3. Click "Edit" in the top right.<br/>
                4. Click the <strong>&lt;/&gt;</strong> (HTML Editor) button in the rich text editor.<br/>
                5. Paste this code into the editor and save.
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