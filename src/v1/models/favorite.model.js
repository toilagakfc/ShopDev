const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');
const Product = require('./product.model');
const ProductsVariants = require("./productVariant.model");

const Favorite = sequelize.define('Favorite', {
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        }
    },
    productvariantId: {
        type: DataTypes.INTEGER,
        references: {
            model: ProductsVariants,
            key: 'id'
        }
    }
}, {
    tableName: "favorites",
    timestamps: true
});

Favorite.belongsTo(User, { foreignKey: 'userId' });
Favorite.belongsTo(ProductsVariants, { foreignKey: 'productvariantId', as: "productVariants" });

module.exports = Favorite;
