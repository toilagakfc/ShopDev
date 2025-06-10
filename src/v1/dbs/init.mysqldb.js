'use strict'

// const mysql = require('mysql');
const Sequelize = require("sequelize");
const {db:{host,port,name,user,password}} = require('../config/config.mysql'); 

class Database {
    constructor() {
        this.connect();
    }

    // Connect to MySQL
    async connect(type = 'mysql') {
        if (1 === 1) {
            console.log('MySQL connected');
        }
        try {
            this.sequelize = await new Sequelize(
                name, // Tên database
                user, // Username
                password, // Password
                {
                    host: host,
                    port: port,
                    dialect: type,
                    dialectOptions: {
                        connectTimeout: 60000
                    },
                    pool: {
                        max: 5,
                        min: 0,
                        acquire: 30000,
                        idle: 10000
                    }
                }
            );
            await this.sequelize.authenticate();
            console.log('MySQL connected successfully!');
        } catch (error) {
            console.error('MySQL connection error:', error);
            process.exit(1);
        }
    }
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