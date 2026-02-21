# 🚀 FleetFlow Setup Guide

Complete step-by-step guide to get FleetFlow running on your local machine.

## Prerequisites Checklist

- [ ] Node.js v18+ installed
- [ ] PostgreSQL v14+ installed and running
- [ ] Git installed
- [ ] Terminal/Command Prompt access

## Step-by-Step Setup

### 1. Install PostgreSQL (if not installed)

**Windows:**

- Download from https://www.postgresql.org/download/windows/
- Run installer and remember your postgres password

**Mac:**

```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

**Option A: Using pgAdmin (Recommended)**

See detailed guides:

- [PGADMIN_SETUP.md](PGADMIN_SETUP.md)
- [PGADMIN_VISUAL_GUIDE.md](PGADMIN_VISUAL_GUIDE.md)

Quick steps:

1. Open pgAdmin 4
2. Right-click Databases → Create → Database
3. Name it `fleetflow`
4. Click Save

**Option B: Using psql command line**

Open terminal and run:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE fleetflow;

# Exit psql
\q
```

### 3. Setup Backend

**Option A: Using pgAdmin (Recommended)**

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install
```

Then in pgAdmin:

1. Right-click on `fleetflow` database
2. Select Query Tool
3. Click Open File icon
4. Navigate to `backend/database/setup-complete.sql`
5. Click Execute (F5)

**Option B: Using psql command line**

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create database tables and load demo data
psql -U postgres -d fleetflow -f database/setup-complete.sql
```

**Configure environment:**
Edit `backend/.env` and update `DB_PASSWORD` with your PostgreSQL password

### 4. Setup Frontend

```bash
# Navigate to frontend folder (from project root)
cd frontend

# Install dependencies
npm install
```

### 5. Start the Application

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

You should see:

```
✅ Database connected
🚀 FleetFlow API running on port 5000
📡 Socket.io ready for connections
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

You should see:

```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

### 6. Access the Application

Open your browser and go to: `http://localhost:5173`

## Demo Login Credentials

Use any of these accounts to login:

| Role                            | Email                    | Password    |
| ------------------------------- | ------------------------ | ----------- |
| **Fleet Manager** (Full Access) | manager@fleetflow.com    | password123 |
| **Dispatcher**                  | dispatcher@fleetflow.com | password123 |
| **Safety Officer**              | safety@fleetflow.com     | password123 |
| **Financial Analyst**           | finance@fleetflow.com    | password123 |

## Troubleshooting

### Database Connection Failed

**Error:** `Database connection failed`

**Solution:**

1. Check PostgreSQL is running: `pg_isready`
2. Verify credentials in `backend/.env`
3. Ensure database exists: `psql -U postgres -l | grep fleetflow`

### Port Already in Use

**Error:** `Port 5000 already in use`

**Solution:**

1. Change PORT in `backend/.env` to another port (e.g., 5001)
2. Update `VITE_API_URL` in `frontend/.env` accordingly

### Cannot Connect to Backend

**Error:** Frontend shows connection errors

**Solution:**

1. Ensure backend is running on port 5000
2. Check `VITE_API_URL` in `frontend/.env` is correct
3. Clear browser cache and reload

### Missing Dependencies

**Error:** `Module not found`

**Solution:**

```bash
# In backend folder
cd backend
rm -rf node_modules package-lock.json
npm install

# In frontend folder
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Verify Installation

After setup, you should be able to:

1. ✅ Login with demo credentials
2. ✅ See the Dashboard with KPI cards
3. ✅ View the Vehicles page with demo vehicles
4. ✅ See "Connected" status in the header (green dot)
5. ✅ Navigate between different pages

## Next Steps

1. Explore the Dashboard and familiarize yourself with the UI
2. Try creating a new vehicle (if you're logged in as Fleet Manager)
3. Check out the different user roles and their permissions
4. Review the API documentation in `backend/README.md`

## Development Workflow

### Making Changes

1. Create a new branch:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes

3. Test locally

4. Commit with proper format:

```bash
git commit -m "feat: add new feature"
```

5. Push and create pull request

### Commit Message Format

- `feat:` - New feature
- `fix:` - Bug fix
- `chore:` - Maintenance
- `refactor:` - Code refactoring
- `docs:` - Documentation

## Need Help?

- Check the main README.md for detailed documentation
- Review backend/README.md for API endpoints
- Check frontend/README.md for frontend structure

## Production Deployment

For production deployment:

1. Update environment variables for production
2. Build frontend: `cd frontend && npm run build`
3. Use a process manager like PM2 for backend
4. Set up proper PostgreSQL security
5. Use HTTPS and secure JWT secrets
6. Configure CORS properly

Happy coding! 🚀
