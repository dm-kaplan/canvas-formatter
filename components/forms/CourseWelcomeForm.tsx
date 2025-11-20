"use client";
import React, { useState, useRef, FormEvent } from "react";
import {
  formatContent,
  type TemplateType,
  type TemplateContext,
} from "@/lib/formatters";

export interface CourseWelcomeFormData {
  title: string;
  rawContent: string;
  template: TemplateType;
  courseName?: string;
  courseCode?: string;
  moduleTitles?: string[];
}

interface CanvasModule {
  id: string;
  name: string;
  position: number;
}

// Kept for consistency with page.tsx props, though we only really use isLoading/baseUrl.
interface CourseWelcomeFormProps {
  isLoading?: boolean;
  baseUrl?: string;
  courseId?: string;
  modules?: CanvasModule[];
  isLoadingModules?: boolean;
  onRefreshModules?: () => Promise<void>;
}

export default function CourseWelcomeForm({
  isLoading: isAppLoading = false,
  baseUrl = "",
}: CourseWelcomeFormProps) {
  const rawContentRef = useRef<HTMLTextAreaElement | null>(null);

  const [formData, setFormData] = useState<CourseWelcomeFormData>({
    title: "",
    rawContent: "",
    template: "wfuCourseWelcome",
    courseName: "",
    courseCode: "",
    moduleTitles: [],
  });

  // Module titles (one per line, 8 lines)
  const [moduleTitlesText, setModuleTitlesText] = useState("");

  // Modal state for generated HTML
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [showModal, setShowModal] = useState(false);
  const htmlTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Sanitize input: remove all HTML tags and angle brackets
  const sanitizePlain = (input: string) => {
    const container = document.createElement("div");
    container.innerHTML = input;
    let plain = container.textContent || container.innerText || "";
    // remove any remaining < and >
    plain = plain.replace(/[<>]/g, "");
    return plain;
  };

  const handleChange = (field: keyof CourseWelcomeFormData, value: any) => {
    if (field === "rawContent") {
      setFormData((prev) => ({ ...prev, [field]: sanitizePlain(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handlePasteRawContent = (
    e: React.ClipboardEvent<HTMLTextAreaElement>
  ) => {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    if (!html) {
      const plain = e.clipboardData.getData("text/plain");
      setFormData((prev) => ({ ...prev, rawContent: plain }));
      return;
    }
    const container = document.createElement("div");
    container.innerHTML = html;
    let plain = container.textContent || container.innerText || "";
    plain = plain.replace(/[<>]/g, "");
    setFormData((prev) => ({ ...prev, rawContent: plain }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Build array from multi-line module titles
    const moduleTitles = moduleTitlesText
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

    const context: TemplateContext = {
      ...formData,
      rawContent: sanitizePlain(formData.rawContent),
      title: "Course Welcome",
      moduleTitles,
      baseUrl,
    };

    const finalHtml = formatContent(
      formData.rawContent,
      "wfuCourseWelcome",
      context
    );

    setGeneratedHtml(finalHtml);
    setShowModal(true);
  };

  const copyToClipboard = () => {
    if (htmlTextareaRef.current) {
      htmlTextareaRef.current.select();
      document.execCommand("copy");
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 capitalize">
          Course Welcome
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course code */}
          <div>
            <label
              htmlFor="courseCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Course Code *
            </label>
            <input
              id="courseCode"
              type="text"
              value={formData.courseCode || ""}
              onChange={(e) => handleChange("courseCode", e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
              placeholder="CYB 720"
            />
          </div>

          {/* Course title */}
          <div>
            <label
              htmlFor="courseName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Course Title *
            </label>
            <input
              id="courseName"
              type="text"
              value={formData.courseName || ""}
              onChange={(e) => handleChange("courseName", e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
              placeholder="Incident Management and Business Continuity"
            />
          </div>

          {/* Module titles */}
          <div>
            <label
              htmlFor="moduleTitlesText"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Module Titles (one per line, 8 required) *
            </label>
            <textarea
              id="moduleTitlesText"
              value={moduleTitlesText}
              onChange={(e) => setModuleTitlesText(e.target.value)}
              rows={8}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-canvas-blue"
              placeholder={
                "Foundations of Organizational Resilience and Risk Strategy\nIncident Detection and Executive Response Leadership\nCrisis Communication and Stakeholder Coordination\nBusiness Continuity Planning and Operational Recovery\nAI, Automation, and the Future of Incident Management\nRegulatory Compliance and Global Standards in Resilience\nEthics, Governance, and Executive Accountability\nReflection, Lessons Learned, and Capstone Simulation"
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter exactly 8 module titles, one per line. These will appear as
              &quot;Module 1: Title&quot;–&quot;Module 8: Title&quot;.
            </p>
          </div>

          {/* Course description */}
          <div>
            <label
              htmlFor="rawContent"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Course Description *
            </label>
            <textarea
              id="rawContent"
              ref={rawContentRef}
              value={formData.rawContent}
              onChange={(e) => handleChange("rawContent", e.target.value)}
              onPaste={handlePasteRawContent}
              rows={10}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-canvas-blue"
              placeholder="This course provides a comprehensive exploration of strategies and practices essential for responding to cybersecurity incidents and ensuring business continuity..."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isAppLoading}
              className="w-full px-4 py-2 bg-canvas-blue text-white rounded-md disabled:opacity-50"
            >
              {isAppLoading ? `Generating...` : `Generate HTML`}
            </button>
          </div>
        </form>
      </div>

      {/* HTML modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Generated HTML
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Click &quot;Copy HTML&quot;.
                <br />
                Go to a Canvas Page.
                <br />
                Click the <strong>&lt;/&gt;</strong> (HTML Editor) button.
                <br />
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
    </>
  );
}
