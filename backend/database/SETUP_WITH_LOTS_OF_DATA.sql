-- ============================================
-- FleetFlow Complete Database Setup
-- WITH LOTS OF DEMO DATA!
-- Run this entire file in pgAdmin Query Tool
-- ============================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS expense_logs CASCADE;
DROP TABLE IF EXISTS fuel_logs CASCADE;
DROP TABLE IF EXISTS maintenance_logs CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- CREATE TABLES
-- ============================================

-- USERS (Auth & RBAC)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst')),
  security_question VARCHAR(255),
  security_answer_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- VEHICLES
CREATE TABLE vehicles (
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
CREATE TABLE drivers (
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
CREATE TABLE trips (
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
CREATE TABLE maintenance_logs (
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
CREATE TABLE fuel_logs (
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
CREATE TABLE expense_logs (
  id SERIAL PRIMARY KEY,
  vehicle_id INT REFERENCES vehicles(id),
  trip_id INT REFERENCES trips(id),
  category VARCHAR(100),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_type ON vehicles(vehicle_type);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_vehicle ON trips(vehicle_id);
CREATE INDEX idx_trips_driver ON trips(driver_id);
CREATE INDEX idx_fuel_vehicle ON fuel_logs(vehicle_id);
CREATE INDEX idx_maintenance_vehicle ON maintenance_logs(vehicle_id);

-- ============================================
-- INSERT LOTS OF DEMO DATA!
-- ============================================

-- Insert demo users (password: password123, security answer: demo)
INSERT INTO users (name, email, password_hash, role, security_question, security_answer_hash) VALUES
('John Manager', 'manager@fleetflow.com', '$2a$10$CWxon4z5/MOt8BkC6UmTEOM4p5TElxR/6hM4fyvaNzqnwSZP6Sa6O', 'fleet_manager', 'What is your mother''s maiden name?', '$2a$10$CWxon4z5/MOt8BkC6UmTEOM4p5TElxR/6hM4fyvaNzqnwSZP6Sa6O'),
('Sarah Dispatcher', 'dispatcher@fleetflow.com', '$2a$10$CWxon4z5/MOt8BkC6UmTEOM4p5TElxR/6hM4fyvaNzqnwSZP6Sa6O', 'dispatcher', 'What was the name of your first pet?', '$2a$10$CWxon4z5/MOt8BkC6UmTEOM4p5TElxR/6hM4fyvaNzqnwSZP6Sa6O'),
('Mike Safety', 'safety@fleetflow.com', '$2a$10$CWxon4z5/MOt8BkC6UmTEOM4p5TElxR/6hM4fyvaNzqnwSZP6Sa6O', 'safety_officer', 'What city were you born in?', '$2a$10$CWxon4z5/MOt8BkC6UmTEOM4p5TElxR/6hM4fyvaNzqnwSZP6Sa6O'),
('Lisa Finance', 'finance@fleetflow.com', '$2a$10$CWxon4z5/MOt8BkC6UmTEOM4p5TElxR/6hM4fyvaNzqnwSZP6Sa6O', 'financial_analyst', 'What is your favorite book?', '$2a$10$CWxon4z5/MOt8BkC6UmTEOM4p5TElxR/6hM4fyvaNzqnwSZP6Sa6O');

-- Insert 20 vehicles
INSERT INTO vehicles (name, model, license_plate, vehicle_type, max_load_capacity_kg, odometer_km, status, region, acquisition_cost) VALUES
-- Trucks
('Truck Alpha', 'Volvo FH16', 'TRK-001', 'Truck', 25000.00, 44250.00, 'available', 'North', 85000.00),
('Truck Beta', 'Mercedes Actros', 'TRK-002', 'Truck', 28000.00, 31350.00, 'on_trip', 'South', 92000.00),
('Truck Gamma', 'Scania R500', 'TRK-003', 'Truck', 26000.00, 57400.00, 'available', 'East', 88000.00),
('Truck Delta', 'MAN TGX', 'TRK-004', 'Truck', 27000.00, 41000.00, 'in_shop', 'West', 90000.00),
('Truck Epsilon', 'DAF XF', 'TRK-005', 'Truck', 25500.00, 34500.00, 'available', 'North', 87000.00),
('Truck Zeta', 'Iveco Stralis', 'TRK-006', 'Truck', 24000.00, 62000.00, 'on_trip', 'South', 83000.00),
('Truck Eta', 'Renault T High', 'TRK-007', 'Truck', 26500.00, 27600.00, 'available', 'East', 89000.00),
('Truck Theta', 'Volvo FH', 'TRK-008', 'Truck', 25000.00, 71000.00, 'available', 'West', 86000.00),
-- Vans
('Van Gamma', 'Ford Transit', 'VAN-001', 'Van', 1500.00, 27650.00, 'available', 'East', 35000.00),
('Van Delta', 'Mercedes Sprinter', 'VAN-002', 'Van', 1800.00, 14700.00, 'on_trip', 'West', 42000.00),
('Van Epsilon', 'Volkswagen Crafter', 'VAN-003', 'Van', 1600.00, 31750.00, 'available', 'North', 38000.00),
('Van Zeta', 'Renault Master', 'VAN-004', 'Van', 1700.00, 19000.00, 'available', 'South', 36000.00),
('Van Eta', 'Peugeot Boxer', 'VAN-005', 'Van', 1550.00, 41000.00, 'in_shop', 'Central', 34000.00),
('Van Theta', 'Citroen Jumper', 'VAN-006', 'Van', 1650.00, 22000.00, 'available', 'East', 37000.00),
-- Bikes
('Bike Echo', 'Honda CB500X', 'BIK-001', 'Bike', 50.00, 7850.00, 'available', 'Central', 7000.00),
('Bike Foxtrot', 'Yamaha MT-07', 'BIK-002', 'Bike', 45.00, 4870.00, 'on_trip', 'Central', 8000.00),
('Bike Iota', 'Kawasaki Versys', 'BIK-003', 'Bike', 48.00, 12000.00, 'available', 'North', 7500.00),
('Bike Kappa', 'Suzuki V-Strom', 'BIK-004', 'Bike', 46.00, 9500.00, 'available', 'South', 7200.00),
('Bike Lambda', 'BMW F750GS', 'BIK-005', 'Bike', 52.00, 6000.00, 'available', 'East', 9500.00),
('Bike Mu', 'Triumph Tiger', 'BIK-006', 'Bike', 50.00, 11000.00, 'available', 'West', 8800.00);

-- Insert 20 drivers
INSERT INTO drivers (name, email, phone, license_number, license_category, license_expiry_date, status, safety_score, total_trips, completed_trips, incident_free_streak_days) VALUES
-- Truck drivers
('James Wilson', 'james@example.com', '+1234567890', 'DL-TRK-001', 'Truck', '2027-12-31', 'off_duty', 98.5, 145, 142, 89),
('Emma Davis', 'emma@example.com', '+1234567891', 'DL-TRK-002', 'Truck', '2026-08-15', 'on_trip', 95.0, 132, 128, 67),
('Michael Brown', 'michael.b@example.com', '+1234567892', 'DL-TRK-003', 'Truck', '2027-03-20', 'off_duty', 92.3, 156, 149, 45),
('Sophia Martinez', 'sophia@example.com', '+1234567893', 'DL-TRK-004', 'Truck', '2026-11-10', 'off_duty', 97.8, 98, 96, 120),
('Daniel Garcia', 'daniel@example.com', '+1234567894', 'DL-TRK-005', 'Truck', '2027-06-30', 'off_duty', 94.2, 167, 161, 34),
('Olivia Rodriguez', 'olivia@example.com', '+1234567895', 'DL-TRK-006', 'Truck', '2026-09-25', 'on_trip', 96.5, 143, 140, 78),
('William Johnson', 'william@example.com', '+1234567896', 'DL-TRK-007', 'Truck', '2027-04-15', 'off_duty', 99.1, 89, 88, 156),
('Ava Anderson', 'ava@example.com', '+1234567897', 'DL-TRK-008', 'Truck', '2026-12-20', 'off_duty', 93.7, 178, 171, 23),
-- Van drivers
('Robert Brown', 'robert@example.com', '+1234567898', 'DL-VAN-001', 'Van', '2027-03-20', 'off_duty', 92.3, 234, 228, 56),
('Isabella Taylor', 'isabella@example.com', '+1234567899', 'DL-VAN-002', 'Van', '2026-11-10', 'on_trip', 97.8, 198, 195, 91),
('Ethan Thomas', 'ethan@example.com', '+1234567800', 'DL-VAN-003', 'Van', '2027-07-05', 'off_duty', 95.6, 212, 207, 67),
('Mia Jackson', 'mia@example.com', '+1234567801', 'DL-VAN-004', 'Van', '2026-10-18', 'off_duty', 91.4, 245, 236, 41),
('Alexander White', 'alex@example.com', '+1234567802', 'DL-VAN-005', 'Van', '2027-02-28', 'off_duty', 98.2, 187, 185, 103),
('Charlotte Harris', 'charlotte@example.com', '+1234567803', 'DL-VAN-006', 'Van', '2026-08-30', 'off_duty', 94.8, 221, 216, 72),
-- Bike drivers
('Michael Lee', 'michael.l@example.com', '+1234567804', 'DL-BIK-001', 'Bike', '2027-06-30', 'off_duty', 100.0, 312, 312, 187),
('Olivia Taylor', 'olivia.t@example.com', '+1234567805', 'DL-BIK-002', 'Bike', '2026-09-25', 'on_trip', 96.5, 289, 284, 98),
('Benjamin Martin', 'benjamin@example.com', '+1234567806', 'DL-BIK-003', 'Bike', '2027-05-12', 'off_duty', 97.3, 267, 263, 112),
('Amelia Thompson', 'amelia@example.com', '+1234567807', 'DL-BIK-004', 'Bike', '2026-11-08', 'off_duty', 95.1, 298, 291, 84),
('Lucas Garcia', 'lucas@example.com', '+1234567808', 'DL-BIK-005', 'Bike', '2027-01-22', 'off_duty', 99.2, 276, 275, 145),
('Harper Martinez', 'harper@example.com', '+1234567809', 'DL-BIK-006', 'Bike', '2026-07-14', 'off_duty', 93.8, 301, 294, 67);

-- Insert completed trips
INSERT INTO trips (vehicle_id, driver_id, origin, destination, cargo_description, cargo_weight_kg, status, revenue, start_odometer, end_odometer, dispatched_at, completed_at, created_at) VALUES
(1, 1, 'Warehouse A', 'Customer Site B', 'Electronics', 5000, 'completed', 1500, 44000, 44250, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '6 hours', NOW() - INTERVAL '11 days'),
(2, 2, 'Distribution Center', 'Retail Store', 'Furniture', 8000, 'completed', 2200, 31000, 31350, NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days' + INTERVAL '7 hours', NOW() - INTERVAL '10 days'),
(3, 3, 'Factory', 'Warehouse C', 'Machinery Parts', 12000, 'completed', 3500, 57000, 57400, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days' + INTERVAL '8 hours', NOW() - INTERVAL '9 days'),
(5, 5, 'Port', 'Distribution Hub', 'Import Goods', 15000, 'completed', 4200, 34000, 34500, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '10 hours', NOW() - INTERVAL '8 days'),
(7, 7, 'Warehouse D', 'Customer E', 'Building Materials', 18000, 'completed', 5100, 27000, 27600, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days' + INTERVAL '12 hours', NOW() - INTERVAL '7 days'),
(9, 9, 'Store A', 'Store B', 'Retail Goods', 800, 'completed', 450, 27500, 27650, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '3 hours', NOW() - INTERVAL '6 days'),
(10, 10, 'Warehouse', 'Office Complex', 'Office Supplies', 1200, 'completed', 680, 14500, 14700, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '4 hours', NOW() - INTERVAL '5 days'),
(11, 11, 'Factory', 'Retail Chain', 'Consumer Goods', 1400, 'completed', 820, 31500, 31750, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '5 hours', NOW() - INTERVAL '4 days'),
(15, 15, 'Restaurant Supply', 'Restaurant A', 'Food Delivery', 25, 'completed', 85, 7800, 7850, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '1 hour', NOW() - INTERVAL '3 days'),
(16, 16, 'Pharmacy', 'Hospital', 'Medical Supplies', 30, 'completed', 120, 4800, 4870, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '2 hours', NOW() - INTERVAL '2 days');

-- Insert active/dispatched trips
INSERT INTO trips (vehicle_id, driver_id, origin, destination, cargo_description, cargo_weight_kg, status, revenue, start_odometer, dispatched_at, created_at) VALUES
(2, 2, 'Warehouse F', 'Customer G', 'Industrial Equipment', 20000, 'dispatched', 5800, 32000, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '5 hours'),
(6, 6, 'Port B', 'Distribution Center', 'Import Containers', 22000, 'dispatched', 6200, 62000, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '4 hours'),
(10, 10, 'Store C', 'Store D', 'Merchandise', 1300, 'dispatched', 750, 15000, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '3 hours'),
(16, 16, 'Courier Hub', 'Business District', 'Documents', 15, 'dispatched', 65, 5000, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '2 hours');

-- Insert draft trips
INSERT INTO trips (vehicle_id, driver_id, origin, destination, cargo_description, cargo_weight_kg, status, revenue, created_at) VALUES
(1, 1, 'Warehouse H', 'Customer I', 'Electronics', 6000, 'draft', 1800, NOW() - INTERVAL '30 minutes'),
(3, 3, 'Factory J', 'Warehouse K', 'Raw Materials', 14000, 'draft', 4100, NOW() - INTERVAL '20 minutes'),
(9, 9, 'Store L', 'Store M', 'Retail Items', 900, 'draft', 520, NOW() - INTERVAL '10 minutes');

-- Insert maintenance logs
INSERT INTO maintenance_logs (vehicle_id, service_type, description, cost, service_date, completed_date, status, created_at) VALUES
(1, 'Oil Change', 'Regular oil and filter change', 150.00, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', 'completed', NOW() - INTERVAL '16 days'),
(2, 'Tire Replacement', 'All four tires replaced', 800.00, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days', 'completed', NOW() - INTERVAL '13 days'),
(3, 'Brake Service', 'Front and rear brake pads', 450.00, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', 'completed', NOW() - INTERVAL '11 days'),
(4, 'Engine Repair', 'Turbocharger replacement', 2500.00, NOW() - INTERVAL '5 days', NULL, 'in_progress', NOW() - INTERVAL '6 days'),
(5, 'Transmission Service', 'Transmission fluid change', 300.00, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', 'completed', NOW() - INTERVAL '9 days'),
(13, 'Suspension Repair', 'Shock absorber replacement', 650.00, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', 'completed', NOW() - INTERVAL '8 days'),
(15, 'Chain Replacement', 'Drive chain and sprockets', 280.00, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', 'completed', NOW() - INTERVAL '5 days'),
(16, 'Brake Pads', 'Front brake pads replacement', 120.00, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 'completed', NOW() - INTERVAL '4 days');

-- Insert fuel logs
INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost_per_liter, total_cost, odometer_at_fill, fuel_date, created_at) VALUES
(1, 1, 150.5, 1.50, 225.75, 44100, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
(2, 2, 180.0, 1.52, 273.60, 31200, NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
(3, 3, 165.3, 1.48, 244.64, 57200, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
(5, 4, 175.8, 1.51, 265.46, 34300, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
(7, 5, 190.2, 1.49, 283.40, 27400, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
(9, 6, 45.5, 1.55, 70.53, 27600, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
(10, 7, 52.3, 1.54, 80.54, 14650, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
(11, 8, 48.7, 1.53, 74.51, 31700, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(15, 9, 12.5, 1.60, 20.00, 7830, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(16, 10, 11.8, 1.62, 19.12, 4850, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- Insert expense logs
INSERT INTO expense_logs (vehicle_id, trip_id, category, amount, description, expense_date, created_at) VALUES
(1, 1, 'Tolls', 25.00, 'Highway toll fees', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
(2, 2, 'Parking', 15.00, 'Overnight parking', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
(3, 3, 'Tolls', 35.00, 'Interstate toll charges', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
(5, 4, 'Parking', 20.00, 'Loading dock fee', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
(7, 5, 'Tolls', 40.00, 'Bridge toll', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
(9, 6, 'Parking', 10.00, 'City parking', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
(10, 7, 'Tolls', 12.00, 'Tunnel toll', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
(15, 9, 'Parking', 5.00, 'Motorcycle parking', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(16, 10, 'Tolls', 8.00, 'Express lane', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Setup Complete!' as message,
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM vehicles) as vehicles,
  (SELECT COUNT(*) FROM drivers) as drivers,
  (SELECT COUNT(*) FROM trips) as trips,
  (SELECT COUNT(*) FROM maintenance_logs) as maintenance,
  (SELECT COUNT(*) FROM fuel_logs) as fuel_logs,
  (SELECT COUNT(*) FROM expense_logs) as expenses;

-- ============================================
-- READY TO USE!
-- Password for all demo users: password123
-- ============================================
