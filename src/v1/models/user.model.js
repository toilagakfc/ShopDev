'use strict'
const {model, Schema, Types} = require('mongoose');

const DOCUMENT_NAME = 'User';
const COLLECTION_NAME = 'users';
const userSchema = new Schema( {
    fullname: {
        type: String,
        length: 100,
        trim: true,
        allowNull: false,
    },
    email: {
        type: String,
        length: 100,
        trim: true,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        allowNull: false,
        required: true,
    },
    address: {
        type: String,
        length: 255,
        allowNull: true,
    },
    // Add a custom validator for phone number format (Vietnamese example)
    phone: {
        type: String,
        length: 15,
        validate: {
            validator: function(v) {
                // Simple regex for Vietnamese phone numbers (starts with 0, followed by 9 digits)
                return !v || /^0[1-9][0-9]{8}$/.test(v);
            },
            message: "Invalid phone number format. Must start with 0 and contain 10 digits.",
        },
        allowNull: true,
    },
    // Custom validator for image URL
    image: {
        type: String,
        validate: {
            validator: function(v) {
                // Simple URL validation for images (http/https, ends with image extension)
                return !v || /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))$/i.test(v);
            },
            message: "Invalid image URL format.",
        },
        length: 500,
        allowNull: true,
    },
    // image: {
    //     type: String,
    //     validate: {
    //         isURL: true, // Validate that the string is a URL
    //     },
    //     length: 500,
    //     allowNull: true,
    // },
    birthday: {
        type: Date,
        allowNull: true,
    },
    gender: {
        type: Number,
        enum: ['male','female','other'],
        defaultValue: 'male',
        allowNull: false,
    },
    status: {
        type: Boolean,
        default: false,
    },
    position: {
        type: Number,
        allowNull: true,
    },
    deleted: {
        type: Boolean,
        defaultValue: false, 
    },
    deletedAt: {
        type: Date,
        allowNull: true,
    },
    // Add a field to store the user's role
    role: {
        type: String,
        enum: ['user', 'admin', 'superadmin'],
        default: 'user',
        allowNull: false,
    },
}, {
    collection: COLLECTION_NAME,
    timestamps: true,
});

module.exports = model(DOCUMENT_NAME, userSchema);
