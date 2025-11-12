# Canvas Importer

A Next.js web app to import content (Pages, Discussions, Assignments) into a Canvas LMS course using the Canvas REST API.

## Features (MVP)
- Configure Canvas base URL, API token, and Course ID
- Create Pages, Discussions, Assignments
- Apply formatting templates to raw markdown/plain text
- Preview sanitized HTML before import
- Per-request override of base URL and token (falls back to env)

## Getting Started

### 1. Requirements
- Node.js 18+
- A Canvas LMS instance URL (e.g. `https://yourinstitution.instructure.com`)
- A Canvas API Access Token (Profile > Settings > New Access Token)
- Target Course ID (from course URL `/courses/:id`)

### 2. Clone & Install
```bash
git clone <repo-url>
cd canvas-importer
npm install
```

### 3. Environment Setup
Create `.env.local` based on `.env.example`:
```env
CANVAS_BASE_URL=https://yourinstitution.instructure.com
CANVAS_TOKEN=your_api_token_here
```
If you leave `CANVAS_TOKEN` blank, you must supply it in the UI for each import.

### 4. Run Dev Server
```bash
npm run dev
```
Visit http://localhost:3000

### 5. Build & Start
```bash
npm run build
npm start
```

## API Routes
All routes expect JSON body and use either env or provided values.
- `POST /api/import/page` => Create a Page
- `POST /api/import/discussion` => Create a Discussion
- `POST /api/import/assignment` => Create an Assignment

## Request Examples
### Create Page
```json
{
  "courseId": 12345,
  "title": "Week 1 Overview",
  "rawContent": "# Welcome to Week 1\nObjectives...",
  "template": "lessonPage",
  "published": true
}
```

### Create Assignment
```json
{
  "courseId": 12345,
  "title": "Essay 1",
  "rawContent": "## Instructions\nWrite an essay...",
  "template": "assignmentBrief",
  "pointsPossible": 100,
  "dueAt": "2025-09-01T23:59:00Z",
  "published": true
}
```

## Templates
Available templates (in `lib/formatters/index.ts`):
- `lessonPage`: Wraps content with learning objectives container.
- `assignmentBrief`: Adds grading and submission section placeholders.
- `discussionPrompt`: Creates a scaffold for prompts + participation guidelines.

## Security Notes
- Do NOT commit real tokens.
- Token is used server-side only; never echoed back.
- Rate limits: Canvas typically allows a generous number of requests; avoid automated flooding.

## Roadmap
- Batch CSV/JSON import
- Template customization UI
- OAuth2 flow instead of static token
- History & rollback
- Multi-course support dashboard

## License
MIT
