"use client";

import React, { useState, FormEvent } from "react";

export interface PageFormData {
  title: string;
  rawContent: string;
  overwritePageId?: string;
  moduleId?: string;
  canvasToken?: string;
  moduleNumber?: string;
}

interface CanvasModule {
  id: string;
  name: string;
  position: number;
}

// Make all the extra props optional so page.tsx can still pass them,
// even though we don't use them here.
interface PageFormProps {
  onSubmit?: (d: PageFormData) => Promise<void>;
  isLoading?: boolean;
  modules?: CanvasModule[];
  isLoadingModules?: boolean;
  onRefreshModules?: () => Promise<void> | void;
  courseId?: string;
}

export default function PageForm({
  onSubmit,
  isLoading = false,
}: PageFormProps) {
  const [title, setTitle] = useState("");
  const [moduleNumber, setModuleNumber] = useState<string>("");
  const [rawContent, setRawContent] = useState("");
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"" | "copied" | "error">("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Build banner if a module number is selected
    let bannerHtml = "";
    if (moduleNumber) {
      bannerHtml = `<div class="grid-row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12" style="padding: 0px 0px 10px 0px;">
          <div class="WFU-SubpageHeader WFU-SubpageHeroModule${moduleNumber}">&nbsp;
            <div class="WFU-Banner-SchoolofProfessionalStudies">&nbsp;</div>
          </div>
        </div>
      </div>`;
    }

    // Wrap the content in the standard WFU container and prepend banner
    const finalHtml = `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
${bannerHtml}
${rawContent}
</div>`;

    setGeneratedHtml(finalHtml);
    setHasGenerated(true);
    setCopyStatus("");

    // If parent provided an onSubmit, pass the final HTML up as well
    if (onSubmit) {
      await onSubmit({
        title,
        rawContent: finalHtml,
        moduleNumber,
      });
    }
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Generic Page (with Module Banner)
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Page Title (optional for reference only) */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Page Title (optional)
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
            placeholder="Internal reference or Canvas page title"
          />
        </div>

        {/* Module Number dropdown (1–16) */}
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
            This controls the WFU banner class (WFU-SubpageHeroModuleX) above
            your content.
          </p>
        </div>

        {/* Page Content */}
        <div>
          <label
            htmlFor="rawContent"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Page Content *
          </label>
          <textarea
            id="rawContent"
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            rows={10}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-canvas-blue"
            placeholder="Paste or write the HTML body for this page..."
          />
          <p className="text-xs text-gray-500 mt-1">
            The module banner and WFU container will be added automatically.
          </p>
        </div>

        {/* Generate HTML */}
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

      {/* Output area */}
      {hasGenerated && (
        <div className="mt-6">
          <label
            htmlFor="generatedHtml"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Generated HTML
          </label>
          <textarea
            id="generatedHtml"
            value={generatedHtml}
            readOnly
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs bg-gray-50"
          />
          <div className="mt-2 flex items-center gap-2">
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
      )}
    </div>
  );
}
