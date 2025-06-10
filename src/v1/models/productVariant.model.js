const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");
const Products = require("./product.model")

const ProductVariants = sequelize.define('ProductVariants', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0 },
    },
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
    },
    deleted: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
    },
    specialPrice: {
        type: DataTypes.INTEGER,
        allowNull: true, 
        defaultValue: null, 
    },
    discount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { min: 0, max: 100 }, 
    },
    size: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    ProductID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'productsvariants',
    timestamps: false,
});
Products.hasMany(ProductVariants, { foreignKey: "ProductID", as: "variants" });
ProductVariants.belongsTo(Products, { foreignKey: "ProductID", as: "product" });

module.exports = ProductVariants;
