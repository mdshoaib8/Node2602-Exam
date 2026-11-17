const apiResponse = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose bad ObjectId error (CastError)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Resource not found. Invalid: ${err.path}`;
    }

    // Mongoose duplicate key error (e.g., duplicate email or username)
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate field value entered for '${field}'. Please use another value.`;
    }

    // Mongoose validation error (e.g., missing required fields, minLength failures)
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    // Send standardized response using your apiResponse utility
    return apiResponse(res, statusCode, message, null);
};

module.exports = errorHandler;