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
function formatWFUCourseWelcome(content: string, context: TemplateContext = {}): string {
  return '';
}
function formatWFUCourseSyllabus(content: string, context: TemplateContext = {}): string {
  return '';
}
function formatWFUMeetFaculty(content: string, context: TemplateContext = {}): string {
  return '';
}
function formatWFUAssessmentOverview(content: string, context: TemplateContext = {}): string {
  return '';
}
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

import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

export interface FormattingOptions {
  sanitize?: boolean;
  addWrappers?: boolean;
  includeMetadata?: boolean;
}

export interface TemplateContext {
  title?: string;
  courseId?: string;
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
  const html = markdownToHtml(content);
  
  // Extract module number from title (e.g., "1.0 Overview" -> "1")
  const moduleMatch = context.title?.match(/^(\d+)\.0/);
  const moduleNum = moduleMatch ? moduleMatch[1] : '1';
  
  // Build objectives list
  const objectivesHtml = context.objectives?.length 
    ? `<ol>
        ${context.objectives.map(obj => `<li>${obj}</li>`).join('\n                ')}
      </ol>`
    : '';
  
  // Build checklist items with nested lists for due dates
  let checklistHtml = '';
  if (context.checklist?.length) {
    const items = context.checklist;
    let inNestedList = false;
    const courseId = context.courseId || '77445';
    const baseUrl = ((context.baseUrl && String(context.baseUrl).trim()) || 'https://wakeforest.instructure.com').replace(/\/+$/, '');
    
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      const isDueDate = /^(Initial post|Two reply posts|Reply posts|Response posts|First post|Responses|Due by)/i.test(item);
      
      // Bold day and time patterns in due date lines
      if (isDueDate) {
        item = item.replace(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+\d{1,2}:\d{2}\s+[ap]\.m\.\s+ET/gi, '<strong>$&</strong>');
      }
      
      // Link "Live Instructor-Led Sessions" page when it appears after "see the"
      item = item.replace(/\bLive Instructor-Led Sessions\b/gi, `<a href="${baseUrl}/courses/${courseId}/pages/live-instructor-led-sessions">Live Instructor-Led Sessions</a>`);
      
      if (isDueDate) {
        if (!inNestedList) {
          checklistHtml += '\n                    <ul>\n';
          inNestedList = true;
        }
        checklistHtml += `                        <li>${item}</li>\n`;
      } else {
        if (inNestedList) {
          checklistHtml += '                    </ul>\n';
          inNestedList = false;
        }
        checklistHtml += `                <li>${item}</li>\n`;
      }
    }
    
    if (inNestedList) {
      checklistHtml += '                    </ul>\n';
    }
    
    // Remove trailing newline
    checklistHtml = checklistHtml.trimEnd();
  } else {
    checklistHtml = `<li>Review the course Syllabus.</li>
                <li>Complete assigned readings.</li>
                <li>Complete discussion activities.</li>
                <li>Complete assignments.</li>`;
  }

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
            <ul>
                ${checklistHtml}
            </ul>
        <div class="grid-row">
            <div class="col-xs-12">
          <footer class="WFU-footer">This material is owned by Wake Forest University and is protected by U.S. copyright laws. All Rights Reserved.</footer>
            </div>
        </div>
        </div>
    </div>
</div>`;
}

/**
 * WFU Learning Materials Template
 * Wake Forest University SPS module learning materials page format
 * --- THIS FUNCTION HAS BEEN REFACTORED ---
 */
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
      
      // Handle "Title URL" pattern, but only if not already linked
      const patWithDesc = /^(.*?)\s+(https?:\/\/\S+):(.*)$/; // Title URL: Desc
      const patSimple = /^(.*?)\s+(https?:\/\/\S+)\s*$/;  // Title URL
      
      // Need to strip tags for matching
      const plainContent = content.replace(/<[^>]+>/g, '');
      const mDesc = plainContent.match(patWithDesc);
      const mSimple = !mDesc ? plainContent.match(patSimple) : null;
      
      if (mDesc) {
          const rawTitle = mDesc[1].trim();
          const rawUrl = mDesc[2].trim().replace(/:$/,'');
          const rest = mDesc[3].trim();
          content = `<a href="${rawUrl}" target="_blank" rel="noopener">${rawTitle}</a>${rest ? `: ${rest}` : ''}`;
      } else if (mSimple) {
          const rawTitle = mSimple[1].trim();
          const rawUrl = mSimple[2].trim().replace(/:$/,'');
          // Don't re-link if it's already the "Exercise:" line or already contains a link
          if (!content.startsWith('<strong>Exercise:</strong>') && !/<\s*a\s*href/i.test(content)) {
             content = `<a href="${rawUrl}" target="_blank" rel="noopener">${rawTitle || rawUrl}</a>`;
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
  <div class="col-xs-12 WFU-footer">
          <div class="grid-row">
        <div class="grid-row">
            <div class="col-xs-12">
                <footer class="WFU-footer">This material is owned by Wake Forest University and is protected by U.S. copyright laws. All Rights Reserved.</footer>
            </div>
        </div>
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
  // Split content into lines and normalize
  const lines = content.split(/\r?\n/).map(l => l.trim());
  // Section regexes
  const sectionHeaders = [
    { key: 'prompt', re: /^(Prompt:?|Discussion Prompt:?)/i },
    { key: 'objectives', re: /^(Objectives?:?|This discussion aligns)/i },
    { key: 'response', re: /^Response to Classmates?:?/i },
    { key: 'instructions', re: /^Instructions?:?/i },
    { key: 'criteria', re: /^(Criteria for Success|Grading Rubric):?/i },
    { key: 'tip', re: /^TIP:?/i },
  ];
  // Default section order
  const sectionOrder = ['prompt', 'objectives', 'response', 'instructions', 'criteria', 'tip'];
  // Default content for missing sections
  const defaults = {
    response: `<p>Review and respond to at least two of your classmates’ postings. Your responses need not be long, but they should add substantial thought to the topic. You may certainly respond to more than two classmate posts, but you will only be graded on two. Consider spreading the wealth if you see a post that hasn’t received a response. Respond by continuing the conversation through quality engagement in any of the following ways:</p>
<ul>
  <li>Offering a new point of view</li>
  <li>Asking a question to further the discussion</li>
  <li>Sharing personal experiences or knowledge</li>
  <li>Tying the information to new knowledge gained</li>
  <li>Offering further research or information on the topic</li>
</ul>`,
    instructions: `<ul>
  <li>Your initial post and response posts to at least two peers should be substantive and add value to the conversation.</li>
  <li>Your initial post (approximately 250 words) is due by <strong>Wednesday at 11:59 p.m. ET.</strong></li>
  <li>Response posts are due by <strong>Saturday at 11:59 p.m. ET.</strong></li>
</ul>`,
    criteria: `<ul>
  <li>Refer to the discussion rubric for additional details. Click the Options icon (three dots on the top-right of this page) and select the Show Rubric link.</li>
</ul>`,
    tip: `<p><strong>TIP:</strong> To avoid inadvertent data loss, first compose your discussion entries in a Word document (or other word processor). Then, cut and paste your text into the discussion window and submit it.</p>`
  };
  // Parse sections
  const sections: Record<string, string[]> = {};
  let current: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    // Detect section header
    const found = sectionHeaders.find(s => s.re.test(line));
    if (found) {
      current = found.key;
      // If header line has content after colon, use it as first line
      const afterColon = line.replace(found.re, '').replace(/^[:\s-]+/, '');
      if (afterColon) {
        if (!sections[current]) sections[current] = [];
        sections[current].push(afterColon);
      }
      continue;
    }
    if (current) {
      if (!sections[current]) sections[current] = [];
      sections[current].push(line);
    } else {
      // If no section header yet, treat as prompt
      if (!sections['prompt']) sections['prompt'] = [];
      sections['prompt'].push(line);
    }
  }
  // Helper: render lines as paragraphs and lists
  function renderLines(ls: string[]): string {
    let html = '';
    let inList = false;
    for (let i = 0; i < ls.length; i++) {
      const l = ls[i];
      if (!l) {
        if (inList) { html += '</ul>\n'; inList = false; }
        continue;
      }
      const isBullet = /^[●•\-\*]\s+/.test(l) || /^\d+[\.)]\s+/.test(l);
      if (isBullet) {
        if (!inList) { html += '<ul>\n'; inList = true; }
        html += `<li>${l.replace(/^[●•\-\*]\s+/, '').replace(/^\d+[\.)]\s+/, '')}</li>\n`;
      } else {
        if (inList) { html += '</ul>\n'; inList = false; }
        html += `<p>${l}</p>\n`;
      }
    }
    if (inList) html += '</ul>\n';
    return html;
  }
  // Helper: render objectives as list
  function renderObjectives(ls: string[]): string {
    if (!ls || !ls.length) return '<li>Objective 1</li>\n<li>Objective 2</li>';
    return ls.map(obj => `<li>${obj.replace(/^[●•\-\*]\s+/, '').replace(/^\d+[\.)]\s+/, '')}</li>`).join('\n');
  }
  // Build HTML
  let html = `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">\n`;
  // Prompt
  html += `<h3>Prompt:</h3>\n${renderLines(sections.prompt || [])}`;
  // Objectives
  html += `<p>This discussion aligns with the following module objectives:</p>\n<ul>\n${renderObjectives(sections.objectives || [])}\n</ul>`;
  // Response to Classmates
  html += `<h3>Response to Classmates:</h3>\n`;
  if (sections.response) {
    html += renderLines(sections.response);
  } else {
    html += defaults.response;
  }
  // Instructions
  html += `<h3>Instructions:</h3>\n`;
  if (sections.instructions) {
    html += renderLines(sections.instructions);
  } else {
    html += defaults.instructions;
  }
  // Criteria for Success
  html += `<h3>Criteria for Success (Grading Rubric):</h3>\n`;
  if (sections.criteria) {
    html += renderLines(sections.criteria);
  } else {
    html += defaults.criteria;
  }
  // Tip
  html += `<hr />\n`;
  if (sections.tip) {
    html += renderLines(sections.tip);
  } else {
    html += defaults.tip;
  }
  html += `</div>`;
  return html;
}

/**
 * WFU Assignment Template
 * Wake Forest University SPS assignment page format
 * Same HTML structure for all modules, only title changes
 */
function formatWFUAssignment(content: string, context: TemplateContext = {}): string {
  // TODO: Implement assignment formatting logic
  return '';
}
/**
 * Preview formatted content (truncated for UI preview)
 */
export function previewContent(
  content: string,
  template: TemplateType,
  context: TemplateContext = {},
  maxLength: number = 500
): string {
  const formatted = formatContent(content, template, context, { sanitize: true });
  
  // Strip HTML tags for plain text preview
  const plainText = formatted.replace(/<[^>]*>/g, '').trim();
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  return plainText.substring(0, maxLength) + '...';
}