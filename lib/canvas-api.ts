/**
 * Canvas LMS API Client
 * Handles authentication and requests to Canvas REST API
 */

export interface CanvasConfig {
  baseUrl: string;
  token: string;
  courseId: string;
}

export interface CanvasPage {
  title: string;
  body: string;
  published?: boolean;
  front_page?: boolean;
  editing_roles?: string;
  notify_of_update?: boolean;
}

export interface CanvasAssignment {
  name: string;
  description: string;
  points_possible?: number;
  due_at?: string;
  unlock_at?: string;
  lock_at?: string;
  assignment_group_id?: number;
  submission_types?: string[];
  published?: boolean;
  grading_type?: 'pass_fail' | 'percent' | 'letter_grade' | 'gpa_scale' | 'points';
  allowed_extensions?: string[];
}

export interface CanvasDiscussion {
  title: string;
  message: string;
  discussion_type?: 'side_comment' | 'threaded';
  published?: boolean;
  delayed_post_at?: string;
  allow_rating?: boolean;
  sort_by_rating?: boolean;
  require_initial_post?: boolean;
}

export interface CanvasApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

class CanvasApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'CanvasApiError';
  }
}

export class CanvasApiClient {
  private baseUrl: string;
  private token: string;
  private courseId: string;

  constructor(config: CanvasConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.token = config.token;
    this.courseId = config.courseId;
  }

  /**
   * Parse RFC 5988 Link header to extract rel URLs
   */
  private parseLinkHeader(header: string | null): Record<string, string> | null {
    if (!header) return null;
    const links: Record<string, string> = {};
    const parts = header.split(',');
    for (const part of parts) {
      const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
      if (match) {
        const url = match[1];
        const rel = match[2];
        links[rel] = url;
      }
    }
    return links;
  }

  /**
   * Fetch all pages for a list endpoint by following Link headers
   */
  private async fetchAllPages<T = any>(endpoint: string, perPage: number = 100): Promise<T[]> {
    const results: T[] = [];
    let url = `${this.baseUrl}/api/v1${endpoint}${endpoint.includes('?') ? '&' : '?'}per_page=${perPage}`;

    for (let i = 0; i < 50; i++) { // hard cap to avoid infinite loops
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage: string;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || `HTTP ${response.status}`;
        } catch {
          errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new CanvasApiError(`Canvas API Error: ${errorMessage}`, response.status, errorText);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        results.push(...data);
      } else {
        // Unexpected shape; stop to avoid errors
        break;
      }

      const linkHeader = response.headers.get('Link');
      const links = this.parseLinkHeader(linkHeader);
      if (links && links['next']) {
        url = links['next'];
      } else {
        break;
      }
    }

    return results;
  }

  private async makeRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api/v1${endpoint}`;
    
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage: string;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || `HTTP ${response.status}`;
        } catch {
          errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
        }

        throw new CanvasApiError(
          `Canvas API Error: ${errorMessage}`,
          response.status,
          errorText
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof CanvasApiError) {
        throw error;
      }
      throw new CanvasApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test the API connection and permissions
   */
  async testConnection(): Promise<CanvasApiResponse> {
    try {
      const course = await this.makeRequest(`/courses/${this.courseId}`);
      return {
        success: true,
        data: {
          courseName: course.name,
          courseCode: course.course_code,
          id: course.id,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create a new page in the course
   */
  async createPage(pageData: CanvasPage): Promise<CanvasApiResponse> {
    try {
      const data = await this.makeRequest(
        `/courses/${this.courseId}/pages`,
        {
          method: 'POST',
          body: JSON.stringify({ wiki_page: pageData }),
        }
      );
      
      return {
        success: true,
        data: {
          id: data.page_id,
          url: data.url,
          html_url: data.html_url,
          title: data.title,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create page'
      };
    }
  }

  /**
   * List existing pages in the course
   */
  async getPages(): Promise<CanvasApiResponse> {
    try {
      // Canvas API paginates results; fetch all pages using per_page=100
      const data = await this.makeRequest(`/courses/${this.courseId}/pages?per_page=100`);
      return {
        success: true,
        data: data.map((page: any) => ({
          url: page.url,
          title: page.title,
          html_url: page.html_url,
          published: page.published,
          front_page: page.front_page,
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list pages'
      };
    }
  }

  /**
   * Overwrite an existing page by URL (slug)
   */
  async updatePage(pageUrl: string, pageData: CanvasPage): Promise<CanvasApiResponse> {
    try {
      const data = await this.makeRequest(
        `/courses/${this.courseId}/pages/${encodeURIComponent(pageUrl)}`,
        {
          method: 'PUT',
          body: JSON.stringify({ wiki_page: pageData }),
        }
      );

      return {
        success: true,
        data: {
          id: data.page_id,
          url: data.url,
          html_url: data.html_url,
          title: data.title,
          updated_at: data.updated_at,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update page'
      };
    }
  }

  /**
   * Create a new assignment in the course
   */
  async createAssignment(assignmentData: CanvasAssignment): Promise<CanvasApiResponse> {
    try {
      const data = await this.makeRequest(
        `/courses/${this.courseId}/assignments`,
        {
          method: 'POST',
          body: JSON.stringify({ assignment: assignmentData }),
        }
      );
      
      return {
        success: true,
        data: {
          id: data.id,
          html_url: data.html_url,
          name: data.name,
          points_possible: data.points_possible,
          due_at: data.due_at,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create assignment'
      };
    }
  }

  /**
   * Update an existing assignment in the course
   */
  async updateAssignment(assignmentId: string | number, assignmentData: CanvasAssignment): Promise<CanvasApiResponse> {
    try {
      const data = await this.makeRequest(
        `/courses/${this.courseId}/assignments/${assignmentId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ assignment: assignmentData }),
        }
      );

      return {
        success: true,
        data: {
          id: data.id,
          html_url: data.html_url,
          name: data.name,
          points_possible: data.points_possible,
          due_at: data.due_at,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update assignment'
      };
    }
  }

  /**
   * List assignments in the course (paginated)
   */
  async getAssignments(): Promise<CanvasApiResponse> {
    try {
      const data = await this.fetchAllPages(`/courses/${this.courseId}/assignments`);
      return {
        success: true,
        data: data.map((a: any) => ({
          id: a.id,
          name: a.name,
          html_url: a.html_url,
          due_at: a.due_at,
          published: a.published,
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get assignments'
      };
    }
  }

  /**
   * Create a new discussion topic in the course
   */
  async createDiscussion(discussionData: CanvasDiscussion): Promise<CanvasApiResponse> {
    try {
      const data = await this.makeRequest(
        `/courses/${this.courseId}/discussion_topics`,
        {
          method: 'POST',
          body: JSON.stringify(discussionData),
        }
      );
      
      return {
        success: true,
        data: {
          id: data.id,
          html_url: data.html_url,
          title: data.title,
          discussion_type: data.discussion_type,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create discussion'
      };
    }
  }

  /**
   * Update an existing discussion topic
   */
  async updateDiscussion(discussionId: string, discussionData: CanvasDiscussion): Promise<CanvasApiResponse> {
    try {
      const data = await this.makeRequest(
        `/courses/${this.courseId}/discussion_topics/${discussionId}`,
        {
          method: 'PUT',
          body: JSON.stringify(discussionData),
        }
      );
      
      return {
        success: true,
        data: {
          id: data.id,
          html_url: data.html_url,
          title: data.title,
          discussion_type: data.discussion_type,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update discussion'
      };
    }
  }

  /**
   * Get all discussion topics in the course
   */
  async getDiscussions(): Promise<CanvasApiResponse> {
    try {
      // Fetch all discussions by following pagination to ensure the most recent is included
      const data = await this.fetchAllPages(`/courses/${this.courseId}/discussion_topics`);
      return {
        success: true,
        data: data.map((d: any) => ({
          id: d.id,
          title: d.title,
          html_url: d.html_url,
          published: d.published,
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get discussions'
      };
    }
  }

  /**
   * Get course information
   */
  async getCourse(): Promise<CanvasApiResponse> {
    try {
      const data = await this.makeRequest(`/courses/${this.courseId}`);
      return {
        success: true,
        data: {
          id: data.id,
          name: data.name,
          course_code: data.course_code,
          sis_course_id: data.sis_course_id,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get course'
      };
    }
  }

  /**
   * Update course syllabus body
   * The syllabus is a special course-level setting, not a page
   */
  async updateCourseSyllabus(syllabusBody: string): Promise<CanvasApiResponse> {
    try {
      const data = await this.makeRequest(
        `/courses/${this.courseId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            course: {
              syllabus_body: syllabusBody,
            }
          }),
        }
      );

      return {
        success: true,
        data: {
          id: data.id,
          name: data.name,
          syllabus_body: data.syllabus_body,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update course syllabus'
      };
    }
  }

  /**
   * List assignment groups for the course
   */
  async getAssignmentGroups(): Promise<CanvasApiResponse> {
    try {
      const data = await this.makeRequest(`/courses/${this.courseId}/assignment_groups`);
      return {
        success: true,
        data: data.map((group: any) => ({
          id: group.id,
          name: group.name,
          position: group.position,
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get assignment groups'
      };
    }
  }

  /**
   * List modules for the course
   */
  async getModules(): Promise<CanvasApiResponse> {
    try {
      // Fetch all modules by following pagination
      const data = await this.fetchAllPages(`/courses/${this.courseId}/modules`);
      return {
        success: true,
        data: data.map((module: any) => ({
          id: module.id,
          name: module.name,
          position: module.position,
          unlock_at: module.unlock_at,
          require_sequential_progress: module.require_sequential_progress,
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get modules'
      };
    }
  }

  /**
   * Add an item to a module
   */
  async addModuleItem(moduleId: string, itemData: {
    type: 'Page' | 'Assignment' | 'Discussion';
    // For Assignment/Discussion (and other non-Page types), Canvas expects content_id
    content_id?: string | number;
    // For Page items, Canvas expects page_url (the wiki page slug)
    page_url?: string;
    title: string;
    position?: number;
  }): Promise<CanvasApiResponse> {
    try {
      // Construct module_item payload based on type
      const module_item: any = {
        type: itemData.type,
        title: itemData.title,
      };

      if (typeof itemData.position !== 'undefined') {
        module_item.position = itemData.position;
      }

      if (itemData.type === 'Page') {
        // Canvas requires page_url for Page items
        if (!itemData.page_url) {
          throw new CanvasApiError('Missing page_url for Page module item');
        }
        module_item.page_url = itemData.page_url;
      } else {
        // For other types use content_id
        if (typeof itemData.content_id === 'undefined') {
          throw new CanvasApiError('Missing content_id for non-Page module item');
        }
        module_item.content_id = itemData.content_id;
      }

      const data = await this.makeRequest(
        `/courses/${this.courseId}/modules/${moduleId}/items`,
        {
          method: 'POST',
          body: JSON.stringify({ module_item }),
        }
      );
      
      return {
        success: true,
        data: {
          id: data.id,
          module_id: data.module_id,
          title: data.title,
          type: data.type,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add item to module'
      };
    }
  }
}

/**
 * Factory function to create a Canvas API client
 */
export function createCanvasClient(config: CanvasConfig): CanvasApiClient {
  return new CanvasApiClient(config);
}

/**
 * Validate Canvas configuration
 */
export function validateCanvasConfig(config: Partial<CanvasConfig>): string[] {
  const errors: string[] = [];
  
  if (!config.baseUrl) {
    errors.push('Canvas base URL is required');
  } else if (!config.baseUrl.match(/^https?:\/\/.+/)) {
    errors.push('Canvas base URL must be a valid URL');
  }
  
  if (!config.token) {
    errors.push('Canvas API token is required');
  }
  
  if (!config.courseId) {
    errors.push('Course ID is required');
  } else if (isNaN(Number(config.courseId))) {
    errors.push('Course ID must be a number');
  }
  
  return errors;
}