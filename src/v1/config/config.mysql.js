'use strict'

//development
const dev = {
    app: {
        port: process.env.DEV_APP_PORT || 3001,
    },  
    db: {
        host: process.env.DEV_DB_HOST || 'localhost',
        port: process.env.DEV_DB_PORT || 3306,
        name: process.env.DEV_DB_NAME || 'shopbadminton',
        user: process.env.DEV_DB_USER || 'shopbadminton_user',
        password: process.env.DEV_DB_PASSWORD || 'mysql123',
    }
}

//production
const prod = {
    app:{
        port: process.env.PROD_APP_PORT 
    },
    db:{
        host: process.env.PROD_DB_HOST,
        port: process.env.PROD_DB_PORT,
        name: process.env.PROD_DB_NAME,
        user: process.env.PROD_DB_USER,
        password: process.env.PROD_DB_PASSWORD
    }
}

const config = { dev, prod }
module.exports = config[process.env.NODE_ENV || 'dev'];