const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user.model");

const ForgotPassword = sequelize.define("ForgotPassword", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: "id"
        },
        onDelete: "CASCADE"
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expireAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: "forgot_password",
    timestamps: true
});

// Thiết lập quan hệ
ForgotPassword.belongsTo(User, { foreignKey: "userId" });
User.hasMany(ForgotPassword, { foreignKey: "userId" });

module.exports = ForgotPassword;
