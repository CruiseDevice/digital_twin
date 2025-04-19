export interface EmailListResponse {
  messages: EmailPreview[];
}

export interface EmailPreview {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
}

export interface EmailDetail {
  id: string;
  headers: {
    [key: string]: string;
  };
  body: string;
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
}

export interface AIAnalysis {
  email_analysis: {
    summary: string;
    key_points: string;
    suggested_response: string;
    full_analysis: string;
  };
  pdf_summary?: {
    page_count: number;
    word_count: number;
    char_count: number;
    filename: string;
    title?: string;
    author?: string;
    subject?: string;
    creation_date?: string;
  };
}

export interface AIResponse {
  response: string; 
}

class ApiService {
  private baseUrl: string;

  constructor () {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  getLoginUrl(): string {
    return `${this.baseUrl}/login`;
  }

  getLogoutUrl(): string {
    return `${this.baseUrl}/logout`;
  }

  async getEmails(query='has:attachment filename:pdf', maxResults=10): Promise<EmailListResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/emails?query=${encodeURIComponent(query)}&maxResults=${maxResults}`, {
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch emails: ${response.statusText}`);
    }
    return response.json();
  }

  async getEmailDetail(emailId: string): Promise<EmailDetail> {
    const response = await fetch(`${this.baseUrl}/api/emails/${emailId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch email detail: ${response.statusText}`);
    }

    return response.json();
  }

  async downloadAttachment(emailId: string, attachmentId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/emails/${emailId}/attachments/${attachmentId}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`Failed to download attachment: ${response.statusText}`);
    }
    return response.json();
  }

  async analyzeEmail(emailId: string, includeAttachments = true): Promise<AIAnalysis> {
    const response = await fetch(
      `${this.baseUrl}/api/ai/analyze/${emailId}?include_attachments=${includeAttachments}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to generate response: ${response.statusText}`);
      }
      return response.json();
  }

  async generateEmailResponse(emailId: string, includeAttachments = true): Promise<AIResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/ai/generate-response/${emailId}?include_attachments=${includeAttachments}`,
      {
        credentials: 'include',
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to generate email response: ${response.statusText}`);
    }
    
    return response.json();
  }



  async checkAuthStatus(): Promise<boolean> {
    try {
      await this.getEmails('', 1);
      return true;
    } catch (error) {
      return false;
    }
  }
}

const apiService = new ApiService();
export default apiService;