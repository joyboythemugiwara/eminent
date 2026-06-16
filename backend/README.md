# Eminent Tutorials - Backend API

A fast, secure REST API built with Bun + Express + TypeScript for managing educational content.

## 🚀 Quick Start

### Prerequisites
- Bun 1.0+
- PostgreSQL 12+ (local or Neon)

### Setup

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Create database**
   ```bash
   createdb eminent_tutorials
   # or set DATABASE_URL in .env for Neon
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database connection
   ```

4. **Run development server**
   ```bash
   bun run dev
   ```
   Server will start at `http://localhost:3001/api/v1`

5. **Setup admin account**
   ```bash
   bun run setup-admin
   # Default: mugi@eminentutorials.com / admin@123
   ```

## 📝 API Endpoints

### Public (No Auth)
- `GET /api/v1/classes` - List all classes
- `GET /api/v1/classes/:slug` - Get single class
- `GET /api/v1/classes/:classSlug/subjects` - List subjects
- `GET /api/v1/subjects/:subjectId/chapters` - List chapters
- `GET /api/v1/chapters/:chapterId` - Get chapter with notes

### Admin (JWT Required)
- `POST /api/v1/admin/auth/login` - Login
- `GET /api/v1/admin/auth/me` - Current admin
- `POST /api/v1/admin/classes` - Create class
- `POST /api/v1/admin/subjects` - Create subject
- `POST /api/v1/admin/chapters` - Create chapter
- `POST /api/v1/admin/notes` - Create note
- And more... (see full docs)

## 📖 Test with cURL

```bash
# Health check
curl http://localhost:3001/health

# Get all classes
curl http://localhost:3001/api/v1/classes

# Login
curl -X POST http://localhost:3001/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mugi@eminentutorials.com","password":"admin@123"}' \
  -c cookies.txt

# Get admin info
curl http://localhost:3001/api/v1/admin/auth/me -b cookies.txt
```
