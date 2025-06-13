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
            otp: otp,
            expiresAt: new Date(Date.now() + EXPIRED) // 15 minutes from now
        };

        return await ForgotPassModel.create(forgotPassData)
    }

    static async otpCleanUp({userId}) {
        return await ForgotPassModel.deleteMany({
            userId,
            expiresAt: { $lt: new Date() }
        })
    }

    static async getForgotPassByUserId({userId}) {
        return await ForgotPassModel.findOne({ 
            userId,
            expiresAt: { $gt: new Date() },
            createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) } // 5 minutes ago
        }).lean();
    }

    static async updateForgotPassAttempts(userId, otp) {
        if (!userId || !otp) {
            throw new BadRequestError("User ID and OTP are required");
        }

        const forgotPass = await ForgotPassModel.findOne({ userId, opt: otp }).lean();
        if (!forgotPass) {
            throw new NotFoundError("Forgot password entry not found");
        }

        forgotPass.attempts += 1;
        return await forgotPass.save();
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

        // const forgotUser = await ForgotPassModel.findOne({ userId, opt: otp }).lean();
        // if (!forgotUser) {
        //     throw new NotFoundError("Invalid OTP or User ID");
        // }

        // if (new Date() > forgotUser.expiresAt) {
        //     throw new BadRequestError("OTP has expired");
        // }

        // return true;
        return await ForgotPassModel.findOne({ userId, opt: otp }).lean()
    }

    static async deleteForgotPassByUserId(userId) {
        return await ForgotPassModel.findOneAndDelete({ userId }).lean();
    }
}

module.exports = ForgotPassService;