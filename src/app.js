const express = require('express');
const cors = require('cors');
const router = require('./router');
const errorHandler = require('./middlewares/error.middleware');

const app = express();
app.use(cors({}));

// middleware to read JSON from req.body
app.use(express.json());

// Router base path
app.use(router);

// 404 Not Found fallback for unhandled routes
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
});

// Global Error Handling Middleware
app.use(errorHandler);

module.exports = app;