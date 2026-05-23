const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Blog = sequelize.define('Blog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true
    },
    excerpt: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    content: {
        // DataTypes.TEXT('long') not supported by SQLite — use plain TEXT
        type: DataTypes.TEXT,
        allowNull: true
    },
    featured_image: {
        type: DataTypes.STRING(1000),
        allowNull: true
    },
    author: {
        type: DataTypes.STRING(255),
        defaultValue: 'RealSays Team'
    },
    status: {
        // DataTypes.ENUM not supported by SQLite on manually-created tables
        type: DataTypes.STRING(20),
        defaultValue: 'draft',
        validate: { isIn: [['draft', 'published']] }
    },
    category: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    tags: {
        // DataTypes.JSON can fail on SQLite with manually-created tables.
        // Store as TEXT and serialize/deserialize manually in the service.
        type: DataTypes.TEXT,
        defaultValue: '[]',
        get() {
            const raw = this.getDataValue('tags');
            if (!raw) return [];
            try { return JSON.parse(raw); } catch { return []; }
        },
        set(value) {
            this.setDataValue('tags', Array.isArray(value) ? JSON.stringify(value) : (value || '[]'));
        }
    },
    meta_title: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    meta_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    published_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'blogs',
    timestamps: true,
    underscored: true,
    indexes: [
        { unique: true, fields: ['slug'] },
        { fields: ['status'] },
        { fields: ['published_at'] }
    ]
});

module.exports = Blog;
