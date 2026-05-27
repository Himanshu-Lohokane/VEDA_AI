# VedaAI Assessment Creator - Setup Guide

## Quick Start (3 Steps)

### Step 1: Start MongoDB and Redis
```bash
docker-compose up -d
```

This starts:
- MongoDB on `localhost:27017`
- Redis on `localhost:6379`

### Step 2: Start Backend Server
Open a new terminal:
```bash
cd backend
npm install
npm run dev
```

Backend will start on `http://localhost:3001`

### Step 3: Start Frontend
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```

Frontend will start on `http://localhost:3000`

---

## Troubleshooting

### Issue: "File upload failed" or buttons not working

**Cause**: Backend is not running

**Solution**:
1. Check if backend is running on port 3001
2. Open http://localhost:3001 in browser - you should see a response
3. If not, start the backend:
   ```bash
   cd backend
   npm run dev
   ```

### Issue: "Cannot connect to MongoDB"

**Cause**: Docker containers not running

**Solution**:
```bash
# Check if containers are running
docker ps

# If not running, start them
docker-compose up -d

# Check logs
docker-compose logs
```

### Issue: Port 3000 or 3001 already in use

**Solution**:
```bash
# Windows - Kill process on port
npx kill-port 3000
npx kill-port 3001

# Or find and kill manually
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: "Module not found" errors

**Solution**:
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install

cd ../backend
rm -rf node_modules package-lock.json
npm install
```

---

## Complete Setup (First Time)

### Prerequisites
- Node.js 18+ installed
- Docker Desktop installed and running
- Git installed

### 1. Install Dependencies

#### Frontend
```bash
cd frontend
npm install
```

#### Backend
```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Environment files are already configured:
- `frontend/.env.local` - Frontend config
- `backend/.env` - Backend config
- `.env` - Root config

**Verify OpenRouter API Key** in `backend/.env`:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 3. Start Services

#### Start Docker Services
```bash
docker-compose up -d
```

Wait 10 seconds for MongoDB and Redis to initialize.

#### Start Backend
```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 3001
MongoDB connected successfully
Redis connected successfully
```

#### Start Frontend
```bash
cd frontend
npm run dev
```

You should see:
```
- Local:        http://localhost:3000
```

### 4. Verify Everything Works

1. Open http://localhost:3000
2. Click "Create Assignment" or "Create Your First Assignment"
3. Fill out the form
4. Click "Next" - should navigate to progress page
5. Should see real-time progress updates
6. Should see generated question paper

---

## Development Workflow

### Running All Services

**Terminal 1 - Docker**:
```bash
docker-compose up
```

**Terminal 2 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 3 - Frontend**:
```bash
cd frontend
npm run dev
```

### Stopping Services

**Stop Frontend/Backend**: Press `Ctrl+C` in their terminals

**Stop Docker**:
```bash
docker-compose down
```

**Stop Docker and Remove Data**:
```bash
docker-compose down -v
```

---

## Testing the Application

### 1. Test Home Page
- Navigate to http://localhost:3000
- Should see "No assignments yet" or assignments list
- Sidebar should be visible on desktop
- Bottom navigation on mobile

### 2. Test Create Assignment
- Click "Create Assignment"
- Upload a file (optional)
- Select due date
- Adjust question types and counts
- Click "Next"
- Should navigate to progress page

### 3. Test Progress Page
- Should see animated loading indicator
- Progress bar should update in real-time
- Should show status messages
- Should auto-redirect to question paper when complete

### 4. Test Question Paper
- Should display student info section
- Should show all question sections (A, B, C, etc.)
- Should show difficulty badges (Easy/Moderate/Hard)
- Should show marks for each question
- "Regenerate" button should work
- "Download PDF" button should work

---

## Common Issues and Solutions

### Backend won't start

**Error**: `Error: Cannot find module`
```bash
cd backend
npm install
```

**Error**: `Port 3001 is already in use`
```bash
npx kill-port 3001
```

**Error**: `MongoDB connection failed`
```bash
docker-compose restart mongodb
```

### Frontend won't start

**Error**: `Port 3000 is already in use`
```bash
npx kill-port 3000
```

**Error**: `Module not found`
```bash
cd frontend
npm install
```

### File upload not working

1. Check backend is running: http://localhost:3001
2. Check browser console for errors (F12)
3. Check backend terminal for error logs
4. Verify MongoDB is running: `docker ps`

### WebSocket not connecting

1. Check backend is running
2. Check `NEXT_PUBLIC_WS_URL` in `frontend/.env.local`
3. Check browser console for WebSocket errors
4. Restart backend server

### Question generation fails

1. Check OpenRouter API key in `backend/.env`
2. Check backend logs for API errors
3. Verify internet connection
4. Check OpenRouter API status

---

## Project Structure

```
VEDA AI task/
├── frontend/               # Next.js 14 frontend
│   ├── src/
│   │   ├── app/           # Pages
│   │   ├── components/    # React components
│   │   ├── store/         # Zustand store
│   │   └── types/         # TypeScript types
│   ├── .env.local         # Frontend config
│   └── package.json
├── backend/               # Express backend
│   ├── src/
│   │   ├── config/        # Database, Redis config
│   │   ├── models/        # Mongoose models
│   │   ├── services/      # Business logic
│   │   └── index.ts       # Server entry
│   ├── .env               # Backend config
│   └── package.json
├── docker-compose.yml     # MongoDB + Redis
└── README.md             # Documentation
```

---

## API Endpoints

### File Upload
```
POST http://localhost:3001/api/files/upload
Content-Type: multipart/form-data
Body: file
```

### Create Assessment
```
POST http://localhost:3001/api/assessments
Content-Type: application/json
Body: {
  "dueDate": "2025-06-21",
  "questionTypes": ["multiple_choice", "short_answer"],
  "numberOfQuestions": 10,
  "marksPerQuestion": 5,
  "additionalInstructions": "Focus on chapters 1-3"
}
```

### Get Question Paper
```
GET http://localhost:3001/api/papers/:paperId
```

### Download PDF
```
GET http://localhost:3001/api/papers/:paperId/pdf
```

---

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/vedaai-assessment
REDIS_HOST=localhost
REDIS_PORT=6379
OPENROUTER_API_KEY=your-api-key-here
CORS_ORIGIN=http://localhost:3000
```

---

## Need Help?

1. Check this SETUP.md file
2. Check README.md for architecture details
3. Check browser console (F12) for frontend errors
4. Check backend terminal for server errors
5. Check Docker logs: `docker-compose logs`

---

## Quick Commands Reference

```bash
# Start everything
docker-compose up -d && cd backend && npm run dev &
cd frontend && npm run dev

# Stop everything
docker-compose down
# Press Ctrl+C in backend and frontend terminals

# Reset everything
docker-compose down -v
rm -rf frontend/node_modules backend/node_modules
cd frontend && npm install
cd ../backend && npm install
docker-compose up -d
```

---

**Ready to go!** 🚀

Start with Step 1 above and you'll be running in minutes.
