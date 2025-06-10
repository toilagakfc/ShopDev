const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const NewsCategory = require("./newsCategory.model");

const News = sequelize.define("News", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    image: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
    },
    slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    author: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    newsCategory: {
        type: DataTypes.INTEGER,
        references: {
            model: NewsCategory,
            key: "id",
        },
        allowNull: false,
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    shares: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    position: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
    },
    featured: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
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
    tableName: "news",
    timestamps: true,
});

// Định nghĩa quan hệ giữa News và NewsCategory
News.belongsTo(NewsCategory, { foreignKey: "newsCategory", as: "category" });
NewsCategory.hasMany(News, { foreignKey: "newsCategory", as: "news" });

module.exports = News;
