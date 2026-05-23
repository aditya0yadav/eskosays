const { connectDB } = require('./src/config/database');
const { Panelist, SurveyProvider, SurveyAttributeMapping, SurveyOptionMapping, AttributeDefinition, PersonaAttribute } = require('./src/models');
const redis = require('./src/config/redis');
const SurveyMatchingService = require('./src/modules/survey/services/surveyMatching.service');

async function simulateMatching() {
    await connectDB();

    console.log('\n--- STARTING SURVEY MATCHING SIMULATION ---\n');

    // 1. Fetch or Create Mock User Profile
    const mockUserAttributes = [
        { key: 'gender', value: 'Male' },
        { key: 'age', value: '30' },
        { key: 'zip_code', value: '10001' },
        { key: 'marital_status', value: 'Single' },
        { key: 'income', value: '$50,000 - $74,999' },
        { key: 'ethnicity', value: 'No' },
        { key: 'race', value: 'White' },
        { key: 'mobilephone_user', value: 'Yes' },
        { key: 'cell_type', value: 'Smart Phone' }
    ];

    console.log('--- USER PROFILE ---');
    console.table(mockUserAttributes);

    // transform to format expected by matching service
    const panelist = {
        attributes: mockUserAttributes.map(attr => ({
            definition: { key: attr.key },
            value: attr.value
        }))
    };

    // 2. Load Mappings
    console.log('\n--- LOADING MAPPINGS ---');
    const allMappings = await SurveyAttributeMapping.findAll({
        include: [{ model: SurveyOptionMapping, as: 'optionMappings' }]
    });

    const providers = await SurveyProvider.findAll();
    const providerMap = providers.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
    console.log(providerMap, "dfsd")
    const formattedMappings = {};

    for (const m of allMappings) {
        const provider = providerMap[m.provider_id];
        if (!provider) continue;
        if (!formattedMappings[provider.slug]) formattedMappings[provider.slug] = {};

        // ADD MANUAL MAPPING FOR RACE IF MISSING (SIMULATION ONLY)
        if (provider.slug === 'zamplia' || provider.slug === 'goweb') {
            // Mock Race Mapping 
            if (!formattedMappings[provider.slug]['race']) {
                formattedMappings[provider.slug]['race'] = {
                    internal_key: 'race',
                    options: {
                        'White': '1', // Common ID for White
                        'Black': '2',
                        'Asian': '3',
                        'Hispanic': '4'
                    }
                };
            }
        }

        const options = {};
        m.optionMappings.forEach(o => { options[o.internal_value] = o.provider_value; });

        const mappingData = { internal_key: m.internal_key, options };
        // Map by both key and ID
        formattedMappings[provider.slug][m.provider_question_key] = mappingData;
        if (m.provider_question_id) {
            formattedMappings[provider.slug][m.provider_question_id] = mappingData;
        }
    }
    console.log(`Loaded mappings for: ${Object.keys(formattedMappings).join(', ')}`);

    // 3. Get Surveys from Cache
    console.log('\n--- FETCHING SURVEYS FROM CACHE ---');
    const cachedRegistry = await redis.get('survey_registry');
    let surveys = cachedRegistry ? JSON.parse(cachedRegistry) : [];

    if (surveys.length === 0) {
        console.log('No surveys found in cache. Please verify the survey fetch worker is running.');
        process.exit(0);
    }
    console.log(`Found ${surveys.length} surveys in cache.`);

    // 4. Run Matching Simulation
    console.log('\n--- MATCHING PROCESS LOG ---');

    let matchedCount = 0;

    // Test a sample of surveys (first 5 active ones)
    const surveysToTest = surveys.slice(0, 50);

    for (const survey of surveysToTest) {
        // We only care about Zamplia/GoWeb for now as they have mappings
        if (!['zamplia', 'goweb'].includes(survey.provider)) continue;

        console.log(`\nEvaluating Survey [${survey.provider.toUpperCase()}] ID: ${survey.providerSurveyId}`);
        console.log(`Title: ${survey.title}`);

        if (!survey.qualifications || survey.qualifications.length === 0) {
            console.log(`Result: MATCH (No qualifications required)`);
            matchedCount++;
            continue;
        }

        console.log('Qualifications Required:');

        // Manual Matching Logical with Logging
        const result = SurveyMatchingService.match(panelist, survey, formattedMappings);

        // Log details of the match process
        // We re-implement specific logging here for visibility
        for (const req of survey.qualifications) {
            const reqKey = req.key || req.id;
            console.log(`  - Checking Rule: ${reqKey} (${req.type})`);
            console.log(`    Expected: ${JSON.stringify(req.allowed_values || { min: req.min, max: req.max })}`);

            // Lookup Mapping
            const providerMappings = formattedMappings[survey.provider] || {};
            const attrMapping = providerMappings[reqKey] || providerMappings[req.id];
            const internalKey = attrMapping?.internal_key || reqKey;

            console.log(`    Mapped to Internal Key: ${internalKey}`);

            // Get User Value
            const userAttr = panelist.attributes.find(a => a.definition && a.definition.key === internalKey);
            const userValueRaw = userAttr ? userAttr.value : 'N/A';
            console.log(`    User Value (Raw): ${userValueRaw}`);

            // Translate
            let userValueTranslated = userValueRaw;
            if (attrMapping && attrMapping.options && userValueRaw !== 'N/A') {
                const opts = attrMapping.options;
                const found = opts[userValueRaw] ||
                    opts[String(userValueRaw).toLowerCase()];

                if (found) {
                    userValueTranslated = found;
                    console.log(`    User Value (Translated): ${userValueTranslated}`);
                } else {
                    console.log(`    User Value (Keep Raw): ${userValueRaw} (No option map found)`);
                }
            }

            // Check
            const isPass = SurveyMatchingService.checkRequirement(req, userValueTranslated);
            console.log(`    Status: ${isPass ? 'PASS' : 'FAIL'}`);
        }

        if (result.isMatch) {
            console.log(`>> FINAL DECISION: MATCH (Score: ${result.score}%)`);
            matchedCount++;
        } else {
            console.log(`>> FINAL DECISION: REJECT (Score: ${result.score}%)`);
            console.log(`>> Reasons: ${result.failedReasons.join(', ')}`);
        }
    }

    console.log(`\n--- SIMULATION SUMMARY ---`);
    console.log(`Total Surveys Evaluated: ${surveysToTest.length}`);
    console.log(`Matches Found: ${matchedCount}`);

    process.exit(0);
}

simulateMatching();
