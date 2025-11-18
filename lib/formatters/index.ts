import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

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
  [key: string]: any;
}

export type TemplateType =
  | 'wfuModule'
  | 'wfuLearningMaterials'
  | 'wfuInstructorPresentation'
  | 'wfuDiscussion'
  | 'wfuAssignment'
  | 'wfuMeetFaculty'
  | 'wfuAssessmentOverview'
  | 'wfuCourseWelcome'
  | 'wfuCourseSyllabus';

// Ensure formatWFUCourseSyllabus is declared and exported
export function formatWFUCourseSyllabus(
  content: string,
  context: TemplateContext = {}
): string {
  const courseName = context.courseName || context.title || 'Course Name';
  const instructorName = context.instructorName || 'Instructor Name';
  const instructorCredentials =
    context.instructorCredentials || 'Adjunct Professor of Practice';
  const instructorEmail = context.instructorEmail || '';
  const syllabusFileName = context.syllabusFileName || 'Syllabus.docx';
  const office =
    context.office ||
    'By appointment via Zoom <a href="https://wakeforest-university.zoom.us" target="_blank" rel="noopener">https://wakeforest-university.zoom.us</a>';

  // Remove any accidental duplicate 'Adjunct Professor of Practice' in credentials
  let credentials = instructorCredentials.trim();
  if (credentials.toLowerCase().includes('adjunct professor of practice')) {
    credentials = credentials
      .replace(/,?\s*adjunct professor of practice\s*/i, '')
      .trim();
  }

  return `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
    <div class="grid-row">
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12" style="padding: 0px 0px 10px 0px;">
        <div class="WFU-SubpageHeader WFU-SubpageHeroGettingStarted">&nbsp;
          <div class="WFU-Banner-SchoolofProfessionalStudies">&nbsp;</div>
        </div>
      </div>
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
        <div class="WFU-Container-DarkText" style="padding: 0px 15px 0px 15px;">
          <h1 class="WFU-SubpageHeader">${courseName} (${context.courseCode || ''})</h1>
          <h2 class="WFU-SubpageSubheader">Course Syllabus</h2>
          <p><strong>Instructor:&nbsp;&nbsp;<span> &nbsp; </span>${instructorName}, ${credentials}</strong></p>
          <p><strong>Email:&nbsp;</strong><a href="mailto:${instructorEmail}">${instructorEmail}</a></p>
          <p><strong>Office Hours:&nbsp;</strong>${office}</p>
          <p><strong>Course Syllabus:&nbsp;</strong>${syllabusFileName}</p>
        </div>
      </div>
      <div class="grid-row">
        <div class="col-xs-12">
          <footer class="WFU-footer">This material is owned by Wake Forest University School of Professional Studies and is protected by U.S. copyright laws. All Rights Reserved.</footer>
        </div>
      </div>
    </div>`;
}

/**
 * Returns available Canvas formatter templates for UI selection
 */
export function getAvailableTemplates() {
  return [
    {
      id: 'wfuModule',
      label: 'WFU SPS Module Page',
      description:
        'Standard module landing page with overview, outcomes, and structure.',
    },
    {
      id: 'wfuLearningMaterials',
      label: 'WFU SPS Learning Materials Page',
      description: 'Structured page for readings, videos, and other resources.',
    },
    {
      id: 'wfuInstructorPresentation',
      label: 'WFU SPS Instructor Presentation',
      description: 'Page template for instructor video presentations.',
    },
    {
      id: 'wfuDiscussion',
      label: 'WFU SPS Discussion',
      description: 'Discussion prompt template aligned with SPS standards.',
    },
    {
      id: 'wfuAssignment',
      label: 'WFU SPS Assignment',
      description: 'Assignment description page matching SPS expectations.',
    },
    {
      id: 'wfuMeetFaculty',
      label: 'WFU SPS Meet Your Faculty',
      description: 'Introductory faculty bio page.',
    },
    {
      id: 'wfuAssessmentOverview',
      label: 'WFU SPS Assessment Overview',
      description: 'Overview page for course assessments.',
    },
    {
      id: 'wfuCourseWelcome',
      label: 'WFU SPS Course Welcome',
      description: 'Welcome page for the course home.',
    },
    {
      id: 'wfuCourseSyllabus',
      label: 'WFU SPS Syllabus Summary',
      description: 'High-level syllabus overview page.',
    },
  ];
}

/**
 * Simple Markdown→HTML helper with optional sanitization
 */
export function markdownToHtml(
  content: string,
  options: FormattingOptions = {}
): string {
  const { sanitize = true } = options;
  const rawHtml = marked(content || '');
  if (!sanitize) return rawHtml;
  return DOMPurify.sanitize(rawHtml);
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
 * WFU SPS Meet Your Faculty page format
 */
export function formatWFUMeetFaculty(
  content: string,
  context: TemplateContext = {}
): string {
  const facultyName = context.facultyName || context.instructorName || 'Faculty Name';
  const facultyBio =
    context.facultyBio || content || 'Faculty biography goes here.';
  const facultyImageNumber = context.facultyImageNumber || '1';

  const htmlBio = markdownToHtml(facultyBio);

  return `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
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
</div>`;
}

/**
 * WFU SPS Assessment Overview page format
 */
export function formatWFUAssessmentOverview(
  content: string,
  context: TemplateContext = {}
): string {
  const html = markdownToHtml(content);
  const courseName = context.courseName || context.title || 'Course Name';

  return `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
  <div class="grid-row">
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
      <div class="WFU-Container-DarkText" style="padding: 10px 15px 10px 15px;">
        <h1 class="WFU-SubpageHeader">${courseName}</h1>
        <h2 class="WFU-SubpageSubheader">Assessment Overview</h2>
        ${html}
      </div>
    </div>
  </div>
</div>`;
}

/**
 * WFU SPS Course Welcome page format
 */
export function formatWFUCourseWelcome(
  content: string,
  context: TemplateContext = {}
): string {
  const courseTitle = context.courseName || context.title || 'Course Title';
  const courseCode = context.courseCode || '';
  const html = markdownToHtml(content);

  return `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
  <div class="grid-row">
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
      <div class="WFU-Container-DarkText" style="padding: 10px 15px 10px 15px;">
        <h1 class="WFU-SubpageHeader">${courseTitle}${
    courseCode ? ` (${courseCode})` : ''
  }</h1>
        <h2 class="WFU-SubpageSubheader">Welcome to the Course</h2>
        ${html}
      </div>
    </div>
  </div>
</div>`;
}

/**
 * WFU SPS Module page format
 */
export function formatWFUModule(
  content: string,
  context: TemplateContext = {}
): string {
  const html = markdownToHtml(content);
  const courseName = context.courseName || context.title || 'Course Name';

  return `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
  <div class="grid-row">
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
      <div class="WFU-Container-DarkText" style="padding: 10px 15px 10px 15px;">
        <h1 class="WFU-SubpageHeader">${courseName}</h1>
        <h2 class="WFU-SubpageSubheader">Module Overview</h2>
        ${html}
      </div>
    </div>
  </div>
</div>`;
}

/**
 * WFU SPS Learning Materials page format
 */
export function formatWFULearningMaterials(
  content: string,
  context: TemplateContext = {}
): string {
  const html = markdownToHtml(content);
  const courseName = context.courseName || context.title || 'Course Name';

  return `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
  <div class="grid-row">
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
      <div class="WFU-Container-DarkText" style="padding: 10px 15px 10px 15px;">
        <h1 class="WFU-SubpageHeader">${courseName}</h1>
        <h2 class="WFU-SubpageSubheader">Learning Materials</h2>
        ${html}
      </div>
    </div>
  </div>
</div>`;
}

/**
 * WFU SPS Discussion page format
 */
export function formatWFUDiscussion(
  content: string,
  context: TemplateContext = {}
): string {
  const html = markdownToHtml(content);
  const title = context.title || 'Discussion';

  return `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
  <div class="grid-row">
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
      <div class="WFU-Container-DarkText" style="padding: 10px 15px 10px 15px;">
        <h1 class="WFU-SubpageHeader">${title}</h1>
        ${html}
      </div>
    </div>
  </div>
</div>`;
}

/**
 * WFU SPS Instructor Presentation video page format
 */
export function formatWFUInstructorPresentation(
  content: string,
  context: TemplateContext = {}
): string {
  const html = markdownToHtml(content);

  // Extract video title from context (e.g., "Introduction to Incident Management")
  const videoTitle = context.videoTitle || 'Video Title';

  return `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
    <div class="grid-row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <p class="WFU-SubpageHeader">${context.courseName || 'Course Name'}</p>
            <h2 class="WFU-SubpageSubheader">Instructor Presentation: ${videoTitle}</h2>
            <br />
            ${html}
            <div class="WFU-Container-LectureMedia">
                <div class="embed-responsive embed-responsive-16by9">
                    <!-- Video embed or iframe can go here -->
                    <p><em>Instructor presentation video will appear here.</em></p>
                </div>
            </div>
        </div>
    </div>
  </div>`;
}

/**
 * WFU SPS Assignment stub (to be implemented)
 */
export function formatWFUAssignment(
  content: string,
  context: TemplateContext = {}
): string {
  // TODO: Implement assignment formatting logic
  return '';
}
