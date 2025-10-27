'use strict'

const  UserModel  = require('../models/user.model');
const forgotPassModel = require('../models/forgotpass.model');
const bcrypt = require('bcrypt');
const { getInfoData, createKeyPair } = require('../utils');
const crypto = require('crypto');
const {ConflictError,BadRequestError,NotFoundError, UnauthorizedError} = require('../core/error.response');
const KeyTokenService = require('./keyToken.services');
const forgotPassService = require('./forgotPwd.services');
const { createTokenPair, verifyToken } = require('../middlewares/authMiddleware');


class UserService {
    
    static register = async (UserData) => {

        // check if user already exists
        const { fullname, email, password } = UserData;
        if (!fullname || !email || !password) {
            throw new BadRequestError("All fields are required");
        }
        const existingUser = await UserModel.findOne({ email , deleted:0, status:1 }).lean();
        // console.log("Existing User:", existingUser);
        if (existingUser) {
            throw new ConflictError("User already exists with this email");
        }
        // Validate phone number format if provided
        if (UserData.phone && !/^0\d{9,10}$/.test(UserData.phone)) {
            throw  new BadRequestError("Invalid phone number format. Must start with 0 and be 10-11 digits long.")
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // create new user
        const regUser = {
            fullname,
            email,
            password:hashedPassword,
            address: UserData.address || null,
            phone: UserData.phone || null,
            image: UserData.image || null,
            deleted: 0, // Default deleted status to 0 (not deleted)
            status: 1, // Default status to 1 (active)
            role: UserData.role || 'user', // Default role to 'user' if not provided
        };
        const newUser = await UserModel.create(regUser);
        if (newUser) {
            const { publicKey, privateKey } = createKeyPair();
            
            const keyStoreString = await KeyTokenService.createKeyToken({
                userId: newUser._id, 
                publicKey
            });
            if (!keyStoreString) {
                throw new Error("Failed to create key token");
            }

            const keyStoreObject = crypto.createPublicKey(keyStoreString)

            const tokens = await createTokenPair(
                {
                    userId: newUser._id,
                    email: newUser.email
                },
                keyStoreObject,
                privateKey
            );
           
            // Return success response with user info
            // Note: Ensure that you do not return sensitive information like password

            return {
                    user: getInfoData({  fields: ['_id', 'fullname', 'email', 'address', 'phone'] ,object: newUser}),
                    tokens
            } 
        }
        throw new BadRequestError("Failed to register user");
    }
    
    static login = async (UserData) => {
        const { email, password, refrestoken = null } = UserData;
        // 1. Check if user exists
        const user = await UserModel.findOne({ email, deleted: 0 }).lean();
        if (!user) throw new UnauthorizedError("User not found with this email");
    
        // 2. Check if password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new UnauthorizedError("Invalid password");
        
        const {_id : userId } = user;
        // 3. Create private key, public key
        const { publicKey, privateKey } = createKeyPair();

        // 4. Create tokens
        const tokens = await createTokenPair(
            {
                userId,
                email: user.email
            },
            publicKey,
            privateKey
        );

        await KeyTokenService.createKeyToken({
            userId,
            publicKey,
            privateKey,
            refreshToken: tokens.refreshToken
        });

        return {
            user: getInfoData({ fields: ['_id', 'fullname', 'email', 'address', 'phone'], object: user }),
            tokens
        }
    }

    static logout = async (keyToken) => {
        const userId = keyToken.userId;
        // 1. Check if user exists
        const user = await UserModel.findOne({ _id: userId, deleted: 0 }).lean();
        if (!user) throw new NotFoundError("User not found");
        
        // 2. Remove key token
        const result = await KeyTokenService.removeKeyTokenByUserId(user._id);
        // console.log("Key Token removed:", result);
        if (!result) throw new BadRequestError("Failed to logout user");
        
        return 
    }

    static handleRefreshToken = async (refreshToken) => {
        /*        
            1. Check if refresh token is provided
            2. Verify the refresh token
            3. Check if the user exists
            4. Create new tokens
            5. Return new tokens
        */

        const keyToken = await KeyTokenService.findrefreshTokenUsed(refreshToken);

        if (keyToken) {
            // delete refresh token used
            // const {email, userId} = await verifyToken(refreshToken, keyToken.publicKey);
            // await KeyTokenService.removeKeyTokenByUserId(userId);
            //get ip request
            throw new UnauthorizedError("Some thing went wrong with refresh token, please login again");
        }

        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
        if (!holderToken) throw new UnauthorizedError("Refresh token not found");
        const {email, userId} = await verifyToken(refreshToken, holderToken.publicKey);

        const user = await UserModel.findOne({ email, deleted: 0 }).lean();
        if (!user) throw new NotFoundError("User not found with this email");
        
        const tokens = await createTokenPair(
            {
                userId,
                email: user.email
            },
            holderToken.publicKey,
            holderToken.privateKey
        );        
        if (!tokens.refreshToken) throw new BadRequestError("Failed to create refresh token");

        // Update the key token with the new refresh token
        await KeyTokenService.updateRefreshToken(holderToken._id, tokens.refreshToken, refreshToken);

        return {
            user: getInfoData({ fields: ['_id', 'fullname', 'email', 'address', 'phone'], object: user }),
            tokens
        }
    }

    static forgotPassword = async (email) => {
        /*
        1. Check if user exists
        2. Check if user already has active OTP
        3. Generate OTP (One Time Password)
        4. Save OTP to forgotPassModel with userId and expiration time
        5. Send OTP to user's email
        6. Return success message
         */
        const user = await UserModel.findOne({ email, deleted: 0 }).lean();
        if (!user) throw new NotFoundError("User not found with this email");

        // Check if user already has active OTP
        const existingOTP = await forgotPassService.getForgotPassByUserId( {userId: user._id });
        if (existingOTP) {
            const timeLeft = Math.ceil((existingOTP.expiresAt - Date.now()) / 1000 / 60);
            throw new BadRequestError(`Please wait ${timeLeft} minutes before requesting a new OTP`);
        }

        // // Count OTP requests in the last hour
        // const otpRequestsLastHour = await forgotPassService.count({
        //     userId: user._id,
        //     createdAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
        // });

        // if (otpRequestsLastHour >= 5) {
        //     throw new BadRequestError("Too many OTP requests. Please try again after an hour");
        // }

        // Generate OTP 6digit
        const otp = crypto.randomInt(100000, 999999).toString();
        // console.log( "OTP: ",otp)
        // Save OTP to forgotPassModel with userId and expiration time
        const forgotPass = await forgotPassService.createForgotPass({ userId: user._id, otp});
        
        if (!forgotPass) throw new BadRequestError("Failed to create forgot password entry");

        // Clean up expired OTPs for this user
        await forgotPassService.otpCleanUp({ userId: user._id });

        // Send OTP to user's email
        // Here you would typically send an email with the OTP
        // console.log(`OTP for ${email}: ${forgotPass.otp}`);
        // await forgotPassService.sendForgotPasswordEmail(email, otp);

        return {
            message: "OTP sent to your email",
        }
    }

    static verifyOtp = async ({email, otp}) => {
        /*
        1. Check if user exists
        2. Verify OTP from forgotPassModel
        3. If OTP is valid, return success message
         */
        const user = await UserModel.findOne({ email, deleted: 0 }).lean();
        if (!user) throw new NotFoundError("User not found with this email");
        
        // 2. Verify OTP from forgotPassModel
        const forgotUser = await forgotPassService.verifyOtp(user._id, otp);
        if (!forgotUser) {
            throw new NotFoundError("Invalid OTP or User ID");
        }
        // Check if OTP has expired
        if (new Date() > forgotUser.expiresAt) {
            throw new BadRequestError("OTP has expired");
        }
          
        // Check if user has a key token
        const holderToken = await KeyTokenService.getKeyTokenByUserId(user._id);

        const tokens = await createTokenPair(
            {
                userId: user._id,
                email: user.email
            },
            holderToken.publicKey,
            holderToken.privateKey
        ); 
        
        if (!tokens.refreshToken) throw new BadRequestError("Failed to create refresh token");

        // Update the key token with the new refresh token
        await KeyTokenService.updateRefreshToken(holderToken._id, tokens.refreshToken, holderToken.refreshToken);

        // 4. Remove forgotPassModel entry
        await forgotPassService.deleteForgotPassByUserId(user._id);

        return {
            message: "OTP verified successfully",
            user: getInfoData({ fields: ['_id', 'fullname', 'email', 'address', 'phone'], object: user }),
            tokens
        }
    }

    static resetPassword = async ({ email, newPassword }) => {
        /*
        1. Check if user exists
        2. Hash new password
        3. Update user password in UserModel
        4. Return success message
         */
        const user = await UserModel.findOne({ email, deleted: 0 }).lean();
        if (!user) throw new NotFoundError("User not found with this email");
        
        // 2. Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // 3. Update user password in UserModel
        const updatedUser = await UserModel.findByIdAndUpdate(user._id, { password: hashedPassword }, { new: true }).lean();
        if (!updatedUser) throw new BadRequestError("Failed to update password");
        
        // 4. Return success message
        return {
            message: "Password reset successfully",
            user: getInfoData({ fields: ['_id', 'fullname', 'email', 'address', 'phone'], object: updatedUser })
        }
    }
}

module.exports = UserService