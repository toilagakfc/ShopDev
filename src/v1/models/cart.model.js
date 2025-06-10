const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user.model");
const ProductVariants = require("./productVariant.model");
const Products = require("./product.model");

const Carts = sequelize.define("Carts", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    productsvariantId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: "carts",
    timestamps: true
});

// Thiết lập quan hệ
User.hasMany(Carts, { foreignKey: "userId" });
Carts.belongsTo(User, { foreignKey: "userId" });


Carts.belongsTo(ProductVariants, { foreignKey: "productsvariantId" , as: "ProductVariant"});
ProductVariants.belongsTo(Products, { foreignKey: "ProductID" });

module.exports = Carts;
