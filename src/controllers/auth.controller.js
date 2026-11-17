const sendEmail = require("../helpers/sendEmail");
const UserModel = require("../model/user.model");
const apiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// signup controller
const signUpController = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    const otp = uuidv4().toString().substring(0, 6);
    const otpExpire = Date.now() + 2 * 60 * 1000;

    const existingUser = await UserModel.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        return apiResponse(res, 400, "User with this email or username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
        username,
        email,
        password: hashedPassword,
        otp,
        otpExpire,
        isVerified: false
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.otp;

    await sendEmail(email, otp, username);

    return apiResponse(res, 201, "Account created successfully. Please check your email for OTP.", userResponse);
});

// signIn controller
const signInController = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const existingUser = await UserModel.findOne({ email }).select("+password");
    if (!existingUser) {
        return apiResponse(res, 404, "User not found");
    }

    if (!existingUser.isVerified) {
        return apiResponse(res, 403, "Please verify your email first before signing in.");
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
        return apiResponse(res, 401, "Invalid email or password");
    }

    const payload = {
        userId: existingUser._id,
        email: existingUser.email,
        role: existingUser.role
    };

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '10m' }
    );

    const userResponse = {
        email: existingUser.email,
        username: existingUser.username,
        role: existingUser.role,
        isActive: existingUser.isActive,
        isVerified: existingUser.isVerified
    };

    return apiResponse(
        res,
        200,
        "Sign in successful",
        {
            token,
            user: userResponse
        }
    );

});

// profile controller
const profileController = asyncHandler(async (req, res) => {

    const userId = req.user.userId;

    const user = await UserModel.findById(userId);

    if (!user) {
        return apiResponse(res, 404, "User not found");
    }

    const userProfile = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        createdAt: user.createdAt
    };

    return apiResponse(res, 200, "Profile fetched successfully", userProfile);
});

// email verification controller
const emailVerifyController = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return apiResponse(res, 400, "Email and OTP are required");
    }

    const existingUser = await UserModel.findOne({ email }).select("+otp +otpExpire");
    if (!existingUser) {
        return apiResponse(res, 404, "User not found");
    }

    if (existingUser.isVerified) {
        return apiResponse(res, 400, "Email is already verified");
    }

    if (existingUser.otpExpire && existingUser.otpExpire < Date.now()) {
        existingUser.otp = undefined;
        existingUser.otpExpire = undefined;
        await existingUser.save();

        return apiResponse(res, 400, "OTP has expired. Please request a new one.");
    }

    if (existingUser.otp !== otp) {
        return apiResponse(res, 400, "Invalid OTP code");
    }

    existingUser.isVerified = true;
    existingUser.otp = undefined;
    existingUser.otpExpire = undefined;
    await existingUser.save();

    return apiResponse(res, 200, "Email verified successfully! You can now sign in.", {
        email: existingUser.email,
        username: existingUser.username,
        isVerified: existingUser.isVerified
    });
});

// resend email verification controller
const resendEmailVerifyController = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return apiResponse(res, 400, "Email is required");
    }

    const existingUser = await UserModel.findOne({ email }).select("+otp +otpExpire");
    if (!existingUser) {
        return apiResponse(res, 404, "User not found");
    }

    if (existingUser.isVerified) {
        return apiResponse(res, 400, "Email is already verified. You can sign in.");
    }

    if (existingUser.otpExpire && existingUser.otpExpire > Date.now()) {
        const remainingTimeMinutes = Math.ceil((existingUser.otpExpire - Date.now()) / (60 * 1000));
        return apiResponse(
            res,
            400,
            `Your previous OTP is still valid. Please check your email or try again after ${remainingTimeMinutes} minute(s).`
        );
    }

    const newOtp = uuidv4().toString().substring(0, 6);
    const newOtpExpire = Date.now() + 2 * 60 * 1000;

    existingUser.otp = newOtp;
    existingUser.otpExpire = newOtpExpire;
    await existingUser.save();

    await sendEmail(email, newOtp, existingUser.username, "resend");

    return apiResponse(res, 200, "A new OTP has been sent to your email.");
});

// Forgot Password Controller
const forgotPasswordController = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return apiResponse(res, 400, "Email is required");
    }

    const existingUser = await UserModel.findOne({ email }).select("+otp +otpExpire");
    if (!existingUser) {
        return apiResponse(res, 404, "User not found with this email");
    }

    if (existingUser.otpExpire && existingUser.otpExpire > Date.now()) {
        const remainingTimeMinutes = Math.ceil((existingUser.otpExpire - Date.now()) / (60 * 1000));
        return apiResponse(
            res,
            400,
            `Your previous OTP is still valid. Please check your email or try again after ${remainingTimeMinutes} minute(s).`
        );
    }

    const otp = uuidv4().toString().substring(0, 6);
    const otpExpire = Date.now() + 2 * 60 * 1000;

    existingUser.otp = otp;
    existingUser.otpExpire = otpExpire;
    await existingUser.save();

    await sendEmail(email, otp, existingUser.username, "forgot");

    return apiResponse(res, 200, "Password reset OTP has been sent to your email.");
});


// Reset Password Controller
const resetPasswordController = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return apiResponse(res, 400, "Email, OTP, and new password are required");
    }

    const existingUser = await UserModel.findOne({ email }).select("+otp +otpExpire +password");
    if (!existingUser) {
        return apiResponse(res, 404, "User not found");
    }

    if (existingUser.otp !== otp) {
        return apiResponse(res, 400, "Invalid OTP code");
    }

    if (existingUser.otpExpire && existingUser.otpExpire < Date.now()) {
        existingUser.otp = undefined;
        existingUser.otpExpire = undefined;
        await existingUser.save();
        return apiResponse(res, 400, "OTP has expired. Please request a new one.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    existingUser.password = hashedPassword;
    existingUser.otp = undefined;
    existingUser.otpExpire = undefined;
    await existingUser.save();

    return apiResponse(res, 200, "Password reset successfully! You can now sign in with your new password.");
});




module.exports = {
    signUpController,
    signInController,
    profileController,
    emailVerifyController,
    resendEmailVerifyController,
    forgotPasswordController,
    resetPasswordController
};