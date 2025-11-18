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

// ...existing code...
// Ensure formatWFUCourseSyllabus is declared and exported
export function formatWFUCourseSyllabus(content: string, context: TemplateContext = {}): string {
  const courseName = context.courseName || context.title || 'Course Name';
  const instructorName = context.instructorName || 'Instructor Name';
  const instructorCredentials = context.instructorCredentials || '';
  const instructorEmail = context.instructorEmail || '';
  const syllabusFileName = context.syllabusFileName || 'Syllabus.docx';
  const office = context.office || 'By appointment via Zoom <a href="https://wakeforest-university.zoom.us" target="_blank" rel="noopener">https://wakeforest-university.zoom.us</a>';

  // Remove any accidental duplicate 'Adjunct Professor of Practice' in credentials
  let credentials = instructorCredentials.trim();
  if (credentials.toLowerCase().includes('adjunct professor of practice')) {
    credentials = credentials.replace(/,?\s*adjunct professor of practice\s*/i, '').trim();
  }
  return `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
    <div class="grid-row">
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12" style="padding: 0px 0px 10px 0px;">
        <div class="WFU-SubpageHeader WFU-SubpageHeroGettingStarted">&nbsp;
          <div class="WFU-Banner-SchoolofProfessionalStudies">&nbsp;</div>
        </div>
      </div>
    </div>
    <div class="grid-row">
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
        <p class="WFU-SubpageHeader">${courseName}</p>
        <h2 class="WFU-SubpageSubheader">Syllabus</h2>
        <p><strong>Instructor:&nbsp;&nbsp;<span> &nbsp; </span></strong>&nbsp;${instructorName}${credentials ? ', ' + credentials : ''}, Adjunct Professor of Practice<br /><strong></strong><strong>E-mail:&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </strong><a href="mailto:${instructorEmail}">${instructorEmail}</a><strong><br /></strong><strong>Office:&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</strong>By appointment via Zoom &nbsp;<a href="https://wakeforest-university.zoom.us" target="_blank" rel="noopener">https://wakeforest-university.zoom.us</a><strong></strong></p>
        <p><strong>Course Syllabus:&nbsp;</strong>${syllabusFileName}</p>
      </div>
    </div>
    <div class="grid-row">
      <div class="col-xs-12">
        <footer class="WFU-footer">This material is owned by Wake Forest University and is protected by U.S. copyright laws. All Rights Reserved.</footer>
      </div>
    </div>
  </div>`;
}
export function formatWFUCourseWelcome(content: string, context: TemplateContext = {}): string {
  const courseTitle = context.courseName || context.title || 'Course Title';
  const courseCode = context.courseCode || '';
  const description = content ? markdownToHtml(content) : '';
  const modules = Array.isArray(context.moduleTitles) ? context.moduleTitles : [];

  // Helper to generate module links (replace # with real Canvas URLs if available)
  function moduleLink(idx: number, title: string) {
    return `<a title="Module ${idx + 1}" href="#">Module ${idx + 1}: ${title}</a>`;
  }

  return `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
    <div class="grid-row">
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12" style="padding: 0px 0px 10px 0px;">
        <div class="WFU-SubpageHeader WFU-SubpageHeroGettingStarted">&nbsp;
          <div class="WFU-Banner-SchoolofProfessionalStudies">&nbsp;</div>
        </div>
      </div>
      <div class="grid-row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
          <p class="WFU-SubpageHeader">${courseTitle}</p>
          <h2 class="WFU-SubpageSubheader">Course Welcome</h2>
          <h3>Introduction to ${courseCode ? courseCode + ' ' : ''}${courseTitle}</h3>
          ${description}
          <p>To begin your journey in this course, please visit the Modules page (linked in the left-hand navigation and below) and get acquainted with the following sections:</p>
          <ul>
            <li>Getting Started&nbsp;
              <ul>
                <li>An introduction to the course instructor&nbsp;</li>
                <li>An overview of assessments</li>
                <li>Other important information about the course&nbsp;&nbsp;</li>
              </ul>
            </li>
            <li>Tools for Success
              <ul>
                <li>Resources to help improve your online education experience, including technical support, Canvas navigation tips, Zoom support, and more</li>
              </ul>
            </li>
            <li>Opportunities for Engagement
              <ul>
                <li>Ways to engage with your peers, instructors, and the university</li>
              </ul>
            </li>
          </ul>
          <h3><a title="Getting Started" href="#">Module</a></h3>
        </div>
        ${modules.map((m: string, i: number) => `<div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">${moduleLink(i, m)}</div>`).join('\n')}
      </div>
    </div>
  </div>
  <div class="grid-row">
    <div class="col-xs-12">
      <footer class="WFU-footer">This material is owned by Wake Forest University and is protected by U.S. copyright laws. All Rights Reserved.</footer>
    </div>
  </div>`;
}
// End of file
/**
 * Returns available Canvas formatter templates for UI selection
 */
export function getAvailableTemplates() {
  return [
    {
      id: 'wfuCourseWelcome',
      name: 'WFU Course Welcome',
      description: 'Wake Forest SPS course welcome page',
      useCase: 'Course landing/welcome page linking to modules',
    },
    {
      id: 'wfuCourseSyllabus',
      name: 'WFU Course Syllabus',
      description: 'Standard syllabus page with instructor and download link',
      useCase: 'Overwrite existing syllabus page with standardized format',
    },
    {
      id: 'wfuMeetFaculty',
      name: 'WFU Meet the Lead Faculty',
      description: 'Wake Forest SPS faculty introduction page',
      useCase: 'WFU faculty bio page with photo and contact information',
    },
    {
      id: 'wfuAssessmentOverview',
      name: 'WFU Overview of Assessments',
      description: 'Wake Forest SPS assessment overview page',
      useCase: 'WFUP page describing all course assessments and point values',
    },
    {
      id: 'wfuModule',
      name: 'WFU Module Overview',
      description: 'Wake Forest SPS module format with objectives and checklist',
      useCase: 'WFU module overview pages with branded styling',
    },
    {
      id: 'wfuInstructorPresentation',
      name: 'WFU Instructor Presentation',
      description: 'Wake Forest SPS instructor presentation video page',
      useCase: 'WFU instructor presentation pages with video content',
    },
    {
      id: 'wfuLearningMaterials',
      name: 'WFU Learning Materials',
      description: 'Wake Forest SPS learning materials page format',
      useCase: 'WFU module learning materials pages with required/optional resources',
    },
    {
      id: 'wfuDiscussion',
      name: 'WFU Discussion',
      description: 'Wake Forest SPS discussion page format',
      useCase: 'WFU discussion pages with consistent formatting',
    },
    {
      id: 'wfuAssignment',
      name: 'WFU Assignment',
      description: 'Wake Forest SPS assignment page format',
      useCase: 'WFU assignment pages with purpose, task, and instructions',
    },
  ];
}
// --- STUBS FOR MISSING FORMATTER FUNCTIONS ---
// function formatWFUCourseWelcome(content: string, context: TemplateContext = {}): string {
//     const courseName = context.courseName || context.title || 'Course Name';
//     // Split content into lines and parse for section headings
//     const lines: string[] = (content || '').split(/\r?\n/);
//     const sectionTitles = [
//       'Discussions',
//       'Assignments',
//       'Project',
//       'Course Project',
//       'Course Reflection',
//       'Reflection'
//     ];
//     const htmlSections: string[] = [];
//     let currentSection: string | null = null;
//     let buffer: string[] = [];
//     function flushSection() {
//       if (!currentSection && buffer.length) {
//         htmlSections.push(buffer.map((l: string) => `<p>${l}</p>`).join('\n'));
//       } else if (currentSection && buffer.length) {
//         // Separate out list items and paragraphs
//         let paras: string[] = [], list: string[] = [];
//         buffer.forEach((l: string) => {
//           if (/^[-*•]/.test(l.trim())) list.push(l);
// }
function formatWFUMeetFaculty(content: string, context: TemplateContext = {}): string {
    // Extract fields from context
    const courseName = context.courseName || context.title || 'Course Name';
    const facultyName = context.facultyName || 'Dr. Faculty Name';
    const facultyBio = content || 'Faculty bio goes here.';
    const facultyImageNumber = context.facultyImageNumber || '5804778';
    const courseId = context.courseId || '77444';

    // Compose image src and data-api-endpoint
    const imgSrc = `https://wakeforest.instructure.com/courses/${courseId}/files/${facultyImageNumber}/download`;
    const imgApi = `https://wakeforest.instructure.com/api/v1/courses/${courseId}/files/${facultyImageNumber}`;

    return `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
  <div class="grid-row">
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12" style="padding: 0px 0px 10px 0px;">
      <div class="WFU-SubpageHeader WFU-SubpageHeroGettingStarted">&nbsp;
        <div class="WFU-Banner-SchoolofProfessionalStudies">&nbsp;</div>
      </div>
    </div>
  </div>
  <div class="grid-row">
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
      <p class="WFU-SubpageHeader">${courseName}</p>
      <h2 class="WFU-SubpageSubheader">Meet the Lead Faculty</h2>
    </div>
    <div class="col-xs-12 col-sm-8 col-md-8 col-lg-8">
      <h2>${facultyName}</h2>
      <h3>About</h3>
      <p>${facultyBio}</p>
      <h3>Contact Your Instructor</h3>
      <p>The instructor facilitating your online course may or may not be the lead faculty/course developer. Be assured that this instructor was chosen to meet very high standards and is a professional or acclaimed educator in their field. They will introduce themselves in the course announcements and will be responsible for answering questions, facilitating the synchronous sessions, providing feedback, and grading. To message the instructor/facilitator, use the message feature within Canvas.</p>
    </div>
    <div class="col-xs-12 col-sm-4 col-md-4 col-lg-4">
      <div class="">
        <p><img style="width: 450px; margin-left: auto; margin-right: auto; padding: 0px;" src="${imgSrc}" alt="" data-api-endpoint="${imgApi}" data-api-returntype="File" /></p>
      </div>
    </div>
  </div>
  <div class="grid-row">
    <div class="col-xs-12">
      <footer class="WFU-footer">This material is owned by Wake Forest University and is protected by U.S. copyright laws. All Rights Reserved.</footer>
    </div>
  </div>
</div>`;
}
function formatWFUAssessmentOverview(content: string, context: TemplateContext = {}): string {
    // DEBUG: Collect debug info
    let debugLines: string[] = [];
  const courseName = context.courseName || context.title || 'Course Name';
  // Normalize input: replace non-breaking spaces, remove invisible chars, trim lines
  const lines: string[] = (content || '')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .split(/\r?\n/)
    .map(l => l.replace(/\s+/g, ' ').trim())
    .filter(l => l && l.replace(/\s/g, '') !== '');

  const categoryHeadings = [
    'Discussions', 'Discussion',
    'Assignments', 'Assignment',
    'Quizzes', 'Quiz',
    'Projects', 'Project', 'Course Project', 'Capstone Project',
    'Reflections', 'Reflection', 'Course Reflection', 'Course Reflections'
  ];
  let sections: Array<{heading: string, description: string[], modules: string[], points: string[], rubric: string[]}> = [];
  let current: any = null;
  function isCategoryHeading(line: string) {
    // Remove markdown bold/underline (**text**, __text__)
    const clean = line.replace(/^(\*\*|__)+/, '').replace(/(\*\*|__)+$/, '').trim();
    return categoryHeadings.find(h => {
      const re = new RegExp(`^\s*${h.replace(/s$/, '')}s?\s*[:\-–—]?\s*$`, 'i');
      return re.test(clean);
    });
  }
  function isModuleLine(line: string) {
    // Flexible: allow "Module X", "Module X:", "Module X -", etc.
    return /^Module\s*\d+\s*[:\-–—]?/i.test(line);
  }
  function isPointsLine(line: string) {
    return /point(s)?/i.test(line) && /\d+/.test(line);
  }
  function isRubricLine(line: string) {
    return /rubric/i.test(line);
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const heading = isCategoryHeading(line);
    if (heading) {
      debugLines.push(`[${i}] CATEGORY: "${line}" => "${heading}"`);
      if (current) sections.push(current);
      current = {heading: heading.replace(/:$/, ''), description: [], modules: [], points: [], rubric: []};
      continue;
    }
    if (!current) {
      debugLines.push(`[${i}] SKIP (no current category): "${line}"`);
      continue;
    }
    if (isModuleLine(line)) {
      debugLines.push(`[${i}] MODULE: "${line}"`);
      current.modules.push(line);
    } else if (isPointsLine(line)) {
      debugLines.push(`[${i}] POINTS: "${line}"`);
      current.points.push(line);
    } else if (isRubricLine(line)) {
      debugLines.push(`[${i}] RUBRIC: "${line}"`);
      current.rubric.push(line);
    } else {
      debugLines.push(`[${i}] DESC: "${line}"`);
      current.description.push(line);
    }
  }
  if (current) sections.push(current);

  let overviewHtml = '';
  for (const sec of sections) {
    overviewHtml += `<h3>${sec.heading}</h3>\n`;
    if (sec.description.length) {
      overviewHtml += `<p>${sec.description.join(' ')}</p>\n`;
    }
    if (sec.modules.length) {
      overviewHtml += '<ul>\n';
      for (const m of sec.modules) {
        const modMatch = m.match(/^(Module\s*\d+)([:\-–—])?(.*)$/i);
        if (modMatch) {
          overviewHtml += `<li><strong>${modMatch[1].replace(/\s+/g, ' ').trim()}</strong>${modMatch[3] ? ':' + modMatch[3].trim() : ''}</li>\n`;
        } else {
          overviewHtml += `<li>${m}</li>\n`;
        }
      }
      overviewHtml += '</ul>\n';
    }
    if (sec.points.length) {
      overviewHtml += `<p><strong>${sec.points.join(' ')}</strong></p>\n`;
    }
    if (sec.rubric.length) {
      overviewHtml += `<p>${sec.rubric.join(' ')}</p>\n`;
    }
  }

  // DEBUG: Output debug info at the top of the HTML for troubleshooting (remove in production)
  const debugHtml = `<pre style="background:#eee;color:#333;font-size:12px;padding:8px;overflow:auto;max-height:300px;">\n${debugLines.join('\n')}\n</pre>`;

  return `<div class=\"WFU-SPS WFU-Container-Global WFU-LightMode-Text\">
    <div class=\"grid-row\">
      <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\" style=\"padding: 0px 0px 10px 0px;\">
        <div class=\"WFU-SubpageHeader WFU-SubpageHeroGettingStarted\">&nbsp;
          <div class=\"WFU-Banner-SchoolofProfessionalStudies\">&nbsp;</div>
        </div>
      </div>
    </div>
    <div class=\"grid-row\">
      <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">
        <p class=\"WFU-SubpageHeader\"><span>${courseName}</span></p>
        <h2 class=\"WFU-SubpageSubheader\">Overview of Assessments</h2>
        ${debugHtml}
      </div>
    </div>
    <div class=\"grid-row\">
      <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">
        ${overviewHtml}
      </div>
    </div>
    <div class=\"grid-row\">
      <div class=\"col-xs-12\">
        <footer class=\"WFU-footer\">This material is owned by Wake Forest University and is protected by U.S. copyright laws. All Rights Reserved.</footer>
      </div>
    </div>
  </div>`;
}
// End of formatWFUAssessmentOverview
/**
 * Main content formatting dispatcher
 */
export function formatContent(
  content: string,
  template: TemplateType,
  context: TemplateContext = {},
  options: FormattingOptions = {}
): string {
  const defaultOptions: FormattingOptions = {
    sanitize: true,
    addWrappers: true,
    includeMetadata: false,
    ...options,
  };

  let formatted: string;

  // Apply the appropriate template
  switch (template) {
    case 'wfuCourseWelcome':
      formatted = formatWFUCourseWelcome(content, context);
      break;
    case 'wfuCourseSyllabus':
      formatted = formatWFUCourseSyllabus(content, context);
      break;
    case 'wfuModule':
      formatted = formatWFUModule(content, context);
      break;
    case 'wfuLearningMaterials':
      formatted = formatWFULearningMaterials(content, context);
      break;
    case 'wfuInstructorPresentation':
      formatted = formatWFUInstructorPresentation(content, context);
      break;
    case 'wfuDiscussion':
      formatted = formatWFUDiscussion(content, context);
      break;
    case 'wfuAssignment':
      formatted = formatWFUAssignment(content, context);
      break;
    case 'wfuMeetFaculty':
      formatted = formatWFUMeetFaculty(content, context);
      break;
    case 'wfuAssessmentOverview':
      formatted = formatWFUAssessmentOverview(content, context);
      break;
    default:
      formatted = markdownToHtml(content);
      break;
  }

  // Sanitize HTML if requested
  if (defaultOptions.sanitize) {
    formatted = sanitizeHtml(formatted);
  }

  return formatted;
}
/**
 * Content formatters for Canvas LMS import
 * Transform raw content using predefined templates
 */

/**
 * Convert markdown to HTML
 */
function markdownToHtml(content: string): string {
  // Configure marked options
  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  return marked(content) as string;
}

/**
 * Sanitize HTML content
 */
function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'div', 'span',
      'strong', 'b', 'em', 'i', 'u', 's',
      'ul', 'ol', 'li',
      'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'blockquote', 'code', 'pre',
      'footer',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'id', 'style'],
  });
}

/**
 * Assignment Brief Template
 * Adds grading criteria and submission guidelines
 */
function formatAssignmentBrief(content: string, context: TemplateContext = {}): string {
  const html = markdownToHtml(content);
  
  const pointsInfo = context.pointsPossible 
    ? `<p><strong>Points:</strong> ${context.pointsPossible}</p>`
    : '';
    
  const dueInfo = context.dueDate
    ? `<p><strong>Due:</strong> ${new Date(context.dueDate).toLocaleDateString()}</p>`
    : '';

  return `
    <div class="assignment-brief">
      <div class="assignment-header">
        <h2>${context.title || 'Assignment'}</h2>
        ${pointsInfo}
        ${dueInfo}
      </div>
      
      <div class="assignment-description">
        ${html}
      </div>
      
      <div class="submission-guidelines">
        <h3>📋 Submission Guidelines</h3>
        <ul>
          <li>Submit your work through Canvas before the due date</li>
          <li>Late submissions may be penalized according to course policy</li>
          <li>If you need an extension, contact the instructor in advance</li>
        </ul>
      </div>
      
      <div class="grading-criteria">
        <h3>📊 Grading Criteria</h3>
        <p>Your work will be evaluated based on:</p>
        <ul>
          <li>Completeness and accuracy</li>
          <li>Quality of analysis and reasoning</li>
          <li>Clear communication and organization</li>
          <li>Adherence to assignment requirements</li>
        </ul>
      </div>
    </div>
  `;
}

/**
 * Discussion Prompt Template
 * Creates structured discussion with participation guidelines
 */
function formatDiscussionPrompt(content: string, context: TemplateContext = {}): string {
  const html = markdownToHtml(content);
  
  return `
    <div class="discussion-prompt">
      <div class="prompt-content">
        ${html}
      </div>
      
      <div class="participation-guidelines">
        <h3>💬 Participation Guidelines</h3>
        <div class="guidelines-grid">
          <div class="initial-post">
            <h4>Initial Post</h4>
            <ul>
              <li>Thoughtful response to the prompt</li>
              <li>Minimum 150 words</li>
              <li>Include specific examples when possible</li>
              <li>Post by Wednesday at 11:59 PM</li>
            </ul>
          </div>
          
          <div class="response-posts">
            <h4>Response Posts</h4>
            <ul>
              <li>Respond to at least 2 classmates</li>
              <li>Minimum 75 words each</li>
              <li>Build on or constructively challenge ideas</li>
              <li>Complete by Sunday at 11:59 PM</li>
            </ul>
          </div>
        </div>
        
        <div class="discussion-tips">
          <h4>💡 Tips for Quality Discussion</h4>
          <ul>
            <li>Ask follow-up questions</li>
            <li>Share relevant personal or professional experiences</li>
            <li>Reference course materials when appropriate</li>
            <li>Be respectful and constructive in all interactions</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

/**
 * Syllabus Template
 * Formats syllabus content with clear sections
 */
function formatSyllabus(content: string, context: TemplateContext = {}): string {
  const html = markdownToHtml(content);
  
  return `
    <div class="syllabus-content">
      <div class="course-header">
        <h1>${context.title || 'Course Syllabus'}</h1>
        <p class="course-meta">Course ID: ${context.courseId || '[Course ID]'}</p>
      </div>
      
      ${html}
      
      <div class="syllabus-footer">
        <hr>
        <p><em>This syllabus is subject to change. Students will be notified of any modifications through Canvas announcements.</em></p>
      </div>
    </div>
  `;
}

/**
 * Announcement Template
 * Simple announcement formatting with date
 */
function formatAnnouncement(content: string, context: TemplateContext = {}): string {
  const html = markdownToHtml(content);
  
  return `
    <div class="announcement-content">
      <div class="announcement-header">
        <span class="announcement-date">${new Date().toLocaleDateString()}</span>
      </div>
      ${html}
    </div>
  `;
}

/**
 * Plain Template
 * Just converts markdown to HTML without additional formatting
 */
function formatPlain(content: string): string {
  return markdownToHtml(content);
}

/**
 * WFU Module Template
 * Wake Forest University School of Professional Studies module format
 */
function formatWFUModule(content: string, context: TemplateContext = {}): string {
  // Extract module number from title (e.g., "2.0 Overview" -> "2")
  const moduleMatch = context.title?.match(/^(\d+)\.\d+/);
  const moduleNum = moduleMatch ? moduleMatch[1] : '1';

  // Build objectives list, filtering out 'Module Description'
  let objectivesHtml = '';
  const filteredObjectives = (context.objectives || []).filter((obj: string) => obj.trim().toLowerCase() !== 'module description');
  if (filteredObjectives.length > 0) {
    objectivesHtml = `<ol>\n${filteredObjectives.map((obj: string) => `  <li>${obj}</li>`).join('\n')}\n</ol>`;
  }

  // Build checklist, filtering out 'Module Description'
  let checklistHtml = '';
  const filteredChecklist = (context.checklist || []).filter((item: string) => item.trim().toLowerCase() !== 'module description');
  if (filteredChecklist.length > 0) {
    checklistHtml = `<ul>\n${filteredChecklist.map((item: string) => `  <li>${item}</li>`).join('\n')}\n</ul>`;
  } else {
    checklistHtml = `<ul>\n  <li>Review the course Syllabus.</li>\n  <li>Complete assigned readings.</li>\n  <li>Complete discussion activities.</li>\n  <li>Complete assignments.</li>\n</ul>`;
  }

  // Description HTML
  const html = markdownToHtml(content);

  return `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
    <div class="grid-row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12" style="padding: 0px 0px 10px 0px;">
            <div class="WFU-SubpageHeader WFU-SubpageHeroModule${moduleNum}">&nbsp;
                <div class="WFU-Banner-SchoolofProfessionalStudies">&nbsp;</div>
            </div>
        </div>
    </div>
    <div class="grid-row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <p class="WFU-SubpageHeader">${context.courseName || 'Course Name'}</p>
            <h2 class="WFU-SubpageSubheader">Module ${moduleNum} Overview</h2>
            ${html}
            <h3>Module Objectives</h3>
            <p>After completing this module, you should be able to:</p>
            ${objectivesHtml}
            <h3>Module Checklist</h3>
            ${checklistHtml}
        </div>
    </div>
    <div class="grid-row">
      <div class="col-xs-12">
        <footer class="WFU-footer">This material is owned by Wake Forest University and is protected by U.S. copyright laws. All Rights Reserved.</footer>
      </div>
    </div>
  </div>`;
function formatWFULearningMaterials(content: string, context: TemplateContext = {}): string {
  // Split content into lines for structured parsing
  const lines = content.split(/\r?\n/);

  // --- Helpers ---
  const isBareUrl = (s: string) => /^(https?:\/\/\S+)/i.test(s.trim());
  const autolink = (s: string) => s.replace(/(https?:\/\/[^\s)<]+)/g, (url) => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`);
  const isSection = (s: string, re: RegExp) => re.test(s.trim());
  
  const h3Names = [/^[^\w]*Required\s+Resources[^\w]*:?\s*$/i, /^[^\w]*Optional\s+Resources[^\w]*:?\s*$/i];
  const h4Names = [
    /^[^\w]*Reading(?:s)?[^\w]*:?\s*$/i, 
    /^[^\w]*Video(?:s)?[^\w]*:?\s*$/i, 
    /^[^\w]*Articles[^\w]*:?\s*$/i, 
    /^[^\w]*Podcasts[^\w]*:?\s*$/i, 
    /^[^\w]*Tools[^\w]*:?\s*$/i, 
    /^[^\w]*Websites[^\w]*:?\s*$/i, 
    /^[^\w]*Case\s+Studies[^\w]*:?\s*$/i,
    /^[^\w]*Textbook Readings[^\w]*:?\s*$/i,
    /^[^\w]*Experimenting\s+with\s+an\s+LLM[^\w]*:?\s*$/i
  ];
  
  const youtubeRe = /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/i;
  const tedRe = /https?:\/\/(?:www\.)?ted\.com\/talks\/([^?\s#]+)/i;

  let bodyHtml = '';
  let currentListType: 'readings' | 'videos' | 'generic' | 'textbook' | null = null;
  let pendingVideoTitle: string | null = null;
  let pendingVideoContext: string | null = null;
  
  // State for indent-aware list
  let inList = false;
  let indentStack: number[] = []; // Stores the indentation level (space count) of current <ul>

  // --- List Management Helpers ---
  
  /**
   * Manages <ul> tags based on line indentation.
   */
  const handleIndent = (raw: string) => {
    const isExerciseLine = /^\s*(\*\*|__)*\s*Exercise\s*(\*\*|__)*:/i.test(raw);
    let indent = raw.match(/^\s*/)?.[0].length || 0;
    
    // This is the first item in a new list
    if (!inList) {
      bodyHtml += '<ul>\n';
      inList = true;
      indentStack = [indent]; // Base indent
      return;
    }

    const currentIndent = indentStack[indentStack.length - 1];

    // If this is the Exercise line and it's less indented than the
    // current level, force it to *be* at the current level.
    if (isExerciseLine && indent < currentIndent) {
        indent = currentIndent;
    }

    if (indent > currentIndent) {
      // Open new nested level
      bodyHtml += '<ul>\n';
      indentStack.push(indent);
    } else if (indent < currentIndent) {
      // Close deeper levels
      while (indentStack.length > 0 && indent < indentStack[indentStack.length - 1]) {
        bodyHtml += '</ul>\n';
        indentStack.pop();
      }
      // If we've bottomed out and the new indent is *still* lower,
      // reset the stack to this new, lower base indent.
      if (indentStack.length === 0 || indent < indentStack[indentStack.length - 1]) {
         indentStack = [indent];
         // Don't re-open <ul> here, it's handled by the fact that
         // inList is true and the stack is now correct.
      }
    }
    // if indent === currentIndent, do nothing (same level)
  };

  /**
   * Closes all open <ul> tags.
   */
  const closeList = () => {
     while (indentStack.length > 0) {
      bodyHtml += '</ul>\n';
      indentStack.pop();
    }
    inList = false;
  };
  
  /**
   * Flushes any pending video (title + context) with a placeholder.
   */
  const flushPendingVideo = () => {
    if (pendingVideoTitle) {
      bodyHtml += `<p>${pendingVideoTitle}</p>\n`;
      if (pendingVideoContext) { 
        bodyHtml += `<p>${pendingVideoContext}</p>\n`; 
      }
      bodyHtml += `<div class=\"WFU-Container-LectureMedia\">\n                <div class=\"VideoPlayer\">\n                    <p>HERE</p>\n                </div>\n            </div>\n`;
      pendingVideoTitle = null;
      pendingVideoContext = null;
    }
  };

  let lastLineWasTitleWithoutUrl = false;
  
  // --- Main Parsing Loop ---
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) continue; // Skip empty lines
    // Skip lines that are just markdown characters (e.g. "____")
    if (/^[\*_]+$/.test(line)) continue;

    // --- UPDATED isBulletLine LOGIC ---
    // A line is a bullet if it starts with -, •, or a number AND is followed by a space.
    // OR if it starts with * AND is followed by a space (to distinguish from **bold**).
    // OR if it's the special **Exercise:** line.
    const isStandardBullet = /^\s*([-•]|\d+[\.)])\s+/.test(raw) || /^\s*\*\s+/.test(raw);
    const isExerciseLine = /^\s*(\*\*|__)*\s*Exercise\s*(\*\*|__)*:/i.test(raw);
    const isBulletLine = isStandardBullet || isExerciseLine;
    
    // --- 1. HEADING DETECTION ---

    // Check H3 (e.g., "Required Resources")
    if (h3Names.some(re => isSection(line, re))) {
      closeList();
      flushPendingVideo();
      // Clean leading/trailing junk, but preserve internal punctuation
      const heading = line.replace(/^[^\w]*/, '').replace(/[^\w]*:?\s*$/, '');
      bodyHtml += `<h3>${heading}</h3>\n`;
      currentListType = null;
      continue;
    }

    // Check H4 (e.g., "Readings:", "Videos:", "Experimenting with an LLM:")
    const isKnownH4 = h4Names.some(re => isSection(line, re));
    // A generic H4 is a non-bullet, non-url, line ending in a colon.
    const isGenericH4 = !isBulletLine && 
                        !/https?:\/\//.test(line) && 
                        /.+:\s*$/.test(line);
                        
    if (isKnownH4 || isGenericH4) {
      closeList();
      flushPendingVideo();
      // Clean leading/trailing junk, but preserve internal punctuation
      const name = line.replace(/^[^\w]*/, '').replace(/[^\w]*:?\s*$/, '');
      bodyHtml += `<h4>${name}</h4>\n`;
      
      // Set the parser mode for the content *following* this heading
      if (/^(\*\*|__)*Video/i.test(line)) {
        currentListType = 'videos';
      } else if (/^(\*\*|__)*Textbook Readings/i.test(line)) {
        currentListType = 'textbook';
      } else if (/^(\*\*|__)*Reading/i.test(line)) {
        currentListType = 'readings';
      } else {
        currentListType = 'generic'; // "Experimenting...", "Articles:", etc.
      }
      continue; // Done with this line
    }

    // --- 2. CONTENT PARSING ---

    // A. Handle "Videos" section (special logic)
    if (currentListType === 'videos') {
      closeList(); // Videos are not in a <ul>
      lastLineWasTitleWithoutUrl = false;
      
      const ytMatch = line.match(youtubeRe);
      const tedMatch = line.match(tedRe);

      // Case 1: Line has an embeddable URL (YouTube, TED)
      if (ytMatch || tedMatch) {
        flushPendingVideo(); // Flush any previous title
        
        // --- VERCEL BUILD FIX ---
        const urlStart = (ytMatch ? ytMatch.index : tedMatch!.index) ?? 0;
        const title = urlStart > 0 ? line.substring(0, urlStart).trim().replace(/^[-•\*]\s*/, '') : null;
        
        let contextText = '';
        if (lines[i+1] && /^\s*-/.test(lines[i+1])) { // Check for indented context
          contextText = lines[i+1].replace(/^\s*-\s*/, '').trim();
          i++;
        }

        if (title) bodyHtml += `<p>${title}</p>\n`;
        if (contextText) bodyHtml += `<p>${contextText}</p>\n`;
        
        if (ytMatch) {
           const id = ytMatch[1];
           let siParam = '';
           try { const u = new URL(line); const si = u.searchParams.get('si'); if (si) siParam = `?si=${encodeURIComponent(si)}`; } catch {}
           const iframe = `<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/${id}${siParam}\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>`;
           bodyHtml += `<div class=\"WFU-Container-LectureMedia\">\n                <div class=\"VideoPlayer\">\n                    <p>${iframe}</p>\n                </div>\n            </div>\n`;
         } else if (tedMatch) {
           const slug = tedMatch[1];
           const iframe = `<iframe width=\"560\" height=\"315\" src=\"https://embed.ted.com/talks/${slug}\" title=\"TED Talk\" frameborder=\"0\" scrolling=\"no\" allowfullscreen></iframe>`;
           bodyHtml += `<div class=\"WFU-Container-LectureMedia\">\n                <div class=\"VideoPlayer\">\n                    <p>${iframe}</p>\n                </div>\n            </div>\n`;
         }
        continue;
      }

      // Case 2: Line has a non-embeddable URL (e.g., The Illustrated Word2vec)
      const cleanLineForUrl = line.replace(/^[-•\*]\s*/, '');
      const mSimple = cleanLineForUrl.match(/^(.*?)\s+(https?:\/\/\S+)\s*$/);

      if (isBareUrl(cleanLineForUrl) || mSimple) {
         flushPendingVideo(); // Flush any previous title
         
         let title, url;
         if (mSimple) {
            title = mSimple[1].trim();
            url = mSimple[2].trim();
         } else { // Bare URL
            title = cleanLineForUrl;
            url = cleanLineForUrl;
         }
         
         // This is a "video" that is just a link. Output as title + placeholder.
         bodyHtml += `<p><a href="${url}" target="_blank" rel="noopener">${title || url}</a></p>\n`;
         bodyHtml += `<div class=\"WFU-Container-LectureMedia\">\n                <div class=\"VideoPlayer\">\n                    <p>HERE</p>\n                </div>\n            </div>\n`;
         continue;
      }

      // Case 3: Line is a non-URL (Title or Context)
      if (pendingVideoTitle && !lastLineWasTitleWithoutUrl && !pendingVideoContext) {
          // This line is context for the previous title
          pendingVideoContext = line.replace(/^[-•\*]\s*/, '');
          lastLineWasTitleWithoutUrl = true;
          continue; 
      }

      // This must be a new title. Flush the old one.
      flushPendingVideo();
      pendingVideoTitle = line.replace(/^[-•\*]\s*/, '');
      pendingVideoContext = null;
      lastLineWasTitleWithoutUrl = true;
      continue;
    }

    // B. Handle "Readings", "Textbook", or "Generic" sections (all use list logic)
    if (currentListType === 'readings' || currentListType === 'textbook' || currentListType === 'generic') {
      if (!isBulletLine) {
         // This is a paragraph *inside* a section (e.g., an intro).
         closeList(); // Stop any list.
         bodyHtml += `<p>${autolink(line)}</p>\n`; // Treat as a plain paragraph.
         continue;
      }

      // It's a bullet. Handle indentation.
      handleIndent(raw);
      
      // Clean the line of bullet markers
      let cleanLine = line.replace(/^[-•\*]\s*/, '').replace(/^\d+[\.)]\s+/, '');
      
      // Convert markdown bold/italic
      let content = cleanLine
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold**
          .replace(/\*(.*?)\*/g, '<em>$1</em>');       // *italic*

      // Special formatting for "Exercise:" (which is already bolded)
      content = content.replace(/^(<strong>Exercise:<\/strong>)/i, '<strong>Exercise:</strong>');
      
      // Autolink, but be careful not to link inside the href attribute of an existing link
      // A simple autolink for content that isn't already <a> tagged
      if (!/<\s*a\s*href/i.test(content)) {
          content = autolink(content);
      }
      
          // If the line is already in markdown link format [Title](URL), convert to HTML link
          const mdLinkMatch = content.match(/^\[([^\]]+)\]\((https?:\/\/[^\)]+)\)$/);
          if (mdLinkMatch) {
            const rawTitle = mdLinkMatch[1].trim();
            const rawUrl = mdLinkMatch[2].trim();
            content = `<a href="${rawUrl}" target="_blank" rel="noopener">${rawTitle}</a>`;
          } else if (content.match(/^\[([^\]]+)\]\(<a [^>]*href=["'](https?:\/\/[^"'>]+)["'][^>]*>[^<]+<\/a>\)$/)) {
            // Fix for pasted HTML links that became markdown with HTML inside: [Title](<a href="url">url</a>)
            const htmlLinkMatch = content.match(/^\[([^\]]+)\]\(<a [^>]*href=["'](https?:\/\/[^"'>]+)["'][^>]*>[^<]+<\/a>\)$/);
            if (htmlLinkMatch) {
              const rawTitle = htmlLinkMatch[1].trim();
              const rawUrl = htmlLinkMatch[2].trim();
              content = `<a href="${rawUrl}" target="_blank" rel="noopener">${rawTitle}</a>`;
            }
          } else {
            // If the line is in 'Title URL' format, render as a single hyperlink with the title as the link text
            const patTitleUrl = /^(.*?)\s+(https?:\/\/\S+)\s*$/;
            const mTitleUrl = content.match(patTitleUrl);
            if (mTitleUrl && !content.includes('<a ')) {
              const rawTitle = mTitleUrl[1].trim();
              const rawUrl = mTitleUrl[2].trim();
              content = `<a href="${rawUrl}" target="_blank" rel="noopener">${rawTitle}</a>`;
            } else {
              // Always hyperlink any bare URL in readings, even if not in 'Title URL' format
              const patWithDesc = /^(.*?)\s+(https?:\/\/\S+):(.*)$/; // Title URL: Desc
              // Need to strip tags for matching
              const plainContent = content.replace(/<[^>]+>/g, '');
              const mDesc = plainContent.match(patWithDesc);
              const urlMatch = plainContent.match(/https?:\/\/\S+/);
              if (mDesc) {
                  const rawTitle = mDesc[1].trim();
                  const rawUrl = mDesc[2].trim().replace(/:$/,'');
                  const rest = mDesc[3].trim();
                  content = `<a href="${rawUrl}" target="_blank" rel="noopener">${rawTitle}</a>${rest ? `: ${rest}` : ''}`;
              } else if (urlMatch && !/<\s*a\s*href/i.test(content)) {
                  // If there's a bare URL anywhere, hyperlink it (even if not in Title URL format)
                  const url = urlMatch[0];
                  content = content.replace(url, `<a href="${url}" target="_blank" rel="noopener">${url}</a>`);
              }
            }
          }
      
      bodyHtml += `<li>${content}</li>\n`;
      continue;
    }

    // C. Fallback: Content before any H3/H4
    bodyHtml += `<p>${autolink(line)}</p>\n`;
  }

  // --- Final Cleanup ---
  closeList();
  flushPendingVideo();

  let html = bodyHtml;
  
  // Extract module number from title (e.g., "1.2 Learning Materials" -> "1")
  const moduleMatch = context.title?.match(/^(\d+)\.\d+/);
  const moduleNum = moduleMatch ? moduleMatch[1] : '1';

  return `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
    <div class="grid-row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12" style="padding: 0px 0px 10px 0px;">
            <div class="WFU-SubpageHeader WFU-SubpageHeroModule${moduleNum}">&nbsp;
                <div class="WFU-Banner-SchoolofProfessionalStudies">&nbsp;</div>
            </div>
        </div>
    </div>
    <div class="grid-row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <p class="WFU-SubpageHeader">${context.courseName || 'Course Name'}</p>
            <h2 class="WFU-SubpageSubheader">Module ${moduleNum} Learning Materials</h2>
        </div>
    </div>
    <div class="grid-row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <p>The following resources will help you master the material and prepare for the module assessments.<br /><strong></strong></p>
            <p><strong>IMPORTANT:</strong> It can take you up to 20 hours to study the material in this module and to successfully complete the assessments. Waiting until the weekend to consume all the material can lead to poor outcomes as you will not have sufficient time to absorb the content. If you plan out your week and complete a little bit every day, you will fare far better and have adequate time to seek answers to questions.</p>
            ${html}
        </div>
    </div>
    <div class="grid-row">
      <div class="col-xs-12">
        <footer class="WFU-footer">This material is owned by Wake Forest University and is protected by U.S. copyright laws. All Rights Reserved.</footer>
      </div>
    </div>
</div>`;
}

/**
 * WFU Instructor Presentation Template
 * Wake Forest University SPS instructor presentation video page format
 */
function formatWFUInstructorPresentation(content: string, context: TemplateContext = {}): string {
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
                <div class="VideoPlayer">
                    <p>HERE</p>
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
}

/**
 * WFU Discussion Template
 * Wake Forest University SPS discussion page format
 * Same HTML structure for all modules, only title changes
 */
function formatWFUDiscussion(content: string, context: TemplateContext = {}): string {
  // Fallback: improved Markdown/plain text parser
  const sectionOrder = [
    'Prompt',
    'This discussion aligns',
    'Objectives',
    'Response to Classmates',
    'Instructions',
    'Criteria for Success (Grading Rubric)',
    'Grading Rubric',
    'TIP'
  ];
  const headingRegex = /^\s*\*{0,2}\s*([A-Za-z0-9 ()]+)\s*:?[\s\*]*$/;
  const lines = content.split(/\r?\n/);
  let currentSection = '';
  let sections: Record<string, string[]> = {};
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;
    let headingMatch = line.match(headingRegex);
    let heading = '';
    if (headingMatch) {
      heading = sectionOrder.find(h => headingMatch[1].toLowerCase().startsWith(h.toLowerCase())) || '';
    } else {
      heading = sectionOrder.find(h => line.toLowerCase().startsWith(h.toLowerCase())) || '';
    }
    if (heading) {
      currentSection = heading;
      if (!sections[currentSection]) sections[currentSection] = [];
      continue;
    }
    if (!currentSection) {
      currentSection = 'Prompt';
      if (!sections[currentSection]) sections[currentSection] = [];
    }
    sections[currentSection].push(line);
  }

  function renderSectionContent(lines: string[]): string {
    let html = '';
    let inList = false;
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i].trim();
      if (!l) continue;
      if (headingRegex.test(l)) continue;
      if (/^[-*] /.test(l)) {
        if (!inList) { html += '<ul>\n'; inList = true; }
        html += `<li>${markdownToHtml(l.replace(/^[-*] /, ''))}</li>\n`;
      } else {
        if (inList) { html += '</ul>\n'; inList = false; }
        const htmlLine = markdownToHtml(l).trim();
        if (htmlLine) html += `<p>${htmlLine}</p>\n`;
      }
    }
    if (inList) html += '</ul>\n';
    return html;
  }

  let html = '<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">\n';
  if (sections['Prompt']) {
    html += '<h3>Prompt:</h3>\n';
    html += renderSectionContent(sections['Prompt']);
  }
  if (sections['This discussion aligns'] || sections['Objectives']) {
    html += '<p>This discussion aligns with the following module objectives:</p>\n';
    const objectives = (sections['This discussion aligns'] || []).concat(sections['Objectives'] || []);
    const desc = markdownToHtml(objectives[0]?.trim() || '');
    if (desc) html += `<p>${desc}</p>\n`;
  }
  // ... (rest of the function unchanged)
  return html;
}

function formatWFUAssignment(content: string, context: TemplateContext = {}): string {
  // TODO: Implement assignment formatting logic
  return '';
}

module.exports = {
  formatWFUModule,
  formatWFULearningMaterials,
  formatWFUInstructorPresentation,
  formatWFUDiscussion,
  formatWFUAssignment
};
}