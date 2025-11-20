"use client";

import React, { useState, FormEvent } from "react";

export interface PageFormData {
  courseTitle: string;
  pageTitle: string;
  moduleNumber: string;
  pageContent: string;
}

interface PageFormProps {
  isLoading?: boolean;
  baseUrl?: string;
  courseId?: string;
  modules?: any[];
  isLoadingModules?: boolean;
  onRefreshModules?: () => Promise<void> | void;
}

export default function PageForm({ isLoading = false }: PageFormProps) {
  const [courseTitle, setCourseTitle] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [moduleNumber, setModuleNumber] = useState("");
  const [pageContent, setPageContent] = useState("");

  const [generatedHtml, setGeneratedHtml] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"" | "copied" | "error">("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!moduleNumber || !courseTitle || !pageTitle || !pageContent) {
      // Basic guard; inputs are already required in the UI.
      return;
    }

    const finalHtml = `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
    <div class="grid-row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12" style="padding: 0px 0px 10px 0px;">
            <div class="WFU-SubpageHeader WFU-SubpageHeroModule${moduleNumber}">&nbsp;
                <div class="WFU-Banner-SchoolofProfessionalStudies">&nbsp;</div>
            </div>
        </div>
    </div>
    <div class="grid-row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <p class="WFU-SubpageHeader">${courseTitle}</p>
            <h2 class="WFU-SubpageSubheader">${pageTitle}</h2>
        </div>
    </div>
    <div class="grid-row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            ${pageContent}
        </div>
    </div>
    <div class="grid-row">
        <div class="col-xs-12">
            <footer class="WFU-footer">This material is owned by Wake Forest University and is protected by U.S. copyright laws. All Rights Reserved.</footer>
        </div>
    </div>
</div>`;

    setGeneratedHtml(finalHtml);
    setShowModal(true);
    setCopyStatus("");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch {
      setCopyStatus("error");
      setTimeout(() => setCopyStatus(""), 2000);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Format Generic Page
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Title */}
          <div>
            <label
              htmlFor="courseTitle"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Course Title *
            </label>
            <input
              id="courseTitle"
              type="text"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
              placeholder="Incident Management and Business Continuity"
            />
          </div>

          {/* Page Title */}
          <div>
            <label
              htmlFor="pageTitle"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Page Title *
            </label>
            <input
              id="pageTitle"
              type="text"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
              placeholder="Page Title"
            />
          </div>

          {/* Module Number dropdown */}
          <div>
            <label
              htmlFor="moduleNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Module Number *
            </label>
            <select
              id="moduleNumber"
              value={moduleNumber}
              onChange={(e) => setModuleNumber(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
            >
              <option value="">Select Module</option>
              {Array.from({ length: 16 }, (_, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  Module {i + 1}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Controls the WFU-SubpageHeroModuleX banner above the course title.
            </p>
          </div>

          {/* Page Content */}
          <div>
            <label
              htmlFor="pageContent"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Page Content *
            </label>
            <textarea
              id="pageContent"
              value={pageContent}
              onChange={(e) => setPageContent(e.target.value)}
              rows={10}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-canvas-blue"
              placeholder="Paste the HTML or rich text for the body of the page."
            />
            <p className="text-xs text-gray-500 mt-1">
              This content will appear in the third grid row inside the standard
              WFU layout.
            </p>
          </div>

          {/* Generate HTML button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-canvas-blue text-white rounded-md disabled:opacity-50"
            >
              {isLoading ? "Generating..." : "Generate HTML"}
            </button>
          </div>
        </form>
      </div>

      {/* Modal with generated HTML */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full mx-4">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated HTML</h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <textarea
                value={generatedHtml}
                readOnly
                rows={14}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs bg-gray-50"
              />
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1 text-xs rounded-md border border-gray-300 hover:bg-gray-100"
                >
                  Copy to Clipboard
                </button>
                {copyStatus === "copied" && (
                  <span className="text-xs text-green-600">Copied!</span>
                )}
                {copyStatus === "error" && (
                  <span className="text-xs text-red-600">
                    Unable to copy. You can still select and copy manually.
                  </span>
                )}
              </div>
            </div>
            <div className="px-4 py-3 border-t flex justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
