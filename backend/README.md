# FleetFlow Backend API

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. PostgreSQL Setup

Make sure PostgreSQL is installed and running on your system.

Create the database:

```bash
psql -U postgres
CREATE DATABASE fleetflow;
\q
```

### 3. Run Database Schema

```bash
psql -U postgres -d fleetflow -f database/schema.sql
```

### 4. (Optional) Seed Demo Data

```bash
psql -U postgres -d fleetflow -f database/seed.sql
```

### 5. Configure Environment

Update `.env` file with your PostgreSQL credentials:

```
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secure_secret_key
```

### 6. Start Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset
- `GET /api/auth/me` - Get current user

### Vehicles

- `GET /api/vehicles` - List all vehicles (filters: status, type, region)
- `GET /api/vehicles/:id` - Get vehicle by ID
- `POST /api/vehicles` - Create vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `PATCH /api/vehicles/:id/retire` - Retire vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Drivers

- `GET /api/drivers` - List all drivers (filters: status, license_category)
- `GET /api/drivers/:id` - Get driver by ID
- `POST /api/drivers` - Create driver
- `PUT /api/drivers/:id` - Update driver
- `PATCH /api/drivers/:id/status` - Update driver status

### Trips

- `GET /api/trips` - List all trips (filters: status, vehicle_id, driver_id)
- `GET /api/trips/:id` - Get trip by ID
- `POST /api/trips` - Create trip (with full validation)
- `PATCH /api/trips/:id/dispatch` - Dispatch trip
- `PATCH /api/trips/:id/complete` - Complete trip
- `PATCH /api/trips/:id/cancel` - Cancel trip

### Maintenance

- `GET /api/maintenance` - List maintenance logs
- `POST /api/maintenance` - Create maintenance log (auto sets vehicle to in_shop)
- `PATCH /api/maintenance/:id/complete` - Complete maintenance (auto sets vehicle to available)
- `PUT /api/maintenance/:id` - Update maintenance log
- `DELETE /api/maintenance/:id` - Delete maintenance log

### Fuel & Expenses

- `GET /api/fuel` - List fuel logs
- `POST /api/fuel` - Create fuel log
- `GET /api/expenses` - List expense logs
- `POST /api/expenses` - Create expense log

### Analytics

- `GET /api/analytics/dashboard` - Dashboard KPIs
- `GET /api/analytics/vehicle/:id` - Vehicle-specific analytics
- `GET /api/analytics/fleet` - Fleet-wide metrics
- `GET /api/analytics/drivers` - Driver performance summary
- `GET /api/analytics/export/csv` - Export CSV
- `GET /api/analytics/export/pdf` - Export PDF

## Demo Users

- Fleet Manager: `manager@fleetflow.com` / `password123`
- Dispatcher: `dispatcher@fleetflow.com` / `password123`
- Safety Officer: `safety@fleetflow.com` / `password123`
- Financial Analyst: `finance@fleetflow.com` / `password123`

## Socket.io Events

- `vehicle:status_updated`
- `vehicle:created`
- `driver:status_updated`
- `trip:created`
- `trip:dispatched`
- `trip:completed`
- `maintenance:alert`
