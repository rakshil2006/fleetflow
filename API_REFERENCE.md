# FleetFlow API Reference

Quick reference guide for all API endpoints.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All endpoints except `/auth/login` require JWT token in header:

```
Authorization: Bearer <token>
```

---

## 🔐 Authentication

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "manager@fleetflow.com",
  "password": "password123"
}

Response: 200 OK
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Manager",
    "email": "manager@fleetflow.com",
    "role": "fleet_manager"
  }
}
```

### Get Current User

```http
GET /auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "name": "John Manager",
  "email": "manager@fleetflow.com",
  "role": "fleet_manager",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 🚛 Vehicles

### List Vehicles

```http
GET /vehicles?status=available&type=Truck&region=North
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "name": "Truck Alpha",
    "model": "Volvo FH16",
    "license_plate": "TRK-001",
    "vehicle_type": "Truck",
    "max_load_capacity_kg": 25000.00,
    "odometer_km": 45000.00,
    "status": "available",
    "region": "North",
    "acquisition_cost": 85000.00,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Vehicle by ID

```http
GET /vehicles/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "name": "Truck Alpha",
  ...
}
```

### Create Vehicle

```http
POST /vehicles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Truck Charlie",
  "model": "Scania R500",
  "license_plate": "TRK-003",
  "vehicle_type": "Truck",
  "max_load_capacity_kg": 30000,
  "odometer_km": 0,
  "region": "East",
  "acquisition_cost": 95000
}

Response: 201 Created
{
  "id": 3,
  "name": "Truck Charlie",
  ...
}
```

### Update Vehicle

```http
PUT /vehicles/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Truck Charlie Updated",
  "odometer_km": 1000,
  ...
}

Response: 200 OK
{
  "id": 3,
  "name": "Truck Charlie Updated",
  ...
}
```

### Retire Vehicle

```http
PATCH /vehicles/:id/retire
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 3,
  "status": "retired",
  ...
}
```

### Delete Vehicle

```http
DELETE /vehicles/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Vehicle deleted successfully"
}
```

---

## 👤 Drivers

### List Drivers

```http
GET /drivers?status=off_duty&license_category=Truck
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "name": "James Wilson",
    "email": "james@example.com",
    "phone": "+1234567890",
    "license_number": "DL-TRK-001",
    "license_category": "Truck",
    "license_expiry_date": "2027-12-31",
    "status": "off_duty",
    "safety_score": 98.5,
    "total_trips": 0,
    "completed_trips": 0,
    "incident_free_streak_days": 0,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### Create Driver

```http
POST /drivers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Driver",
  "email": "newdriver@example.com",
  "phone": "+1234567899",
  "license_number": "DL-TRK-003",
  "license_category": "Truck",
  "license_expiry_date": "2028-12-31"
}

Response: 201 Created
```

### Update Driver Status

```http
PATCH /drivers/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "on_duty"
}

Response: 200 OK
```

---

## 🗺️ Trips

### List Trips

```http
GET /trips?status=dispatched&vehicle_id=1&driver_id=1
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "vehicle_id": 1,
    "driver_id": 1,
    "origin": "Warehouse A",
    "destination": "Customer B",
    "cargo_description": "Electronics",
    "cargo_weight_kg": 5000,
    "status": "dispatched",
    "revenue": 1500,
    "start_odometer": 45000,
    "end_odometer": null,
    "dispatched_at": "2024-01-01T10:00:00.000Z",
    "completed_at": null,
    "created_at": "2024-01-01T09:00:00.000Z",
    "vehicle_name": "Truck Alpha",
    "license_plate": "TRK-001",
    "driver_name": "James Wilson"
  }
]
```

### Create Trip

```http
POST /trips
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicle_id": 1,
  "driver_id": 1,
  "origin": "Warehouse A",
  "destination": "Customer C",
  "cargo_description": "Furniture",
  "cargo_weight_kg": 8000,
  "revenue": 2000
}

Response: 201 Created
{
  "id": 2,
  ...
}

Errors:
- 400: Cargo weight exceeds vehicle max capacity
- 400: Driver license is expired
- 400: Driver license category does not match vehicle type
- 400: Vehicle is not available
- 400: Driver is not available
```

### Dispatch Trip

```http
PATCH /trips/:id/dispatch
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 2,
  "status": "dispatched",
  "dispatched_at": "2024-01-01T11:00:00.000Z",
  ...
}

Side Effects:
- Vehicle status → on_trip
- Driver status → on_trip
- Driver total_trips incremented
```

### Complete Trip

```http
PATCH /trips/:id/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "end_odometer": 45250
}

Response: 200 OK
{
  "id": 2,
  "status": "completed",
  "end_odometer": 45250,
  "completed_at": "2024-01-01T15:00:00.000Z",
  ...
}

Side Effects:
- Vehicle status → available
- Vehicle odometer updated
- Driver status → off_duty
- Driver completed_trips incremented
```

### Cancel Trip

```http
PATCH /trips/:id/cancel
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 2,
  "status": "cancelled",
  ...
}

Side Effects (if trip was dispatched):
- Vehicle status → available
- Driver status → off_duty
```

---

## 🔧 Maintenance

### List Maintenance Logs

```http
GET /maintenance?vehicle_id=1&status=in_progress&start_date=2024-01-01&end_date=2024-12-31
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "vehicle_id": 1,
    "service_type": "Oil Change",
    "description": "Regular maintenance",
    "cost": 150.00,
    "service_date": "2024-01-15",
    "completed_date": null,
    "status": "in_progress",
    "created_at": "2024-01-15T08:00:00.000Z",
    "vehicle_name": "Truck Alpha",
    "license_plate": "TRK-001"
  }
]
```

### Create Maintenance Log

```http
POST /maintenance
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicle_id": 1,
  "service_type": "Brake Replacement",
  "description": "Front brake pads replaced",
  "cost": 500,
  "service_date": "2024-01-20"
}

Response: 201 Created
{
  "id": 2,
  ...
}

Side Effects:
- Vehicle status → in_shop
```

### Complete Maintenance

```http
PATCH /maintenance/:id/complete
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 2,
  "status": "completed",
  "completed_date": "2024-01-21",
  ...
}

Side Effects:
- Vehicle status → available
```

---

## ⛽ Fuel Logs

### List Fuel Logs

```http
GET /fuel?vehicle_id=1&start_date=2024-01-01&end_date=2024-12-31
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "vehicle_id": 1,
    "trip_id": 1,
    "liters": 150.5,
    "cost_per_liter": 1.50,
    "total_cost": 225.75,
    "odometer_at_fill": 45100,
    "fuel_date": "2024-01-10",
    "created_at": "2024-01-10T14:00:00.000Z",
    "vehicle_name": "Truck Alpha",
    "license_plate": "TRK-001"
  }
]
```

### Create Fuel Log

```http
POST /fuel
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicle_id": 1,
  "trip_id": 1,
  "liters": 200,
  "cost_per_liter": 1.55,
  "total_cost": 310,
  "odometer_at_fill": 45250,
  "fuel_date": "2024-01-15"
}

Response: 201 Created
```

---

## 💰 Expenses

### List Expense Logs

```http
GET /expenses?vehicle_id=1&category=Tolls&start_date=2024-01-01&end_date=2024-12-31
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "vehicle_id": 1,
    "trip_id": 1,
    "category": "Tolls",
    "amount": 25.00,
    "description": "Highway toll",
    "expense_date": "2024-01-10",
    "created_at": "2024-01-10T16:00:00.000Z",
    "vehicle_name": "Truck Alpha",
    "license_plate": "TRK-001"
  }
]
```

### Create Expense Log

```http
POST /expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicle_id": 1,
  "trip_id": 1,
  "category": "Parking",
  "amount": 15,
  "description": "Overnight parking",
  "expense_date": "2024-01-15"
}

Response: 201 Created
```

---

## 📊 Analytics

### Dashboard KPIs

```http
GET /analytics/dashboard
Authorization: Bearer <token>

Response: 200 OK
{
  "activeFleet": 3,
  "maintenanceAlerts": 1,
  "utilizationRate": 50.00,
  "pendingCargo": 2,
  "totalVehicles": 6,
  "totalDrivers": 6,
  "activeTrips": 3,
  "monthlyFuelCost": 1250.50,
  "recentActivity": [
    {
      "type": "trip",
      "id": 5,
      "status": "completed",
      "timestamp": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Vehicle Analytics

```http
GET /analytics/vehicle/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "vehicle": { ... },
  "fuelCost": 2500.00,
  "maintenanceCost": 1500.00,
  "totalCosts": 4000.00,
  "revenue": 15000.00,
  "roi": 12.94,
  "totalTrips": 25,
  "fuelEfficiency": 8.5
}
```

### Fleet Analytics

```http
GET /analytics/fleet
Authorization: Bearer <token>

Response: 200 OK
{
  "vehicles": [
    {
      "id": 1,
      "name": "Truck Alpha",
      "vehicle_type": "Truck",
      "status": "available",
      "fuel_cost": 2500.00,
      "maintenance_cost": 1500.00,
      "revenue": 15000.00,
      "total_trips": 25
    }
  ],
  "utilizationByType": [
    {
      "type": "Truck",
      "total": 2,
      "onTrip": 1,
      "utilizationRate": 50.00
    }
  ]
}
```

### Driver Performance

```http
GET /analytics/drivers
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "name": "James Wilson",
    "license_number": "DL-TRK-001",
    "license_category": "Truck",
    "status": "off_duty",
    "safety_score": 98.5,
    "total_trips": 25,
    "completed_trips": 24,
    "incident_free_streak_days": 45,
    "completion_rate": 96.00
  }
]
```

---

## 🔒 Error Responses

### 400 Bad Request

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "error": "Access denied. No token provided."
}
```

### 403 Forbidden

```json
{
  "error": "Access denied. Insufficient permissions."
}
```

### 404 Not Found

```json
{
  "error": "Vehicle not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

---

## 📡 Socket.io Events

### Client → Server

```javascript
socket.emit("ping");
```

### Server → Client

```javascript
// Vehicle events
socket.on("vehicle:status_updated", (data) => {
  // { id, status, ... }
});

socket.on("vehicle:created", (data) => {
  // { id, name, ... }
});

// Driver events
socket.on("driver:status_updated", (data) => {
  // { id, status, ... }
});

// Trip events
socket.on("trip:created", (data) => {
  // { id, vehicle_id, driver_id, ... }
});

socket.on("trip:dispatched", (data) => {
  // { id, status: 'dispatched', ... }
});

socket.on("trip:completed", (data) => {
  // { id, status: 'completed', ... }
});

// Maintenance events
socket.on("maintenance:alert", (data) => {
  // { id, vehicle_id, service_type, ... }
});
```

---

## 🧪 Testing with cURL

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@fleetflow.com","password":"password123"}'
```

### Get Vehicles

```bash
curl -X GET http://localhost:5000/api/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Vehicle

```bash
curl -X POST http://localhost:5000/api/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Truck",
    "license_plate": "TEST-001",
    "vehicle_type": "Truck",
    "max_load_capacity_kg": 20000
  }'
```

---

## 📝 Notes

- All dates are in ISO 8601 format
- All monetary values are in decimal format (2 decimal places)
- All weights are in kilograms
- All distances are in kilometers
- Timestamps are in UTC
- Token expires in 8 hours by default
