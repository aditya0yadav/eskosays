const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const DeviceFingerprint = sequelize.define('DeviceFingerprint', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    fingerprint_hash: {
        type: DataTypes.STRING(64), // SHA-256 hex = 64 chars
        allowNull: false
    },
    user_agent: {
        type: DataTypes.STRING(512),
        allowNull: true
    },
    trust_score: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
        comment: '10=new, 40=familiar, 70=regular, 95=trusted'
    },
    seen_count: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    first_seen_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    last_seen_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'device_fingerprints',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'fingerprint_hash']
        }
    ]
});

module.exports = DeviceFingerprint;
