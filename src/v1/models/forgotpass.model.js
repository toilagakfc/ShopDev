'use strict';

const { model, Types,Schema } = require('mongoose');
const DOCUMENT_NAME = 'ForgotPassword';
const COLLECTION_NAME = 'ForgotPasswords';

const forgotPasswordSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    opt: {
        type: String,
        required: true,
        unique: true // Ensure each OTP is unique
    },
    expiresAt: {
        type: Date,
        required: true,
        expires: '15m' // Automatically delete after 15 minutes
    },
    createdAt: {
        type: Date,
        defaultValue: Types.NOW,
    },
    updatedAt: {
        type: Date,
        defaultValue: Types.NOW,
    }
},    
    {
        collection: COLLECTION_NAME,
        timestamps: true, // Automatically manage createdAt and updatedAt fields
    }
    );

module.exports = model(DOCUMENT_NAME, forgotPasswordSchema);