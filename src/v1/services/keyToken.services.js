'use strict';

const KeyTokenModel = require('../models/keyToken.model');
const {} = require('../core/error.response');
class KeyTokenService {
    static async createKeyToken({userId, publicKey, privateKey, refreshToken}) {
        // const publicKeyString = publicKey.toString();
        // const token = await KeyTokenModel.create({
        //     userId,
        //     publicKey: publicKeyString

        // });
        // if (!token) {
        //     throw new Error("Failed to create key token");
        // }
        
        // return token ? token.publicKey : null;
        const filter = { userId },       update = {
                publicKey,
                privateKey, // Assuming privateKey is not provided here
                refreshTokenUsed: [],
                refreshToken // Assuming refreshToken is not provided here
            
        },options = { upsert: true, new: true };
        const token = await KeyTokenModel.findOneAndUpdate(filter,update,options).lean();
        return token ? token.publicKey : null;
    }

    static async getKeyTokenByUserId(userId) {
        const keyToken = await KeyTokenModel.findOne({ userId }).lean();
        if (!keyToken) {
            throw new Error("Key token not found for this user");
        }
        return keyToken;
    }

    static  removeKeyTokenByUserId = async (userId) => {
        return await KeyTokenModel.findOneAndDelete({ userId }).lean();
    }

    static  findrefreshTokenUsed = async (refreshToken) => {
    return await KeyTokenModel.findOne({ refreshTokenUsed:refreshToken}).lean();
    }

    static  findByRefreshToken = async (refreshToken) => {
        return await KeyTokenModel.findOne({refreshToken});
    }
}

module.exports = KeyTokenService;