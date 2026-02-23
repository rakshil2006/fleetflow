# FleetFlow - Fleet & Logistics Management System

A comprehensive, full-stack fleet management system built with React, Node.js, Express, and PostgreSQL. Features role-based access control, real-time updates, and advanced financial analytics.

## 🚀 Features

### Core Functionality

- **Vehicle Management**: Track fleet assets, status, maintenance, and performance
- **Trip Dispatcher**: Create, dispatch, and manage trips with validation
- **Driver Management**: Monitor driver performance, safety scores, and compliance
- **Maintenance Tracking**: Schedule and track vehicle service with auto-status updates
- **Fuel & Expense Logging**: Record and analyze operational costs
- **Financial Analytics**: Comprehensive ROI analysis, cost breakdowns, and performance metrics

### Technical Features

- Role-Based Access Control (RBAC) with 4 user roles
- Real-time updates with Socket.io
- JWT authentication with secure password hashing
- Responsive premium brown-themed UI
- Input validation and error handling
- CSV export functionality

## 👥 User Roles

1. **Fleet Manager**: Full system access
2. **Dispatcher**: Create/manage trips, view vehicles and drivers
3. **Safety Officer**: Manage drivers and maintenance
4. **Financial Analyst**: Audit costs, analyze ROI, and generate reports

## 🛠️ Tech Stack

**Frontend:**

- React 18 with Vite
- TailwindCSS for styling
- Axios for API calls
- Socket.io-client for real-time updates

**Backend:**

- Node.js with Express
- PostgreSQL database
- JWT authentication
- bcrypt for password hashing
- Socket.io for real-time communication

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## 🚀 Quick Start

See [SETUP.md](SETUP.md) for detailed installation instructions.

### 1. Clone the repository

```bash
git clone https://github.com/rakshil2006/fleetflow
cd fleetflow
```

### 2. Install dependencies

```bash
npm run setup
```

### 3. Configure environment variables

**Backend** (`backend/.env`):

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/fleetflow_db
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

**Frontend** (`frontend/.env`):

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Setup database

Open pgAdmin and run the SQL file:

```
backend/database/SETUP_WITH_LOTS_OF_DATA.sql
```

This will create the database, tables, and populate with demo data.

### 5. Start the application

```bash
# Start both frontend and backend
npm run dev

# Or start separately
npm run backend  # Backend on http://localhost:5000
npm run frontend # Frontend on http://localhost:5173
```

## 🔐 Demo Accounts

After running the setup SQL, you can login with:

**Fleet Manager:**

- Email: `manager@fleetflow.com`
- Password: `password123`

**Dispatcher:**

- Email: `dispatcher@fleetflow.com`
- Password: `password123`

**Safety Officer:**

- Email: `safety@fleetflow.com`
- Password: `password123`

**Financial Analyst:**

- Email: `analyst@fleetflow.com`
- Password: `password123`

## 📊 Key Features by Role

### Fleet Manager

- Full access to all features
- Manage vehicles, drivers, trips, maintenance
- View comprehensive analytics

### Dispatcher

- Create and dispatch trips
- View available vehicles and drivers
- Monitor trip status
- Cargo weight validation
- License category matching

### Safety Officer

- Manage driver profiles
- Track safety scores and compliance
- Monitor license expiry
- Manage maintenance schedules

### Financial Analyst

- View financial analytics dashboard
- Analyze ROI by vehicle
- Track fuel and maintenance costs
- Cost breakdown analysis
- Export financial reports to CSV
- Identify top/bottom performers

## 📁 Project Structure

```
fleetflow/
├── backend/
│   ├── database/
│   │   ├── schema.sql
│   │   ├── seed-extended.sql
│   │   └── SETUP_WITH_LOTS_OF_DATA.sql
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── socket/
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── API_REFERENCE.md
├── SETUP.md
├── package.json
└── README.md
```

## 🔧 API Endpoints

See [API_REFERENCE.md](API_REFERENCE.md) for complete API documentation.

## 🎨 UI Features

- Premium brown color theme
- Glassmorphism design
- Responsive layout
- Toast notifications
- Modal forms
- Real-time status updates
- Interactive charts and metrics

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation
- SQL injection prevention
- XSS protection

## 📈 Analytics Features

- Fleet utilization by vehicle type
- Vehicle performance metrics
- Driver performance tracking
- Financial ROI analysis
- Cost per trip calculations
- Revenue vs cost analysis
- Top/bottom performer identification
- CSV export for external analysis

## 🤝 Contributing

This is a portfolio/academic project. Feel free to fork and modify for your own use.

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

Created as a full-stack fleet management system demonstration project.

TEAM:
Rakshil Gajjar
Krish Anand
Aniket Sonkusare
Mohit Gupta

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by real-world fleet management needs
- Designed for scalability and maintainability
