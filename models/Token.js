const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Token = sequelize.define('Token', {
    tokenAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    symbol: {
        type: DataTypes.STRING,
        allowNull: false
    },
    twitter: {
        type: DataTypes.STRING
    },
    telegram: {
        type: DataTypes.STRING
    },
    website: {
        type: DataTypes.STRING
    },
    imageUrl: {
        type: DataTypes.STRING
    }
});

module.exports = Token;
