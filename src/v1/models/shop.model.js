'use strict'
const {model, Schema, Types} = require('mongoose');

const DOCUMENT_NAME = 'Shop';
const COLLECTION_NAME = 'shops';

const shopSchema = new mongoose.Schema({
    name:        { type: String, required: true, trim: true },
    // owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // address:     { type: String, trim: true },
    email:       { type: String, lowercase: true, trim: true },
    password:    { type: String, required: true, trim: true },
    phone:       { type: String, trim: true },
    status:      { type: String, enum:['active','inactive'],default:'inactive'}, // 1: active, 0: inactive
    verify:      { type: Boolean, default: false },
    roles:        { type: Array, default: [] }, 
    createdAt:   { type: Date, default: Date.now }
},
{
    collection: COLLECTION_NAME,
    timestamps: true,
});


module.exports = mongoose.model(DOCUMENT_NAME, shopSchema);
