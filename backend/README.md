# Email Digital Twin Backend

A FastAPI-based backend service that analyzes emails with PDF attachments using AI, creating a digital twin that can analyze content and generate human-like responses.

## Overview

This application provides a suite of APIs that allow you to:

- Authenticate with Gmail using OAuth 2.0
- Retrieve emails with PDF attachments
- Extract and analyze text from PDF attachments
- Generate AI insights from email content and attachments
- Create AI-generated email responses that mimic your writing style

## Features

- **Gmail Integration**: Secure OAuth authentication with Gmail
- **Email Management**: List, retrieve, and filter emails with PDF attachments
- **PDF Processing**: Extract text from PDF attachments
- **AI Analysis**: Analyze email content and attachments for key points and insights
- **Response Generation**: Generate contextually relevant email responses
- **Secure Sessions**: State management with secure session handling

## Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Authentication**: OAuth 2.0 with [Google OAuth Library](https://googleapis.github.io/google-api-python-client/docs/oauth.html)
- **Email Service**: Gmail API
- **PDF Processing**: PyPDF2
- **AI Integration**: OpenAI API (GPT-4o-mini)
- **Deployment**: Uvicorn ASGI server

## Prerequisites

- Python 3.9+
- Google Cloud Platform project with Gmail API enabled
- OpenAI API key
- Gmail account for testing

## Setup and Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd digital_twin
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables by creating a `.env` file in the project root:
   ``` 
   # OpenAI API
   OPENAI_API_KEY=your_openai_api_key
   
   # Session security
   SESSION_SECRET_KEY=your_random_secret_key
   
   # Frontend URL for redirects
   FRONTEND_URL=http://localhost:3000
   ```

4. Create or Download a `client_secret.json` file in the project root with your Google OAuth credentials:
   ```json
   {
     "web": {
       "client_id": "your_client_id.apps.googleusercontent.com",
       "project_id": "your_project_id",
       "auth_uri": "https://accounts.google.com/o/oauth2/auth",
       "token_uri": "https://oauth2.googleapis.com/token",
       "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
       "client_secret": "your_client_secret",
       "redirect_uris": ["http://localhost:8000/oauth2callback"]
     }
   }
   ```

5. Run the application:
   ```bash
   python -m app.main
   ```
   
   Or alternatively:
   ```bash
   uvicorn app.main:app --reload
   ```

## API Endpoints

### Authentication

- **GET /login**: Initiates the OAuth login flow
- **GET /oauth2callback**: Processes the OAuth callback
- **GET /logout**: Clears the user's session

### Emails

- **GET /api/emails**: List emails matching the query
- **GET /api/emails/{email_id}**: Get a specific email by ID
- **GET /api/emails/{email_id}/attachments/{attachment_id}**: Download an attachment

### AI Features

- **GET /api/ai/analyze/{email_id}**: Analyze an email and its attachments using AI
- **GET /api/ai/generate-response/{email_id}**: Generate an email response using AI

## Project Structure

```
app/
├── __init__.py
├── main.py
├── api/
│   ├── __init__.py
│   ├── ai.py         # AI analysis endpoints
│   ├── auth.py       # Authentication endpoints
│   └── emails.py     # Email management endpoints
└── services/
    ├── __init__.py
    ├── ai_service.py       # AI integration service
    ├── gmail_service.py    # Gmail API integration
    └── pdf_service.py      # PDF processing service
```

## Development

### Adding New Features

1. Implement the service in `app/services/`
2. Create or update API endpoints in `app/api/`
3. Register new routers in `app/main.py` if needed

### Testing

Manual testing can be performed using FastAPI's automatic Swagger UI documentation at `http://localhost:8000/docs`.

## Security Considerations

- OAuth tokens are stored in secure server-side sessions
- HTTPS should be enabled in production
- API rate limiting is recommended for production deployment
- Data minimization practices are followed (e.g., temporary file handling for PDFs)

## Future Enhancements

- Support for additional email providers
- Improved PDF analysis with document structure understanding
- Support for other attachment types (Word, Excel, images)
- Fine-tuning the AI model to better match user writing style
- Thread analysis for more contextual responses
- Email sending capabilities

## Troubleshooting

- **Authentication Issues**: Ensure your client_secret.json is correctly formatted and contains valid credentials
- **PDF Processing Errors**: Some PDFs may be encrypted or use uncommon formats that PyPDF2 cannot process
- **API Rate Limits**: Be aware of Gmail API and OpenAI API rate limits for your accounts
