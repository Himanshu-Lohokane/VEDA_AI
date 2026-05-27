# VedaAI Assessment Creator

AI-powered assessment and question paper generator built for VedaAI Full Stack Engineering Internship (Round 2).

## 🚀 Live Demo

**Application**: [https://your-project.vercel.app](https://your-project.vercel.app)  
**API Health**: [https://your-project.vercel.app/api/health](https://your-project.vercel.app/api/health)

## 📋 Features

- ✅ **AI-Powered Question Generation** - Uses GPT-4 via OpenRouter API
- ✅ **File Upload Support** - Images (JPEG, PNG), PDFs, and text files
- ✅ **Real-time Progress Tracking** - Live updates during question generation
- ✅ **Smart Question Paper** - Organized sections with difficulty levels
- ✅ **PDF/TXT Download** - Export generated question papers
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop
- ✅ **Pixel-Perfect UI** - Matches Figma designs exactly
- ✅ **Production Ready** - Error handling, logging, and validation

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management
- **shadcn/ui** - UI component library
- **Lucide Icons** - Icon library

### Backend
- **Express** - Node.js web framework
- **TypeScript** - Type-safe backend
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **GridFS** - File storage in MongoDB
- **Multer** - File upload handling
- **OpenRouter API** - AI model access (GPT-4)

### Deployment
- **Vercel** - Serverless deployment (frontend + backend)
- **MongoDB Atlas** - Cloud database (free tier)

## 📦 Project Structure

```
vedaai-assessment-creator/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   ├── store/           # Zustand store
│   │   └── types/           # TypeScript types
│   └── package.json
├── backend/                  # Express backend
│   ├── src/
│   │   ├── config/          # Database & Redis config
│   │   ├── models/          # Mongoose models
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript types
│   │   └── index.ts         # Express app
│   └── package.json
├── api/                      # Vercel serverless functions
│   └── [...path].ts         # API proxy
├── vercel.json              # Vercel configuration
└── README.md
```

## 🚀 Local Development

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- OpenRouter API key

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/vedaai-assessment-creator.git
cd vedaai-assessment-creator
```

2. **Install dependencies**
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. **Configure environment variables**

Create `backend/.env`:
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/vedaai-assessment
OPENROUTER_API_KEY=your_openrouter_key_here
CORS_ORIGIN=http://localhost:3000
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. **Start MongoDB**
```bash
# If using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use MongoDB Atlas (cloud)
```

5. **Run development servers**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

6. **Open browser**
```
http://localhost:3000
```

## 📤 Deployment

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. Push to GitHub
2. Import repository in Vercel
3. Set environment variables
4. Deploy!

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests (if added)
cd frontend
npm test
```

## 📝 API Endpoints

- `GET /health` - Health check
- `POST /api/upload` - Upload file
- `POST /api/assessments` - Create assessment
- `GET /api/jobs/:jobId` - Get job status
- `GET /api/papers/:paperId` - Get question paper
- `POST /api/papers/:paperId/regenerate` - Regenerate paper

## 🎨 UI Screenshots

The application matches the provided Figma designs pixel-perfectly:
- Home page with assignment cards
- Create assignment form with file upload
- Progress page with animated loader
- Question paper with sections and difficulty badges
- Responsive mobile and desktop layouts

## 🔒 Security

- File upload validation (type and size limits)
- CORS configuration
- Environment variable protection
- Input sanitization
- Error handling

## 📄 License

This project was created for the VedaAI Full Stack Engineering Internship assignment.

## 👤 Author

**Your Name**  
GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)  
Email: your.email@example.com

## 🙏 Acknowledgments

- VedaAI for the internship opportunity
- OpenRouter for AI API access
- Vercel for hosting
- MongoDB Atlas for database

---

**Submission Date**: May 28, 2026  
**Assignment**: VedaAI Full Stack Engineering Internship - Round 2
