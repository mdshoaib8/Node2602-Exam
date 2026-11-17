const mongoose = require('mongoose');

const dbConfig = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Database Connected");
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1); // Exit process with failure code to prevent running without DB
    }
};

module.exports = dbConfig;