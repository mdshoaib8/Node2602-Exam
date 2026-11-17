const express = require('express');
const router = express.Router();
const authRouter = require('./auth');

// http://localhost:3000/api/auth
router.use('/auth', authRouter);


module.exports = router;