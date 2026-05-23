const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const SurveyCompletion = sequelize.define('SurveyCompletion', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    click_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    panelist_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    survey_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('complete', 'disqualified', 'overquota', 'terminated'),
        allowNull: false
    },
    payout: {
        type: DataTypes.DECIMAL(10, 4),
        defaultValue: 0.0000
    },
    external_transaction_id: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'survey_completions',
    timestamps: true,
    underscored: true
});

module.exports = SurveyCompletion;
