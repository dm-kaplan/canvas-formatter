# WFU Module Template - Usage Guide

## Wake Forest University School of Professional Studies Module Format

I've added a custom **WFU Module Overview** template that matches your Wake Forest SPS module format exactly.

## How to Use

### In the UI:

1. **Open the app** at http://localhost:3000
2. **Configure Canvas** with your credentials
3. **Select "Page"** as the import type
4. **Choose "WFU Module Overview"** from the template dropdown
5. **Fill in the fields:**

### Fields Explained:

**Title:** 
- Enter something like: `Module 1 Overview`
- The system will automatically extract the module number (1, 2, 3, etc.)

**Course Name:**
- Example: `Incident Management and Business Continuity`
- This appears in the header section

**Learning Objectives (one per line):**
```
Explain the fundamentals of incident management
Examine business continuity best practices
Describe risk assessment methodologies
```

**Module Checklist (one per line):**
```
Review the course Syllabus.
Watch the Course Overview video.
Read the required readings which can be found via the Course Reserves.
Complete the discussion about Strategy in Digital Marketing.
Complete Case Study Project Part 1 on the Container Homes Research Approach.
Attend the Live Instructor-Led Session.
```

**Content (Markdown):**
```markdown
We begin our study of incident management and business continuity planning. This module introduces the fundamental concepts that will guide our work throughout the course.

You will learn how organizations prepare for, respond to, and recover from various types of incidents and disruptions.
```

## Example Input

Here's a complete example for Module 1:

**Import Type:** Page  
**Template:** WFU Module Overview  
**Title:** Module 1 Overview  
**Published:** ☐ (unchecked to review first)

**Course Name:**
```
Incident Management and Business Continuity
```

**Learning Objectives:**
```
Explain the fundamentals of incident management
Examine business continuity planning frameworks
Describe risk assessment methodologies
```

**Module Checklist:**
```
Review the course Syllabus.
Watch the Course Overview video.
Read the required readings which can be found via the Course Reserves.
Complete the discussion about Strategy in Digital Marketing.
Complete Case Study Project Part 1 on the Container Homes Research Approach.
Attend the Live Instructor-Led Session. See the Live Instructor-Led Sessions page in Getting Started for the day, time, and additional information.
```

**Content:**
```markdown
We begin our study of incident management and business continuity planning. This module introduces the fundamental concepts that will guide our work throughout the course.

You will learn how organizations prepare for, respond to, and recover from various types of incidents and disruptions. Understanding these frameworks is essential for protecting organizational assets and ensuring operational resilience.
```

## Output

This will generate the exact HTML structure you provided:

```html
<div class="WFU-SPS WFU-Container-Global WFU-LightMode-Text">
    <div class="grid-row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12" style="padding: 0px 0px 10px 0px;">
            <div class="WFU-SubpageHeader WFU-SubpageHeroModule1">&nbsp;
                <div class="WFU-Banner-SchoolofProfessionalStudies">&nbsp;</div>
            </div>
        </div>
    </div>
    <div class="grid-row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <p class="WFU-SubpageHeader">Incident Management and Business Continuity</p>
            <h2 class="WFU-SubpageSubheader">Module 1 Overview</h2>
            <!-- Your content here -->
            <h3>Module Objectives</h3>
            <p>After completing this module, you should be able to:</p>
            <ol>
                <li>Explain the fundamentals of incident management</li>
                <li>Examine business continuity planning frameworks</li>
                <li>Describe risk assessment methodologies</li>
            </ol>
            <h3>Module Checklist</h3>
            <ul>
                <li>Review the course Syllabus.</li>
                <!-- etc. -->
            </ul>
            <div class="grid-row">
                <div class="col-xs-12">
                    <footer class="WFU-footer">This material is owned by Wake Forest University and is protected by U.S. copyright laws. All Rights Reserved.</footer>
                </div>
            </div>
        </div>
    </div>
</div>
```

## For Different Modules

The template automatically adjusts for different module numbers:

- **Module 1**: `WFU-SubpageHeroModule1`
- **Module 2**: `WFU-SubpageHeroModule2`
- **Module 3**: `WFU-SubpageHeroModule3`
- etc.

Just change the **Title** field to match:
- `Module 2 Overview`
- `Module 3 Overview`
- etc.

## API Usage (Optional)

You can also use the API directly:

```bash
curl -X POST http://localhost:3000/api/import/page \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "YOUR_COURSE_ID",
    "title": "Module 1 Overview",
    "rawContent": "We begin our study...",
    "template": "wfuModule",
    "published": false,
    "courseName": "Incident Management and Business Continuity",
    "objectives": [
      "Explain the fundamentals of incident management",
      "Examine business continuity planning frameworks"
    ],
    "checklist": [
      "Review the course Syllabus.",
      "Watch the Course Overview video."
    ],
    "canvasBaseUrl": "https://wakeforest.instructure.com",
    "canvasToken": "YOUR_TOKEN"
  }'
```

## Tips

1. **Preview before publishing** - Use the "Show Preview" button to see formatted output
2. **Save a template** - Keep a text file with your standard checklist items
3. **Batch import** - You can quickly create all module overviews by changing just the title and content
4. **Links in checklist** - You can include HTML links in the checklist items

## Need Changes?

If you need to modify the template format (add/remove sections, change styling, etc.), let me know and I can adjust it!