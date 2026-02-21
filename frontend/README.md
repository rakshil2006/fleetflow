# FleetFlow Frontend

React + Vite frontend for FleetFlow Fleet Management System.

## Setup

```bash
npm install
npm run dev
```

## Build for Production

```bash
npm run build
npm run preview
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components (Button, Card, etc.)
│   ├── layout/       # Layout components (Sidebar, Header)
│   └── forms/        # Form components
├── pages/            # Page components
├── context/          # React Context (Auth, Socket)
├── services/         # API services
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
├── App.jsx           # Main app
└── main.jsx          # Entry point
```

## Key Features

- Glassmorphism UI design
- Real-time updates via Socket.io
- Role-based access control
- Responsive design
- Accessibility compliant
- Smooth animations and transitions

## Technologies

- React 18
- Vite
- TailwindCSS
- Socket.io-client
- Recharts
- React Router
- Axios
