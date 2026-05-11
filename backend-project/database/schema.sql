-- ================================================================
-- SmartPark Stock Inventory Management System (SIMS)
-- Database Schema
-- Company  : SmartPark
-- Location : Rubavu District, Rwanda
-- ================================================================

CREATE DATABASE IF NOT EXISTS SIMS
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE SIMS;

-- ================================================================
-- TABLE: Users
-- Purpose : Stores system authentication credentials
-- NOTE    : Renamed from 'User' — reserved keyword in MySQL 8.0
-- ================================================================
CREATE TABLE IF NOT EXISTS Users (
    UserID    INT          AUTO_INCREMENT PRIMARY KEY,
    Username  VARCHAR(50)  UNIQUE NOT NULL,
    Password  VARCHAR(255) NOT NULL COMMENT 'bcrypt-hashed password',
    CreatedAt TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;

-- ================================================================
-- TABLE: Spare_Part
-- Purpose : Master catalogue of all spare parts in the warehouse
-- Notes   : TotalPrice is a STORED generated column (Qty × UnitPrice)
-- ================================================================
CREATE TABLE IF NOT EXISTS Spare_Part (
    SparePartID INT            AUTO_INCREMENT PRIMARY KEY,
    Name        VARCHAR(100)   UNIQUE NOT NULL,
    Category    VARCHAR(50)    NOT NULL,
    Quantity    INT            NOT NULL DEFAULT 0,
    UnitPrice   DECIMAL(12,2)  NOT NULL,
    TotalPrice  DECIMAL(14,2)  AS (Quantity * UnitPrice) STORED
                               COMMENT 'Auto-computed: Quantity × UnitPrice',
    CreatedAt   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_sp_quantity   CHECK (Quantity  >= 0),
    CONSTRAINT chk_sp_unit_price CHECK (UnitPrice  > 0)
) ENGINE = InnoDB;

-- ================================================================
-- TABLE: Stock_In
-- Purpose : Records every incoming stock delivery for a spare part
-- Relationship : Many Stock_In records → One Spare_Part (N:1)
-- ================================================================
CREATE TABLE IF NOT EXISTS Stock_In (
    StockInID       INT   AUTO_INCREMENT PRIMARY KEY,
    SparePartID     INT   NOT NULL,
    StockInQuantity INT   NOT NULL,
    StockInDate     DATE  NOT NULL,
    CreatedAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_si_spare_part
        FOREIGN KEY (SparePartID) REFERENCES Spare_Part(SparePartID)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT chk_si_qty CHECK (StockInQuantity > 0)
) ENGINE = InnoDB;

-- ================================================================
-- TABLE: Stock_Out
-- Purpose : Records every outgoing stock transaction
-- Relationship : Many Stock_Out records → One Spare_Part (N:1)
-- Notes   : StockOutTotalPrice is auto-computed (Qty × UnitPrice)
-- ================================================================
CREATE TABLE IF NOT EXISTS Stock_Out (
    StockOutID         INT            AUTO_INCREMENT PRIMARY KEY,
    SparePartID        INT            NOT NULL,
    StockOutQuantity   INT            NOT NULL,
    StockOutUnitPrice  DECIMAL(12,2)  NOT NULL,
    StockOutTotalPrice DECIMAL(14,2)  AS (StockOutQuantity * StockOutUnitPrice) STORED
                                      COMMENT 'Auto-computed: Qty × UnitPrice',
    StockOutDate       DATE           NOT NULL,
    CreatedAt          TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_so_spare_part
        FOREIGN KEY (SparePartID) REFERENCES Spare_Part(SparePartID)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT chk_so_qty   CHECK (StockOutQuantity  > 0),
    CONSTRAINT chk_so_price CHECK (StockOutUnitPrice  > 0)
) ENGINE = InnoDB;

-- ================================================================
-- INDEXES – improve query performance on common filter columns
-- ================================================================
CREATE INDEX idx_si_date       ON Stock_In  (StockInDate);
CREATE INDEX idx_si_part       ON Stock_In  (SparePartID);
CREATE INDEX idx_so_date       ON Stock_Out (StockOutDate);
CREATE INDEX idx_so_part       ON Stock_Out (SparePartID);
CREATE INDEX idx_sp_category   ON Spare_Part(Category);
