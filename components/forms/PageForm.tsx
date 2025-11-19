"use client";
import React, { useState, FormEvent, useEffect } from "react";
import { type TemplateType } from "@/lib/formatters";

export interface PageFormData {
  title: string;
  rawContent: string;
  overwritePageId?: string;
  moduleId?: string;
  canvasToken?: string;
  moduleNumber?: string; // NEW: module number for banner
}

interface CanvasModule {
  id: string;
  name: string;
  position: number;
}

interface PageFormProps {
  onSubmit: (d: PageFormData) => Promise<void>;
  isLoading?: boolean;
  modules?: CanvasModule[];
  isLoadingModules?: boolean;
  onRefreshModules?: () => Promise<void>;
  courseId?: string;
}

export default function PageForm({
  onSubmit,
  isLoading = false,
  modules = [],
  isLoadingModules = false,
  onRefreshModules,
  courseId,
}: PageFormProps) {
  const [formData, setFormData] = useState<PageFormData>({
    title: "",
    rawContent: "",
    overwritePageId: undefined,
    moduleId: undefined,
    canvasToken: "",
    moduleNumber: "",
  });

  const [canvasPages, setCanvasPages] = useState<any[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [pagesError, setPagesError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const handleChange = (field: keyof PageFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Fetch all Canvas pages for the dropdown, using courseId from props
  const fetchPages = async (cid?: string) => {
    const effectiveCourseId = cid || courseId;

    setDebugInfo(
      `fetchPages called with courseId=${
        effectiveCourseId || "[none]"
      }, token=${formData.canvasToken ? "[provided]" : "[none]"}`
    );
    setIsLoadingPages(true);
    setPagesError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_CANVAS_BASE_URL;
      if (!baseUrl || !effectiveCourseId) {
        setPagesError("Enter a Course ID to load pages.");
        setCanvasPages([]);
        setIsLoadingPages(false);
        return;
      }

      let url = `/api/pages?canvasBaseUrl=${encodeURIComponent(
        baseUrl
      )}&courseId=${encodeURIComponent(effectiveCourseId)}`;

      if (formData.canvasToken && formData.canvasToken.trim()) {
        url += `&canvasToken=${encodeURIComponent(
          formData.canvasToken.trim()
        )}`;
      }

      let data: any;
      try {
        const res = await fetch(url);
        data = await res.json();
        setDebugInfo((prev) => prev + `\nAPI response: ${JSON.stringify(data)}`);
      } catch (networkErr) {
        setPagesError(
          "Network error: Could not reach the server. Is the backend running?"
        );
        setDebugInfo((prev) => prev + `\nNetwork error: ${networkErr}`);
        setCanvasPages([]);
        setIsLoadingPages(false);
        return;
      }

      if (data.success) {
        setCanvasPages(data.data);
      } else {
        setPagesError(data.error || "Failed to load pages.");
        setCanvasPages([]);
      }
    } catch (err) {
      setPagesError(
        "Unexpected error: " +
          (err instanceof Error ? err.message : String(err))
      );
      setCanvasPages([]);
      setDebugInfo((prev) => prev + `\nUnexpected error: ${err}`);
    } finally {
      setIsLoadingPages(false);
    }
  };

  // Watch for courseId or canvasToken changes and fetch pages
  useEffect(() => {
    if (courseId) {
      fetchPages(courseId);
    } else {
      setCanvasPages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, formData.canvasToken]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    let finalRawContent = formData.rawContent;

    // If module number is provided, prepend the WFU SPS module banner
    if (formData.moduleNumber) {
      const moduleNumber = formData.moduleNumber;
      const bannerHtml = `<div class="grid-row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12" style="padding: 0px 0px 10px 0px;">
            <div class="WFU-SubpageHeader WFU-SubpageHeroModule${moduleNumber}">&nbsp;
                <div class="WFU-Banner-SchoolofProfessionalStudies">&nbsp;</div>
            </div>
        </div>
    </div>`;

      // Prepend the banner so it appears above the course title/content
      finalRawContent = `${bannerHtml}\n${formData.rawContent}`;
    }

    await onSubmit({
      ...formData,
      rawContent: finalRawContent,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 capitalize">
        Create Generic Page
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Page Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Page Title *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-canvas-blue"
            placeholder="Page Title"
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
            value={formData.moduleNumber || ""}
            onChange={(e) => handleChange("moduleNumber", e.target.value)}
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
            This will add the correct WFU SPS module banner above your course
            title in the page content.
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
            value={formData.rawContent}
            onChange={(e) => handleChange("rawContent", e.target.value)}
            rows={10}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-canvas-blue"
            placeholder="Enter page content..."
          />
        </div>

        {/* Canvas token + overwrite page */}
        <div className="space-y-2">
          <label
            htmlFor="canvasToken"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Canvas API Token (optional, for troubleshooting)
          </label>
          <input
            id="canvasToken"
            type="text"
            value={formData.canvasToken || ""}
            onChange={(e) => handleChange("canvasToken", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Paste your Canvas API token here (optional)"
            autoComplete="off"
          />

          <label
            htmlFor="overwritePageId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Overwrite existing page (optional)
          </label>
          <div className="flex items-center gap-2">
            <select
              id="overwritePageId"
              value={formData.overwritePageId || ""}
              onChange={(e) =>
                handleChange("overwritePageId", e.target.value || undefined)
              }
              disabled={isLoadingPages}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">-- None --</option>
              {canvasPages.map((p) => (
                <option key={p.url} value={p.url}>
                  {p.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => fetchPages(courseId)}
              disabled={isLoadingPages || !courseId}
              className="text-xs text-canvas-blue hover:underline disabled:opacity-50"
            >
              {isLoadingPages ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          {pagesError && (
            <div className="text-xs text-red-500 mt-1">{pagesError}</div>
          )}
          {debugInfo && (
            <pre className="text-xs text-gray-400 bg-gray-100 rounded p-2 mt-1 max-h-40 overflow-auto">
              {debugInfo}
            </pre>
          )}
        </div>

        {/* Canvas module selection */}
        <div className="space-y-2">
          <label
            htmlFor="moduleId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Canvas Module (Optional)
          </label>
          <select
            id="moduleId"
            value={formData.moduleId || ""}
            onChange={(e) =>
              handleChange("moduleId", e.target.value || undefined)
            }
            disabled={isLoadingModules}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">-- Choose --</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          {onRefreshModules && (
            <button
              type="button"
              onClick={onRefreshModules}
              disabled={isLoadingModules}
              className="text-xs text-canvas-blue hover:underline disabled:opacity-50 ml-2"
            >
              {isLoadingModules ? "Refreshing..." : "Refresh"}
            </button>
          )}
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-canvas-blue text-white rounded-md disabled:opacity-50"
          >
            {isLoading ? "Creating Page..." : "Create Page"}
          </button>
        </div>
      </form>
    </div>
  );
}
