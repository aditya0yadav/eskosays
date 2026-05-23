const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const RefreshToken = sequelize.define('RefreshToken', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    token: {
        type: DataTypes.STRING(512),
        allowNull: false,
        unique: true
    },
    user_agent: {
        type: DataTypes.STRING,
        allowNull: true
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'refresh_tokens',
    timestamps: true,
    updatedAt: false,
    underscored: true
});

module.exports = RefreshToken;
