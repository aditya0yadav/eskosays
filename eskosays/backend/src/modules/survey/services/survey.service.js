const { fetchGoWebSurveys, fetchGoWebQualifications, registerSurvey: registerGoWeb } = require('../integrations/gowebsurveys');
const { fetchZampliaSurveys, fetchZampliaQualifications, registerSurvey: registerZamplia } = require('../integrations/zamplia');
const { fetchPollsOpinionSurveys } = require('../integrations/pollsopinion');
const { fetchMiratsQuantoSurveys } = require('../integrations/miratsquanto');
const fs = require('fs').promises;
const path = require('path');
const redis = require('../../../config/redis');
const { Queue } = require('bullmq');
const { addSurveyFetchJob, surveyFetchQueue } = require('./survey.queue');
const { SurveyProvider, Survey, Panelist, PersonaAttribute, AttributeDefinition, SurveyClick } = require('../../../models');
const { Op } = require('sequelize');
const SurveyMatchingService = require('./surveyMatching.service');

const providerMapper = {
    'goweb': {
        fetchSurveys: fetchGoWebSurveys,
        fetchQualifications: fetchGoWebQualifications,
        register: registerGoWeb
    },
    'zamplia': {
        fetchSurveys: fetchZampliaSurveys,
        fetchQualifications: fetchZampliaQualifications,
        register: registerZamplia
    },
    'pollsopinion': { fetchSurveys: fetchPollsOpinionSurveys },
    'miratsquanto': { fetchSurveys: fetchMiratsQuantoSurveys }
};

// Internal Cache for all fetched surveys (Registry)
let surveyRegistry = {
    data: [],        // Filtered (Active) data for users
    full: [],        // Unfiltered (All) data from last fetch
    lastFetched: null
};
const CACHE_DURATION = 10 * 60 * 1000; // 35 minutes

/**
 * Main function to get matched surveys for a user
 */
async function getAllSurveys(panelistId, forceFetch = false) {
    try {
        if (forceFetch) {
            await refreshSurveyRegistry(true);
        }

        // 1. Get Registry from Local Memory
        const surveyRegistryData = surveyRegistry.data || [];

        if (!panelistId) return surveyRegistryData;

        // Fetch user attributes for matching
        const panelist = await Panelist.findByPk(panelistId, {
            include: [{
                model: PersonaAttribute,
                as: 'attributes',
                include: [{ model: AttributeDefinition, as: 'definition' }]
            }]
        });

        if (!panelist) return surveyRegistry.data;

        // Load all mappings for active providers
        const { SurveyAttributeMapping, SurveyOptionMapping } = require('../../../models');
        const allMappings = await SurveyAttributeMapping.findAll({
            include: [{ model: SurveyOptionMapping, as: 'optionMappings' }]
        });

        // Format mappings for fast lookup
        const formattedMappings = {};
        const providers = await SurveyProvider.findAll();
        const providerMap = providers.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});


        for (const m of allMappings) {
            const provider = providerMap[m.provider_id];
            if (!provider) continue;

            if (!formattedMappings[provider.slug]) formattedMappings[provider.slug] = {};

            const options = {};
            m.optionMappings.forEach(o => {
                options[o.internal_value] = o.provider_value;
            });

            const mappingData = { internal_key: m.internal_key, options };
            formattedMappings[provider.slug][m.provider_question_key] = mappingData;
            if (m.provider_question_id) {
                formattedMappings[provider.slug][m.provider_question_id] = mappingData;
            }
        }

        // 4. Fetch user's clicks for filtering (Already visited & Daily limit)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const recentClicks = await SurveyClick.findAll({
            where: {
                panelist_id: panelistId,
                created_at: { [Op.gte]: startOfDay }
            }
        });

        const visitedSurveyIds = new Set(recentClicks.map(c => `${c.provider_id}_${c.provider_survey_id}`));
        const dailyLimitReached = recentClicks.length >= 5;

        if (dailyLimitReached) {
            console.log(`[SurveyService] Panelist ${panelistId} has reached daily survey limit.`);
            return []; // User has hit their daily limit of 5 survey attempts/clicks
        }

        // 5. Match, Score, and Filter all surveys
        const stats = { inactive: 0, visited: 0, loiCpi: 0, total_input: surveyRegistryData.length };

        const filtered = surveyRegistryData
            .filter(survey => {
                const provider = providers.find(p => p.slug === survey.provider);

                // Filter: Check if provider is still active in DB (Immediate toggle effect)
                if (!provider || !provider.is_active) {
                    stats.inactive++;
                    return false;
                }

                // Filter: Already visited today
                if (visitedSurveyIds.has(`${provider.id}_${survey.providerSurveyId}`)) {
                    stats.visited++;
                    return false;
                }

                // Filter 1: LOI/CPI Rule (LOI > 10 and CPI < 0.4)
                const loi = parseInt(survey.raw_data.LOI || survey.raw_data.SurveyLOI || survey.duration) || 0;
                const cpi = survey.payout;
                if (loi > 10 && cpi < 0.4) {
                    stats.loiCpi++;
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

        return filtered;

    } catch (error) {
        console.error('Error in getAllSurveys:', error.message);
        throw error;
    }
}

/**
 * Initiates a survey for a panelist, generating the entry link
 */
async function initiateSurvey(panelistId, providerSlug, providerSurveyId, ipAddress = '127.0.0.1') {
    const { SurveyClick, SurveyProvider, Survey } = require('../../../models');

    try {
        if (!panelistId) {
            throw new Error('Panelist ID is required to initiate a survey');
        }

        // 1. Get Provider
        const provider = await SurveyProvider.findOne({ where: { slug: providerSlug } });
        if (!provider) throw new Error(`Provider ${providerSlug} not found`);

        // 2. Persist the survey to DB if it's in our registry (standardized payout, etc.)
        const survey = await persistSurveyOnVisit(providerSlug, providerSurveyId);

        // 3. Create a Click Record
        const click = await SurveyClick.create({
            panelist_id: panelistId,
            provider_id: provider.id,
            provider_survey_id: String(providerSurveyId),
            survey_id: survey ? survey.id : null,
            ip_address: ipAddress,
            status: 'pending'
        });

        // 4. Call Provider Registration Logic
        const mapper = providerMapper[providerSlug];
        if (!mapper || !mapper.register) {
            throw new Error(`Provider ${providerSlug} does not support registration yet.`);
        }

        const config = {
            baseUrl: provider.base_url,
            auth: provider.auth_config,
            listUrl: provider.list_url,
            qualification_url: provider.qualification_url
        };

        const entryLink = await mapper.register(config, providerSurveyId, panelistId, ipAddress, click.id);

        // 5. Update Click with generated link
        await click.update({ entry_link: entryLink });

        return {
            clickId: click.id,
            entryLink
        };

    } catch (error) {
        console.error('Error in initiateSurvey:', error); // Log full error object
        throw error;
    }
}

/**
 * Standardizes a survey object to a predefined structure
 */
function standardizeSurvey(s, providerSlug) {
    // Basic extraction with fallbacks
    return {
        provider: providerSlug || s.provider,
        providerId: s.providerId, // Ensure the DB UUID is preserved
        providerSurveyId: String(s.providerSurveyId || s.surveyID || s.SurveyId || s.SurveyID),
        title: s.title || s.projectBrief || s.Name || s.ProjectName || 'Survey Mission',
        payout: parseFloat(s.payout || s.surveyCPI || s.CPI || s.Cpi) || 0,
        duration: s.duration || (s.LOI ? `${s.LOI} mins` : 'Flexible'),
        qualifications: Array.isArray(s.qualifications) ? s.qualifications : [],
        quota: {
            required: parseInt(s.quota?.target_count || s.quota?.total_required || s.surveyTargetCount || s.TotalCompleteRequired) || 0,
            remaining: parseInt(s.quota?.remaining || s.surveyRemainingCount || s.RemainingCompleteRequired) || 0
        },
        status: s.status || 'active',
        // Preserve raw data for matching/audit but standardized everything else
        raw_data: s.raw_data || s
    };
}

/**
 * Background/Manual task to pull surveys from all providers into memory
 */
async function refreshSurveyRegistry(forceFetch = false, targetSlugs = null) {
    try {
        const lastFetched = surveyRegistry.lastFetched;
        const now = Date.now();

        if (!forceFetch && lastFetched && (now - lastFetched < CACHE_DURATION)) {
            return;
        }

        // Lock logic can remain if Redis is available, but for now we prioritize local refresh
        // Optional: Skip lock for local dev if hit with forceFetch
        if (process.env.NODE_ENV === 'production' && !forceFetch) {
            const lock = await redis.set('survey_fetch_lock', 'true', 'NX', 'PX', 30000); // 30s lock
            if (!lock) return;
        }

        const query = { where: { is_active: true } };
        if (targetSlugs && Array.isArray(targetSlugs)) {
            const { Op } = require('sequelize');
            query.where.slug = { [Op.in]: targetSlugs };
        }

        const activeProviders = await SurveyProvider.findAll(query);
        console.log(`[SurveyService] Refreshing registry for active providers: ${activeProviders.map(p => p.name).join(', ')}`);

        const fetchPromises = activeProviders.map(async (provider) => {
            const mapper = providerMapper[provider.slug];
            if (!mapper) return [];

            const config = {
                baseUrl: provider.base_url,
                auth: provider.auth_config,
                listUrl: provider.list_url,
                qualification_url: provider.qualification_url
            };

            try {
                const surveys = await mapper.fetchSurveys(config, 20);
                if (surveys.length === 0 && provider.slug === 'goweb') {
                    console.warn(`[SurveyService] GoWeb returned zero surveys. Check config:`, JSON.stringify(config.auth));
                }

                // Enrich with qualifications
                if (mapper.fetchQualifications) {
                    if (provider.slug === 'goweb') {
                        // GoWeb is per-survey qualification fetch
                        await Promise.all(surveys.map(async (s) => {
                            const rawTargeting = await mapper.fetchQualifications(config, s.providerSurveyId);

                            if (rawTargeting && Object.keys(rawTargeting).length > 0) {
                                s.qualifications = normalizeGoWebQualifications(rawTargeting);
                            } else {
                                s.qualifications = [];
                            }
                        }));
                    }
                    else {
                        // Zamplia is per-survey
                        await Promise.all(surveys.map(async (s) => {
                            const rawQuals = await mapper.fetchQualifications(config, s.providerSurveyId);

                            if (rawQuals && rawQuals.length > 0) {
                                // Standardize Zamplia quals
                                s.qualifications = rawQuals.map(q => {
                                    const allowedValues = q.AnswerCodes ? q.AnswerCodes.map(a => {
                                        // Robust extraction of the answer code/ID
                                        const code = a.AnswerCode ?? a.AnswerID ?? a.answercode ?? a.Code ?? a.Id ?? (typeof a !== 'object' ? a : null);
                                        if (code === null || code === undefined || code === 'undefined' || typeof code === 'object') return null;
                                        return String(code);
                                    }).filter(v => v !== null) : [];

                                    return {
                                        key: q.DemographicName,
                                        id: String(q.QuestionID),
                                        type: q.QuestionType === 'Radio' || q.QuestionType === 'MultiSelect' ? 'list' : 'text',
                                        allowed_values: allowedValues
                                    };
                                });
                            } else {
                                s.qualifications = [];
                            }
                        }));
                    }
                }

                return surveys.map(s => ({ ...s, providerId: provider.id }));
            } catch (providerError) {
                console.error(`[SurveyService] Failed to fetch from ${provider.slug}:`, providerError.message);
                return [];
            }
        });

        const results = await Promise.all(fetchPromises);
        // Standardize all results before saving to registry
        const flattened = results.flat();

        if (flattened.length === 0) {
            console.warn(`[SurveyService] All provider fetches returned zero results. Keeping existing registry (${surveyRegistry.full.length} items).`);
            return;
        }

        const standardizedData = flattened.map(s => standardizeSurvey(s, s.provider));

        // Update In-Memory Registry (Merge or Replace)
        if (targetSlugs && Array.isArray(targetSlugs)) {
            // MERGE: Keep existing "full" data but replace items from the targeted providers
            const targetSet = new Set(targetSlugs);
            const preservedData = surveyRegistry.full.filter(s => !targetSet.has(s.provider));
            surveyRegistry.full = [...preservedData, ...standardizedData];
        } else {
            // REPLACE ALL: Standard full refresh
            surveyRegistry.full = standardizedData;
        }

        surveyRegistry.lastFetched = Date.now();

        // Apply filtering and save to file
        await applyStateToRegistry();

        // Optional: Mirror to Redis for other instances if available, but don't depend on it
        try {
            await redis.set('survey_registry', JSON.stringify(surveyRegistry.data), 'EX', 3600);
            await redis.del('survey_fetch_lock');
        } catch (e) { }

        // Persist to file for debugging/audit
        await saveRegistryToFile();

    } catch (error) {
        console.error('Survey Service: Error refreshing registry:', error.message);
        throw error;
    }
}

/**
 * Persists a survey to the DB only when the user decides to visit/take it
 */
async function persistSurveyOnVisit(providerSlug, providerSurveyId) {
    const surveyRegistryData = surveyRegistry.data || [];

    const surveyData = surveyRegistryData.find(s =>
        s.provider === providerSlug && s.providerSurveyId === providerSurveyId
    );

    // Get Provider from DB to ensure we have the ID, especially if cache is stale
    const provider = await SurveyProvider.findOne({ where: { slug: providerSlug } });
    if (!provider) return null;

    if (!surveyData) {
        // If not in cache, check if already in DB
        return await Survey.findOne({ where: { provider_survey_id: providerSurveyId, provider_id: provider.id } });
    }

    const [survey, created] = await Survey.findOrCreate({
        where: {
            provider_id: provider.id,
            provider_survey_id: surveyData.providerSurveyId
        },
        defaults: {
            provider_id: provider.id,
            provider_survey_id: surveyData.providerSurveyId,
            title: surveyData.title,
            payout: surveyData.payout,
            qualifications: surveyData.qualifications,
            quota: surveyData.quota,
            status: 'active',
            raw_data: surveyData.raw_data
        }
    });

    return survey;
}

/**
 * Normalizes GoWeb targeting object into our qualification format
 */
function normalizeGoWebQualifications(targeting) {
    if (!targeting || typeof targeting !== 'object') return [];

    const quals = [];
    for (const [key, options] of Object.entries(targeting)) {
        if (!Array.isArray(options)) continue;

        if (key === 'age') {
            options.forEach(opt => {
                if (opt.min !== undefined && opt.max !== undefined) {
                    quals.push({
                        key: 'age',
                        type: 'range',
                        min: parseInt(opt.min),
                        max: parseInt(opt.max)
                    });
                }
            });
        } else {
            const allowedValues = options.map(opt => opt.profileAnswerKey).filter(Boolean);
            if (allowedValues.length > 0) {
                quals.push({
                    key: key,
                    type: 'list',
                    allowed_values: allowedValues
                });
            }
        }
    }
    return quals;
}

// Initial job addition logic moved to initializeSurveyService

async function initializeSurveyService() {
    // 0. Load existing cache from file to avoid starting with an empty registry
    await loadRegistryFromFile();

    // 1. Warm the cache locally/synchronously on startup if needed (or just queue it)
    await refreshSurveyRegistry(false);

    // 2. Setup repeatable job for background refresh
    if (process.env.NODE_ENV === 'production') {
        await surveyFetchQueue.add('refresh-registry', { force: false }, {
            repeat: {
                every: CACHE_DURATION
            },
            jobId: 'refresh-registry-repeat'
        });
    }
}

/**
 * Applies current provider status (is_active) to the registry without re-fetching
 */
async function applyStateToRegistry() {
    const activeProviders = await SurveyProvider.findAll({ where: { is_active: true } });
    const activeSlugs = new Set(activeProviders.map(p => p.slug));

    surveyRegistry.data = surveyRegistry.full.filter(s => activeSlugs.has(s.provider));
}

async function saveRegistryToFile() {
    try {
        const standardizedData = surveyRegistry.data;
        let matchAudit = [];

        try {
            const testPanelist = await Panelist.findOne({
                where: { first_name: 'Prod', last_name: 'Test' },
                include: [{
                    model: PersonaAttribute,
                    as: 'attributes',
                    include: [{ model: AttributeDefinition, as: 'definition' }]
                }]
            });

            if (testPanelist) {
                const { SurveyAttributeMapping, SurveyOptionMapping } = require('../../../models');
                const allMappings = await SurveyAttributeMapping.findAll({
                    include: [{ model: SurveyOptionMapping, as: 'optionMappings' }]
                });

                const providersMap = (await SurveyProvider.findAll()).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
                const formattedMappings = {};

                for (const m of allMappings) {
                    const provider = providersMap[m.provider_id];
                    if (!provider) continue;
                    if (!formattedMappings[provider.slug]) formattedMappings[provider.slug] = {};

                    const options = {};
                    m.optionMappings.forEach(o => { options[o.internal_value] = o.provider_value; });

                    const mappingData = { internal_key: m.internal_key, options };
                    formattedMappings[provider.slug][m.provider_question_key] = mappingData;
                    if (m.provider_question_id) {
                        formattedMappings[provider.slug][m.provider_question_id] = mappingData;
                    }
                }

                matchAudit = standardizedData.map(s => {
                    const result = SurveyMatchingService.match(testPanelist, s, formattedMappings);
                    return {
                        ...s,
                        auditMatch: { isMatch: result.isMatch, score: result.score, failedReasons: result.failedReasons }
                    };
                });
            }
        } catch (e) {
            console.warn('Survey Service: Match audit failed:', e.message);
        }

        const cachePath = path.join(__dirname, '../../../../survey-cache.json');
        await fs.writeFile(cachePath, JSON.stringify({
            lastFetched: surveyRegistry.lastFetched || Date.now(),
            count: surveyRegistry.data.length,
            fullCount: surveyRegistry.full.length,
            data: matchAudit.length > 0 ? matchAudit : surveyRegistry.data,
            full: surveyRegistry.full, // Persist the full unfiltered registry
            auditTimestamp: new Date().toISOString()
        }, null, 2));
    } catch (fsError) {
        console.warn('Survey Service: Failed to persist registry to file:', fsError.message);
    }
}

async function syncRegistry() {
    await applyStateToRegistry();
    await saveRegistryToFile();
}

async function loadRegistryFromFile() {
    try {
        const cachePath = path.join(__dirname, '../../../../survey-cache.json');
        const content = await fs.readFile(cachePath, 'utf8');
        const parsed = JSON.parse(content);

        if (parsed) {
            if (Array.isArray(parsed.full)) {
                surveyRegistry.full = parsed.full;
            } else if (Array.isArray(parsed.data)) {
                // Fallback for older cache format
                surveyRegistry.full = parsed.data;
            }

            if (Array.isArray(parsed.data)) {
                surveyRegistry.data = parsed.data;
            }

            surveyRegistry.lastFetched = parsed.lastFetched || Date.now();

            // Re-apply current DB state immediately to ensure 'data' is correct vs current providers
            await applyStateToRegistry();
        }
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.warn('[SurveyService] Failed to load registry from file:', error.message);
        } else {
            console.log('[SurveyService] No existing survey cache file found. Starting with empty registry.');
        }
    }
}

module.exports = {
    getAllSurveys,
    refreshSurveyRegistry,
    persistSurveyOnVisit,
    initializeSurveyService,
    initiateSurvey,
    syncRegistry,
    loadRegistryFromFile,
    surveyRegistry
};
