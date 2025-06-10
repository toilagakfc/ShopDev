'use strict'

const mongoose = require('mongoose');
const { db: { host, port, name, user, password } } = require('../config/config.mongodb');

const MONGO_URI = process.env.MONGO_URI || `mongodb://${user}:${password}@${host}:${port}/${name}?authSource=${user}`;

class Database {
    constructor() {
        this.connect();
    }

    // Connect to MongoDB
    async connect(type = 'mongodb') {
        if (process.env.NODE_ENV !== 'production') {
            mongoose.set('debug', true);
            mongoose.set('debug', { colors: true });
        }

        try {
            await mongoose.connect(MONGO_URI, {
                maxPoolSize: 50,
                connectTimeoutMS: 30000,
                socketTimeoutMS: 45000,
                serverSelectionTimeoutMS: 5000,
                retryWrites: true
            });
            console.log('MongoDB connected successfully!');

            // Handle connection events
            mongoose.connection.on('connected', () => {
                console.log('MongoDB connection established');
            });

            mongoose.connection.on('disconnected', () => {
                console.error('MongoDB disconnected! Attempting to reconnect...');
                this.handleDisconnect();
            });

            mongoose.connection.on('error', (err) => {
                console.error('MongoDB connection error:', err);
                this.handleDisconnect();
            });

        } catch (error) {
            console.error('Failed to connect to MongoDB:', error);
            this.handleDisconnect();
        }
    }

    // Handle disconnection with retry mechanism
    async handleDisconnect() {
        if (!this.reconnectTimer) {
            this.reconnectAttempts = 0;
            this.firstDisconnectTime = Date.now();
            this.reconnectWithBackoff();
        }
    }

    // Implement exponential backoff for reconnection
    async reconnectWithBackoff() {
        const maxReconnectTime = 5 * 60 * 1000; // 5 minutes
        const maxReconnectAttempts = 10;

        if (Date.now() - this.firstDisconnectTime > maxReconnectTime) {
            console.error('Could not reconnect to MongoDB after 5 minutes. Exiting...');
            process.exit(1);
        }

        if (this.reconnectAttempts >= maxReconnectAttempts) {
            console.error('Maximum reconnection attempts reached. Exiting...');
            process.exit(1);
        }

        try {
            await mongoose.connect(MONGO_URI, {
                maxPoolSize: 50,
                connectTimeoutMS: 15000,
                socketTimeoutMS: 30000
            });
            console.log('MongoDB reconnected successfully!');
            this.reconnectAttempts = 0;
            this.firstDisconnectTime = null;
            this.reconnectTimer = null;
        } catch (err) {
            this.reconnectAttempts++;
            const backoffTime = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 60000); // Max 60 seconds
            console.log(`Reconnection attempt ${this.reconnectAttempts} failed. Retrying in ${backoffTime/1000} seconds...`);
            
            this.reconnectTimer = setTimeout(() => {
                this.reconnectWithBackoff();
            }, backoffTime);
        }
    }

    // Implement Singleton pattern
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}

// Export the singleton instance
const dbInstance = Database.getInstance();
module.exports = dbInstance;