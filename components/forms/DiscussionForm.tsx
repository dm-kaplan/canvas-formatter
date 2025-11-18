"use client";
import React, { useState, useRef, useMemo, FormEvent, useEffect } from "react";
import {
  formatContent,
  type TemplateType,
  type TemplateContext,
} from "@/lib/formatters";

export interface DiscussionFormData {
  title: string;
  rawContent: string;
  template: TemplateType;
  overwrite?: boolean;
  discussionId?: string;
  moduleId?: string; // Keep this to match the interface
}

interface CanvasModule {
  id: string;
  name: string;
  position: number;
}

interface DiscussionFormProps {
  isLoading?: boolean;
  discussionId?: string;
  baseUrl?: string;
  courseId?: string;
  modules?: CanvasModule[];
  isLoadingModules?: boolean;
  onRefreshModules?: () => Promise<void>;
}

export default function DiscussionForm({
  isLoading: isAppLoading = false,
  discussionId,
  baseUrl = "",
  courseId = "",
  // unused but kept for compatibility
  modules = [],
  isLoadingModules = false,
  onRefreshModules,
}: DiscussionFormProps) {
  const rawContentRef = useRef<HTMLTextAreaElement | null>(null);

  const [formData, setFormData] = useState<DiscussionFormData>({
    title: "",
    rawContent: "",
    template: "wfuDiscussion",
    discussionId,
    overwrite: false,
    moduleId: undefined,
  });

  // NEW STATE for HTML Modal and Preview
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [showModal, setShowModal] = useState(false);
  const htmlTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [livePreviewHtml, setLivePreviewHtml] = useState("");

  // LIVE PREVIEW EFFECT (no more discussionTitle)
  useEffect(() => {
    const context: TemplateContext = {
      ...formData,
      baseUrl,
      courseId,
    };
    if (formData.rawContent.trim()) {
      setLivePreviewHtml(
        formatContent(formData.rawContent, "wfuDiscussion", context)
      );
    } else {
      setLivePreviewHtml("");
    }
  }, [formData.rawContent, baseUrl, courseId, formData.discussionId]);

  const handleChange = (f: keyof DiscussionFormData, v: any) =>
    setFormData((p) => ({ ...p, [f]: v }));

  const handlePasteRawContent = (
    e: React.ClipboardEvent<HTMLTextAreaElement>
  ) => {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    if (!html) {
      const plain = e.clipboardData.getData("text/plain");
      setFormData({ ...formData, rawContent: plain });
      return;
    }
    const parsed = htmlToPlainWithLinks(html);
    setFormData({ ...formData, rawContent: parsed });
  };

  // Discussion-specific HTML to plain/markdown logic
  const htmlToPlainWithLinks = (html: string): string => {
    const container = document.createElement("div");
    container.innerHTML = html;

    const isBlock = (tag: string) =>
      /^(P|DIV|LI|UL|OL|H1|H2|H3|H4|H5|H6|TR|BLOCKQUOTE)$/i.test(tag);

    let currentListDepth = 0;

    const serialize = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return (node as Text).data;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.tagName === "BR") return "\n";
        if (
          el.tagName === "STRONG" ||
          el.tagName === "B" ||
          (el.style &&
            el.style.fontWeight &&
            el.style.fontWeight !== "normal" &&
            el.style.fontWeight !== "400")
        ) {
          const inner = serializeChildren(el);
          return inner ? `**${inner}**` : "";
        }
        if (
          el.tagName === "EM" ||
          el.tagName === "I" ||
          (el.style && el.style.fontStyle === "italic")
        ) {
          const inner = serializeChildren(el);
          return inner ? `*${inner}*` : "";
        }
        if (el.tagName === "A") {
          const label = (el.textContent || "").trim();
          const href = (el.getAttribute("href") || "").trim();
          return href ? `${label} ${href}` : label;
        }
        if (el.tagName === "OL") {
          currentListDepth++;
          const content = serializeChildren(el);
          currentListDepth--;
          return content;
        }
        if (el.tagName === "UL") {
          currentListDepth++;
          const content = serializeChildren(el);
          currentListDepth--;
          return content;
        }
        if (el.tagName === "LI") {
          const indent = "  ".repeat(Math.max(0, currentListDepth - 1));
          let text = "";
          for (let i = 0; i < el.childNodes.length; i++) {
            text += serialize(el.childNodes[i]);
          }
          text = text.replace(/^\s+|\s+$/g, "");
          return `${indent}- ${text}\n`;
        }
        if (isBlock(el.tagName)) {
          const content = serializeChildren(el).trim();
          return content ? content + "\n" : "";
        }
        return serializeChildren(el);
      }
      return "";
    };

    const serializeChildren = (el: HTMLElement): string => {
      let text = "";
      for (let i = 0; i < el.childNodes.length; i++) {
        text += serialize(el.childNodes[i]);
      }
      return text;
    };

    let out = serialize(container);
    out = out
      .replace(/\r/g, "")
      .replace(/\u00A0/g, " ")
      .replace(/\n{3,}/g, "\n\n");

    const outLines = out.split("\n");
    out = outLines
      .map((line) => {
        const match = line.match(/^(\s*)(.*)/);
        if (!match) return line;
        const [, leadingSpaces, rest] = match;
        const collapsedRest = rest.replace(/[ ]{3,}/g, " ");
        return leadingSpaces + collapsedRest;
      })
      .join("\n")
      .trim();

    const rawLines = out.split(/\n/);
    const processed: string[] = [];
    for (let i = 0; i < rawLines.length; i++) {
      let line = rawLines[i];
      const t = line.trim();
      if (!t) {
        processed.push(line);
        continue;
      }
      // normalize headings like **Prompt**: or ****Prompt**:
      if (/^\*\*[^*]+\*\*:\s*$/.test(t)) {
        line = t.replace(/^\*\*([^*]+)\*\*:\s*$/, "$1:");
        processed.push(line);
        continue;
      }
      if (/^\*\*\*\*[^*]+\*\*:(.*)/.test(t)) {
        line = t.replace(/^\*\*\*\*([^*]+)\*\*:(.*)/, "$1:$2");
        processed.push(line);
        continue;
      }
      processed.push(line);
    }

    // FINAL CLEANUP: remove any leftover bare ** markers
    let result = processed.join("\n");
    result = result.replace(/\*{2,}/g, "");
    return result;
  };

  // Generate HTML and show the modal
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const context: TemplateContext = {
      ...formData,
      baseUrl,
      courseId,
    };

    const finalHtml = formatContent(formData.rawContent, "wfuDiscussion", context);

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
          Format Discussion
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Discussion Title field REMOVED on purpose */}

          <div>
            <label
              htmlFor="rawContent"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Discussion *
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
              placeholder="Paste or type the full discussion prompt, objectives, response instructions, criteria, and TIP..."
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

      {/* LIVE PREVIEW SECTION */}
      <div className="mt-8">
        <h3 className="text-md font-semibold text-gray-800 mb-2">
          Live Preview
        </h3>
        <div className="border border-gray-200 rounded bg-gray-50 p-4 overflow-x-auto">
          {livePreviewHtml ? (
            <div
              className="prose max-w-none"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: livePreviewHtml }}
            />
          ) : (
            <span className="text-gray-400">Nothing to preview yet.</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          This preview shows how your input will be formatted for Canvas. Check
          that all sections and lists appear as expected.
        </p>
      </div>

      {/* HTML MODAL */}
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
                Go to a Canvas Discussion.
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
