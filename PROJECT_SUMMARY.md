# Canvas LMS Importer - Complete Application

## ✅ What We've Built

A fully functional Next.js web application that allows you to import formatted content into Canvas LMS courses. The application supports creating Pages, Discussions, and Assignments with professional formatting templates.

## 🎯 Key Features

### 1. **Canvas API Integration**
- Full integration with Canvas REST API
- Support for Pages, Discussions, and Assignments
- Connection testing and validation
- Flexible credential management (environment variables or UI input)

### 2. **Content Formatters (Templates)**
- **Lesson Page**: Structured lessons with learning objectives section
- **Assignment Brief**: Assignments with grading criteria and submission guidelines
- **Discussion Prompt**: Discussions with participation guidelines
- **Syllabus**: Course syllabus with structured sections
- **Announcement**: Simple announcements with date stamps
- **Plain**: Basic markdown to HTML conversion

### 3. **User Interface**
- Clean, modern UI built with Tailwind CSS
- Configuration form for Canvas credentials
- Import form with live preview
- Template selection dropdown
- Content type selection (Page/Assignment/Discussion)
- Success/error feedback with Canvas links

### 4. **Security Features**
- HTML sanitization using DOMPurify
- Server-side API token handling
- Input validation with Zod
- CORS protection

## 📁 Project Structure

```
canvas-importer/
├── app/
│   ├── api/import/
│   │   ├── page/route.ts           # Create Canvas pages
│   │   ├── assignment/route.ts     # Create assignments
│   │   └── discussion/route.ts     # Create discussions
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Main application
│   └── globals.css                  # Global styles
├── components/
│   ├── ConfigForm.tsx               # Canvas configuration
│   └── ImportForm.tsx               # Content import form
├── lib/
│   ├── canvas-api.ts                # Canvas API client
│   └── formatters/index.ts          # Content templates
├── .env.example                     # Environment template
├── package.json                     # Dependencies
└── tsconfig.json                    # TypeScript config
```

## 🚀 Getting Started

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment (optional):**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   CANVAS_BASE_URL=https://yourinstitution.instructure.com
   CANVAS_TOKEN=your_api_token_here
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:3000

### Canvas API Setup

1. Log into your Canvas LMS instance
2. Go to Account → Settings
3. Scroll to "Approved Integrations"
4. Click "+ New Access Token"
5. Give it a purpose (e.g., "Content Importer")
6. Copy the generated token
7. Find your Course ID in the course URL: `/courses/[ID]`

## 📝 Usage Guide

### Creating a Page

1. Configure Canvas credentials (Base URL, API Token, Course ID)
2. Click "Test Connection" to verify
3. Select "Page" as import type
4. Choose a template (e.g., "Lesson Page")
5. Enter page title
6. Add learning objectives (one per line)
7. Write content in markdown
8. Toggle "Show Preview" to see formatted output
9. Check "Publish immediately" if desired
10. Click "Create page"

### Creating an Assignment

1. Select "Assignment" as import type
2. Choose "Assignment Brief" template
3. Enter assignment title
4. Add learning objectives
5. Write assignment instructions in markdown
6. Set points possible
7. Set due date (optional)
8. Check publish status
9. Click "Create assignment"

### Creating a Discussion

1. Select "Discussion" as import type
2. Choose "Discussion Prompt" template
3. Enter discussion title
4. Write discussion prompt in markdown
5. Toggle options:
   - Require initial post before viewing replies
   - Allow users to rate posts
6. Click "Create discussion"

## 🎨 Available Templates

### Lesson Page
Adds a learning objectives section with icons and a footer with contact information.

**Best for:** Weekly lessons, module content, instructional pages

### Assignment Brief
Includes assignment header with points/due date, grading criteria section, and submission guidelines.

**Best for:** Essays, projects, homework assignments

### Discussion Prompt
Provides structured participation guidelines with initial post requirements and response expectations.

**Best for:** Forum discussions, debate topics, reflection prompts

### Syllabus
Professional syllabus formatting with course header and modification notice.

**Best for:** Course overview, policies, schedule

### Announcement
Simple formatting with date stamp.

**Best for:** Course updates, reminders, notifications

### Plain HTML
Just converts markdown to sanitized HTML without additional formatting.

**Best for:** Custom content, simple pages

## 🔧 API Endpoints

All endpoints accept JSON POST requests:

### POST `/api/import/page`
```json
{
  "courseId": "12345",
  "title": "Week 1 Overview",
  "rawContent": "# Welcome\n\nThis is the content...",
  "template": "lessonPage",
  "published": true,
  "objectives": ["Understand X", "Apply Y"],
  "canvasBaseUrl": "https://...",
  "canvasToken": "..."
}
```

### POST `/api/import/assignment`
```json
{
  "courseId": "12345",
  "title": "Essay Assignment",
  "rawContent": "## Instructions\n\nWrite...",
  "template": "assignmentBrief",
  "pointsPossible": 100,
  "dueAt": "2025-12-31T23:59:00Z",
  "published": false
}
```

### POST `/api/import/discussion`
```json
{
  "courseId": "12345",
  "title": "Week 1 Discussion",
  "rawContent": "## Prompt\n\nDiscuss...",
  "template": "discussionPrompt",
  "requireInitialPost": true,
  "published": true
}
```

### GET `/api/import/page?courseId=123&canvasBaseUrl=...&canvasToken=...`
Tests connection and returns course information.

## 🔐 Security Notes

- ✅ All HTML content is sanitized before sending to Canvas
- ✅ API tokens are handled server-side only
- ✅ Input validation with Zod schemas
- ✅ Never commit `.env.local` to version control
- ⚠️ Respect Canvas API rate limits

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Markdown:** marked.js
- **Sanitization:** isomorphic-dompurify
- **Validation:** Zod

## 📦 Dependencies

All dependencies are already listed in `package.json`:
- next, react, react-dom
- marked (markdown parsing)
- zod (validation)
- isomorphic-dompurify (HTML sanitization)
- tailwindcss, postcss, autoprefixer
- TypeScript and type definitions

## 🐛 Troubleshooting

### TypeScript Errors
The lint errors you see before running `npm install` are normal and will be resolved once dependencies are installed.

### Connection Issues
- Verify Canvas Base URL format: `https://yourinstitution.instructure.com`
- Ensure API token is valid and not expired
- Check Course ID exists and you have access

### Import Failures
- Verify required fields (title, content)
- Check date formats (ISO 8601: `YYYY-MM-DDTHH:mm:ssZ`)
- Review Canvas API error messages in the response

## 🚧 Future Enhancements

Potential features for future development:
- [ ] Batch import from CSV/JSON
- [ ] Custom template builder UI
- [ ] OAuth2 authentication
- [ ] Import history and rollback
- [ ] Multi-course dashboard
- [ ] Module and quiz support
- [ ] File attachment uploads
- [ ] Rich text editor (WYSIWYG)

## 📄 License

MIT

---

**Your Canvas LMS Importer is now complete and ready to use!** 🎉

The server is running at http://localhost:3000