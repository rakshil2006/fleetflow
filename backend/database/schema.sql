-- FleetFlow Database Schema

-- USERS (Auth & RBAC)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- VEHICLES
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  model VARCHAR(100),
  license_plate VARCHAR(50) UNIQUE NOT NULL,
  vehicle_type VARCHAR(50) CHECK (vehicle_type IN ('Truck', 'Van', 'Bike')),
  max_load_capacity_kg DECIMAL(10,2) NOT NULL,
  odometer_km DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'on_trip', 'in_shop', 'retired')),
  region VARCHAR(100),
  acquisition_cost DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- DRIVERS
CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(20),
  license_number VARCHAR(100) UNIQUE NOT NULL,
  license_category VARCHAR(50),
  license_expiry_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'off_duty' CHECK (status IN ('on_duty', 'on_trip', 'off_duty', 'suspended')),
  safety_score DECIMAL(5,2) DEFAULT 100.0,
  total_trips INT DEFAULT 0,
  completed_trips INT DEFAULT 0,
  incident_free_streak_days INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- TRIPS
CREATE TABLE IF NOT EXISTS trips (
  id SERIAL PRIMARY KEY,
  vehicle_id INT REFERENCES vehicles(id),
  driver_id INT REFERENCES drivers(id),
  origin VARCHAR(200) NOT NULL,
  destination VARCHAR(200) NOT NULL,
  cargo_description TEXT,
  cargo_weight_kg DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'dispatched', 'completed', 'cancelled')),
  revenue DECIMAL(12,2) DEFAULT 0,
  start_odometer DECIMAL(10,2),
  end_odometer DECIMAL(10,2),
  dispatched_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- MAINTENANCE LOGS
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id SERIAL PRIMARY KEY,
  vehicle_id INT REFERENCES vehicles(id),
  service_type VARCHAR(200) NOT NULL,
  description TEXT,
  cost DECIMAL(12,2),
  service_date DATE NOT NULL,
  completed_date DATE,
  status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- FUEL LOGS
CREATE TABLE IF NOT EXISTS fuel_logs (
  id SERIAL PRIMARY KEY,
  vehicle_id INT REFERENCES vehicles(id),
  trip_id INT REFERENCES trips(id),
  liters DECIMAL(8,2) NOT NULL,
  cost_per_liter DECIMAL(8,2),
  total_cost DECIMAL(12,2) NOT NULL,
  odometer_at_fill DECIMAL(10,2),
  fuel_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- EXPENSE LOGS
CREATE TABLE IF NOT EXISTS expense_logs (
  id SERIAL PRIMARY KEY,
  vehicle_id INT REFERENCES vehicles(id),
  trip_id INT REFERENCES trips(id),
  category VARCHAR(100),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_vehicle ON trips(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_fuel_vehicle ON fuel_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle ON maintenance_logs(vehicle_id);
