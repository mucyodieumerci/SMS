-- ================================================================
-- SmartPark SIMS – Sample Seed Data
-- Run AFTER schema.sql and AFTER executing: npm run seed
-- (npm run seed creates the admin user with a hashed password)
-- NOTE: 'User' was renamed to 'Users' (reserved word in MySQL 8.0)
-- ================================================================

USE SIMS;

-- ----------------------------------------------------------------
-- Spare Parts  (Quantity reflects stock AFTER all sample movements)
-- ----------------------------------------------------------------
INSERT INTO Spare_Part (Name, Category, Quantity, UnitPrice) VALUES
  ('Brake Pad (Front)',       'Brakes',       45,  15000.00),
  ('Brake Pad (Rear)',        'Brakes',       37,  12000.00),
  ('Engine Oil Filter',       'Engine',       28,   8000.00),
  ('Air Filter',              'Engine',       25,   5500.00),
  ('Spark Plug',              'Ignition',     90,   3000.00),
  ('Transmission Belt',       'Transmission', 15,  22000.00),
  ('Alternator Belt',         'Engine',       20,  18000.00),
  ('Coolant Thermostat',      'Cooling',      12,  25000.00),
  ('Shock Absorber (Front)',  'Suspension',   10,  65000.00),
  ('Wheel Bearing',           'Suspension',   18,  35000.00);

-- ----------------------------------------------------------------
-- Stock In – sample receiving records
-- ----------------------------------------------------------------
INSERT INTO Stock_In (SparePartID, StockInQuantity, StockInDate) VALUES
  (1,  50, '2025-01-10'),
  (2,  40, '2025-01-10'),
  (3,  30, '2025-01-11'),
  (4,  25, '2025-01-12'),
  (5, 100, '2025-01-12'),
  (6,  15, '2025-01-13'),
  (7,  20, '2025-01-13'),
  (8,  12, '2025-01-14'),
  (9,  10, '2025-01-14'),
  (10, 18, '2025-01-15');

-- ----------------------------------------------------------------
-- Stock Out – sample issue records
-- ----------------------------------------------------------------
INSERT INTO Stock_Out (SparePartID, StockOutQuantity, StockOutUnitPrice, StockOutDate) VALUES
  (1,  5,  18000.00, '2025-01-13'),
  (2,  3,  15000.00, '2025-01-13'),
  (5, 10,   3500.00, '2025-01-14'),
  (3,  2,  10000.00, '2025-01-14'),
  (1,  3,  18000.00, '2025-01-15'),
  (4,  2,   7000.00, '2025-01-15'),
  (6,  1,  28000.00, '2025-01-16'),
  (9,  2,  75000.00, '2025-01-16');
