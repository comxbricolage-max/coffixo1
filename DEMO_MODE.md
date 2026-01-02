# 🧪 Demo Mode Documentation

## Overview
This Next.js 14 application runs in **Demo Mode** without requiring MongoDB or any external services.

## Features
- ✅ **No Database Required** - All data is mock/fake
- ✅ **No Environment Variables** - Works out of the box
- ✅ **No Blank Pages** - All routes render content
- ✅ **No Runtime Errors** - Comprehensive error handling
- ✅ **Visual Demo Banner** - Clear indication of demo mode

## Demo User
All authentication uses a demo user:
```json
{
  "id": "demo-user",
  "email": "demo@caffixo.com",
  "name": "Demo Owner",
  "role": "owner"
}
```

## Available Routes

### Public Routes
- `/` - Home page with login/signup links
- `/app/login` - Login page (any credentials work)
- `/app/signup` - Signup page (always succeeds)

### Protected Routes (Demo Mode - Always Accessible)
- `/app/dashboard` - Dashboard with demo data:
  - Recent Orders (3 mock orders)
  - Table Status (5 mock tables)
  - Menu Items (4 mock items)

## API Routes

All API routes return mock data:
- `POST /api/auth/login` - Always succeeds
- `POST /api/auth/signup` - Always succeeds
- `POST /api/auth/logout` - Always succeeds
- `GET /api/auth/session` - Returns demo user

## Session Handling

Demo mode uses simple cookies:
- Cookie name: `demo-session`
- Always returns demo user ID
- No encryption (dev mode only)

## Demo Data

### Orders
- Table 5: Pizza, Coke - Pending - $24.99
- Table 3: Burger, Fries - Preparing - $18.50
- Table 8: Pasta, Salad - Ready - $22.00

### Tables
- Table 1: Available
- Table 2: Occupied (1 order)
- Table 3: Occupied (1 order)
- Table 4: Available
- Table 5: Occupied (1 order)

### Menu Items
- Margherita Pizza - $12.99
- Classic Burger - $9.99
- Caesar Salad - $8.99
- Pasta Carbonara - $14.99

## Error Handling

All pages include try/catch blocks:
- Never show blank pages
- Always render fallback UI
- Console logs for debugging
- User-friendly error messages

## Future Integration

When ready to connect MongoDB:
1. Search for `🧪 DEMO MODE` comments
2. Search for `TODO:` comments
3. Replace mock functions in `lib/auth.ts`
4. Update API routes to use real database
5. Remove demo banner component
6. Add environment variables for MongoDB URI

## Running Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

No configuration needed!

