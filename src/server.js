require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = require('./app');
const dbConfig = require('./config/db');

const port = process.env.PORT || 3000;

// Connect to DB, then start server
dbConfig()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server Connected: http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error("Failed to start server due to database error:", err);
    });