'use strict'

const  UserModel  = require('../models/user.model');
const KeyTokenModel = require('../models/keyToken.model');
const bcrypt = require('bcrypt');
const { getInfoData, createKeyPair } = require('../utils');
const crypto = require('crypto');
const {ConflictError,BadRequestError,NotFoundError, UnauthorizedError} = require('../core/error.response');
const KeyTokenService = require('./keyToken.services');
const { createTokenPair, verifyToken } = require('../middlewares/authMiddleware');
const { $where } = require('../models/keyToken.model');

class UserService {
    
    static register = async (UserData) => {

        // check if user already exists
        const { fullname, email, password } = UserData;
        if (!fullname || !email || !password) {
            throw new BadRequestError("All fields are required");
        }
        const existingUser = await UserModel.findOne({ email , deleted:0, status:1 }).lean();
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
        console.log("Key Token removed:", result);
        if (!result) throw new BadRequestError("Failed to logout user");
        
        return 
    }

    static handleRefreshToken = async (refreshToken) => {
        /*        1. Check if refresh token is provided
           2. Verify the refresh token
           3. Check if the user exists
           4. Create new tokens
           5. Return new tokens
        */
        // 2. Verify the refresh token
        // console.log("Refresh Token:", refreshToken);
        const keyToken = await KeyTokenService.findrefreshTokenUsed(refreshToken);
        // console.log("Key Token:", keyToken);
        
        if (keyToken) {
            // delete refresh token used
            const {email, userId} = await verifyToken(refreshToken, keyToken.publicKey);
            await KeyTokenService.removeKeyTokenByUserId(userId); 
            throw new UnauthorizedError("Some thing went wrong with refresh token, please login again");
        }

        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
        if (!holderToken) throw new UnauthorizedError("Refresh token not found");
        const {email, userId} = await verifyToken(refreshToken, holderToken.publicKey);
        console.log("Email:", email, "User ID:", userId);

        // 4. Create new tokens
        const user = await UserModel.findOne({ email, deleted: 0 }).lean();
        if (!user) throw new NotFoundError("User not found with this email");
        
        //create new key pair
        // const { publicKey, privateKey } = createKeyPair();
        const tokens = await createTokenPair(
            {
                userId,
                email: user.email
            },
            holderToken.publicKey,
            holderToken.privateKey
        );        // 5. Update holderToken with new public key, private key and refreshToken and add refreshToken to refreshTokenUsed
        await KeyTokenModel.findOneAndUpdate(
            { _id: holderToken._id },
            {   
                $set: {
                    refreshToken: tokens.refreshToken
                },
                $addToSet: { 
                    refreshTokenUsed: refreshToken 
                }
            },
            { new: true }
        )

        return {
            user: getInfoData({ fields: ['_id', 'fullname', 'email', 'address', 'phone'], object: user }),
            tokens
        }
    }

    static forgotPassword = async (email) => {
        // 1. Check if user exists
        const user = await UserModel.findOne({ email, deleted: 0 }).lean();
        if (!user) throw new NotFoundError("User not found with this email");
        // 2. Generate reset password token
        const resetToken = crypto.randomBytes(32).toString('hex');
        // 3. Save reset token to user
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const updatedUser = await UserModel.findOneAndUpdate(
            { _id: user._id },
            { resetPasswordToken: resetTokenHash, resetPasswordExpires: Date.now() + 3600000 }, // 1 hour expiration
            { new: true }
        ).lean();
        console.log("Updated User:", updatedUser);
        if (!updatedUser) throw new BadRequestError("Failed to update user with reset token");
        // 4. Send reset password email
        // Here you would typically send an email with the reset token
        console.log(`Reset password token for ${email}: ${resetToken}`);
        return {
            message: "Reset password token sent to your email",
            resetToken
        }
    }
}

module.exports = UserService