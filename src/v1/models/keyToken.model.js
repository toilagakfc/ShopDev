'use strict';

const { model, Schema } = require('mongoose');
const DOCUMENT_NAME = 'KeyToken';
const COLLECTION_NAME = 'keyTokens';

const keyTokenSchema = new Schema(
    {
        userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        },

        publicKey: {
        type: String,
        required: true,
        },

        privateKey: {
        type: String,
        required: true,
        },

        refreshTokenUsed: {
        type: Array,
        default: [],
        },

        refreshToken: {
        type: String,
        required: true, 
        },
        
        createdAt: {
        type: Date,
        default: Date.now,
        expires: '1d', // Automatically delete after 1 day
        },
    },
    {
        collection: COLLECTION_NAME,
        timestamps: true, // Automatically manage createdAt and updatedAt fields
    }
    );

module.exports = model(DOCUMENT_NAME, keyTokenSchema);