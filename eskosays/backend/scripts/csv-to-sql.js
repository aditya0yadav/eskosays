const fs = require('fs');
const path = require('path');

const EXPORT_DIR = path.join(__dirname, '../database/exports');
const ATTRIBUTE_CSV = path.join(EXPORT_DIR, 'survey_attribute_mappings.csv');
const OPTION_CSV = path.join(EXPORT_DIR, 'survey_option_mappings.csv');
const PROVIDER_CSV = path.join(EXPORT_DIR, 'survey_providers.csv');

/**
 * Normalizes a timestamp string from CSV to SQL format
 * Input: "2026-02-15 17:54:59.172 +00:00"
 * Output: "2026-02-15 17:54:59.172"
 */
function cleanTimestamp(ts) {
    if (!ts || ts === '""' || ts === 'NULL') return 'CURRENT_TIMESTAMP';

    // Remove quotes and +00:00 offset
    let cleaned = ts.replace(/"/g, '').replace(/\s\+\d{2}:\d{2}$/, '').trim();

    if (!cleaned) return 'CURRENT_TIMESTAMP';
    return `'${cleaned}'`;
}

/**
 * Escapes single quotes for SQL safety and handles NULLs
 */
function escapeSql(val) {
    if (val === undefined || val === null || val === '' || val === '""') return 'NULL';

    let str = String(val).trim();
    if (!str) return 'NULL';

    // Escape single quotes (SQL style)
    return `'${str.replace(/'/g, "''")}'`;
}

/**
 * Parses a single CSV line while respecting quoted values containing commas and escaped quotes ("")
 */
function parseCsvLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const next = line[i + 1];

        if (char === '"') {
            if (inQuotes && next === '"') {
                // Escaped double quote ""
                cur += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(cur);
            cur = '';
        } else {
            cur += char;
        }
    }
    result.push(cur);
    return result;
}

function processAttributes() {
    console.log(`Processing Attributes: ${ATTRIBUTE_CSV}`);
    if (!fs.existsSync(ATTRIBUTE_CSV)) {
        console.error('Attribute CSV not found!');
        return;
    }

    const lines = fs.readFileSync(ATTRIBUTE_CSV, 'utf8').split('\n');
    const sqlLines = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [id, provider_id, internal_key, q_key, q_id, q_title, created, updated] = parseCsvLine(line);

        sqlLines.push(
            `INSERT INTO survey_attribute_mappings (id, provider_id, internal_key, provider_question_key, provider_question_id, provider_question_title, created_at, updated_at) ` +
            `VALUES ('${id}', '${provider_id}', ${escapeSql(internal_key)}, ${escapeSql(q_key)}, ${escapeSql(q_id)}, ${escapeSql(q_title)}, ${cleanTimestamp(created)}, ${cleanTimestamp(updated)});`
        );
    }

    const outputFile = path.join(EXPORT_DIR, 'attribute_mappings.sql');
    fs.writeFileSync(outputFile, sqlLines.join('\n'));
    console.log(`Saved ${sqlLines.length} statements to ${outputFile}`);
}

function processOptions() {
    console.log(`Processing Options: ${OPTION_CSV}`);
    if (!fs.existsSync(OPTION_CSV)) {
        console.error('Option CSV not found!');
        return;
    }

    const lines = fs.readFileSync(OPTION_CSV, 'utf8').split('\n');
    const sqlLines = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [id, mapping_id, internal_val, provider_val, opt_text, created, updated] = parseCsvLine(line);

        sqlLines.push(
            `INSERT INTO survey_option_mappings (id, attribute_mapping_id, internal_value, provider_value, provider_option_text, created_at, updated_at) ` +
            `VALUES ('${id}', '${mapping_id}', ${escapeSql(internal_val)}, ${escapeSql(provider_val)}, ${escapeSql(opt_text)}, ${cleanTimestamp(created)}, ${cleanTimestamp(updated)});`
        );
    }

    const outputFile = path.join(EXPORT_DIR, 'option_mappings.sql');
    fs.writeFileSync(outputFile, sqlLines.join('\n'));
    console.log(`Saved ${sqlLines.length} statements to ${outputFile}`);
}

function processProviders() {
    console.log(`Processing Providers: ${PROVIDER_CSV}`);
    if (!fs.existsSync(PROVIDER_CSV)) {
        console.error('Provider CSV not found!');
        return;
    }

    const lines = fs.readFileSync(PROVIDER_CSV, 'utf8').split('\n');
    const sqlLines = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [id, name, slug, api_key, auth, base, list, quota, click, qualification, active, created, updated] = parseCsvLine(line);

        sqlLines.push(
            `INSERT INTO survey_providers (id, name, slug, api_key, auth_config, base_url, list_url, quota_url, click_url, qualification_url, is_active, created_at, updated_at) ` +
            `VALUES ('${id}', ${escapeSql(name)}, ${escapeSql(slug)}, ${escapeSql(api_key)}, ${escapeSql(auth)}, ${escapeSql(base)}, ${escapeSql(list)}, ${escapeSql(quota)}, ${escapeSql(click)}, ${escapeSql(qualification)}, ${active === '1' ? 1 : 0}, ${cleanTimestamp(created)}, ${cleanTimestamp(updated)});`
        );
    }

    const outputFile = path.join(EXPORT_DIR, 'providers.sql');
    fs.writeFileSync(outputFile, sqlLines.join('\n'));
    console.log(`Saved ${sqlLines.length} statements to ${outputFile}`);
}

console.log('--- Starting CSV to SQL Conversion ---');
processProviders();
processAttributes();
processOptions();
console.log('--- Done ---');
