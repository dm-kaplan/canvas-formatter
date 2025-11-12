# Quick Start Guide - Canvas LMS Importer

## 🚀 5-Minute Setup

### Step 1: Get Your Canvas Credentials

1. **Canvas Base URL**: Your institution's Canvas URL
   - Example: `https://canvas.university.edu`
   - Example: `https://yourinstitution.instructure.com`

2. **API Token**: Generate from Canvas
   - Log into Canvas
   - Click your profile picture → Settings
   - Scroll to "Approved Integrations"
   - Click "+ New Access Token"
   - Copy the token (save it securely!)

3. **Course ID**: Find in your course URL
   - Go to your Canvas course
   - Look at the URL: `https://canvas.edu/courses/12345`
   - The number `12345` is your Course ID

### Step 2: Run the Application

The server is already running at: **http://localhost:3000**

If it's not running:
```bash
npm run dev
```

### Step 3: Configure Canvas

1. Open http://localhost:3000
2. Fill in the "Canvas Configuration" form:
   - Canvas Base URL: `https://yourinstitution.instructure.com`
   - Canvas API Token: (paste your token)
   - Course ID: (your course number)
3. Click "Test Connection"
4. Wait for the green checkmark ✓

### Step 4: Create Your First Import

Let's create a simple page:

1. **Select Import Type**: Choose "Page"
2. **Choose Template**: Select "Lesson Page"
3. **Enter Title**: Type "Welcome to Week 1"
4. **Add Objectives** (one per line):
   ```
   Understand the course structure
   Learn how to navigate Canvas
   Complete the first assignment
   ```
5. **Write Content** (supports markdown):
   ```markdown
   # Welcome to Week 1!
   
   This week we will cover the basics of the course.
   
   ## Topics
   - Introduction to the subject
   - Course expectations
   - Required materials
   
   ## Getting Started
   Please review the syllabus and complete the introductory assignment.
   ```
6. Click "Show Preview" to see formatted output
7. Check "Publish immediately" if ready
8. Click "Create page"
9. Success! Click "View in Canvas →" to see your page

## 🎯 Quick Examples

### Example 1: Assignment

**Import Type:** Assignment  
**Template:** Assignment Brief  
**Title:** Essay 1 - Personal Narrative  
**Points:** 100  
**Due Date:** (select from calendar)  
**Content:**
```markdown
## Assignment Overview
Write a 500-word personal narrative about a meaningful experience.

## Requirements
- Minimum 500 words
- Double-spaced, 12pt font
- Include descriptive language
- Clear narrative structure

## Submission
Submit as a PDF or Word document via Canvas.
```

### Example 2: Discussion

**Import Type:** Discussion  
**Template:** Discussion Prompt  
**Title:** Week 1 - Introductions  
**Options:** ✓ Require initial post  
**Content:**
```markdown
## Introduce Yourself!

Please share:
1. Your name and major
2. Why you're taking this course
3. One interesting fact about yourself

## Discussion Guidelines
- Post your introduction by Wednesday
- Respond to at least 2 classmates by Sunday
- Be respectful and engaging
```

## 📌 Tips

### Markdown Cheatsheet
```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*

- Bullet point
- Another bullet

1. Numbered list
2. Second item

[Link text](https://example.com)

> Blockquote
```

### Best Practices

1. **Always test connection first** before importing
2. **Use preview feature** to check formatting
3. **Start unpublished** and publish after reviewing in Canvas
4. **Save your content** somewhere before importing
5. **Use templates** for consistent formatting

### Common Issues

**"Canvas credentials are required"**
→ Fill in all three fields: Base URL, Token, Course ID

**"Connection failed"**
→ Check your Base URL doesn't have trailing slash
→ Verify API token is correct
→ Ensure Course ID is a number

**"Failed to create [item]"**
→ Check you have permission in the course
→ Verify the course allows creating this type of content
→ Check Canvas error message for details

## 🎓 Next Steps

1. **Read the full documentation**: See `PROJECT_SUMMARY.md`
2. **Explore templates**: Try each template to see formatting
3. **Create multiple items**: Pages, assignments, discussions
4. **Review in Canvas**: Check how they look in the actual course
5. **Customize content**: Experiment with markdown formatting

## 🆘 Need Help?

- Check `SETUP.md` for detailed setup instructions
- Review `PROJECT_SUMMARY.md` for complete documentation
- Read the original `README.md` for feature overview
- Check Canvas API docs: https://canvas.instructure.com/doc/api/

---

**You're all set! Start creating Canvas content with ease! 🎉**