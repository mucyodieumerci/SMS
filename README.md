# SmartPark – Stock Inventory Management System (SIMS)
**Company:** SmartPark | **Location:** Rubavu District, Rwanda  
**Year:** 2025 | National Practical Exam

---

## 1. Entity Relationship Diagram (ERD)

```
┌──────────────┐            ┌──────────────────────┐           ┌─────────────────────┐
│     User     │            │      Spare_Part       │           │      Stock_In        │
├──────────────┤            ├──────────────────────┤           ├─────────────────────┤
│ UserID  (PK) │            │ SparePartID  (PK)     │◄──────────│ StockInID      (PK)  │
│ Username     │            │ Name (UNIQUE)         │  1 ──── N │ SparePartID    (FK)  │
│ Password     │            │ Category              │           │ StockInQuantity      │
│ CreatedAt    │            │ Quantity              │           │ StockInDate          │
└──────────────┘            │ UnitPrice             │           │ CreatedAt            │
  (Auth only)               │ TotalPrice (computed) │           └─────────────────────┘
                            │ CreatedAt             │
                            │ UpdatedAt             │           ┌─────────────────────────┐
                            └──────────────────────┘           │       Stock_Out          │
                                        │◄─────────────────────│ StockOutID         (PK)  │
                                        │          1 ──── N     │ SparePartID        (FK)  │
                                                                │ StockOutQuantity         │
                                                                │ StockOutUnitPrice        │
                                                                │ StockOutTotalPrice(comp) │
                                                                │ StockOutDate             │
                                                                │ CreatedAt                │
                                                                └─────────────────────────┘
```

### Relationship Explanations

| Relationship            | Type    | Description                                                       |
|-------------------------|---------|-------------------------------------------------------------------|
| Spare_Part → Stock_In   | 1 to N  | One spare part can have many stock-in (delivery) records.         |
| Spare_Part → Stock_Out  | 1 to N  | One spare part can have many stock-out (issuance) records.        |
| User (standalone)       | —       | Stores login credentials; not directly linked to business tables. |

### Computed Columns
- `Spare_Part.TotalPrice` = `Quantity × UnitPrice` *(MySQL STORED generated column)*
- `Stock_Out.StockOutTotalPrice` = `StockOutQuantity × StockOutUnitPrice` *(MySQL STORED generated column)*

---

## 2. Project Structure

```
SIMS_National_Practical_Exam_2025/
├── README.md
├── backend-project/
│   ├── package.json
│   ├── .env
│   ├── server.js                       ← Express entry point
│   ├── config/
│   │   └── db.js                       ← MySQL connection pool
│   ├── middleware/
│   │   └── authMiddleware.js           ← Session guard
│   ├── controllers/
│   │   ├── authController.js           ← login / logout / status
│   │   ├── sparePartController.js      ← CRUD spare parts
│   │   ├── stockInController.js        ← Stock-in operations
│   │   ├── stockOutController.js       ← Stock-out CRUD
│   │   └── reportController.js         ← Report queries
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── sparePartRoutes.js
│   │   ├── stockInRoutes.js
│   │   ├── stockOutRoutes.js
│   │   └── reportRoutes.js
│   ├── database/
│   │   ├── schema.sql                  ← Table definitions
│   │   └── seed.sql                    ← Sample data
│   └── scripts/
│       └── seedAdmin.js                ← Creates admin user
│
└── frontend-project/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx                     ← Router + PrivateRoute
        ├── index.css                   ← Tailwind + custom classes
        ├── api/
        │   └── axios.js                ← Axios instance
        ├── context/
        │   └── AuthContext.jsx         ← Global auth state
        ├── components/
        │   ├── Layout.jsx              ← Shell (sidebar + navbar)
        │   ├── Navbar.jsx
        │   └── Sidebar.jsx
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── SparePart.jsx
            ├── StockIn.jsx
            ├── StockOut.jsx
            └── Reports.jsx
```

---

## 3. API Routes

### Authentication  `(no auth required)`
| Method | Endpoint           | Description            |
|--------|--------------------|------------------------|
| POST   | /api/auth/login    | Login with credentials |
| POST   | /api/auth/logout   | Destroy session        |
| GET    | /api/auth/status   | Check session status   |

### Spare Parts  `(auth required)`
| Method | Endpoint              | Description            |
|--------|-----------------------|------------------------|
| GET    | /api/spare-parts      | List all spare parts   |
| GET    | /api/spare-parts/:id  | Get single spare part  |
| POST   | /api/spare-parts      | Create new spare part  |

### Stock In  `(auth required)`
| Method | Endpoint        | Description            |
|--------|-----------------|------------------------|
| GET    | /api/stock-in   | List all stock-in records |
| POST   | /api/stock-in   | Record new stock-in    |

### Stock Out  `(auth required — full CRUD)`
| Method | Endpoint           | Description                        |
|--------|--------------------|------------------------------------|
| GET    | /api/stock-out     | List all stock-out records         |
| GET    | /api/stock-out/:id | Get single stock-out record        |
| POST   | /api/stock-out     | Record new stock-out               |
| PUT    | /api/stock-out/:id | Update stock-out (adjusts qty)     |
| DELETE | /api/stock-out/:id | Delete stock-out (restores qty)    |

### Reports  `(auth required)`
| Method | Endpoint                                        | Description                  |
|--------|-------------------------------------------------|------------------------------|
| GET    | /api/reports/daily-stock-status?date=YYYY-MM-DD | Daily stock status report    |
| GET    | /api/reports/daily-stock-out?date=YYYY-MM-DD    | Daily stock-out report       |

---

## 4. Step-by-Step Setup Instructions

### Prerequisites
- Node.js v18+
- MySQL (via XAMPP or standalone)
- npm

---

### Step 1 – Database Setup

1. Start MySQL (via XAMPP Control Panel or service).
2. Open phpMyAdmin or MySQL CLI.
3. Run the schema:
   ```sql
   SOURCE path/to/backend-project/database/schema.sql;
   ```
4. Load sample data:
   ```sql
   SOURCE path/to/backend-project/database/seed.sql;
   ```

---

### Step 2 – Backend Setup

```bash
cd backend-project

# Install dependencies
npm install

# (Optional) Review / edit database credentials
notepad .env

# Create admin user with hashed password
npm run seed

# Start development server
npm run dev
```

Backend runs at: **http://localhost:5000**  
Health check: http://localhost:5000/api/health

---

### Step 3 – Frontend Setup

Open a **new terminal**:

```bash
cd frontend-project

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

### Step 4 – Login

Open your browser and navigate to **http://localhost:5173**

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

---

## 5. Sample Test Data (from seed.sql)

### Spare Parts (10 parts)
| ID | Name                   | Category     | Qty | Unit Price (RWF) |
|----|------------------------|--------------|-----|-----------------|
| 1  | Brake Pad (Front)      | Brakes       | 45  | 15,000          |
| 2  | Brake Pad (Rear)       | Brakes       | 37  | 12,000          |
| 3  | Engine Oil Filter      | Engine       | 28  | 8,000           |
| 5  | Spark Plug             | Ignition     | 90  | 3,000           |
| 9  | Shock Absorber (Front) | Suspension   | 10  | 65,000          |

### Stock-In Transactions (10 records)
Ranging from 2025-01-10 to 2025-01-15

### Stock-Out Transactions (8 records)
Ranging from 2025-01-13 to 2025-01-16

---

## 6. Technology Stack

| Layer      | Technology                            |
|------------|---------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, Axios   |
| Backend    | Node.js, Express.js                   |
| Database   | MySQL 5.7+ (via mysql2)               |
| Auth       | express-session + bcryptjs            |
| MVC        | Controllers / Routes / Config layers  |

---

## 7. Key Features

- **Session-based authentication** with bcrypt password hashing
- **Protected API routes** – all data endpoints require a valid session
- **Transactional stock management** – MySQL transactions ensure inventory accuracy
- **Computed columns** – TotalPrice values auto-calculated in the database
- **Inventory reconciliation** – Editing/deleting stock-out adjusts Spare_Part.Quantity
- **Printable reports** – Daily Stock Status & Daily Stock-Out with `window.print()`
- **Responsive design** – Tailwind CSS, mobile sidebar, overflow-x-auto tables
- **Low stock alerts** – Parts with Quantity < 10 highlighted in red
- **RWF currency formatting** – All amounts shown in Rwandan Francs

---

*SmartPark SIMS — Built for National Practical Exam 2025*
