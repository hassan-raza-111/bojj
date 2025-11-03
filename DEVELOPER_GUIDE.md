# VenBid - Developer Guide 🛠️

Ye guide **developers** ke liye hai jo project ko setup, understand, aur extend karna chahte hain.

---

## 📋 Table of Contents

1. [Project Architecture](#project-architecture)
2. [Setup & Installation](#setup--installation)
3. [Database Schema](#database-schema)
4. [API Documentation](#api-documentation)
5. [Frontend Architecture](#frontend-architecture)
6. [Backend Architecture](#backend-architecture)
7. [Real-time Features (Socket.IO)](#real-time-features-socketio)
8. [Authentication & Authorization](#authentication--authorization)
9. [Code Structure](#code-structure)
10. [Development Workflow](#development-workflow)
11. [Testing](#testing)
12. [Deployment](#deployment)

---

## 🏗️ Project Architecture

### Tech Stack

**Frontend:**
- React 18.2.0
- TypeScript 5.5.3
- Vite 5.4.1 (Build tool)
- TailwindCSS 3.4.11
- React Router DOM 6.26.2
- TanStack Query 5.85.6 (State management)
- Socket.IO Client 4.8.1 (Real-time)
- Zod 3.23.8 (Validation)
- React Hook Form 7.53.0

**Backend:**
- Node.js
- Express 4.21.2
- TypeScript 5.8.3
- Prisma 6.17.1 (ORM)
- PostgreSQL (Database)
- Socket.IO 4.8.1 (Real-time)
- JWT (Authentication)
- Bcrypt 6.0.0 (Password hashing)
- Multer 2.0.2 (File uploads)

**Development Tools:**
- Prisma Studio (Database GUI)
- ESLint (Linting)
- Prettier (Code formatting)

---

## 🚀 Setup & Installation

### Prerequisites

Install these before starting:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **Git**

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd bojj
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials
```

**.env file structure:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/venbid"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="30d"
NODE_ENV="development"
PORT=5000
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-password"
FRONTEND_URL="http://localhost:8080"
```

### Step 3: Database Setup

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npm run db:seed

# (Optional) Open Prisma Studio
npx prisma studio
```

### Step 4: Frontend Setup

```bash
# Go to root directory
cd ..

# Install dependencies
npm install

# Create .env file (if not exists)
# Edit with backend URL
```

**.env file (frontend):**
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_FRONTEND_URL=http://localhost:8080
```

### Step 5: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Frontend runs on http://localhost:8080
```

### Step 6: Verify Installation

1. Backend: Visit `http://localhost:5000/health` - Should return `{status: "healthy"}`
2. Frontend: Visit `http://localhost:8080` - Should see home page
3. Database: Run `npx prisma studio` to verify tables

---

## 🗄️ Database Schema

### Prisma Schema Overview

Location: `backend/prisma/schema.prisma`

### Key Models

#### User Model
```prisma
model User {
  id               String           @id @default(uuid())
  email            String           @unique
  password         String
  firstName        String
  lastName         String
  role             Role             @default(CUSTOMER)
  status           UserStatus       @default(ACTIVE)
  
  // Relations
  vendorProfile    VendorProfile?
  customerProfile  CustomerProfile?
  jobs             Job[]
  bids             Bid[]
  // ... more relations
}
```

#### Job Model
```prisma
model Job {
  id                 String        @id @default(uuid())
  title              String
  description        String
  category           String
  budget             Float?
  budgetType         BudgetType
  status             JobStatus     @default(OPEN)
  customerId         String
  assignedVendorId   String?
  
  // Relations
  customer           User          @relation(...)
  assignedVendor     User?        @relation(...)
  bids               Bid[]
  chatRoom           ChatRoom?
}
```

#### Bid Model
```prisma
model Bid {
  id                    String    @id @default(uuid())
  amount                Float
  status                BidStatus @default(PENDING)
  jobId                 String
  vendorId              String
  
  // Negotiation fields
  initialAmount         Float?
  currentAmount         Float?
  counterOffers         Json?
  negotiationRound      Int       @default(1)
  negotiationStatus     String?   @default("INITIAL")
  
  // Relations
  job                   Job
  vendor                User
}
```

### Relationships

```
User (CUSTOMER) → Job (many-to-one)
User (VENDOR) → Bid (many-to-one)
Job → Bid (one-to-many)
Job → ChatRoom (one-to-one)
ChatRoom → ChatMessage (one-to-many)
User → Notification (one-to-many)
```

### Enums

```prisma
enum Role { CUSTOMER, VENDOR, ADMIN }
enum JobStatus { OPEN, IN_PROGRESS, COMPLETED, CANCELLED, DISPUTED }
enum BidStatus { PENDING, ACCEPTED, REJECTED, WITHDRAWN }
enum BudgetType { FIXED, HOURLY, NEGOTIABLE }
enum NotificationType { NEW_BID, BID_ACCEPTED, ... }
```

---

## 📡 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://api.venbid.com/api
```

### Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer <access_token>
```

---

### Auth Endpoints

#### POST /api/auth/register
Register new user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CUSTOMER" | "VENDOR",
  "phone": "+1234567890",
  "city": "New York"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresIn": "15m"
    }
  }
}
```

#### POST /api/auth/login
Login user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register

#### GET /api/auth/me
Get current user (Protected)

**Response:**
```json
{
  "success": true,
  "data": { ...user }
}
```

---

### Job Endpoints

#### GET /api/jobs/open
Get all open jobs (Public)

**Query Params:**
- `category`: Filter by category
- `city`: Filter by city
- `minBudget`: Minimum budget
- `maxBudget`: Maximum budget
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50
    }
  }
}
```

#### POST /api/jobs
Create new job (Customer only)

**Request:**
```json
{
  "title": "Need Plumber",
  "description": "Kitchen sink repair",
  "category": "Plumbing",
  "budget": 150,
  "budgetType": "FIXED",
  "city": "New York",
  "state": "NY",
  "street": "123 Main St",
  "zipCode": "10001",
  "timeline": "2 days",
  "tags": ["urgent", "kitchen"]
}
```

#### GET /api/jobs/:id
Get job details (Protected)

#### POST /api/jobs/:id/bids
Submit bid (Vendor only)

**Request:**
```json
{
  "amount": 120,
  "description": "I can fix this",
  "timeline": "1 day",
  "milestones": {...}
}
```

#### POST /api/jobs/:jobId/accept-bid/:bidId
Accept bid (Customer only)

---

### Bid Endpoints

#### GET /api/jobs/:id/bids
Get all bids for a job (Protected)

#### POST /api/jobs/bids/:bidId/counter-offer
Submit counter offer (Customer/Vendor)

**Request:**
```json
{
  "amount": 135,
  "message": "Can you do it for this price?"
}
```

#### POST /api/jobs/bids/:bidId/accept-counter
Accept counter offer

---

### Vendor Endpoints

#### GET /api/vendor/dashboard
Get vendor dashboard stats (Vendor only)

**Response:**
```json
{
  "success": true,
  "data": {
    "activeBids": 5,
    "awardedJobs": 10,
    "completedJobs": 25,
    "totalEarnings": 5000,
    "rating": 4.5
  }
}
```

#### GET /api/vendor/jobs/available
Get available jobs for vendor (Vendor only)

**Query Params:**
- `category`: Filter by category
- `city`: Filter by city
- `page`, `limit`: Pagination

#### GET /api/vendor/public/:vendorId
Get public vendor profile (Public)

---

### Chat Endpoints

#### POST /api/chat/rooms
Create chat room (Protected)

**Request:**
```json
{
  "jobId": "job-id",
  "vendorId": "vendor-id"
}
```

#### GET /api/chat/rooms
Get all chat rooms for user (Protected)

#### GET /api/chat/rooms/:chatRoomId/messages
Get messages for chat room (Protected)

**Query Params:**
- `page`: Page number
- `limit`: Messages per page

#### POST /api/chat/messages
Send message (Protected)

**Request:**
```json
{
  "chatRoomId": "room-id",
  "content": "Hello!",
  "messageType": "TEXT"
}
```

---

### Notification Endpoints

#### GET /api/notifications
Get all notifications for user (Protected)

**Query Params:**
- `isRead`: Filter by read/unread
- `type`: Filter by notification type
- `page`, `limit`: Pagination

#### PUT /api/notifications/:id/read
Mark notification as read (Protected)

---

## 🎨 Frontend Architecture

### Project Structure

```
src/
├── components/          # Reusable components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── auth/           # Auth components
│   ├── customer/       # Customer-specific
│   ├── vendor/         # Vendor-specific
│   ├── admin/          # Admin-specific
│   └── shared/         # Shared components
├── pages/              # Route pages
│   ├── customer/      # Customer pages
│   ├── vendor/        # Vendor pages
│   ├── admin/         # Admin pages
│   └── shared/        # Shared pages
├── hooks/              # Custom React hooks
│   ├── useAuth.ts     # Authentication hook
│   ├── useAvailableJobs.ts
│   ├── useBidActions.ts
│   └── ...
├── contexts/           # React contexts
│   ├── ChatContext.tsx
│   ├── CustomerContext.tsx
│   └── ThemeContext.tsx
├── config/             # Configuration
│   ├── api.ts         # API endpoints
│   ├── env.ts         # Environment vars
│   └── ...
├── layouts/            # Layout components
│   ├── CustomerLayout.tsx
│   ├── VendorLayout.tsx
│   └── AdminLayout.tsx
└── services/          # API services
```

### Key Hooks

#### useAuth Hook
```typescript
const { user, isAuthenticated, login, logout, refreshUserData } = useAuth();
```

**Features:**
- Auto-check auth status on mount
- Token validation
- User data management
- LocalStorage sync

#### useAvailableJobs Hook
```typescript
const { jobs, isLoading, refetch } = useAvailableJobs({
  category: 'Plumbing',
  city: 'New York'
});
```

#### useBidActions Hook
```typescript
const { submitBid, acceptBid, rejectBid, submitCounterOffer } = useBidActions();

await submitBid(jobId, {
  amount: 120,
  description: "...",
  timeline: "2 days"
});
```

### Routing Structure

**File:** `src/App.tsx`

```typescript
<Routes>
  {/* Public routes */}
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />
  
  {/* Customer routes */}
  <Route element={<RoleBasedRoute allowedRoles={['CUSTOMER']} />}>
    <Route path="/customer/*" element={<CustomerLayout>...</CustomerLayout>} />
  </Route>
  
  {/* Vendor routes */}
  <Route element={<RoleBasedRoute allowedRoles={['VENDOR']} />}>
    <Route path="/vendor/*" element={<VendorLayout>...</VendorLayout>} />
  </Route>
  
  {/* Admin routes */}
  <Route element={<AdminProtectedRoute />}>
    <Route path="/admin/*" element={<AdminLayout>...</AdminLayout>} />
  </Route>
</Routes>
```

### State Management

**TanStack Query (React Query)** use hota hai for:
- Server state management
- Caching
- Automatic refetching
- Optimistic updates

**Example:**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['jobs', filters],
  queryFn: () => fetchJobs(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

---

## ⚙️ Backend Architecture

### Project Structure

```
backend/src/
├── controllers/        # Request handlers
│   ├── auth.controller.ts
│   ├── job.controller.ts
│   ├── vendor.controller.ts
│   ├── chat.controller.ts
│   └── ...
├── routes/            # Route definitions
│   ├── auth.routes.ts
│   ├── job.routes.ts
│   └── ...
├── middleware/        # Middleware functions
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   ├── error.middleware.ts
│   └── upload.middleware.ts
├── services/          # Business logic services
│   └── notificationService.ts
├── utils/             # Utility functions
│   ├── schemas.ts     # Zod schemas
│   ├── logger.ts
│   └── emailService.ts
├── config/            # Configuration
│   ├── database.ts    # Prisma client
│   └── index.ts       # App config
├── app.ts             # Express app setup
└── server.ts          # Server entry with Socket.IO
```

### Middleware Chain

```typescript
// Example route
router.post(
  '/api/jobs/:id/bids',
  authenticateToken,      // 1. Verify JWT
  requireVendor,         // 2. Check role
  validateRequest(schema), // 3. Validate input
  submitBid              // 4. Controller
);
```

### Error Handling

**Error Middleware:** `middleware/error.middleware.ts`

```typescript
// Custom error class
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
  }
}

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details
    });
  }
  // ... handle other errors
};
```

### Validation

**Zod Schemas:** `utils/schemas.ts`

```typescript
export const createJobSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20),
  category: z.string(),
  budget: z.number().positive().optional(),
  budgetType: z.enum(['FIXED', 'HOURLY', 'NEGOTIABLE']),
  // ...
});
```

---

## 🔌 Real-time Features (Socket.IO)

### Server Setup

**File:** `backend/src/server.ts`

```typescript
import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: { origin: true, credentials: true }
});

// Socket authentication
io.use(authenticateSocket);

io.on('connection', (socket) => {
  const userId = socket.data.user?.id;
  
  // Join user's personal room
  socket.join(`user_${userId}`);
  
  // Join chat room
  socket.on('join_room', ({ chatRoomId }) => {
    socket.join(`room_${chatRoomId}`);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    // Cleanup
  });
});
```

### Client Setup

**File:** `src/contexts/ChatContext.tsx`

```typescript
import { io } from 'socket.io-client';

const socket = io(API_URL, {
  auth: { token: localStorage.getItem('accessToken') }
});

socket.on('new_message', (message) => {
  // Handle new message
});

socket.on('notification', (notification) => {
  // Handle notification
});
```

### Socket Events

**Server → Client:**
- `new_message`: New message received
- `notification`: New notification
- `bid_accepted`: Bid accepted
- `typing`: User is typing

**Client → Server:**
- `join_room`: Join chat room
- `leave_room`: Leave chat room
- `send_message`: Send message

---

## 🔒 Authentication & Authorization

### JWT Token Structure

**Access Token:**
```json
{
  "userId": "user-id",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Refresh Token:**
```json
{
  "userId": "user-id",
  "type": "refresh",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Token Generation

```typescript
// Access token (15 min)
const accessToken = jwt.sign(
  { userId: user.id },
  JWT_SECRET,
  { expiresIn: '15m' }
);

// Refresh token (30 days)
const refreshToken = jwt.sign(
  { userId: user.id, type: 'refresh' },
  JWT_SECRET,
  { expiresIn: '30d' }
);
```

### Middleware

**authenticateToken:**
```typescript
export const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new AppError(401, 'Token required');
  
  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  });
  
  req.user = user;
  next();
};
```

**Role-based:**
```typescript
export const requireVendor = requireRole(['VENDOR']);
export const requireCustomer = requireRole(['CUSTOMER']);
export const requireAdmin = requireRole(['ADMIN']);
```

---

## 📁 Code Structure

### Controller Pattern

```typescript
// job.controller.ts
export const createJob: RequestHandler = async (req, res, next) => {
  try {
    // 1. Validate input (middleware already did this)
    const jobData = req.body;
    
    // 2. Business logic
    const job = await prisma.job.create({
      data: { ...jobData, customerId: req.user.id }
    });
    
    // 3. Side effects (notifications)
    await notifyNewJobPosted(job);
    
    // 4. Response
    res.status(201).json({
      success: true,
      data: { job }
    });
  } catch (error) {
    next(error); // Error middleware handles it
  }
};
```

### Service Layer

```typescript
// notificationService.ts
export const notifyNewBid = async (
  customerId: string,
  jobTitle: string,
  bidAmount: number,
  vendorName: string,
  jobId: string
) => {
  // Create notification
  const notification = await prisma.notification.create({
    data: {
      userId: customerId,
      type: 'NEW_BID',
      title: 'New Bid Received',
      message: `${vendorName} submitted a bid of $${bidAmount}`,
      link: `/customer/jobs/${jobId}/details`,
      priority: 'HIGH'
    }
  });
  
  // Emit Socket.IO event
  io.to(`user_${customerId}`).emit('notification', notification);
  
  // Send email
  await sendNotificationEmail(/* ... */);
  
  return notification;
};
```

---

## 🔄 Development Workflow

### Branch Strategy

```bash
main          # Production
├── develop   # Development
    ├── feature/job-filtering
    ├── feature/payment-integration
    └── bugfix/chat-messages
```

### Commit Messages

```
feat: Add job filtering by location
fix: Fix chat message real-time update
refactor: Optimize database queries
docs: Update API documentation
```

### Code Style

**ESLint + Prettier** configured:
- Run: `npm run lint`
- Auto-fix: `npm run lint:fix`
- Format: `npm run format`

### Prisma Workflow

```bash
# 1. Update schema.prisma
# 2. Create migration
npx prisma migrate dev --name add_new_field

# 3. Generate Prisma Client
npx prisma generate

# 4. Use in code
import { prisma } from './config/database';
```

---

## 🧪 Testing

### Backend Testing

```bash
# Install test dependencies
npm install --save-dev jest @types/jest ts-jest

# Run tests
npm test
```

### Frontend Testing

```bash
# Install test dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Run tests
npm test
```

### Manual Testing Checklist

- [ ] User registration/login
- [ ] Job creation
- [ ] Bid submission
- [ ] Counter offers
- [ ] Chat messaging
- [ ] Notifications
- [ ] File uploads

---

## 🚢 Deployment

### Backend Deployment

**Environment Variables:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=production-secret
PORT=5000
FRONTEND_URL=https://venbid.com
```

**Build:**
```bash
cd backend
npm run build
npm start
```

### Frontend Deployment

**Build:**
```bash
npm run build
# Output: dist/
```

**Deploy `dist/` folder to:**
- Vercel
- Netlify
- AWS S3 + CloudFront
- Or any static hosting

### Database Migrations

```bash
# Production migration
npx prisma migrate deploy
```

---

## 🔧 Common Issues & Solutions

### Issue 1: Prisma Client not found
**Solution:**
```bash
cd backend
npx prisma generate
```

### Issue 2: CORS errors
**Solution:** Check `backend/src/app.ts` - CORS configuration

### Issue 3: Socket.IO not connecting
**Solution:** 
- Check JWT token in socket auth
- Verify CORS settings
- Check Socket.IO version compatibility

### Issue 4: File upload not working
**Solution:**
- Check multer configuration
- Verify upload directory exists
- Check file size limits

---

## 📚 Additional Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **React Query Docs**: https://tanstack.com/query
- **Socket.IO Docs**: https://socket.io/docs
- **Express Docs**: https://expressjs.com

---

**End of Developer Guide**

Happy Coding! 🚀

