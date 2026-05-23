require('dotenv').config({ quiet: true });
const { Sequelize } = require('sequelize');
const path = require('path');
const seedingService = require('../services/seeding.service');

const dialect = process.env.DB_DIALECT || 'sqlite';
const isDevelopment = process.env.NODE_ENV === 'development';

console.log(`Database Dialect selected: ${dialect}`);

let sequelize;

if (dialect === 'mysql') {
    // User's Preferred Production Structure for MySQL
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: 3306,
            dialect: 'mysql',
            logging: isDevelopment ? console.log : false,
            dialectOptions: {
                // Useful for some remote MySQL setups
                connectTimeout: 60000
            }
        }
    );
} else {
    // Local SQLite Development fallback
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../../database/dev.sqlite'),
        logging: isDevelopment ? console.log : false
    });
}

/**
 * Safe migrations for SQLite/MySQL — adds new columns/tables without touching existing schema.
 * Uses raw SQL with try/catch so it's idempotent (safe to run on every startup).
 */
const runMigrations = async () => {
    // Add `phone` column to users if missing
    try {
        await sequelize.query('ALTER TABLE users ADD COLUMN phone VARCHAR(20);');
        console.log('[Migration] Added phone column to users table');
    } catch (e) {
        if (!e.message.includes('already exists') && !e.message.includes('duplicate column')) {
            if (!e.message.includes('no such table')) {
                console.log('[Migration] phone column status check:', e.message);
            }
        }
    }

    // Create device_fingerprints table if missing
    try {
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS device_fingerprints (
                id VARCHAR(255) PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                fingerprint_hash VARCHAR(255) NOT NULL,
                user_agent TEXT,
                trust_score INTEGER DEFAULT 10,
                seen_count INTEGER DEFAULT 1,
                first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, fingerprint_hash)
            );
        `);
        console.log('[Migration] device_fingerprints table ready');
    } catch (e) {
        console.error('[Migration] device_fingerprints error:', e.message);
    }

    // Create blogs table if missing
    try {
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS blogs (
                id VARCHAR(255) PRIMARY KEY,
                title VARCHAR(500) NOT NULL,
                slug VARCHAR(255) NOT NULL UNIQUE,
                excerpt TEXT,
                content TEXT,
                featured_image TEXT,
                author VARCHAR(255) DEFAULT 'StartSaySt Team',
                status VARCHAR(50) DEFAULT 'draft',
                category VARCHAR(255),
                tags TEXT,
                meta_title VARCHAR(500),
                meta_description TEXT,
                published_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('[Migration] blogs table ready');
    } catch (e) {
        console.error('[Migration] blogs table error:', e.message);
    }

    // ── survey_visits: anonymous visitor tracking ──────────────────────────
    try {
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS survey_visits (
                id               VARCHAR(255) PRIMARY KEY,
                survey_id        VARCHAR(255) NOT NULL,
                platform         VARCHAR(255) NOT NULL,
                fingerprint_hash VARCHAR(255) NOT NULL,
                ip_address       VARCHAR(255) NOT NULL,
                user_agent       TEXT,
                status           VARCHAR(50) DEFAULT 'new',
                created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        // Unique indexes — created separately so the table migration never fails
        try {
            await sequelize.query(`
                CREATE UNIQUE INDEX idx_sv_fp_survey
                ON survey_visits (fingerprint_hash, survey_id);
            `);
        } catch (idxErr) { }
        try {
            await sequelize.query(`
                CREATE UNIQUE INDEX idx_sv_ip_survey
                ON survey_visits (ip_address, survey_id);
            `);
        } catch (idxErr) { }
        console.log('[Migration] survey_visits table ready');
    } catch (e) {
        console.error('[Migration] survey_visits error:', e.message);
    }

    // Add `score` column to survey_visits if missing
    try {
        await sequelize.query('ALTER TABLE survey_visits ADD COLUMN score INTEGER DEFAULT 100;');
        console.log('[Migration] Added score column to survey_visits table');
    } catch (e) {
        if (!e.message.includes('already exists') && !e.message.includes('duplicate column')) {
            console.error('[Migration] survey_visits score column error:', e.message);
        }
    }

    // ── survey_fraud_flags: audit log for duplicate signals ───────────────
    try {
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS survey_fraud_flags (
                id        VARCHAR(255) PRIMARY KEY,
                visit_id  VARCHAR(255) NOT NULL,
                flag_type VARCHAR(255) NOT NULL,
                detail    TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        try {
            await sequelize.query(`
                CREATE INDEX idx_sff_visit
                ON survey_fraud_flags (visit_id);
            `);
        } catch (idxErr) { }
        console.log('[Migration] survey_fraud_flags table ready');
    } catch (e) {
        console.error('[Migration] survey_fraud_flags error:', e.message);
    }
};

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database Connected successfully');

        // Sync known models (no alter — use migrations for schema changes)
        await sequelize.sync({ alter: false });

        // Apply safe incremental migrations
        await runMigrations();

        // Run seeding
        await seedingService.seedAttributeDefinitions();
        await seedingService.seedSurveyProviders();
        await seedingService.seedSurveyMappings();
        await seedingService.seedTestPanelist();

    } catch (error) {
        console.error('DATABASE CONNECTION ERROR:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
