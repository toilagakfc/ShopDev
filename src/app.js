const express = require("express");
require('dotenv').config();
const cors = require('cors');
const {default:helmet} = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const app = express();

// Init database connections

require("./v1/dbs/init.mongodb");  // MongoDB
// require("./dbs/init.mysqldb");  // MySQL
// require("./config/database"); // Sequelize ORM for MySQL

// Init middlewares
app.use(morgan("compined")); // HTTP request logger
app.use(helmet()); // Security headers
app.use(compression()); // Compress response bodies
app.use(cors()); // Enable CORS for all routes


// Parse requests
app.use(express.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(express.json()); // parse application/json

// Init routes
app.use("/v1/api", require("./v1/routes/index.router")); // Main API routes

// Error handling middleware
app.use((req, res, next) => {
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    // console.error(err.stack);
    const statuscode = err.status || 500;
    res.status(statuscode).json({
        status: 'error',
        code: statuscode,   
        message: err.message || "Internal Server Error",

    });
});

module.exports = app;