import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

export interface FormattingOptions {
  sanitize?: boolean;
  addWrappers?: boolean;
  includeMetadata?: boolean;
}

export interface TemplateContext {
  title?: string;
  courseName?: string;
  courseCode?: string;
  instructorName?: string;
  instructorCredentials?: string;
  instructorEmail?: string;
  syllabusFileName?: string;
  office?: string;
  facultyName?: string;
  facultyBio?: string;
  facultyImageNumber?: string;
  courseId?: string;
  moduleTitles?: string[];
  dueDate?: string;
  pointsPossible?: number;
  objectives?: string[];
  moduleNumber?: string;
  checklist?: string[];
  [key: string]: any;
}

export type TemplateType =
  | "wfuModule"
  | "wfuLearningMaterials"
  | "wfuInstructorPresentation"
  | "wfuDiscussion"
  | "wfuAssignment"
  | "wfuMeetFaculty"
  | "wfuAssessmentOverview"
  | "wfuCourseWelcome"
  | "wfuCourseSyllabus";

/**
 * Markdown → HTML helper with optional sanitization
 */
export function markdownToHtml(
  content: string,
  options: FormattingOptions = {}
): string {
  const { sanitize = true } = options;
  // marked is typed as string | Promise<string>, but we only use sync form
  const rawHtml = marked(content || "") as string;
  if (!sanitize) return rawHtml;
  return DOMPurify.sanitize(rawHtml);
}

/**
 * Render plain text into multiple <p>...</p> blocks.
 *
 * Heuristic:
 *  - If there are *blank* lines → split on blank lines.
 *  - Otherwise → split on single newlines.
 */
function renderParagraphsFromText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";

  const hasBlankLines = /\n\s*\n/.test(trimmed);
  const chunks = (hasBlankLines
    ? trimmed.split(/\n\s*\n/)
    : trimmed.split(/\n+/)
  )
    .map((p) => p.trim())
    .filter(Boolean);

  return chunks
    .map((para) => {
      const html = markdownToHtml(para);
      const m = html.match(/^<p>([\s\S]*)<\/p>$/i);
      return m ? `<p>${m[1]}</p>` : `<p>${html}</p>`;
    })
    .join("\n");
}

/**
 * Global post-processing:
 *  - Bold standard due dates
 *  - Link "Live Instructor-Led Sessions" only when preceded by "See the"
 */

function boldDueDates(html: string): string {
  const re =
    /\b(Sunday|Saturday|Wednesday|Tuesday),\s*11:59\s*p\.m\.\s*ET\b/gi;
  return html.replace(re, (match) => `<strong>${match}</strong>`);
}

function linkLiveInstructorSessions(
  html: string,
  context: TemplateContext = {}
): string {
  const courseId =
    context.courseId || context.courseID || context.courseid || context.course_id;
  if (!courseId) return html;

  const url = `https://wakeforest.instructure.com/courses/${courseId}/pages/live-instructor-led-sessions`;

  // Only link the phrase after "See the", e.g.:
  // "See the Live Instructor-Led Sessions page..."
  return html.replace(
    /See the Live Instructor-Led Sessions/g,
    `See the <a href="${url}" data-api-endpoint="${url}" data-api-returntype="Page">Live Instructor-Led Sessions</a>`
  );
}

function postProcessHtml(html: string, context: TemplateContext = {}): string {
  let out = html;
  out = boldDueDates(out);
  out = linkLiveInstructorSessions(out, context);
  return out;
}

/**
 * Helper: Wraps the given HTML in a generic container with WFU SPS classes
 */
export function wrapInWFUContainer(html: string): string {
  return `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
  <div class="grid-row">
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
      ${html}
    </div>
  </div>
</div>`;
}

/**
 * WFU SPS Syllabus summary / header block
 */
export function formatWFUCourseSyllabus(
  content: string,
  context: TemplateContext = {}
): string {
  const courseName = context.courseName || context.title || "Course Name";
  const instructorName = context.instructorName || "Instructor Name";
  const instructorCredentials =
    context.instructorCredentials || "Adjunct Professor of Practice";
  const instructorEmail = context.instructorEmail || "";
  const syllabusFileName = context.syllabusFileName || "Syllabus.docx";
  const office =
    context.office ||
    'By appointment via Zoom <a href="https://wakeforest-university.zoom.us" target="_blank" rel="noopener">https://wakeforest-university.zoom.us</a>';

  let credentials = instructorCredentials.trim();
  if (credentials.toLowerCase().includes("adjunct professor of practice")) {
    credentials = credentials
      .replace(/,?\s*adjunct professor of practice\s*/i, "")
      .trim();
  }

  const html = `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
    <div class="grid-row">
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12" style="padding: 0px 0px 10px 0px;">
        <div class="WFU-SubpageHeader WFU-SubpageHeroGettingStarted">&nbsp;
          <div class="WFU-Banner-SchoolofProfessionalStudies">&nbsp;</div>
        </div>
      </div>
    </div>
    <div class="grid-row">
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
        <div class="WFU-Container-DarkText" style="padding: 0px 15px 0px 15px;">
          <h1 class="WFU-SubpageHeader">${courseName} (${context.courseCode || ""})</h1>
          <h2 class="WFU-SubpageSubheader">Course Syllabus</h2>
          <p><strong>Instructor:&nbsp;&nbsp;<span> &nbsp; </span>${instructorName}, ${credentials}</strong></p>
          <p><strong>Email:&nbsp;</strong><a href="mailto:${instructorEmail}">${instructorEmail}</a></p>
          <p><strong>Office Hours:&nbsp;</strong>${office}</p>
          <p><strong>Course Syllabus:&nbsp;</strong>${syllabusFileName}</p>
        </div>
      </div>
    </div>
    <div class="grid-row">
      <div class="col-xs-12">
        <footer class="WFU-footer">This material is owned by Wake Forest University School of Professional Studies and is protected by U.S. copyright laws. All Rights Reserved.</footer>
      </div>
    </div>
  </div>`;

  return postProcessHtml(html, context);
}

/**
 * Returns available Canvas formatter templates for UI selection
 */
export function getAvailableTemplates() {
  return [
    {
      id: "wfuModule",
      label: "WFU SPS Module Page",
      description:
        "Standard module landing page with overview, outcomes, and structure.",
    },
    {
      id: "wfuLearningMaterials",
      label: "WFU SPS Learning Materials Page",
      description: "Structured page for readings, videos, and other resources.",
    },
    {
      id: "wfuInstructorPresentation",
      label: "WFU SPS Instructor Presentation",
      description: "Page template for instructor video presentations.",
    },
    {
      id: "wfuDiscussion",
      label: "WFU SPS Discussion",
      description: "Discussion prompt template aligned with SPS standards.",
    },
    {
      id: "wfuAssignment",
      label: "WFU SPS Assignment",
      description: "Assignment description page matching SPS expectations.",
    },
    {
      id: "wfuMeetFaculty",
      label: "WFU SPS Meet Your Faculty",
      description: "Introductory faculty bio page.",
    },
    {
      id: "wfuAssessmentOverview",
      label: "WFU SPS Assessment Overview",
      description: "Overview page for course assessments.",
    },
    {
      id: "wfuCourseWelcome",
      label: "WFU SPS Course Welcome",
      description: "Welcome page for the course home.",
    },
    {
      id: "wfuCourseSyllabus",
      label: "WFU SPS Syllabus Summary",
      description: "High-level syllabus overview page.",
    },
  ];
}

/**
 * WFU SPS Meet Your Faculty page format
 */
export function formatWFUMeetFaculty(
  content: string,
  context: TemplateContext = {}
): string {
  const facultyName =
    context.facultyName || context.instructorName || "Faculty Name";
  const facultyBio =
    context.facultyBio || content || "Faculty biography goes here.";
  const facultyImageNumber = context.facultyImageNumber || "1";

  const htmlBio = markdownToHtml(facultyBio);

  const html = `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
  <div class="grid-row">
    <div class="col-xs-12 col-sm-12 col-md-7 col-lg-7">
      <div class="WFU-Container-DarkText" style="padding: 10px 15px 10px 15px;">
        <h1 class="WFU-SubpageHeader">Meet Your Faculty</h1>
        <h2 class="WFU-SubpageSubheader">${facultyName}</h2>
        ${htmlBio}
      </div>
    </div>
    <div class="col-xs-12 col-sm-12 col-md-5 col-lg-5">
      <div class="WFU-Container-FacultyPhoto">
        <img src="https://sps-canvas-assets.wfu.edu/faculty/faculty-${facultyImageNumber}.jpg" alt="${facultyName}" class="img-responsive" />
      </div>
    </div>
  </div>
  <div class="grid-row">
    <div class="col-xs-12">
      <footer class="WFU-footer">This material is owned by Wake Forest University School of Professional Studies and is protected by U.S. copyright laws. All Rights Reserved.</footer>
    </div>
  </div>
</div>`;

  return postProcessHtml(html, context);
}

/**
 * WFU SPS Assessment Overview page format
 */
export function formatWFUAssessmentOverview(
  content: string,
  context: TemplateContext = {}
): string {
  const htmlContent = markdownToHtml(content);
  const courseName = context.courseName || context.title || "Course Name";

  const html = `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
  <div class="grid-row">
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
      <div class="WFU-Container-DarkText" style="padding: 10px 15px 10px 15px;">
        <h1 class="WFU-SubpageHeader">${courseName}</h1>
        <h2 class="WFU-SubpageSubheader">Assessment Overview</h2>
        ${htmlContent}
      </div>
    </div>
  </div>
  <div class="grid-row">
    <div class="col-xs-12">
      <footer class="WFU-footer">This material is owned by Wake Forest University School of Professional Studies and is protected by U.S. copyright laws. All Rights Reserved.</footer>
    </div>
  </div>
</div>`;

  return postProcessHtml(html, context);
}

/**
 * WFU SPS Course Welcome page format
 */
export function formatWFUCourseWelcome(
  content: string,
  context: TemplateContext = {}
): string {
  const courseTitle = context.courseName || context.title || "Course Title";
  const courseCode = context.courseCode || "";
  const htmlContent = markdownToHtml(content);

  const html = `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
  <div class="grid-row">
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
      <div class="WFU-Container-DarkText" style="padding: 10px 15px 10px 15px;">
        <h1 class="WFU-SubpageHeader">${courseTitle}${
    courseCode ? ` (${courseCode})` : ""
  }</h1>
        <h2 class="WFU-SubpageSubheader">Welcome to the Course</h2>
        ${htmlContent}
      </div>
    </div>
  </div>
  <div class="grid-row">
    <div class="col-xs-12">
      <footer class="WFU-footer">This material is owned by Wake Forest University School of Professional Studies and is protected by U.S. copyright laws. All Rights Reserved.</footer>
    </div>
  </div>
</div>`;

  return postProcessHtml(html, context);
}

/**
 * WFU SPS Module page format
 *
 * - Correct footer nesting: no closing </div> before the footer grid-row.
 * - Final structure matches your example exactly.
 */
export function formatWFUModule(
  content: string,
  context: TemplateContext = {}
): string {
  const courseName = context.courseName || context.title || "Course Name";

  // Try to infer module number from context
  let moduleNumber = context.moduleNumber;
  if (!moduleNumber && context.title) {
    const m = String(context.title).match(/^(\d+)/);
    if (m) moduleNumber = m[1];
  }
  if (!moduleNumber) moduleNumber = "1";

  // Remove leading "Module Description" label if it slipped into content
  let descText = content || "";
  descText = descText.replace(
    /^\s*Module\s+Description\s*:?\s*/i,
    ""
  ).trim();

  // Turn description into proper <p> paragraphs
  const descriptionHtml = renderParagraphsFromText(descText);

  // Objectives & checklist coming from the form
  let objectives = Array.isArray(context.objectives)
    ? [...context.objectives]
    : [];
  let checklist = Array.isArray(context.checklist)
    ? [...context.checklist]
    : [];

  // If "Module Checklist" accidentally ended up in objectives, split it out
  const checklistLabelIndex = objectives.findIndex((o) =>
    /^\s*Module\s+Checklist\b/i.test(o)
  );
  if (checklistLabelIndex !== -1) {
    const afterLabel = objectives.slice(checklistLabelIndex + 1);
    objectives = objectives.slice(0, checklistLabelIndex);
    if (!checklist.length) {
      checklist = afterLabel;
    }
  }

  const heroClass = `WFU-SubpageHeroModule${moduleNumber}`;

  const objectivesSection =
    objectives.length > 0
      ? `<h3>Module Objectives</h3>
            <p>After completing this module, you should be able to:</p>
            <ol>
                ${objectives.map((o) => `<li>${o}</li>`).join("")}
            </ol>`
      : "";

  const checklistSection =
    checklist.length > 0
      ? `<h3>Module Checklist</h3>
            <ul>
                ${checklist.map((item) => `<li>${item}</li>`).join("")}
            </ul>`
      : "";

  const html = `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
    <div class="grid-row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12" style="padding: 0px 0px 10px 0px;">
            <div class="WFU-SubpageHeader ${heroClass}">&nbsp;
                <div class="WFU-Banner-SchoolofProfessionalStudies">&nbsp;</div>
            </div>
        </div>
    </div>
    <div class="grid-row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <p class="WFU-SubpageHeader">${courseName}</p>
            <h2 class="WFU-SubpageSubheader">Module ${moduleNumber} Overview</h2>
            ${descriptionHtml}
            ${objectivesSection}
            ${checklistSection}
            <div class="grid-row">
                <div class="col-xs-12">
                    <footer class="WFU-footer">This material is owned by Wake Forest University and is protected by U.S. copyright laws. All Rights Reserved.</footer>
                </div>
            </div>
        </div>
    </div>
</div>`;

  return postProcessHtml(html, context);
}

/**
 * WFU SPS Learning Materials page format
 */
export function formatWFULearningMaterials(
  content: string,
  context: TemplateContext = {}
): string {
  const htmlContent = markdownToHtml(content);
  const courseName = context.courseName || context.title || "Course Name";

  const html = `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
  <div class="grid-row">
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
      <div class="WFU-Container-DarkText" style="padding: 10px 15px 10px 15px;">
        <h1 class="WFU-SubpageHeader">${courseName}</h1>
        <h2 class="WFU-SubpageSubheader">Learning Materials</h2>
        ${htmlContent}
      </div>
    </div>
  </div>
  <div class="grid-row">
    <div class="col-xs-12">
      <footer class="WFU-footer">This material is owned by Wake Forest University and is protected by U.S. copyright laws. All Rights Reserved.</footer>
    </div>
  </div>
</div>`;

  return postProcessHtml(html, context);
}

/**
 * WFU SPS Discussion page format
 */
export function formatWFUDiscussion(
  content: string,
  context: TemplateContext = {}
): string {
  const htmlContent = markdownToHtml(content);
  const title = context.title || "Discussion";

  const html = `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
  <div class="grid-row">
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
      <div class="WFU-Container-DarkText" style="padding: 10px 15px 10px 15px;">
        <h1 class="WFU-SubpageHeader">${title}</h1>
        ${htmlContent}
      </div>
    </div>
  </div>
  <div class="grid-row">
    <div class="col-xs-12">
      <footer class="WFU-footer">This material is owned by Wake Forest University and is protected by U.S. copyright laws. All Rights Reserved.</footer>
    </div>
  </div>
</div>`;

  return postProcessHtml(html, context);
}

/**
 * WFU SPS Instructor Presentation video page format
 */
export function formatWFUInstructorPresentation(
  content: string,
  context: TemplateContext = {}
): string {
  const htmlContent = markdownToHtml(content);
  const videoTitle = context.videoTitle || "Video Title";

  const html = `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
    <div class="grid-row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <p class="WFU-SubpageHeader">${context.courseName || "Course Name"}</p>
            <h2 class="WFU-SubpageSubheader">Instructor Presentation: ${videoTitle}</h2>
            <br />
            ${htmlContent}
            <div class="WFU-Container-LectureMedia">
                <div class="embed-responsive embed-responsive-16by9">
                    <!-- Video embed or iframe can go here -->
                    <p><em>Instructor presentation video will appear here.</em></p>
                </div>
            </div>
        </div>
    </div>
    <div class="grid-row">
      <div class="col-xs-12">
        <footer class="WFU-footer">This material is owned by Wake Forest University and is protected by U.S. copyright laws. All Rights Reserved.</footer>
      </div>
    </div>
  </div>`;

  return postProcessHtml(html, context);
}

/**
 * WFU SPS Assignment page format (basic)
 */
export function formatWFUAssignment(
  content: string,
  context: TemplateContext = {}
): string {
  const htmlContent = markdownToHtml(content);
  const title = context.title || "Assignment";

  const html = `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
    <div class="grid-row">
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
        <div class="WFU-Container-DarkText" style="padding: 10px 15px 10px 15px;">
          <h1 class="WFU-SubpageHeader">${title}</h1>
          ${htmlContent}
        </div>
      </div>
    </div>
    <div class="grid-row">
      <div class="col-xs-12">
        <footer class="WFU-footer">This material is owned by Wake Forest University and is protected by U.S. copyright laws. All Rights Reserved.</footer>
      </div>
    </div>
  </div>`;

  return postProcessHtml(html, context);
}

/**
 * Generic formatter entry point used by forms / API
 */
export function formatContent(
  rawContent: string,
  template?: TemplateType | null,
  context: TemplateContext = {},
  options: FormattingOptions = {}
): string {
  if (!template) {
    const baseHtml = markdownToHtml(rawContent, options);
    const wrapped = options.addWrappers
      ? wrapInWFUContainer(baseHtml)
      : baseHtml;
    return postProcessHtml(wrapped, context);
  }

  switch (template) {
    case "wfuModule":
      return formatWFUModule(rawContent, context);
    case "wfuLearningMaterials":
      return formatWFULearningMaterials(rawContent, context);
    case "wfuInstructorPresentation":
      return formatWFUInstructorPresentation(rawContent, context);
    case "wfuDiscussion":
      return formatWFUDiscussion(rawContent, context);
    case "wfuAssignment":
      return formatWFUAssignment(rawContent, context);
    case "wfuMeetFaculty":
      return formatWFUMeetFaculty(rawContent, context);
    case "wfuAssessmentOverview":
      return formatWFUAssessmentOverview(rawContent, context);
    case "wfuCourseWelcome":
      return formatWFUCourseWelcome(rawContent, context);
    case "wfuCourseSyllabus":
      return formatWFUCourseSyllabus(rawContent, context);
    default: {
      const baseHtml = markdownToHtml(rawContent, options);
      const wrapped = options.addWrappers
        ? wrapInWFUContainer(baseHtml)
        : baseHtml;
      return postProcessHtml(wrapped, context);
    }
  }
}
