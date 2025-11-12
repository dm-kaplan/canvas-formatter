# Canvas LMS Importer - Development Setup

## Getting Started

### Prerequisites
- Node.js 18+ installed
- A Canvas LMS instance and API access
- Canvas API Access Token (generate from Profile > Settings > New Access Token)
- Target Course ID (find in course URL: `/courses/:id`)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Edit `.env.local` and add your Canvas credentials:
```env
CANVAS_BASE_URL=https://yourinstitution.instructure.com
CANVAS_TOKEN=your_api_token_here
```

Note: You can also provide credentials via the UI instead of environment variables.

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
canvas-importer/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   └── import/          # Import endpoints
│   │       ├── page/        # Create Canvas pages
│   │       ├── assignment/  # Create assignments
│   │       └── discussion/  # Create discussions
│   ├── page.tsx             # Main application page
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ConfigForm.tsx       # Canvas configuration form
│   └── ImportForm.tsx       # Content import form
├── lib/                     # Utility libraries
│   ├── canvas-api.ts        # Canvas API client
│   └── formatters/          # Content formatters
│       └── index.ts         # Template formatters
└── package.json             # Dependencies
```

## Features

### Content Types
- **Pages**: Informational content pages
- **Assignments**: Graded assignments with due dates
- **Discussions**: Discussion topics with prompts

### Templates
- **Lesson Page**: Structured lessons with learning objectives
- **Assignment Brief**: Assignments with grading criteria and submission guidelines
- **Discussion Prompt**: Discussions with participation guidelines
- **Syllabus**: Course syllabus formatting
- **Announcement**: Simple announcements
- **Plain**: Basic markdown to HTML conversion

### Formatting
- Markdown support for all content
- HTML sanitization for security
- Template-based formatting for consistent styling
- Live preview before import

## API Usage

### Create a Page
```bash
curl -X POST http://localhost:3000/api/import/page \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "12345",
    "title": "Week 1 Overview",
    "rawContent": "# Welcome\\n\\nThis is the content...",
    "template": "lessonPage",
    "published": true,
    "canvasBaseUrl": "https://yourinstitution.instructure.com",
    "canvasToken": "your_token"
  }'
```

### Create an Assignment
```bash
curl -X POST http://localhost:3000/api/import/assignment \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "12345",
    "title": "Essay Assignment",
    "rawContent": "## Instructions\\n\\nWrite an essay...",
    "template": "assignmentBrief",
    "pointsPossible": 100,
    "dueAt": "2025-12-31T23:59:00Z",
    "published": false,
    "canvasBaseUrl": "https://yourinstitution.instructure.com",
    "canvasToken": "your_token"
  }'
```

### Create a Discussion
```bash
curl -X POST http://localhost:3000/api/import/discussion \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "12345",
    "title": "Week 1 Discussion",
    "rawContent": "## Prompt\\n\\nDiscuss...",
    "template": "discussionPrompt",
    "published": true,
    "requireInitialPost": true,
    "canvasBaseUrl": "https://yourinstitution.instructure.com",
    "canvasToken": "your_token"
  }'
```

## Security Notes

⚠️ **Important Security Considerations:**
- Never commit `.env.local` or real API tokens to version control
- API tokens are used server-side only and never exposed to the client
- All HTML content is sanitized before being sent to Canvas
- Respect Canvas API rate limits (typically generous, but avoid automated flooding)

## Troubleshooting

### Connection Issues
- Verify your Canvas Base URL is correct (e.g., `https://yourinstitution.instructure.com`)
- Ensure your API token is valid and has the necessary permissions
- Check that the Course ID exists and you have access to it

### Import Failures
- Check the Canvas API response for specific error messages
- Verify that required fields are provided (title, content)
- Ensure date formats are valid ISO 8601 strings for due dates

### TypeScript Errors
The lint errors you see are normal before running `npm install`. They will be resolved once dependencies are installed.

## Roadmap

Future enhancements planned:
- [ ] Batch import from CSV/JSON files
- [ ] Template customization UI
- [ ] OAuth2 authentication flow
- [ ] Import history and rollback
- [ ] Multi-course dashboard
- [ ] Module and quiz support
- [ ] File attachment handling

## License

MIT