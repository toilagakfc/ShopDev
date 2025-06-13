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
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    used: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, forgotPasswordSchema);