# CryOutNow Developer Guide

This guide provides comprehensive information for developers working on the CryOutNow project.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Architecture](#architecture)
4. [Development Workflow](#development-workflow)
5. [Code Standards](#code-standards)
6. [Testing](#testing)
7. [Database](#database)
8. [API Documentation](#api-documentation)
9. [Security](#security)
10. [Performance](#performance)

## Project Overview

CryOutNow is a full-stack application built with:

- Frontend: React.js with TypeScript
- Backend: Node.js/Express with TypeScript
- Database: PostgreSQL
- ORM: Knex.js
- Authentication: JWT & Passport.js
- UI Components: Shadcn/UI

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL (v14+)
- Git
- npm or yarn

### Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/cryoutnow.git
   cd cryoutnow
   ```

2. **Install Dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend (.env)
   NODE_ENV=development
   PORT=3000
   DATABASE_URL=postgresql://user:password@localhost:5432/cryoutnow
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Frontend (.env.local)
   REACT_APP_API_URL=http://localhost:3000
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Database Setup**
   ```bash
   cd backend
   npm run migrate
   npm run seed
   ```

5. **Start Development Servers**
   ```bash
   # Backend
   npm run dev

   # Frontend
   cd ../frontend
   npm start
   ```

## Architecture

### Frontend Architecture

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API service calls
│   ├── store/            # Redux store configuration
│   ├── utils/            # Utility functions
│   └── types/            # TypeScript type definitions
```

### Backend Architecture

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── utils/           # Utility functions
```

## Development Workflow

### Git Workflow

1. **Branch Naming**
   - Feature: `feature/description`
   - Bug Fix: `fix/description`
   - Hotfix: `hotfix/description`

2. **Commit Messages**
   ```
   type(scope): description

   [optional body]

   [optional footer]
   ```

3. **Pull Request Process**
   - Create feature branch
   - Make changes
   - Run tests
   - Submit PR with description
   - Get code review
   - Merge after approval

### Code Review Guidelines

1. **What to Look For**
   - Code style consistency
   - Potential bugs
   - Performance issues
   - Security concerns
   - Test coverage

2. **Review Process**
   - Read the description
   - Check out the branch
   - Run tests locally
   - Review code changes
   - Provide constructive feedback

## Code Standards

### TypeScript Guidelines

```typescript
// Use interfaces for objects
interface User {
  id: string;
  email: string;
  displayName: string;
}

// Use type for unions/intersections
type AuthResponse = {
  token: string;
  user: User;
} | {
  error: string;
};

// Use enums for constants
enum PrayerStatus {
  ACTIVE = 'active',
  ANSWERED = 'answered',
  ARCHIVED = 'archived',
}
```

### React Guidelines

```typescript
// Use functional components
const PrayerCard: React.FC<PrayerCardProps> = ({ prayer }) => {
  // Use hooks at the top
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Extract complex logic to custom hooks
  const { handlePray } = usePrayerActions(prayer.id);

  return (
    // JSX
  );
};
```

### API Guidelines

```typescript
// Use consistent response format
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Handle errors consistently
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message,
  });
};
```

## Testing

### Frontend Testing

```typescript
// Component testing with React Testing Library
describe('PrayerCard', () => {
  it('renders prayer details correctly', () => {
    render(<PrayerCard prayer={mockPrayer} />);
    expect(screen.getByText(mockPrayer.title)).toBeInTheDocument();
  });
});
```

### Backend Testing

```typescript
// API testing with Jest
describe('POST /api/prayers', () => {
  it('creates a new prayer request', async () => {
    const response = await request(app)
      .post('/api/prayers')
      .send(mockPrayerData);
    expect(response.status).toBe(201);
  });
});
```

## Database

### Migration Guidelines

```typescript
// Create migration
exports.up = function(knex) {
  return knex.schema.createTable('prayers', table => {
    table.uuid('id').primary();
    table.string('title').notNullable();
    table.text('content').notNullable();
    table.timestamps(true, true);
  });
};
```

### Query Guidelines

```typescript
// Use QueryBuilder
const getPrayerRequests = async (userId: string) => {
  return await knex('prayers')
    .where('userId', userId)
    .orderBy('createdAt', 'desc');
};
```

## Security

### Authentication

```typescript
// JWT Authentication
const authenticateJWT: RequestHandler = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  // Verify token
};
```

### Authorization

```typescript
// Role-based authorization
const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
```

## Performance

### Frontend Optimization

1. **Code Splitting**
   ```typescript
   const PrayerChain = lazy(() => import('./PrayerChain'));
   ```

2. **Memoization**
   ```typescript
   const MemoizedComponent = memo(Component);
   ```

### Backend Optimization

1. **Caching**
   ```typescript
   const cache = new NodeCache();
   ```

2. **Query Optimization**
   ```typescript
   const getOptimizedPrayers = async () => {
     return await knex('prayers')
       .select('id', 'title')
       .whereNull('deletedAt')
       .limit(10);
   };
   ```

## Troubleshooting

### Common Issues

1. **Database Connection**
   ```bash
   # Check connection
   npm run db:check
   ```

2. **Authentication Issues**
   ```bash
   # Clear tokens
   npm run auth:clear
   ```

### Debugging

1. **Backend Debugging**
   ```bash
   # Start with debugger
   npm run debug
   ```

2. **Frontend Debugging**
   - Use React Developer Tools
   - Check Redux DevTools
   - Monitor Network tab

## Additional Resources

- [API Documentation](/api-docs)
- [Deployment Guide](/docs/deployment.md)
- [User Guide](/docs/user-guide.md)
- [Contributing Guidelines](/CONTRIBUTING.md) 