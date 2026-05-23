const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Survey = sequelize.define('Survey', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    provider_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    provider_survey_id: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    title: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    payout: {
        type: DataTypes.DECIMAL(10, 4),
        defaultValue: 0.0000
    },
    qualifications: {
        type: DataTypes.JSON,
        allowNull: true
    },
    quota: {
        type: DataTypes.JSON,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(50),
        defaultValue: 'active'
    },
    raw_data: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    tableName: 'surveys',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['provider_id', 'provider_survey_id']
        }
    ]
});

module.exports = Survey;
