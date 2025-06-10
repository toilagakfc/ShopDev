const Sequelize = require("sequelize");
const {db:{host,port,name,user,password}} = require('./config.mysql'); 
const sequelize = new Sequelize(
    name, // Tên database
    user, // Username
    password, // Password
    {
        host: host,
        port: port,
        dialect: 'mysql'
    }
);

sequelize.authenticate().then(() => {
    console.log('Kết nối database thành công!.');
}).catch((error) => {
    console.error('Kết nối database thất bại! ', error);
});

module.exports = sequelize; 