const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    tknName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tokenQuantity: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('buy', 'sell'),
        allowNull: false
    },
    ethQuantity: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    userAddress: {
        type: DataTypes.STRING,
        allowNull: false
    },
    txHash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = Transaction;
