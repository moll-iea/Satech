const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            throw new Error('MONGODB_URI is missing. Add it to backend/.env');
        }

        if (mongoUri.includes('<db_password>')) {
            throw new Error('Replace <db_password> in MONGODB_URI with your real MongoDB password.');
        }

        const conn = await mongoose.connect(mongoUri);
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
