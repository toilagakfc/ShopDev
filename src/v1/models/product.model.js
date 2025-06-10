const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");
const ProductCategories = require("./ProductCategory.model");
const Brands = require("./brand.model");

const Products = sequelize.define('Products', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    brandID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    categoriesID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    featured: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
    },
    position: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    deleted: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
    },
    slug: {
        type: DataTypes.STRING,
        unique: true,
    },
    codeProduct: {
        type: DataTypes.STRING,
        unique: true,
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
    descriptionPromotion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'products',
    timestamps: true,
});

Brands.hasMany(Products, { foreignKey: "brandID", as: "products" });
Products.belongsTo(Brands, { foreignKey: "brandID", as: "brands" });

ProductCategories.hasMany(Products, { foreignKey: "categoriesID", as: "products" });
Products.belongsTo(ProductCategories, { foreignKey: "categoriesID", as: "categories" });

module.exports = Products;