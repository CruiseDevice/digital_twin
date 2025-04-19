# Email Digital Twin Frontend

This is a Next.js frontend for the Email Digital Twin application, which allows you to:

- Authenticate with your Gmail account
- View your emails with PDF attachments
- Download and manage these attachments

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm/bun
- Backend API running (FastAPI Gmail integration)

## Getting Started

1. Clone this repository
2. Install dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
# or
bun install
```

3. Set up your environment variables by creating a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

1. **Authentication**: The app uses OAuth 2.0 to authenticate with Gmail
2. **Email Listing**: View emails with PDF attachments by default
3. **Search**: Use Gmail's search syntax to find specific emails 
4. **View Details**: Click on an email to view its details and attachments
5. **Download**: Download attachments directly to your computer

## Project Structure

- `/src/components` - React components
- `/src/services` - API services for backend communication
- `/src/utils` - Utility functions
- `/src/app` - Next.js app router

## Backend API

This frontend works with the Email Digital Twin FastAPI backend that:

1. Handles OAuth authentication with Gmail
2. Retrieves emails with attachments
3. Downloads and processes attachments
4. Provides a RESTful API for the frontend to consume

Make sure the backend is running on `http://localhost:8000` or update the `.env.local` file accordingly.