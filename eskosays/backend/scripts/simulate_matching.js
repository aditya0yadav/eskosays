const { sequelize, connectDB } = require('../src/config/database');
const { SurveyProvider, SurveyAttributeMapping, SurveyOptionMapping, Panelist, PersonaAttribute, AttributeDefinition } = require('../src/models');
const SurveyMatchingService = require('../src/modules/survey/services/surveyMatching.service'); // Adjust path
const redis = require('../src/config/redis');
const fs = require('fs');
const path = require('path');

async function simulate() {
    try {
        await connectDB();

        // 1. Get Test User
        const panelist = await Panelist.findOne({
            include: [{
                model: PersonaAttribute,
                as: 'attributes',
                include: [{ model: AttributeDefinition, as: 'definition' }]
            }]
        }); // Just get the first one, which should be our 'Prod Test' user or similar

        if (!panelist) {
            console.log("No panelist found!");
            process.exit(1);
        }
        console.log(`Simulating for Panelist: ${panelist.first_name} ${panelist.last_name}`);

        // 2. Load Mappings
        const allMappings = await SurveyAttributeMapping.findAll({
            include: [{ model: SurveyOptionMapping, as: 'optionMappings' }]
        });
        const providers = await SurveyProvider.findAll();
        const providerMap = providers.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
        const formattedMappings = {};

        for (const m of allMappings) {
            const provider = providerMap[m.provider_id];
            if (!provider) continue;
            if (!formattedMappings[provider.slug]) formattedMappings[provider.slug] = {};
            const options = {};
            m.optionMappings.forEach(o => { options[o.internal_value] = o.provider_value; });
            formattedMappings[provider.slug][m.provider_question_key] = { internal_key: m.internal_key, options };
            if (m.provider_question_id) formattedMappings[provider.slug][m.provider_question_id] = { internal_key: m.internal_key, options };
        }

        // 3. Get Surveys from Redis
        let surveyRegistryData = [];
        const cachedRegistry = await redis.get('survey_registry');
        if (cachedRegistry) {
            surveyRegistryData = JSON.parse(cachedRegistry);
        } else {
            console.log("Redis cache empty, checking file...");
            try {
                const cachePath = path.join(__dirname, '../survey-cache.json');
                const fileData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
                surveyRegistryData = fileData.data;
            } catch (e) {
                console.log("No file cache either.");
            }
        }

        // 4. Run Logic
        console.log(`\nProcessing ${surveyRegistryData.length} surveys...\n`);

        const processed = surveyRegistryData
            .filter(survey => {
                const loi = parseInt(survey.duration || survey.raw_data.LOI || 0);
                const cpi = parseFloat(survey.payout);

                // Filter 1: LOI/CPI Rule
                if (loi > 10 && cpi < 0.4) {
                    console.log(`[FILTERED] ID: ${survey.providerSurveyId} | Payout: $${cpi} | LOI: ${loi}m (Low Pay/High Effort)`);
                    return false;
                }
                return true;
            })
            .map(survey => {
                const matchResult = SurveyMatchingService.match(panelist, survey, formattedMappings);
                return {
                    ...survey,
                    matchScore: matchResult.score,
                    isMatch: matchResult.isMatch,
                    failedReasons: matchResult.failedReasons
                };
            })
            .sort((a, b) => b.matchScore - a.matchScore);

        console.log('\n--- Final Ranked Output (Top 10) ---');
        processed.slice(0, 10).forEach((s, i) => {
            console.log(`${i + 1}. [${s.provider}] ID: ${s.providerSurveyId} | Score: ${s.matchScore.toFixed(1)}% | Payout: $${s.payout} | Title: ${s.title.substring(0, 40)}...`);
            if (!s.isMatch) {
                console.log(`   Reasons: ${s.failedReasons.join(', ')}`);
            }
        });

        const top5Ids = processed.slice(0, 5).map(s => s.providerSurveyId);
        console.log('\nIDs visible on Frontend (Top 5):', top5Ids.join(', '));

        process.exit(0);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

simulate();
