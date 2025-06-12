'use strict'

const ForgotPassModel = require('../models/forgotpass.model');
const { BadRequestError, NotFoundError } = require('../core/error.response');
const { sendMail } = require('../helpers/sendMail.helper');

const EXPIRED = 15 * 60 * 1000; // 15 minutes in milliseconds

class ForgotPassService {
    static async createForgotPass({ userId, otp }) {
        if (!userId || !otp) {
            throw new BadRequestError("User ID and OTP are required");
        }

        const forgotPassData = {
            userId,
            opt: otp,
            expiresAt: new Date(Date.now() + EXPIRED) // 15 minutes from now
        };

        return await ForgotPassModel.create(forgotPassData);
    }

    static async sendForgotPasswordEmail(email, otp) {
        if (!email || !otp) {
            throw new BadRequestError("Email and OTP are required");
        }

        const subject = "Password Reset Request";
        const text = `<p>Your OTP for password reset is: <strong>${otp}</strong></p>`;
        
        await sendMail(email, subject, text);
    }

    static async verifyOtp(userId, otp) {
        if (!userId || !otp) {
            throw new BadRequestError("User ID and OTP are required");
        }

        const forgotPass = await ForgotPassModel.findOne({ userId, opt: otp }).lean();
        if (!forgotPass) {
            throw new NotFoundError("Invalid OTP or User ID");
        }

        if (new Date() > forgotPass.expiresAt) {
            throw new BadRequestError("OTP has expired");
        }

        return true;
    }
}

module.exports = ForgotPassService;