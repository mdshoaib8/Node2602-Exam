const mongoose = require('mongoose');

const dbConfig = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Database Connected");
        // error log
    } catch (error) {
        console.error("Database connection failed completely:", error);
        process.exit(1); 
    }
};

module.exports = dbConfig;