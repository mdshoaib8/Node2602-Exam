const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true,
            lowercase: true,
            minLength: [3, 'Username must be at least 3 characters long'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please fill a valid email address',
            ],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minLength: [5, 'Password must be at least 5 characters long'],
            select: false, // Prevents password from being returned in standard queries
        },
        otp: {
            type: String,
            select: false
        },
        otpExpire: {
            type: Date,
            select: false
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'employer'],
            default: 'user',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isVerified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Compile the schema into a model
const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
