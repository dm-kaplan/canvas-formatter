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
  // Matches:
  //   Sunday, 11:59 p.m. ET
  //   Wednesday at 11:59 p.m. ET
  const re =
    /\b(Sunday|Saturday|Wednesday|Tuesday)\s*(?:,)?\s*(?:at\s*)?11:59\s*p\.m\.\s*ET\b/gi;
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
 * - Correct footer nesting (no closing </div> before footer block)
 * - Paragraph-aware description
 * - Objectives & checklist
 * - Discussion due dates nested under the Discussion item
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
  descText = descText
    .replace(/^\s*Module\s+Description\s*:?\s*/i, "")
    .trim();

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

  // Build checklist with special nesting for Discussion due dates
  let checklistItemsHtml: string[] = [];
  for (let i = 0; i < checklist.length; i++) {
    const item = checklist[i];

    const isDiscussion =
      /Discussion/i.test(item) ||
      /Participate in the Discussion/i.test(item);

    const next = checklist[i + 1] || "";
    const next2 = checklist[i + 2] || "";

    const isInitialPost = /^Initial post due by\b/i.test(next.trim());
    const isTwoReplies = /^Two reply posts due by\b/i.test(next2.trim());

    if (isDiscussion && isInitialPost && isTwoReplies) {
      checklistItemsHtml.push(
        `<li>${item}<ul><li>${next}</li><li>${next2}</li></ul></li>`
      );
      i += 2; // Skip the next two since we've consumed them
    } else {
      checklistItemsHtml.push(`<li>${item}</li>`);
    }
  }

  const checklistSection =
    checklistItemsHtml.length > 0
      ? `<h3>Module Checklist</h3>
            <ul>
                ${checklistItemsHtml.join("")}
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
 *
 * Takes a combined discussion text that includes:
 *  - Prompt:
 *  - This discussion aligns with the following module objective:
 *  - Response to Classmates:
 *  - Instructions:
 *  - Criteria for Success (Grading Rubric):
 *  - TIP:
 *
 * and restructures it into the exact HTML shape you specified.
 */
export function formatWFUDiscussion(
  content: string,
  context: TemplateContext = {}
): string {
  // Normalize line endings and trim
  let text = (content || "").replace(/\r\n/g, "\n").trim();

  // Remove stray markdown bold markers that may still be in the plain text
  // (we'll add our own bold TIP label later)
  text = text.replace(/\*{2,}/g, "");

  // Helper to find a label and return [labelStart, labelEnd] indexes
  const findLabel = (re: RegExp, from = 0): [number, number] | null => {
    const slice = text.slice(from);
    const m = slice.match(re);
    if (!m || m.index === undefined) return null;
    const start = from + m.index;
    const end = start + m[0].length;
    return [start, end];
  };

  // Label regexes (case-insensitive, flexible)
  const reAlign = /This discussion aligns with the following module objective[s]?:/i;
  const reResponse = /Response to Classmates\s*:/i;
  const reInstructions = /Instructions\s*:/i;
  const reCriteria = /Criteria for Success[^:]*:/i;
  const reTip = /TIP\s*:/i;

  const len = text.length;

  // Find label positions (in order of appearance in the text)
  const alignPos = findLabel(reAlign) ?? null;
  const responsePos = findLabel(reResponse) ?? null;
  const instructionsPos = findLabel(reInstructions) ?? null;
  const criteriaPos = findLabel(reCriteria) ?? null;
  const tipPos = findLabel(reTip) ?? null;

  // Helper to choose the earliest non-null index from a list
  const earliest = (...indices: Array<number | null>): number => {
    const valid = indices.filter(
      (i): i is number => i !== null && i >= 0
    );
    return valid.length ? Math.min(...valid) : len;
  };

  // PROMPT: from start up to the first label (align/response/instructions/criteria/tip)
  const firstLabelStart = earliest(
    alignPos ? alignPos[0] : null,
    responsePos ? responsePos[0] : null,
    instructionsPos ? instructionsPos[0] : null,
    criteriaPos ? criteriaPos[0] : null,
    tipPos ? tipPos[0] : null
  );
  const promptText = text.slice(0, firstLabelStart).trim();

  // OBJECTIVES: between "This discussion aligns..." and the next label
  let objectivesText = "";
  if (alignPos) {
    const start = alignPos[1]; // after the label
    const end = earliest(
      responsePos ? responsePos[0] : null,
      instructionsPos ? instructionsPos[0] : null,
      criteriaPos ? criteriaPos[0] : null,
      tipPos ? tipPos[0] : null
    );
    objectivesText = text.slice(start, end).trim();
  }

  // RESPONSE TO CLASSMATES
  let responseText = "";
  if (responsePos) {
    const start = responsePos[1];
    const end = earliest(
      instructionsPos ? instructionsPos[0] : null,
      criteriaPos ? criteriaPos[0] : null,
      tipPos ? tipPos[0] : null
    );
    responseText = text.slice(start, end).trim();
  }

  // INSTRUCTIONS
  let instructionsText = "";
  if (instructionsPos) {
    const start = instructionsPos[1];
    const end = earliest(
      criteriaPos ? criteriaPos[0] : null,
      tipPos ? tipPos[0] : null
    );
    instructionsText = text.slice(start, end).trim();
  }

  // CRITERIA
  let criteriaText = "";
  if (criteriaPos) {
    const start = criteriaPos[1];
    const end = earliest(tipPos ? tipPos[0] : null);
    criteriaText = text.slice(start, end).trim();
    // Strip a stray "(Grading Rubric)" line if it got pulled in
    criteriaText = criteriaText.replace(/^\(?Grading Rubric\)?:?\s*/i, "").trim();
  }

  // TIP
  let tipText = "";
  if (tipPos) {
    const start = tipPos[1];
    const end = len;
    tipText = text.slice(start, end).trim();
  }

  // Convert each block via markdown → HTML

  // Strip a leading "Prompt:" label so it doesn't duplicate our <h3>Prompt:</h3>
  let cleanedPrompt = promptText.replace(/^\s*Prompt\s*:?\s*/i, "").trim();
  const promptHtml = cleanedPrompt ? markdownToHtml(cleanedPrompt) : "";

  const objectiveHtml = objectivesText ? markdownToHtml(objectivesText) : "";
  const responseHtml = responseText ? markdownToHtml(responseText) : "";
  const instructionsHtml = instructionsText
    ? markdownToHtml(instructionsText)
    : "";
  const criteriaHtml = criteriaText ? markdownToHtml(criteriaText) : "";
  const tipHtml = tipText ? markdownToHtml(`**TIP:** ${tipText}`) : "";

  // Decide whether to use "objective" or "objectives" in the line
  const alignPlural = /objective[s]/i.test(text);

  const html = `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
    <h3>Prompt:</h3>
    ${promptHtml}
    ${
      objectiveHtml
        ? `<p>This discussion aligns with the following module objective${
            alignPlural ? "s" : ""
          }:</p>
    ${objectiveHtml}`
        : ""
    }
    <h3>Response to Classmates:</h3>
    ${responseHtml}
    <h3>Instructions:</h3>
    ${instructionsHtml}
    <h3>Criteria for Success (Grading Rubric):</h3>
    ${criteriaHtml}
    <hr />
    ${tipHtml}
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
 * WFU SPS Assignment page format
 *
 * Parses a standardized assignment block containing labels like:
 *  - Purpose:
 *  - Task:
 *  - Scenario:
 *  - Instructions:
 *  - Formatting Requirements:
 *  - Submission Instructions:
 *  - Criteria for Success (Grading Rubric):
 *
 * and turns them into structured headings + sections.
 */
export function formatWFUAssignment(
  content: string,
  context: TemplateContext = {}
): string {
  const title = context.title || "Assignment";

  // Normalize text
  let text = (content || "").replace(/\r\n/g, "\n").trim();
  // Strip leftover markdown bold markers – we’ll format via HTML
  text = text.replace(/\*{2,}/g, "");

  const len = text.length;

  const findLabel = (re: RegExp, from = 0): [number, number] | null => {
    const slice = text.slice(from);
    const m = slice.match(re);
    if (!m || m.index === undefined) return null;
    const start = from + m.index;
    const end = start + m[0].length;
    return [start, end];
  };

  const rePurpose = /Purpose\s*:/i;
  const reScenario = /Scenario\s*:/i;
  const reTask = /Task\s*:/i;
  const reInstructions = /Instructions\s*:/i;
  const reFormatting = /Formatting Requirements\s*:/i;
  const reSubmission = /Submission Instructions\s*:/i;
  const reCriteria = /Criteria for Success[^:]*:/i;

  const purposePos = findLabel(rePurpose);
  const scenarioPos = findLabel(reScenario);
  const taskPos = findLabel(reTask);
  const instructionsPos = findLabel(reInstructions);
  const formattingPos = findLabel(reFormatting);
  const submissionPos = findLabel(reSubmission);
  const criteriaPos = findLabel(reCriteria);

  const earliest = (...indices: Array<number | null>): number => {
    const valid = indices.filter(
      (i): i is number => i !== null && i >= 0
    );
    return valid.length ? Math.min(...valid) : len;
  };

  // PURPOSE
  let purposeText = "";
  if (purposePos) {
    const start = purposePos[1];
    const end = earliest(
      scenarioPos ? scenarioPos[0] : null,
      taskPos ? taskPos[0] : null,
      instructionsPos ? instructionsPos[0] : null,
      formattingPos ? formattingPos[0] : null,
      submissionPos ? submissionPos[0] : null,
      criteriaPos ? criteriaPos[0] : null
    );
    purposeText = text.slice(start, end).trim();
  }

  // SCENARIO
  let scenarioText = "";
  if (scenarioPos) {
    const start = scenarioPos[1];
    const end = earliest(
      taskPos ? taskPos[0] : null,
      instructionsPos ? instructionsPos[0] : null,
      formattingPos ? formattingPos[0] : null,
      submissionPos ? submissionPos[0] : null,
      criteriaPos ? criteriaPos[0] : null
    );
    scenarioText = text.slice(start, end).trim();
  }

  // TASK
  let taskText = "";
  if (taskPos) {
    const start = taskPos[1];
    const end = earliest(
      instructionsPos ? instructionsPos[0] : null,
      formattingPos ? formattingPos[0] : null,
      submissionPos ? submissionPos[0] : null,
      criteriaPos ? criteriaPos[0] : null
    );
    taskText = text.slice(start, end).trim();
  }

  // INSTRUCTIONS (we may merge Formatting Requirements into this)
  let instructionsText = "";
  if (instructionsPos) {
    const start = instructionsPos[1];
    const end = earliest(
      formattingPos ? formattingPos[0] : null,
      submissionPos ? submissionPos[0] : null,
      criteriaPos ? criteriaPos[0] : null
    );
    instructionsText = text.slice(start, end).trim();
  }

  // FORMATTING REQUIREMENTS – merged into Instructions if present
  let formattingText = "";
  if (formattingPos) {
    const start = formattingPos[1];
    const end = earliest(
      submissionPos ? submissionPos[0] : null,
      criteriaPos ? criteriaPos[0] : null
    );
    formattingText = text.slice(start, end).trim();
  }

  const combinedInstructionsText = [instructionsText, formattingText]
    .filter(Boolean)
    .join("\n\n");

  // SUBMISSION INSTRUCTIONS
  let submissionText = "";
  if (submissionPos) {
    const start = submissionPos[1];
    const end = earliest(criteriaPos ? criteriaPos[0] : null);
    submissionText = text.slice(start, end).trim();
  }

  // CRITERIA
  let criteriaText = "";
  if (criteriaPos) {
    const start = criteriaPos[1];
    const end = len;
    criteriaText = text.slice(start, end).trim();
    criteriaText = criteriaText.replace(/^\(?Grading Rubric\)?:?\s*/i, "").trim();
  }

  // --- PURPOSE HTML (intro <p> + <ul> of skills) ---
  let purposeIntroHtml = "";
  let purposeListHtml = "";

  if (purposeText) {
    const lines = purposeText
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);

    const intro = lines.shift() || "";
    const skills = lines;

    if (intro) {
      purposeIntroHtml = markdownToHtml(intro);
    }

    if (skills.length) {
      const items = skills
        .map((line) => {
          const liHtml = markdownToHtml(line).trim();
          const inner = liHtml.replace(/^<p>/i, "").replace(/<\/p>$/i, "");
          return `<li>${inner}</li>`;
        })
        .join("");
      purposeListHtml = `<ul>${items}</ul>`;
    }
  }

  // --- SCENARIO & TASK via markdown ---
  const scenarioHtml = scenarioText ? markdownToHtml(scenarioText) : "";
  const taskHtml = taskText ? markdownToHtml(taskText) : "";

      // --- INSTRUCTIONS ---
  let instructionsHtml = "";
  if (combinedInstructionsText) {
    // If author already used markdown list syntax, let markdown render it as-is
    const hasListSyntax = /^\s*(?:\d+\.|-|\*)\s+/m.test(combinedInstructionsText);

    if (hasListSyntax) {
      instructionsHtml = markdownToHtml(combinedInstructionsText);
    } else {
      // Otherwise: first line is an intro <p>, remaining lines form a nested list
      const lines = combinedInstructionsText
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean);

      const introLine = lines.shift() || "";
      let introBlock = "";
      if (introLine) {
        introBlock = markdownToHtml(introLine);
      }

      type InstrItem = { title: string; bullets: string[] };
      const items: InstrItem[] = [];
      let current: InstrItem | null = null;

      const isHeaderLine = (line: string) => {
        // Lines ending with ":" are clearly headers
        if (/:$/.test(line)) return true;
        // If it ends with sentence punctuation, treat as detail, not header
        if (/[.?!]\s*$/.test(line)) return false;
        // Short, non-sentence lines are likely section labels (e.g., "Incident Overview")
        return true;
      };

      for (const line of lines) {
        if (isHeaderLine(line)) {
          if (current) items.push(current);
          current = { title: line.replace(/:$/, "").trim(), bullets: [] };
        } else if (current) {
          current.bullets.push(line);
        } else {
          // No header yet, treat as a bullet under an implicit item
          current = { title: "", bullets: [line] };
        }
      }
      if (current) items.push(current);

      let listBlock = "";
      if (items.length) {
        const itemHtml = items
          .map((item) => {
            const titleHtml = item.title
              ? markdownToHtml(`**${item.title}**`).trim()
              : "";
            const cleanTitle = titleHtml
              .replace(/^<p>/i, "")
              .replace(/<\/p>$/i, "");

            let bulletsHtml = "";
            if (item.bullets.length) {
              const bullets = item.bullets
                .map((b) => {
                  const liHtml = markdownToHtml(b).trim();
                  const inner = liHtml
                    .replace(/^<p>/i, "")
                    .replace(/<\/p>$/i, "");
                  return `<li>${inner}</li>`;
                })
                .join("");
              bulletsHtml = `<ul>${bullets}</ul>`;
            }

            if (cleanTitle && bulletsHtml) {
              return `<li>${cleanTitle}<br />${bulletsHtml}</li>`;
            }
            if (cleanTitle) {
              return `<li>${cleanTitle}</li>`;
            }
            return bulletsHtml ? `<li>${bulletsHtml}</li>` : "";
          })
          .join("");

        listBlock = `<ol>${itemHtml}</ol>`;
      }

      instructionsHtml = `${introBlock}${listBlock ? "\n" + listBlock : ""}`;
    }
  }

  // --- SUBMISSION INSTRUCTIONS as <ul> ---
  let submissionHtml = "";
  if (submissionText) {
    const lines = submissionText
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length) {
      const items = lines
        .map((line) => {
          const liHtml = markdownToHtml(line).trim();
          const inner = liHtml.replace(/^<p>/i, "").replace(/<\/p>$/i, "");
          return `<li>${inner}</li>`;
        })
        .join("");
      submissionHtml = `<ul>${items}</ul>`;
    }
  }

  // --- CRITERIA as a bullet list ---
  let criteriaHtml = "";
  if (criteriaText) {
    const lines = criteriaText
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length) {
      const items = lines
        .map((line) => {
          const liHtml = markdownToHtml(line).trim();
          const inner = liHtml.replace(/^<p>/i, "").replace(/<\/p>$/i, "");
          return `<li>${inner}</li>`;
        })
        .join("");
      criteriaHtml = `<ul>${items}</ul>`;
    }
  }

  // --- Final HTML matching the desired assignment structure ---
  const html = `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
    <h2>${title}</h2>
    ${
      purposeIntroHtml || purposeListHtml
        ? `<h3>Purpose:</h3>
    ${purposeIntroHtml}
    ${purposeListHtml}`
        : ""
    }
    ${
      scenarioHtml
        ? `<h3>Scenario:</h3>
    ${scenarioHtml}`
        : ""
    }
    ${
      taskHtml
        ? `<h3>Task:</h3>
    ${taskHtml}`
        : ""
    }
    ${
      instructionsHtml
        ? `<h3>Instructions:</h3>
    ${instructionsHtml}`
        : ""
    }
    ${
      submissionHtml
        ? `<h3>Submission Instructions:</h3>
    ${submissionHtml}`
        : ""
    }
    ${
      criteriaHtml
        ? `<h3>Criteria for Success (Grading Rubric):</h3>
    ${criteriaHtml}`
        : ""
    }
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
