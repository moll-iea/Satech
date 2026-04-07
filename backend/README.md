# Satech Backend

Backend server for Satech application built with Node.js, Express, and MongoDB.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Create `backend/.env` using `backend/.env.example`
   - Set `MONGODB_URI` to your MongoDB Atlas connection string
   - Replace `<db_password>` with your real database user password
   - Set a strong `JWT_SECRET`
   - Set Gmail SMTP values (`SMTP_USER`, `SMTP_PASS`, and `CONTACT_RECEIVER_EMAIL`)

### Gmail Contact Delivery Setup

1. Enable 2-Step Verification on the Gmail account you will use to send mail.
2. Generate a Google App Password (16 characters) for Mail.
3. Put these in `backend/.env`:
   - `SMTP_USER` = sender Gmail address
   - `SMTP_PASS` = Google App Password (not your normal Gmail password)
   - `CONTACT_RECEIVER_EMAIL` = destination inbox for contact submissions

Contact form submissions are stored in MongoDB and then forwarded to `CONTACT_RECEIVER_EMAIL`.

3. Start the server:
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Project Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── server.js        # Application entry point
└── .env             # Environment variables
```

## Technologies

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
