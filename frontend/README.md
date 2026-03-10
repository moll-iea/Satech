# Satech Frontend

React frontend for Satech application.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Update `.env` file with your API URL if different from default

3. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
frontend/
├── public/          # Static files
│   └── index.html   # HTML template
├── src/
│   ├── components/  # Reusable components
│   ├── pages/       # Page components
│   ├── services/    # API services
│   ├── App.js       # Main app component
│   ├── App.css      # App styles
│   ├── index.js     # Entry point
│   └── index.css    # Global styles
└── package.json     # Dependencies and scripts
```

## Features

- React 18
- React Router for navigation
- Axios for API calls
- Responsive design
- User management interface

## Environment Variables

- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000/api)
