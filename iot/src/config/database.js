require('dotenv').config()
const mysql = require('mysql2')

//create connection to database
const connection = mysql.createConnection({
    host: process.env.HOST_NAME,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

module.exports = connection;