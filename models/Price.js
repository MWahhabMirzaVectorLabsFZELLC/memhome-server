// models/TokenPrice.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TokenPrice = sequelize.define('TokenPrice', {
    tokenAddress: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'token_prices',
    timestamps: true
});

module.exports = TokenPrice;
