"use client";
import React, { useState, FormEvent } from "react";
import { formatContent, type TemplateType, type TemplateContext } from "@/lib/formatters";

export interface GenericPageFormData {
  title: string;
  rawContent: string;
  moduleNumber: string;
  courseName: string;
}

interface GenericPageFormProps {
  isLoading?: boolean;
}

const GenericPageForm: React.FC<GenericPageFormProps> = ({ isLoading = false }) => {
  const [formData, setFormData] = useState<GenericPageFormData>({
    title: "",
    rawContent: "",
    moduleNumber: "",
    courseName: "",
  });
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [showModal, setShowModal] = useState(false);
  const htmlTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const handleChange = (f: keyof GenericPageFormData, v: any) =>
    setFormData((p) => ({ ...p, [f]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const context: TemplateContext = {
      ...formData,
      title: formData.title,
      moduleNumber: formData.moduleNumber,
      courseName: formData.courseName,
    };
    const finalHtml = formatContent(formData.rawContent, "wfuCourseWelcome", context);
    setGeneratedHtml(finalHtml);
    setShowModal(true);
  };

  const copyToClipboard = () => {
    if (htmlTextareaRef.current) {
      htmlTextareaRef.current.select();
      document.execCommand('copy');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 capitalize">
        Format Generic Page
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Page Title *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={e => handleChange("title", e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
            placeholder="Page Title"
          />
        </div>
        <div>
          <label htmlFor="moduleNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Module Number *
          </label>
          <input
            id="moduleNumber"
            type="text"
            value={formData.moduleNumber}
            onChange={e => handleChange("moduleNumber", e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
            placeholder="Module Number"
          />
        </div>
        <div>
          <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-1">
            Course Name *
          </label>
          <input
            id="courseName"
            type="text"
            value={formData.courseName}
            onChange={e => handleChange("courseName", e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
            placeholder="Course Name"
          />
        </div>
        <div>
          <label htmlFor="rawContent" className="block text-sm font-medium text-gray-700 mb-1">
            Page Content *
          </label>
          <textarea
            id="rawContent"
            value={formData.rawContent}
            onChange={e => handleChange("rawContent", e.target.value)}
            rows={10}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-canvas-blue"
            placeholder="Enter page content..."
          />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-canvas-blue text-white rounded-md disabled:opacity-50"
          >
            {isLoading ? `Generating...` : `Generate HTML`}
          </button>
        </div>
      </form>
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
};

export default GenericPageForm;
