# Lead Tracker - Setup & Installation Guide

A full-stack lead management system with email tracking, campaign automation, and real-time analytics.

## Tech Stack

### Frontend
- **React 18** with React Router
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animation library
- **GSAP** - Smooth scroll animations
- **Axios** - HTTP client
- **Recharts** - Data visualization

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** - Authentication
- **Nodemailer** - Email sending
- **Rate Limiting** - DDoS protection
- **Helmet** - Security headers
- **XSS-Clean** - Input sanitization
- **Mongo-Sanitize** - NoSQL injection prevention

## Features

- 🔐 JWT authentication with secure cookies
- 📧 Email campaign management with tracking
- 📊 Real-time analytics dashboard
- 🎯 Lead pipeline management
- 📝 Email templates with AI snippets
- 🔗 Open/Click tracking
- 🚀 Performance optimized with clustering
- 🛡️ Security hardened (rate limiting, XSS/NoSQL protection)

## Installation

### Prerequisites
- Node.js 18+ 
- MongoDB 6+ (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd lead-tracker/backend
npm install
```

Create a `.env` file in `backend/`:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/lead-tracker

# JWT Secret
JWT_SECRET=your-secure-secret-key-min-32-chars

# SMTP (optional - uses Ethereal if not set)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SambaNova API (for AI snippets)
SAMBANOVA_API_KEY=your-api-key
SAMBANOVA_MODEL=Meta-Llama-3.1-8B-Instruct

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

Start the backend:

```bash
npm run dev
# or
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd lead-tracker/frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_API_FRONTEND_URL=http://localhost:5173
```

Start the frontend:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Documentation

See `backend/API_DOCS.md` for detailed API reference.

### Key Endpoints

**Auth**
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

**Leads**
- `GET /api/leads` - List leads (paginated, filtered)
- `POST /api/leads` - Create lead
- `GET /api/leads/:id` - Get single lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

**Email**
- `POST /api/email/campaigns` - Send email campaign
- `GET /api/email/templates` - List templates
- `POST /api/email/templates` - Create template
- `GET /api/email/history` - Email history

**Tracking** (Public - no auth)
- `GET /api/email/track/open?hid=ID` - Track email opens
- `GET /api/email/track/click?hid=ID&url=...` - Track clicks

**Stats**
- `GET /api/stats` - Dashboard analytics

## Security Features

✅ **Rate Limiting** - 1000 requests per 15 minutes  
✅ **XSS Protection** - Input sanitization  
✅ **NoSQL Injection Prevention** - MongoDB sanitization  
✅ **HTTP Parameter Pollution Prevention**  
✅ **Helmet** - Security headers  
✅ **JWT** with httpOnly cookies  
✅ **CSRF Protection** - CORS configuration

## Performance

### Backend Clustering
The backend uses Node.js clustering to utilize all CPU cores:

```javascript
// Configure worker count
export WEB_CONCURRENCY=4  // or auto-detect CPU count
```

### Minimal API Responses
Only necessary data is sent:
- Leads: Only visible fields
- Templates: Metadata only, full body on demand
- History: Aggregated stats, not full documents

## Database Schema

### Lead
```javascript
{
  name: String,
  email: String,
  phone: String,
  company: String,
  status: String, // new, contacted, qualified, etc.
  source: String,
  notes: String,
  lastEmailSentAt: Date,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### EmailTemplate
```javascript
{
  name: String,
  subject: String,
  body: String,
  createdAt: Date,
  updatedAt: Date
}
```

### EmailHistory
```javascript
{
  lead: ObjectId,
  template: ObjectId,
  to: String,
  subject: String,
  status: String, // sent, opened, clicked
  trackId: String (UUID),
  openedAt: Date,
  clickedAt: Date,
  previewUrl: String,
  error: String
}
```

## Development

### Backend Scripts
```bash
npm run dev      # Development with nodemon
npm start        # Production
```

### Frontend Scripts
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

## Deployment

### Environment Variables for Production

**Backend:**
- Set `NODE_ENV=production`
- Use a production MongoDB URI (Atlas)
- Set strong `JWT_SECRET`
- Configure SMTP
- Set `BACKEND_URL` to your domain
- Set `FRONTEND_URL` to your frontend domain

**Frontend:**
- Set `VITE_API_URL` to your backend URL
- Update `VITE_API_FRONTEND_URL` to your frontend URL

### Database
- Use MongoDB Atlas or self-hosted MongoDB
- Ensure indexes on frequently queried fields
- Enable replica sets for production

## Troubleshooting

**Issue: Cookie not set**
- Check CORS origin matches frontend URL
- Verify `credentials: true` in frontend axios config
- Ensure cookies are set with proper `sameSite` in production

**Issue: Email not sending**
- Check SMTP credentials in .env
- Verify network allows outbound SMTP (port 587/465)
- Check Ethereal test account (if no SMTP configured)

**Issue: Tracking not working**
- Verify `BASE_URL` in backend .env matches your domain
- Check that emails include tracking pixel/link
- Ensure tracking routes are public (no auth middleware)

## License

MIT

