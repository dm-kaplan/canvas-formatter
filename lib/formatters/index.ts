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

/**
 * Available template types
 */
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
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'blockquote', 'pre', 'code',
      'hr',
      'iframe',
      'footer'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'target', 'referrerpolicy', 'scrolling',
      'class', 'id', 'style',
      'width', 'height',
      'colspan', 'rowspan',
      'allow', 'allowfullscreen', 'frameborder'
    ],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Lesson Page Template
 * Adds learning objectives and structured content wrapper
 */
function formatLessonPage(content: string, context: TemplateContext = {}): string {
  const html = markdownToHtml(content);
  
  const objectivesHtml = context.objectives?.length 
    ? `
    <div class="learning-objectives">
      <h3>🎯 Learning Objectives</h3>
      <ul>
        ${context.objectives.map(obj => `<li>${obj}</li>`).join('')}
      </ul>
    </div>
    ` 
    : '';

  return `
    <div class="lesson-page-content">
      ${objectivesHtml}
      <div class="main-content">
        ${html}
      </div>
      <div class="lesson-footer">
        <hr>
        <p><em>If you have questions about this lesson, please reach out during office hours or post in the course discussion forum.</em></p>
      </div>
    </div>
  `;
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
  const autolink = (s: string) => s.replace(/(https?:\/\/[^\s)<]+)/g, (url) => `<a href="${url}" target="_blank">${url}</a>`);
  const isSection = (s: string, re: RegExp) => re.test(s.trim());
  
  // --- FIX 1: Updated regex for headers ---
  // This is more robust and handles odd bolding (e.g., ****)
  const h3Names = [
    /^[^\w]*Required\s+Resources[^\w]*:?\s*$/i, 
    /^[^\w]*Optional\s+Resources[^\w]*:?\s*$/i
  ];
  const h4Names = [
    /^[^\w]*Reading(?:s)?[^\w]*:?\s*$/i, 
    /^[^\w]*Video(?:s)?[^\w]*:?\s*$/i, 
    /^[^\w]*Articles[^\w]*:?\s*$/i, 
    /^[^\w]*Podcasts[^\w]*:?\s*$/i, 
    /^[^\w]*Tools[^\w]*:?\s*$/i, 
    /^[^\w]*Websites[^\w]*:?\s*$/i, 
    /^[^\w]*Case\s+Studies[^\w]*:?\s*$/i,
    /^[^\w]*Textbook Readings[^\w]*:?\s*$/i,
    // --- THIS IS THE FIX ---
    /^[^\w]*Experimenting\s+with\s+an\s+LLM[^\w]*:?\s*$/i
    // --- END FIX ---
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
    // --- NEW LOGIC ---
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

    // --- NEW LOGIC ---
    // If this is the Exercise line and it's less indented than the
    // current level, force it to *be* at the current level.
    if (isExerciseLine && indent < currentIndent) {
        indent = currentIndent;
    }
    // --- END NEW LOGIC ---

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

    // --- NEW LOGIC V3 ---
    // A line is a bullet if it's the special "Exercise:" line
    const isExerciseLine = /^\s*(\*\*|__)*\s*Exercise\s*(\*\*|__)*:/i.test(raw);
    
    // A line is a bullet if it starts with a bullet marker
    const isStandardBullet = /^\s*([-•\*]|\d+[\.)])\s+/.test(raw);

    // A line is a bullet if it's either
    const isBulletLine = isExerciseLine || isStandardBullet;

    // An H4 is a line that is NOT a bullet, AND ends with a colon, AND is not a URL
    const isGenericH4 = !isBulletLine && 
                        !/https?:\/\//.test(line) && 
                        /.+:\s*$/.test(line);
    // --- END NEW LOGIC V3 ---


    // --- 1. HEADING DETECTION ---

    // Check H3 (e.g., "Required Resources")
    // Use the new robust regex
    if (h3Names.some(re => isSection(line, re))) {
      closeList();
      flushPendingVideo();
      const heading = line.replace(/[^\w\s]/g, '').trim().replace(/:$/, ''); // Simple clean
      bodyHtml += `<h3>${heading}</h3>\n`;
      currentListType = null;
      continue;
    }

    // Check H4 (e.g., "Readings:", "Videos:", "Experimenting with an LLM:")
    // Use the new isGenericH4 flag
    if (h4Names.some(re => isSection(line, re)) || isGenericH4) {
      closeList();
      flushPendingVideo();
      const name = line.replace(/[^\w\s]/g, '').trim().replace(/:$/, ''); // Simple clean
      bodyHtml += `<h4>${name}</h4>\n`;
      
      // Set the parser mode for the content *following* this heading
      // Use the robust regex again to check
      if (/^[^\w]*Video/i.test(line)) {
        currentListType = 'videos';
      } else if (/^[^\w]*Textbook Readings/i.test(line)) {
        currentListType = 'textbook';
      } else if (/^[^\w]*Reading/i.test(line)) {
        currentListType = 'readings';
      } else {
        currentListType = 'generic'; // "Experimenting...", "Articles:", etc.
      }
      continue; // Done with this line
    }

    // --- 2. CONTENT PARSING ---

    // A. Handle "Videos" section (special logic)
    // This logic is now correctly triggered because "**Video:**" is identified as H4
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
      // This logic is now triggered for "**Exercise:**" because isBulletLine is true
      if (!isBulletLine) {
         // This is a paragraph *inside* a section (e.g., an intro).
         closeList(); // Stop any list.
         bodyHtml += `<p>${autolink(line)}</p>\n`; // Treat as a plain paragraph.
         continue;
      }

      // It's a bullet. Handle indentation.
      handleIndent(raw);
      
      // Clean the line, removing standard bullet markers
      const cleanLine = line.replace(/^[-•\*]\s*/, '').replace(/^\d+[\.)]\s+/, '');

      // Special formatting for bolded "Exercise:"
      // This will now catch "**Exercise:**" as cleanLine will be "**Exercise:** Ask..."
      let content = autolink(cleanLine).replace(/^(\*\*|__)*\s*Exercise\s*(\*\*|__)*:/i, '<strong>Exercise:</strong>');
      
      // --- NEW FIX: Convert markdown bold/italic ---
      const exercisePrefix = '<strong>Exercise:</strong>';
      if (content.startsWith(exercisePrefix)) {
          // For exercise line, convert markdown *after* the strong tag
          let rest = content.substring(exercisePrefix.length);
          rest = rest
              .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')  // **bold**
              .replace(/\*([^*]+)\*/g, '<em>$1</em>');             // *italic*
          content = exercisePrefix + rest;
      } else {
           // For all other lines, convert markdown
           content = content
              .replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>')  // **bold**
              .replace(/\*([^\*]+)\*/g, '<em>$1</em>');             // *italic*
      }
      // --- END NEW FIX ---

      // Handle "Title URL" pattern
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
          // Don't re-link if it's already the "Exercise:" line
          if (!content.startsWith('<strong>Exercise:')) {
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
            <p><strong>IMPORTANT:</strong> It can take up to 20 hours to study the material in this module and to successfully complete the assessments. Waiting until the weekend to consume all the material can lead to poor outcomes as you will not have sufficient time to absorb the content. If you plan out your week and complete a little bit every day, you will fare far better and have adequate time to seek answers to questions.</p>
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
  // Parse the content for prompt and objectives
  const lines = content.split(/\r?\n/);
  let promptLines: string[] = [];
  let objectives: string[] = [];
  let inObjectives = false;
  
  // Section headers that should stop objectives collection
  const stopHeaders = /^(Response to Classmates?|Instructions?|Criteria for Success|Grading Rubric|TIP):?\s*$/i;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) {
      if (!inObjectives && promptLines.length > 0) {
        promptLines.push(''); // Preserve spacing in prompt
      }
      continue;
    }
    
    // Skip if this is a "Prompt:" header (to avoid duplication)
    if (/^Prompt:?\s*$/i.test(trimmed)) continue;
    
    // Stop collecting objectives if we hit a new section
    if (inObjectives && stopHeaders.test(trimmed)) {
      break; // Stop processing, we have everything we need
    }
    
    // Check for objectives section
    if (/objectives?:?\s*$/i.test(trimmed) || /^This discussion aligns/i.test(trimmed)) {
      inObjectives = true;
      continue;
    }
    
    // Collect objectives (lines starting with bullet or number, or plain lines when in objectives section)
    if (inObjectives) {
      // Remove bullet markers and numbering
      const cleaned = trimmed.replace(/^[●•\-\*]\s+/, '').replace(/^\d+[\.)]\s+/, '');
      if (cleaned) {
        objectives.push(cleaned);
      }
    } else {
      // Collect prompt content
      promptLines.push(line);
    }
  }
  
  // Process prompt content: detect lists and format them
  let promptHtml = '';
  let inList = false;
  let currentParagraph = '';
  
  for (let i = 0; i < promptLines.length; i++) {
    const line = promptLines[i];
    const trimmed = line.trim();
    
    // Check if this is a list item (starts with bullet or is after a list-introducing line)
    const isBullet = /^[●•\-\*]\s+/.test(trimmed);
    const hasColonPrefix = /^[^:]+:\s+/.test(trimmed);
    
    // Detect list context: lines that end with ":" and next line is a bullet/colon-prefix
    const nextLine = i + 1 < promptLines.length ? promptLines[i + 1].trim() : '';
    const isListIntro = trimmed.endsWith(':') && (
      /^[●•\-\*]\s+/.test(nextLine) || /^[^:]+:\s+/.test(nextLine)
    );
    
    // Split multi-colon lines into separate list items (e.g., "Identify: ... Assess: ... Mitigate: ...")
  const multiColonMatches = (trimmed.match(/[A-Z][A-Za-z0-9\-,'() ]{0,80}:\s/g) || []).length;
  if (!isBullet && !hasColonPrefix && multiColonMatches >= 2) {
      // Close any open paragraph
      if (currentParagraph.trim()) {
        promptHtml += `<p>${currentParagraph.trim()}</p>\n`;
        currentParagraph = '';
      }
      // Start a list
      if (!inList) {
        promptHtml += '<ul>\n';
        inList = true;
      }
      const segments = trimmed.split(/(?<=:)\s+(?=[A-Z][^:]+:\s)/);
      for (const seg of segments) {
        const itemText = seg.replace(/^([^:]+):\s*/, '<strong>$1:</strong> ');
        promptHtml += `<li>${itemText}</li>\n`;
      }
      // Close list after processing multi-colon line
      if (inList) {
        promptHtml += '</ul>\n';
        inList = false;
      }
      continue;
    }

    // Start a list for standalone colon-prefixed lines (e.g., "Case Overview: ...") when not already in a list
    if (!isBullet && hasColonPrefix && !inList) {
      // Close any open paragraph
      if (currentParagraph.trim()) {
        promptHtml += `<p>${currentParagraph.trim()}</p>\n`;
        currentParagraph = '';
      }
      promptHtml += '<ul>\n';
      inList = true;
    }

    if (isBullet || hasColonPrefix || (inList && hasColonPrefix)) {
      // Close any open paragraph
      if (currentParagraph.trim()) {
        promptHtml += `<p>${currentParagraph.trim()}</p>\n`;
        currentParagraph = '';
      }
      
      // Start list if not already in one
      if (!inList) {
        promptHtml += '<ul>\n';
        inList = true;
      }
      
      // Remove bullet marker
  let itemText = trimmed.replace(/^[●•\-\*]\s+/, '');
      
      // Bold text before colon if present
      itemText = itemText.replace(/^([^:]+):\s*/, '<strong>$1:</strong> ');
      
      promptHtml += `<li>${itemText}</li>\n`;
  } else if (trimmed === '') {
      // Empty line - close list if open
      if (inList) {
        promptHtml += '</ul>\n';
        inList = false;
      }
      // Add to paragraph buffer if we have content
      if (currentParagraph.trim()) {
        promptHtml += `<p>${currentParagraph.trim()}</p>\n`;
        currentParagraph = '';
      }
  } else if (isListIntro) {
      // Line ending with colon that introduces a list - treat as a paragraph heading before the list
      if (currentParagraph.trim()) {
        promptHtml += `<p>${currentParagraph.trim()}</p>\n`;
      }
      promptHtml += `<p>${trimmed}</p>\n`;
      currentParagraph = '';
    } else {
      // Regular text - accumulate in paragraph
      if (currentParagraph) {
        currentParagraph += ' ' + trimmed;
      } else {
        currentParagraph = trimmed;
      }
    }
  }
  
  // Close any remaining open tags
  if (inList) {
    promptHtml += '</ul>\n';
  }
  if (currentParagraph.trim()) {
    promptHtml += `<p>${currentParagraph.trim()}</p>\n`;
  }
  
  // Bold due dates (day of week followed by "at HH:MM" pattern)
  promptHtml = promptHtml.replace(
    /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+at\s+\d{1,2}:\d{2}\s+(?:a\.m\.|p\.m\.)\s+ET/gi,
    '<strong>$&</strong>'
  );
  
  // Build objectives list
  const objectivesHtml = objectives.length 
    ? objectives.map(obj => `<li>${obj}</li>`).join('\n        ')
    : '<li>Objective 1</li>\n        <li>Objective 2</li>';

  return `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
    <h3>Prompt:</h3>
    ${promptHtml}
    <p>This discussion aligns with the following module objectives:</p>
    <ul>
        ${objectivesHtml}
    </ul>
    <h3>Response to Classmates:</h3>
    <p>Review and respond to at least two of your classmates&rsquo; postings. Your responses need not be long, but they should add substantial thought to the topic. You may certainly respond to more than two classmate posts but will only be graded on two. Consider spreading the wealth if you see a post that hasn&rsquo;t received a response. Respond by continuing the conversation through quality engagement in any of the following ways:&nbsp;</p>
    <ul>
        <li>Offering a new point of view</li>
        <li>Asking a question to further the discussion</li>
        <li>Sharing personal experiences or knowledge</li>
        <li>Tying the information to new knowledge gained</li>
        <li>Offering further research or information on the topic</li>
    </ul>
    <h3>Instructions:</h3>
    <ul>
        <li>Your initial post and response posts to at least two peers should be substantive and add value to the conversation.</li>
        <li>Your initial post (approximately 300&ndash;350 words) is due by <strong>Wednesday at 11:59 p.m. ET.</strong></li>
        <li>Response posts (approximately 150&ndash;200 words each) are due by <strong>Saturday at 11:59 p.m. ET.</strong></li>
    </ul>
    <h3>Criteria for Success (Grading Rubric):</h3>
    <ul>
        <li>Refer to the discussion rubric for additional details. Click the Options icon (three dots on the top-right of this page) and select the Show Rubric link.</li>
    </ul>
    <hr />
    <p><strong>TIP:</strong> To avoid inadvertent data loss, first compose your discussion entries in a Word document. Then, cut and paste your text into the discussion window and submit it.</p>
</div>`;
}

/**
 * WFU Assignment Template
 * Wake Forest University SPS assignment page format
 * Same HTML structure for all modules, only title changes
 */
function formatWFUAssignment(content: string, context: TemplateContext = {}): string {
  // The raw content may include well-structured headings (lines ending with ':') and bullets.
  // We parse and transform it into the standardized WFU assignment layout.
  const lines = content.split(/\r?\n/);
  interface Section { heading: string; lines: string[]; subsections: Section[]; }
  const majorHeadings = new Set([
    'Purpose',
    'Scenario',
    'Task',
    'Instructions',
    'Submission Instructions',
    'Criteria for Success (Grading Rubric)',
    'AI Usage Log and Reflection',
    'AI Usage Log and Reflection (Required)'
  ]);
  // Regex for 'Part X:' headings
  const partHeadingRegex = /^Part\s*\d+:\s*(.*)$/i;
  const headingRegex = /^\s*(.+?):\s*$/;
  const sections: Section[] = [];
  let current: Section | null = null;

  const unwrapStrong = (s: string) => s.replace(/^<strong>([\s\S]+)<\/strong>$/i, '$1');
  for (const raw of lines) {
    let line = raw.replace(/\t/g, '    '); // normalize tabs
    let trimmed = line.trim();
    if (!trimmed) {
      if (current) current.lines.push('');
      continue;
    }

    // Check for 'Part X:' headings
    const partMatch = trimmed.match(partHeadingRegex);
    if (partMatch) {
      // New section for Part X
      current = { heading: trimmed, lines: [], subsections: [] };
      sections.push(current);
      continue;
    }

    // Check if this line starts with a known major heading followed by a colon, possibly with HTML tags
    const visible = trimmed.replace(/<[^>]+>/g, '').trim();
    const lower = visible.toLowerCase();
    let matchedHeading: string | null = null;
    for (const h of Array.from(majorHeadings)) {
      const hLower = h.toLowerCase();
      if (lower.startsWith(hLower + ':')) {
        matchedHeading = h;
        break;
      }
    }
    if (matchedHeading) {
      // If entire line is wrapped in <strong>, unwrap first to avoid leaking closing tags into remainder
      if (/^<strong>[\s\S]+<\/strong>$/i.test(trimmed)) {
        trimmed = unwrapStrong(trimmed);
        line = trimmed; // keep in sync
      }
      // New major section
      current = { heading: matchedHeading, lines: [], subsections: [] };
      sections.push(current);
      // Anything after the first colon belongs to this section as inline text
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx !== -1) {
        const remainder = trimmed.slice(colonIdx + 1).replace(/^\s+/, '');
        // Don't add stray closing tags as content
        if (remainder && remainder !== '</strong>') {
          current.lines.push(unwrapStrong(remainder));
        }
      }
      continue;
    }

    // Check if this line is a bullet or numbered item (not a heading)
    const isBulletLine = /^[●•\-*]\s+/.test(trimmed) || /^\d+[\.)]\s+/.test(trimmed);

    const m = trimmed.match(headingRegex);
    if (m && !isBulletLine) {
      const headingText = m[1].trim();
      if (majorHeadings.has(headingText)) {
        // New major section (classic style: heading line ends with colon and no extra text)
        current = { heading: headingText, lines: [], subsections: [] };
        sections.push(current);
        continue;
      }
      // If not a major heading and not a bullet, fall through as content
    }
    // Regular content line (including bullets that end with colons)
    // Preserve leading indentation for list structure; trim only trailing whitespace
    const preserved = unwrapStrong(line.replace(/\s+$/, ''));
    // Skip lines that are only closing HTML tags (artifacts from split strong tags)
    if (/^<\/[a-z]+>$/i.test(preserved.trim())) {
      continue;
    }
    if (current) current.lines.push(preserved);
    else {
      // No heading encountered yet; treat as Purpose preamble
      if (!sections.length) {
        current = { heading: 'Purpose', lines: [preserved], subsections: [] };
        sections.push(current);
      } else {
        // Append to last section
        sections[sections.length - 1].lines.push(preserved);
      }
    }
  }

  // Helper to render lines into HTML paragraphs and lists
  const renderLines = (ls: string[], opts: { forceUnorderedStyle?: boolean } = {}): string => {
    let htmlOut = '';
    let para: string[] = [];
    type ListCtx = { type: 'ul' | 'ol'; depth: number; hasOpenLi?: boolean };
    const stack: ListCtx[] = [];

    // Find minimum bullet depth to normalize indentation
    // Skip normalization for Instructions section (forceUnorderedStyle) since it uses preprocessed indentation
    let minBulletDepth: number | null = null;
    if (!opts.forceUnorderedStyle) {
      for (const line of ls) {
        const l = line.replace(/\t/g, '    ');
        const leading = (l.match(/^\s*/) || [''])[0].length;
        const t = l.trim();
        const isBullet = /^\d+[\.)]\s+/.test(t) || /^[●•\-*]\s+/.test(t) || /^-\s+/.test(t);
        if (isBullet) {
          const depth = Math.floor(leading / 2);
          if (minBulletDepth === null || depth < minBulletDepth) {
            minBulletDepth = depth;
          }
        }
      }
    }
    if (minBulletDepth === null) minBulletDepth = 0;

    const flushPara = () => {
      const text = para.join(' ').trim();
      if (text) {
        // Convert markdown-style bold/italic to HTML
        let html = text
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')  // **bold**
          .replace(/\*([^*]+)\*/g, '<em>$1</em>');             // *italic*
        htmlOut += `<p>${html}</p>\n`;
      }
      para = [];
    };
    const openList = (type: 'ul' | 'ol', depth: number) => {
      // Close any open <li> in the parent list before opening nested list
      if (stack.length > 0 && stack[stack.length - 1].hasOpenLi) {
        // Don't close the <li> yet - we're nesting inside it
        // The nested list will be inside this <li>
      }
      
      if (type === 'ol') {
        htmlOut += depth === 0 ? '<ol style="list-style-type: decimal;">\n' : '<ol>\n';
      } else {
        if (opts.forceUnorderedStyle) {
          // Depth-based bullet style differentiation for Instructions
          // depth 0-1 (0-2 spaces, base bullets): circle (hollow)
          // depth 2 (4 spaces, first nested level): disc (filled)
          // depth 3+ (6+ spaces, deeper nested): square
          const styleType = depth <= 1 ? 'circle' : depth === 2 ? 'disc' : 'square';
          htmlOut += `<ul style="list-style-type: ${styleType};">\n`;
        } else {
          htmlOut += '<ul>\n';
        }
      }
      stack.push({ type, depth, hasOpenLi: false });
    };
    const closeList = () => {
      const ctx = stack.pop();
      if (!ctx) return;
      // Close any unclosed <li> before closing the list
      if (ctx.hasOpenLi) {
        htmlOut += '</li>\n';
      }
      htmlOut += ctx.type === 'ol' ? '</ol>\n' : '</ul>\n';
    };
    const closeToDepth = (target: number) => {
      while (stack.length && stack[stack.length - 1].depth > target) closeList();
    };
    const ensureDepth = (depth: number, type: 'ul' | 'ol') => {
      if (!stack.length || stack[stack.length - 1].depth < depth) {
        openList(type, depth);
        return;
      }
      if (stack[stack.length - 1].depth > depth) {
        closeToDepth(depth);
      }
      // If same depth but different type, switch
      if (stack.length && stack[stack.length - 1].depth === depth && stack[stack.length - 1].type !== type) {
        closeList();
        openList(type, depth);
      }
    };

  for (let i = 0; i < ls.length; i++) {
      let l = ls[i].replace(/\t/g, '    ');
      const leading = (l.match(/^\s*/) || [''])[0].length;
      const rawDepth = Math.floor(leading / 2);
      const depth = rawDepth - minBulletDepth; // Normalize to start at 0
      const t = l.trim();

      if (!t) {
        flushPara();
        // Close all open lists on blank line to avoid bleed
        while (stack.length) closeList();
        continue;
      }

      const isOrdered = /^\d+[\.)]\s+/.test(t);
      const isUnordered = /^[●•\-*]\s+/.test(t) || /^-\s+/.test(t);
      const isBullet = isOrdered || isUnordered;

      if (isBullet) {
        flushPara();
  const type: 'ul' | 'ol' = isOrdered ? 'ol' : 'ul';
  ensureDepth(depth, type);

        // Clean item text
        let item = t
          .replace(/^[●•\-*]\s+/, '')
          .replace(/^\d+[\.)]\s+/, '')
          .replace(/^-+\s*/, '')
          .trim();

        // Convert markdown-style bold/italic to HTML
        item = item
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')  // **bold**
          .replace(/\*([^*]+)\*/g, '<em>$1</em>');             // *italic*

        // Bold leading colon-prefix phrase: "Label: rest" (if not already bolded)
        // Bold colon-prefix if pattern present and not already wrapped
        if (/^[^:<]{1,120}:\s/.test(item) && !/^<strong>[^<]+:<\/strong>/.test(item)) {
          item = item.replace(/^([^:]{1,120}):\s*/, '<strong>$1:</strong> ');
        }

        // Check if next line is a deeper bullet (needs nesting)
        const nextLineIdx = i + 1;
        let hasNestedBullet = false;
        if (nextLineIdx < ls.length) {
          const nextLine = ls[nextLineIdx].replace(/\t/g, '    ');
          const nextLeading = (nextLine.match(/^\s*/) || [''])[0].length;
          const nextDepth = Math.floor(nextLeading / 2);
          const nextTrimmed = nextLine.trim();
          const nextIsBullet = /^\d+[\.)]\s+/.test(nextTrimmed) || /^[●•\-*]\s+/.test(nextTrimmed) || /^-\s+/.test(nextTrimmed);
          hasNestedBullet = nextIsBullet && nextDepth > depth;
        }

        if (hasNestedBullet) {
          // Don't close <li> yet - nested list will follow
          htmlOut += `<li>${item}\n`;
          // Mark that the current list has an open <li>
          if (stack.length > 0) {
            stack[stack.length - 1].hasOpenLi = true;
          }
        } else {
          htmlOut += `<li>${item}</li>\n`;
        }
        continue;
      }

      // Regular paragraph text; close deeper lists if any
      if (stack.length && depth < stack[stack.length - 1].depth) {
        closeToDepth(depth);
      }
      para.push(t);
    }

    flushPara();
    while (stack.length) closeList();
    return htmlOut;
  };

  // Specialized renderer for Instructions section
  const renderInstructions = (ls: string[]): string => {
    // Split out any prelude paragraphs before the first top-level bullet/numbered line
    const prelude: string[] = [];
    type TopItem = { title: string; sublines: string[] };
    const items: TopItem[] = [];

    const isOrdered = (t: string) => /^\d+[\.)]\s+/.test(t);
    const isUnordered = (t: string) => /^[●•\-*]\s+/.test(t) || /^-\s+/.test(t);
    const isBulletish = (t: string) => isOrdered(t) || isUnordered(t);

    let i = 0;

    // Heuristic: If the well-known headings appear, group by them regardless of indentation.
    const expected = [
      'Scenario Development (Required Pre-Work)',
      'Risk Analysis',
      'Corporate Governance and Accountability',
      'Strategic Framework for Response'
    ];
    const normalize = (s: string) => s
      .replace(/<strong>|<\/strong>/gi, '')
      .replace(/^[-●•*]\s+/, '')
      .replace(/^\d+[\.)]\s+/, '')
      .replace(/^-+\s*/, '')
      .replace(/^\s*"|"\s*$/g, '')
      .replace(/:\s*$/, '')
      .trim()
      .toLowerCase();
    const expectedSet = new Set(expected.map(e => e.toLowerCase()));

    // Find heading indices
    const headingIdxs: Array<{ idx: number; title: string }> = [];
    for (let idx = 0; idx < ls.length; idx++) {
      const raw = ls[idx];
      const t = raw.replace(/\t/g, '    ').trim();
      if (!t) continue;
      const n = normalize(t.replace(/:$/, ''));
      if (expectedSet.has(n)) {
        // Use canonical casing from expected
        const canon = expected.find(e => e.toLowerCase() === n)!;
        headingIdxs.push({ idx, title: canon });
      }
    }

    if (headingIdxs.length >= 2) {
      // Group by detected headings
      // Prelude is everything before the first heading
      const firstIdx = headingIdxs[0].idx;
      for (let k = 0; k < firstIdx; k++) prelude.push(ls[k]);
      for (let h = 0; h < headingIdxs.length; h++) {
        const start = headingIdxs[h].idx;
        const end = h + 1 < headingIdxs.length ? headingIdxs[h + 1].idx : ls.length;
        const titleLine = ls[start];
        // Build title from detected canonical title but preserve any inline bolding present
        let title = headingIdxs[h].title;
        // Preserve strong if present on original line before colon
        const strongMatch = titleLine.match(/<strong>(.+?)<\/strong>/i);
        if (strongMatch) title = strongMatch[1];
        
  // Collect sublines and convert specific patterns to proper bullets with indentation
  const rawSublines = ls.slice(start + 1, end);
  const processedSublines: string[] = [];
        
  // Track context for smart nesting decisions
  let insideRecommend = false;
  let insideIncludeSteps = false;
  let lastUploadLineIndex: number | null = null;
        
        for (let i = 0; i < rawSublines.length; i++) {
          const line = rawSublines[i];
          const trimmed = line.replace(/\t/g, '    ').trim();
          if (!trimmed) {
            processedSublines.push(line);
            continue;
          }
        
          // Normalize working text by stripping any leading bullet/number markers
          const working = trimmed.replace(/^[-●•*]\s+/, '').replace(/^\d+[\.)]\s+/, '');
          const prevRaw = i > 0 ? rawSublines[i - 1].replace(/\t/g, '    ').trim() : '';
          const prevWorking = prevRaw.replace(/^[-●•*]\s+/, '').replace(/^\d+[\.)]\s+/, '');
          let handled = false;

          // Detect when we're inside "Recommend a response..." context
          if (/Recommend a response and recovery framework/i.test(working)) {
            insideRecommend = true;
            // ensure it's a bullet at base level
            processedSublines.push(`- ${working}`);
            handled = true;
          }

          // Pattern 1: Quoted line → nest under previous "Upload or paste" bullet (4 spaces)
          if (!handled && /Upload or paste.*into your AI tool/i.test(prevWorking) && /^[“”"']/.test(working)) {
            processedSublines.push(`    - ${working}`);
            handled = true;
          }
          // Pattern 2: "Include specific steps for:" when inside Recommend context → nest (4 spaces)
          if (!handled && insideRecommend && /Include specific steps for:/i.test(working)) {
            insideIncludeSteps = true;
            processedSublines.push(`    - ${working}`);
            handled = true;
          }
          // Pattern 3: Crisis/Stakeholder/Long-term when inside Include Steps context → nest deeply (6 spaces)
          if (!handled && insideIncludeSteps && /^(Crisis response|Stakeholder communication|Long-term improvements)/i.test(working)) {
            processedSublines.push(`      - ${working}`);
            handled = true;
            // Keep include steps active until a non-matching line appears
          }
          // Pattern 4: "Use AI to compare" when inside Recommend context → nest (4 spaces)
          if (!handled && insideRecommend && /Use AI to compare frameworks/i.test(working)) {
            processedSublines.push(`    - ${working}`);
            handled = true;
          }

          // Fallback: auto-bullet non-empty lines that are not headings
          if (!handled) {
            const looksHeading = expectedSet.has(normalize(working.replace(/:$/, '')));
            const alreadyBullet = /^[-●•*]\s+/.test(trimmed) || /^\d+[\.)]\s+/.test(trimmed);
            if (!looksHeading && !alreadyBullet) {
              processedSublines.push(`- ${working}`);
            } else {
              processedSublines.push(line);
            }
          }
        }

        items.push({ title, sublines: processedSublines });
      }
      // Render with <ol> and nested circles
      let html = '';
      if (prelude.length) html += renderLines(prelude);
      if (items.length) {
        html += '<ol style="list-style-type: decimal;">\n';
        for (const it of items) {
          let titleHtml = it.title;
          // Clean up double colons and trailing colons
          titleHtml = titleHtml.replace(/:{2,}/g, ':').replace(/:\s*$/, '');
          // Bold the title and add single colon
          if (!/^<strong>/.test(titleHtml)) {
            titleHtml = `<strong>${titleHtml}:</strong>`;
          } else {
            // Already has strong, ensure colon after closing tag
            titleHtml = titleHtml.replace(/<\/strong>\s*:?\s*$/i, '</strong>:');
          }
          
          let content = it.sublines.length ? renderLines(it.sublines, { forceUnorderedStyle: true }) : '';
          
          // Post-process content to fix common Google Docs pasting issues:
          // 1. Quoted lines (starting with ldquo/rdquo) are continuation, nest them
          // 2. Lines without bullet markers that follow bullets should nest
          // 3. Adjacent <ul> siblings at same level should stay separate unless continuation
          
          // Pattern 1: A quoted line appearing as top-level <li> after </ul> - nest it under previous item
          // Example: </li>\n</ul>\n<ul...>\n<li>&ldquo;Given this...&rdquo;</li>
          // Should become: </li>\n<ul...>\n<li>&ldquo;Given this...&rdquo;</li>\n</ul>\n</li>
          content = content.replace(
            /(<\/li>\n)(<\/ul>\n)(<ul style="list-style-type: circle;">\n)(<li>(?:&ldquo;|&quot;|")[^<]*(?:&rdquo;|&quot;|")<\/li>\n)/g,
            (match, endLi, endUl, startUl, quotedItem) => {
              // Move the quoted item inside the previous ul, before its closing tag
              return `${startUl}${quotedItem}${endUl}${endLi}`;
            }
          );
          
          // Pattern 2: Three specific bullets (Crisis/Stakeholder/Long-term) appearing as top-level after "Include specific steps"
          // Detect by content match and wrap in nested ul
          content = content.replace(
            /(<li>Include specific steps for:<\/li>\n)(<\/ul>\n)?(<ul[^>]*>\n)?(<li>Crisis response<\/li>\n<li>Stakeholder communication[^<]*<\/li>\n<li>Long-term improvements[^<]*<\/li>\n)/gi,
            (match, includeItem, maybeEndUl, maybeStartUl, threeBullets) => {
              return `${includeItem}<ul style="list-style-type: circle;">\n${threeBullets}</ul>\n`;
            }
          );
          
          // Pattern 3: Fix incorrectly adjacent <ul> siblings when not continuation content
          content = content.replace(
            /<\/li>\n<\/ul>\n<ul style="list-style-type: circle;">\n<li>/g,
            '\n<ul style="list-style-type: circle;">\n<li>'
          );
          
          html += content ? `<li>${titleHtml}\n${content}</li>\n` : `<li>${titleHtml}</li>\n`;
        }
        html += '</ol>\n';
      }
      return html;
    }
    // Determine the top-level depth for bullets in this section
    let topDepth: number | null = null;
    for (let j = 0; j < ls.length; j++) {
      const raw = ls[j];
      const t = raw.replace(/\t/g, '    ').trim();
      if (!t) continue;
      if (isBulletish(t)) {
        const leading = (raw.match(/^\s*/) || [''])[0].length;
        topDepth = Math.floor(leading / 2);
        break;
      }
    }
    if (topDepth == null) topDepth = 0;
    // Collect prelude
    for (; i < ls.length; i++) {
      const raw = ls[i];
      const t = raw.replace(/\t/g, '    ').trim();
      const leading = (raw.match(/^\s*/) || [''])[0].length;
      const depth = Math.floor(leading / 2);
      if (t && depth === topDepth && isBulletish(t)) break;
      prelude.push(raw);
    }

    // Group top-level items (depth 0 bullets/numbers) with their nested sublines
    let current: TopItem | null = null;
    for (; i < ls.length; i++) {
      const raw = ls[i];
      const line = raw.replace(/\t/g, '    ');
      const t = line.trim();
      const leading = (line.match(/^\s*/) || [''])[0].length;
      const depth = Math.floor(leading / 2);
      const bullet = isBulletish(t);

      if (!t) {
        // keep spacing inside current item details if any
        if (current) current.sublines.push('');
        continue;
      }

      if (depth === topDepth && bullet) {
        // Start a new top-level item
        const title = t
          .replace(/^[●•\-*]\s+/, '')
          .replace(/^\d+[\.)]\s+/, '')
          .replace(/^-+\s*/, '')
          .trim();
        if (current) items.push(current);
        current = { title, sublines: [] };
      } else {
        // Nested content of current item
        if (!current) {
          // If malformed (nested before any item), treat as prelude
          prelude.push(raw);
        } else {
          current.sublines.push(raw);
        }
      }
    }
    if (current) items.push(current);

    // Helper to render nested bullets as circle-style ULs
    const renderNestedBulletsCircle = (subls: string[], baseDepth = topDepth + 1): string => {
      let htmlOut = '';
      type Ctx = { depth: number };
      const stack: Ctx[] = [];

      const openList = (depth: number) => {
        htmlOut += '<ul style="list-style-type: circle;">\n';
        stack.push({ depth });
      };
      const closeList = () => {
        stack.pop();
        htmlOut += '</ul>\n';
      };
      const closeToDepth = (target: number) => {
        while (stack.length && stack[stack.length - 1].depth > target) closeList();
      };
      const ensureDepth = (depth: number) => {
        if (!stack.length || stack[stack.length - 1].depth < depth) {
          openList(depth);
          return;
        }
        if (stack[stack.length - 1].depth > depth) closeToDepth(depth);
      };

      for (let k = 0; k < subls.length; k++) {
        let l = subls[k].replace(/\t/g, '    ');
        const leading = (l.match(/^\s*/) || [''])[0].length;
  const rawDepth = Math.floor(leading / 2);
  const depth = Math.max(0, rawDepth - baseDepth);
        let t = l.trim();
        if (!t) {
          // close deeper lists but keep current open
          continue;
        }
        const bullet = isBulletish(t);
        if (!bullet) {
          // Non-bullet lines are appended to the previous list item if present
          if (htmlOut.endsWith('</li>\n')) {
            // Append inline (simple heuristic)
            const appended = t
              .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
              .replace(/\*([^*]+)\*/g, '<em>$1</em>');
            htmlOut = htmlOut.replace(/<li>([^<]*?)<\/li>\n$/, (m, prev) => `<li>${prev} ${appended}</li>\n`);
            continue;
          }
          // If no previous list item, treat as paragraph outside list
          continue;
        }
        ensureDepth(depth);
        // Clean item text
        let item = t
          .replace(/^[●•\-*]\s+/, '')
          .replace(/^\d+[\.)]\s+/, '')
          .replace(/^-+\s*/, '')
          .trim();
        
        // Convert markdown-style bold/italic to HTML
        item = item
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')  // **bold**
          .replace(/\*([^*]+)\*/g, '<em>$1</em>');             // *italic*
        
        // Bold colon-prefix phrase (if not already bolded)
        if (!item.startsWith('<strong>')) {
          item = item.replace(/^([^:]{1,120}):\s*/, '<strong>$1:</strong> ');
        }
        
        htmlOut += `<li>${item}</li>\n`;
      }

      while (stack.length) closeList();
      return htmlOut;
    };

    // Build final HTML
    let html = '';
    if (prelude.length) {
      html += renderLines(prelude);
    }
    if (items.length) {
      html += '<ol style="list-style-type: decimal;">\n';
      for (const it of items) {
        // Convert markdown-style bold/italic to HTML
        let titleHtml = it.title
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')  // **bold**
          .replace(/\*([^*]+)\*/g, '<em>$1</em>');             // *italic*
        
        // Bold colon-prefix in the title (if not already bolded)
        if (/^[^:<]{1,120}:\s/.test(titleHtml) && !/^<strong>[^<]+:<\/strong>/.test(titleHtml)) {
          titleHtml = titleHtml.replace(/^([^:]{1,120}):\s*/, '<strong>$1:</strong> ');
        }
        
        if (it.sublines.length) {
          html += `<li>${titleHtml}\n${renderNestedBulletsCircle(it.sublines)}</li>\n`;
        } else {
          html += `<li>${titleHtml}</li>\n`;
        }
      }
      html += '</ol>\n';
    }
    return html;
  };

  // Render sections
  const assignmentTitle = context.assignmentTitle || context.title || 'Assignment';
  let body = `<h2>${assignmentTitle}</h2>`;
  for (const s of sections) {
    // Use h4 for 'Part X:' headings, h3 for others
    const tag = /^Part\s*\d+:/.test(s.heading) ? 'h4' : 'h3';
    body += `\n<${tag}>${s.heading}</${tag}>\n`;
    if (s.heading === 'Instructions') {
      // Always use specialized renderer to ensure correct grouping
      body += renderInstructions(s.lines);
    } else {
      // --- THIS IS THE FIX ---
      body += renderLines(s.lines); 
      // --- END FIX ---
      if (s.subsections.length) {
        for (const sub of s.subsections) {
          body += `\n<h4>${sub.heading}</h4>\n${renderLines(sub.lines)}`;
        }
      }
    }
  }

  // Bold due date patterns inside body
  body = body.replace(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+at\s+\d{1,2}:\d{2}\s+(?:a\.m\.|p\.m\.)\s+ET/gi, '<strong>$&</strong>');
  // Also catch lines like 'Sunday at 11:59 p.m. ET.' (with trailing period)
  body = body.replace(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+at\s+\d{1,2}:\d{2}\s+(?:a\.m\.|p\.m\.)\s+ET\./gi, '<strong>$&</strong>');
  
  // Clean up any double-wrapped strong tags that may have been created
  body = body.replace(/<strong>\s*<strong>([^<]+)<\/strong>\s*<\/strong>/gi, '<strong>$1</strong>');

  // Append points if provided
  if (typeof context.pointsPossible === 'number') {
    body += `\n<p><strong>Point Value:</strong> ${context.pointsPossible}</p>`;
  }

  return `<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">\n  ${body}\n</div>`;
}

/**
 * WFU Meet the Lead Faculty Template
 * Wake Forest University SPS faculty introduction page format
 */
function formatWFUMeetFaculty(content: string, context: TemplateContext = {}): string {
  const html = markdownToHtml(content);
  
  // Extract faculty details from context
  const facultyName = context.facultyName || 'Dr. Faculty Name, PhD, Credentials';
  let facultyImageUrl = '';
  if (context.courseId && context.facultyImageNumber) {
    facultyImageUrl = `https://wakeforest.instructure.com/courses/${context.courseId}/files/${context.facultyImageNumber}/download`;
  } else {
    facultyImageUrl = 'https://wakeforest.instructure.com/courses/77445/files/5804913/download';
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
            <p class="WFU-SubpageHeader">${context.courseName || 'Course Name'}</p>
            <h2 class="WFU-SubpageSubheader">Meet the Lead Faculty</h2>
        </div>
        <div class="col-xs-12 col-sm-8 col-md-8 col-lg-8">
            <h2>${facultyName}</h2>
            ${html}
            <h3>Contact Your Instructor</h3>
            <p>The instructor facilitating your online course may or may not be the lead faculty/course developer. Be assured that this instructor was chosen to meet very high standards and is a professional or acclaimed educator in their field. They will introduce themselves in the course announcements and will be responsible for answering questions, facilitating the synchronous sessions, providing feedback, and grading. To message the instructor/facilitator, use the message feature within Canvas.</p>
        </div>
    <div class="col-xs-12 col-sm-4 col-md-4 col-lg-4">
      <div class="">
        <p><img style="width: 450px; margin-left: auto; margin-right: auto; padding: 0px;" src="${facultyImageUrl}" alt="${facultyName}" data-api-endpoint="${facultyImageUrl.replace('/download', '')}" data-api-returntype="File" /></p>
      </div>
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
 * WFU Overview of Assessments Template
 * Wake Forest University SPS assessment overview page format
 * Custom parser to handle assessment categories as h3 and bullet points as lists
 */
function formatWFUAssessmentOverview(content: string, context: TemplateContext = {}): string {
  // Parse the content into sections based on assessment category headings
  // Pattern: standalone lines that don't start with bullets/numbers become h3
  const lines = content.split(/\r?\n/);
  let html = '';
  let inList = false;

  let lastHeader = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines - don't output anything for them
    if (!trimmed) {
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }
      continue;
    }

    // Remove multiple ** from headers and bolds, and bold before colon
    const cleanStars = (s: string) => {
      let out = s.replace(/\*\*+/g, '').trim();
      // Bold before colon (e.g., 'Point value:')
      out = out.replace(/(^|\s)([A-Za-z0-9 \-()]+:)/g, (m, pre, label) => pre + '<strong>' + label + '</strong>');
      return out;
    };

    // Check for "Point value:" line followed by "See..." line - format together
    if (/^\*?\*?point value:?/i.test(trimmed)) {
      // Close any open list
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }
      // Look ahead for "See..." line
      let pointLine = cleanStars(trimmed);
      let seeLine = '';
      if (i + 1 < lines.length) {
        const nextTrimmed = lines[i + 1].trim();
        if (/^see /i.test(nextTrimmed)) {
          seeLine = cleanStars(nextTrimmed);
          i++; // Skip the next line since we're consuming it
        }
      }
      // If previous header was "Course Reflection", do NOT render as header
      if (lastHeader.toLowerCase().includes('reflection')) {
        // No extra space between point value and rubric line
        if (seeLine) {
          html += `<p>${pointLine}<br />${seeLine}</p>\n`;
        } else {
          html += `<p>${pointLine}</p>\n`;
        }
      } else {
        // No extra space between point value and rubric line
        if (seeLine) {
          html += `<p>${pointLine}<br />${seeLine}</p>\n`;
        } else {
          html += `<p>${pointLine}</p>\n`;
        }
      }
      continue;
    }

    // Check if line is a bullet point (●, •, -, *, or numbered)
    const isBullet = /^[●•\-\*]\s+/.test(trimmed) || /^\d+[\.)]\s+/.test(trimmed);

    if (isBullet) {
      // Extract bullet content and remove multiple **
      const bulletContent = cleanStars(trimmed.replace(/^[●•\-\*]\s+/, '').replace(/^\d+[\.)]\s+/, ''));
      if (!inList) {
        html += '<ul>\n';
        inList = true;
      }
      html += `<li>${bulletContent}</li>\n`;
    } else {
      // Close any open list
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }
      // Check if this looks like a section header (e.g., "Discussions", "Assignments")
      // Heuristic: short line (< 50 chars), no ending punctuation except :
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
      const isLikelyHeader = trimmed.length < 50 && 
                             !trimmed.match(/[.!?]$/) && 
                             (nextLine.length > 50 || nextLine.startsWith('●') || nextLine.startsWith('•'));
      if (isLikelyHeader && !trimmed.toLowerCase().startsWith('see ')) {
        lastHeader = cleanStars(trimmed.replace(/:$/, ''));
        html += `<h3>${lastHeader}</h3>\n`;
      } else {
        html += `<p>${cleanStars(trimmed)}</p>\n`;
      }
    }
  }

  // Close any remaining list
  if (inList) {
    html += '</ul>\n';
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
            <p class="WFU-SubpageHeader"><span>${context.courseName || 'Course Name'}</span></p>
            <h2 class="WFU-SubpageSubheader">Overview of Assessments</h2>
        </div>
    </div>
    <div class="grid-row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
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
 * WFU Course Welcome Template
 * Wake Forest University SPS course welcome page format
 */
function formatWFUCourseWelcome(content: string, context: TemplateContext = {}): string {
  return `
    <div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
      <div class="grid-row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12" style="padding: 0px 0px 10px 0px;">
          <div class="WFU-SubpageHeader WFU-SubpageHeroGettingStarted">&nbsp;
            <div class="WFU-Banner-SchoolofProfessionalStudies">&nbsp;</div>
          </div>
        </div>
        <div class="grid-row">
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <p class="WFU-SubpageHeader">Incident Management and Business Continuity</p>
            <h2 class="WFU-SubpageSubheader">Course Welcome</h2>
            <h3>Introduction to CYB 720 Incident Management and Business Continuity</h3>
            <p>This course provides a comprehensive exploration of strategies and practices essential for responding to cybersecurity incidents and ensuring business continuity. Students will learn to plan, test, and execute incident management and disaster recovery strategies, including conducting Business Impact Analysis (BIA) to prioritize responses. The course emphasizes the importance of exercises to test preparedness plans and enhance cyber resiliency. Topics include incident detection and response, crisis communication, ethics, coordination of recovery efforts, and the integration of cybersecurity measures into business continuity plans.</p>
            <p>To begin your journey in this course, please visit the Modules page (linked in the left-hand navigation and below) and get acquainted with the following sections:</p>
            <ul>
              <li>Getting Started&nbsp;</li>
              <ul>
                <li>An introduction to the course instructor&nbsp;</li>
                <li>An overview of assessments</li>
                <li>Other important information about the course&nbsp;&nbsp;</li>
              </ul>
              <li>Tools for Success</li>
              <ul>
                <li>Resources to help improve your online education experience, including technical support, Canvas navigation tips, Zoom support, and more</li>
              </ul>
              <li>Opportunities for Engagement</li>
              <ul>
                <li>Ways to engage with your peers, instructors, and the university</li>
              </ul>
            </ul>
            <h3><a title="Getting Started" href="https://wakeforest.instructure.com/courses/77445/modules/258868">Module</a></h3>
          </div>
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"><a title="Module 1" href="https://wakeforest.instructure.com/courses/77445/modules/258871?wrap=1">Module 1: Foundations of Organizational Resilience and Risk Strategy</a></div>
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"><a title="Module 2" href="https(D:/AITEMP/index.ts.ts)://wakeforest.instructure.com/courses/77445/modules/258872?wrap=1">Module 2: Incident Detection and Executive Response Leadership</a></div>
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"><a title="Module 3" href="https://wakeforest.instructure.com/courses/77445/modules/258873?wrap=1">Module 3: Crisis Communication and Stakeholder Coordination</a></div>
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"><a title="Module 4" href="https://wakeforest.instructure.com/courses/77445/modules/258874?wrap=1">Module 4: Business Continuity Planning and Operational Recovery</a></div>
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"><a title="Module 5" href="https(D:/AITEMP/index.ts.ts)://wakeforest.instructure.com/courses/77445/modules/258875?wrap=1">Module 5: AI, Automation, and the Future of Incident Management</a></div>
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"><a title="Module 6" href="https://wakeforest.instructure.com/courses/77445/modules/258876?wrap=1">Module 6: Regulatory Compliance and Global Standards in Resilience</a></div>
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"><a title="Module 7" href="https://wakeforest.instructure.com/courses/77445/modules/258877?wrap=1">Module 7: Ethics, Governance, and Executive Accountability</a></div>
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"><a title="Module 8" href="https://wakeforest.instructure.com/courses/77445/modules/258878?wrap=1">Module 8: Reflection, Lessons Learned, and Capstone Simulation</a></div>
        </div>
      </div>
      <div class="grid-row">
        <div class="col-xs-12">
          <footer class="WFU-footer">This material is owned by Wake Forest University and is protected by U.S. copyright laws. All Rights Reserved.</footer>
        </div>
      </div>
    </div>
  `;
}

/**
 * Normalize Canvas file URL to canonical format with wrap=1
 * Accepts various Canvas file URL formats and returns: /courses/:courseId/files/:fileId?wrap=1
 */
function normalizeCanvasFileUrl(url: string, baseUrl?: string, courseId?: string): string {
  if (!url) return '';

  // Extract file ID from various Canvas file URL formats:
  // - /courses/36821/files/3427260/download
  // - /files/3427260/download
  // - https://wakeforest.instructure.com/courses/36821/files/3427260
  // - /courses/36821/files/3427260?wrap=1
  const fileIdMatch = url.match(/\/files\/(\d+)/);
  if (!fileIdMatch) return url; // Not a recognizable Canvas file URL; return as-is

  const fileId = fileIdMatch[1];

  // If we have baseUrl and courseId, construct absolute URL
  if (baseUrl && courseId) {
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    return `${cleanBaseUrl}/courses/${courseId}/files/${fileId}?wrap=1`;
  }

  // Otherwise construct relative URL (Canvas will resolve it)
  if (courseId) {
    return `/courses/${courseId}/files/${fileId}?wrap=1`;
  }

  // Fallback: just file ID with wrap
  return `/files/${fileId}?wrap=1`;
}

/**
 * WFU Course Syllabus Template
 * Renders standardized syllabus header with instructor info and download link
 */
function formatWFUCourseSyllabus(content: string, context: TemplateContext = {}): string {


      // Updated values per latest user request
      const courseName = context.courseName || '';
      const instructorName = context.instructorName || '';
      const instructorCredentials = context.instructorCredentials || '';
      const instructorEmail = context.instructorEmail || '';
      const syllabusFileName = context.syllabusFileName || '';
      const emailLink = `<a href="mailto:${instructorEmail}" target="_blank" rel="noopener">${instructorEmail}</a>`;

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
          <p><strong>Instructor:&nbsp;&nbsp;<span> &nbsp; </span></strong>&nbsp;${instructorName}, ${instructorCredentials}<br><strong></strong><strong>E-mail:&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </strong>${emailLink}<strong><br></strong><strong>Office:&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</strong>By appointment via Zoom &nbsp;<a href="https://wakeforest-university.zoom.us" target="_blank" rel="noopener">https://wakeforest-university.zoom.us</a><strong></strong></p>
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

/**
 * Main formatting function
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
 * Get available templates with descriptions
 */
export function getAvailableTemplates(): Array<{
  id: TemplateType;
  name: string;
  description: string;
  useCase: string;
}> {
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