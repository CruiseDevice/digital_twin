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

  async getEmail(query='has:attachment filename:pdf', maxResults=10): Promise<EmailListResponse> {
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

  async checkAuthStatus(): Promise<boolean> {
    try {
      await this.getEmail('', 1);
      return true;
    } catch (error) {
      return false;
    }
  }
}

const apiService = new ApiService();
export default apiService;