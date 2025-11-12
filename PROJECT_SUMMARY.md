
# WFU SPS Canvas HTML Formatter

## What is this?

A client-side Next.js app for quickly formatting course content into Canvas-ready HTML using WFU SPS templates. No Canvas API integration, no server-side logic—just select a template, paste your content, and copy the generated HTML for Canvas.

## Key Features

- Dedicated tabs for each Canvas template: Course Welcome, Assessment Overview, Discussion, Instructor Presentation, Learning Materials, Meet the Faculty, Module Overview, Syllabus, Assignment, and Page.
- Clean, modern UI with Tailwind CSS and custom colors.
- Simple workflow: select a tab, fill out the form, generate HTML, and copy to Canvas.
- All formatting is done client-side—no API tokens, course IDs, or server config required.
- Templates ensure consistent, professional Canvas pages for WFU SPS courses.

## Project Structure

```
canvas-formatter/
├── app/
│   ├── page.tsx            # Main app and navigation
│   ├── layout.tsx          # App layout
│   └── globals.css         # Global styles
├── components/
│   ├── ConfigForm.tsx      # Welcome/intro tab
│   └── forms/
│       ├── AssessmentOverviewForm.tsx
│       ├── AssignmentForm.tsx
│       ├── CourseWelcomeForm.tsx
│       ├── DiscussionForm.tsx
│       ├── GenericPageForm.tsx
│       ├── InstructorPresentationForm.tsx
│       ├── LearningMaterialsForm.tsx
│       ├── MeetFacultyForm.tsx
│       ├── ModuleForm.tsx
│       ├── SyllabusForm.tsx
├── lib/
│   └── formatters/         # HTML formatting logic
├── tailwind.config.ts      # Tailwind config
├── postcss.config.cjs      # PostCSS config
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── README.md               # Quickstart and usage
└── PROJECT_SUMMARY.md      # This file
```

## How to Use

1. Open the app in your browser (local or Vercel deployment)
2. Select the template tab for your Canvas content type
3. Fill out the form fields (title, module number, course name, content, etc.)
4. Click "Generate HTML"
5. Copy the generated HTML
6. Paste into Canvas using the HTML editor for your page, assignment, etc.

## Templates Available

- Course Welcome
- Assessment Overview
- Discussion
- Instructor Presentation
- Learning Materials
- Meet the Faculty
- Module Overview
- Syllabus
- Assignment
- Page (generic)

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Custom formatting logic in `/lib/formatters`

## Notes

- No Canvas API integration—this is a pure client-side formatter.
- No config, no preview links, no publish checkboxes.
- All content is generated and copied manually to Canvas.

## License

MIT