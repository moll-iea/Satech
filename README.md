# Satech - MERN Stack Application

Full-stack application built with MongoDB, Express.js, React, and Node.js.

## Project Structure

```
Satech/
├── backend/               # Node.js/Express backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── server.js        # Server entry point
│   └── package.json     # Backend dependencies
│
└── frontend/            # React frontend
    ├── public/          # Static files
    ├── src/             # React source code
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   └── services/    # API services
    └── package.json     # Frontend dependencies
```

## Prerequisites

Before running this application, make sure you have installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (v4.4 or higher)
- npm or yarn package manager

## Installation

### 1. Clone or navigate to the project directory

```bash
cd Satech
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables

#### Backend (.env file in backend folder)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/satech
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

#### Frontend (.env file in frontend folder)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

### Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows (if MongoDB is installed as a service)
net start MongoDB

# Or start manually
mongod
```

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend server will run on [http://localhost:5000](http://localhost:5000)

### Start Frontend Development Server

Open a new terminal:

```bash
cd frontend
npm start
```

The React app will open at [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Users API

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Features

### Backend
- RESTful API with Express.js
- MongoDB database with Mongoose ODM
- User authentication with JWT
- Password hashing with bcrypt
- CORS enabled
- Environment variable configuration
- Error handling middleware

### Frontend
- React 18 with functional components
- React Router for navigation
- Axios for API calls
- Responsive design
- User management interface
- Environment-based configuration

## Development

### Backend Commands

```bash
npm start       # Start server in production mode
npm run dev     # Start server with nodemon (auto-restart)
```

### Frontend Commands

```bash
npm start       # Start development server
npm build       # Build for production
npm test        # Run tests
```

## Production Deployment

### Backend

1. Set environment variables in your hosting platform
2. Build and deploy the backend
3. Ensure MongoDB connection is accessible

### Frontend

1. Update `REACT_APP_API_URL` in `.env` to your production API URL
2. Build the React app:
   ```bash
   npm run build
   ```
3. Deploy the `build` folder to your hosting service

## Tech Stack

- **Frontend:** React 18, React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** bcryptjs for password hashing

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

ISC

## Support

For issues and questions, please create an issue in the repository.
