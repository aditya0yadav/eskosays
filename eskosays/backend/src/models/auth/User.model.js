const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'panelist'),
        defaultValue: 'panelist'
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    },
    email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    google_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true
    },
    avatar_url: {
        type: DataTypes.STRING(1024),
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true
});

module.exports = User;
