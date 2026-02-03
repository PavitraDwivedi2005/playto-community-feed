# Playto Community App

This is a community app built with Django (backend) and React (frontend) that allows users to create posts, comment on them, and like posts and comments. Users earn karma points for likes on their content.

## Features

- Create and view posts
- Comment on posts with nested replies
- Like posts and comments
- Karma system for user engagement
- Leaderboard showing top users by karma

## Local Development Setup

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Run migrations:
   ```
   python manage.py migrate
   ```

6. Start the Django development server:
   ```
   python manage.py runserver
   ```

The backend will be running at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

The frontend will be running at http://localhost:5173

### Running the Full App

1. Start the backend server in one terminal
2. Start the frontend server in another terminal
3. Open http://localhost:5173 in your browser

## Deployment

### Backend Deployment (Railway)

1. Create a Railway account at https://railway.app
2. Connect your GitHub repository
3. Railway will automatically detect the Django app and deploy it
4. Set environment variables if needed (e.g., DEBUG=False)

### Frontend Deployment (Vercel)

1. Create a Vercel account at https://vercel.com
2. Connect your GitHub repository
3. Vercel will automatically detect the React app and deploy it
4. Update the API base URL in the frontend to point to your deployed backend

## API Endpoints

- GET /api/posts/ - List all posts
- POST /api/posts/ - Create a new post
- GET /api/posts/{id}/ - Get post details with comments
- POST /api/comments/ - Create a comment
- POST /api/posts/{id}/like/ - Like a post
- POST /api/comments/{id}/like/ - Like a comment
- GET /api/leaderboard/ - Get leaderboard

## Technologies Used

- Backend: Django, Django REST Framework
- Frontend: React, Tailwind CSS
- Database: SQLite (for development)
