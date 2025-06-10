const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const NewsCategory = sequelize.define("NewsCategory", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    image: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
    },
    parentID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    position: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    deleted: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: "newscategories",
    timestamps: true,
});

module.exports = NewsCategory;
