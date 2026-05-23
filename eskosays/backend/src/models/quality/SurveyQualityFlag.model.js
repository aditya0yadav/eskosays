const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

/**
 * SurveyFraudFlag — audit log for every fraud signal detected.
 *
 * Each row records *why* a particular visit was considered fraudulent.
 * One visit can have multiple flags (e.g. both duplicate_ip AND
 * duplicate_fingerprint triggered at the same time).
 */
const SurveyFraudFlag = sequelize.define('SurveyFraudFlag', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    visit_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'FK → survey_visits.id of the flagged visit',
    },
    flag_type: {
        type: DataTypes.ENUM('duplicate_fingerprint', 'duplicate_ip'),
        allowNull: false,
    },
    detail: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON string with additional context (e.g. original visit id)',
        get() {
            const raw = this.getDataValue('detail');
            try { return raw ? JSON.parse(raw) : null; } catch { return raw; }
        },
        set(value) {
            this.setDataValue('detail', value ? JSON.stringify(value) : null);
        },
    },
}, {
    tableName: 'survey_fraud_flags',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['visit_id'] },
        { fields: ['flag_type'] },
    ],
});

module.exports = SurveyFraudFlag;
