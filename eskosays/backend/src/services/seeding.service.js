const attributeDefinitions = require('../../database/seeders/004-attribute-definitions');

/**
 * Service to handle automated database seeding
 */
const seedingService = {
    /**
     * Seeds attribute definitions if they don't exist or need updating
     */
    seedAttributeDefinitions: async () => {
        try {
            const { AttributeDefinition } = require('../models');
            let syncedCount = 0;

            for (const def of attributeDefinitions) {
                // We use upsert to ensure questions are updated if the seeder file changes
                await AttributeDefinition.upsert(def);
                syncedCount++;
            }
        } catch (error) {
            console.error('Seeding Service: Failed to seed attribute definitions:', error);
            // We don't want to crash the whole server if just seeding fails, 
            // but we should definitely log it.
        }
    },

    /**
     * Seeds initial survey providers
     */
    seedSurveyProviders: async () => {
        try {
            const { SurveyProvider } = require('../models');
            const providers = [
                {
                    name: 'GoWebSurveys',
                    slug: 'goweb',
                    auth_config: {
                        app_id: '1761',
                        app_key: 'c4nQuabgdF7S3kGVpvNUK5Xq2RfyDZzEh9we8tmrAxYTMsWCP6'
                    },
                    list_url: 'https://api.gowebsurveys.com/suppliers/v2/surveys',
                    quota_url: 'https://api.gowebsurveys.com/suppliers/v2/quotaStatus',
                    click_url: 'https://api.gowebsurveys.com/suppliers/v2/register',
                    qualification_url: 'https://api.gowebsurveys.com/suppliers/v2/getQualification',
                    base_url: 'https://api.gowebsurveys.com/suppliers/v2',
                    is_active: true
                },
                {
                    name: 'Zamplia',
                    slug: 'zamplia',
                    auth_config: {
                        app_key: 'cD8sRdIb1CP2n1Y2Pj1nQ2yFNjxefmq8',
                        app_secret: '85b41c921f7f11f0a3d0002248b38ca9tCF6'
                    },
                    list_url: 'https://surveysupply.zamplia.com/api/v1/Surveys/GetAllocatedSurveys',
                    quota_url: 'https://surveysupply.zamplia.com/api/v1/Surveys/GetSurveyQuotas',
                    click_url: 'https://surveysupply.zamplia.com/api/v1/Surveys/GenerateLink',
                    qualification_url: 'https://surveysupply.zamplia.com/api/v1/Surveys/GetSurveyQualifications',
                    base_url: 'https://surveysupply.zamplia.com/api/v1/Surveys',
                    is_active: true
                },
                {
                    name: 'PollsOpinion',
                    slug: 'pollsopinion',
                    auth_config: {
                        app_id: '88',
                        app_key: 'SRPQYVAHcxtG6de38TN5yzmvDsChaEwKWbBpMn2UFqZuX97fg4'
                    },
                    list_url: 'https://staging.pollsopinion.com/suppliers/v2/surveys',
                    quota_url: 'https://staging.pollsopinion.com/suppliers/v2/quotaStatus',
                    click_url: 'https://staging.pollsopinion.com/suppliers/v2/register',
                    base_url: 'https://staging.pollsopinion.com/suppliers/v2',
                    is_active: false
                },
                {
                    name: 'MiratsQuanto',
                    slug: 'miratsquanto',
                    auth_config: {
                        app_key: 'WqYS55gRneaCHdhrcyM8P9QN0ySKy6SLLnj',
                        app_secret: '0EAU42LnX7NhclHCPTp2UnWMRrDvxUHgz0ysszHA'
                    },
                    list_url: 'https://api.publisher.miratsquanto.com/api/v1/publisher/surveys',
                    quota_url: 'https://api.publisher.miratsquanto.com/api/v1/publisher/surveys/{surveyNumber}/qualification',
                    click_url: 'https://api.publisher.miratsquanto.com/api/v1/publisher/surveys/{surveyNumber}/link',
                    base_url: 'https://api.publisher.miratsquanto.com/api/v1/publisher',
                    is_active: false
                }
            ];

            for (const provider of providers) {
                // Use update instead of defaults to ensure existing records get the new URLs and Keys
                const [instance, created] = await SurveyProvider.findOrCreate({
                    where: { slug: provider.slug },
                    defaults: provider
                });

                if (!created) {
                    await instance.update(provider);
                }
            }
        } catch (error) {
            console.error('Seeding Service: Failed to seed survey providers:', error);
        }
    },
    /**
     * Seeds initial mappings for survey attributes and options
     */
    seedSurveyMappings: async () => {
        try {
            const { SurveyProvider, SurveyAttributeMapping, SurveyOptionMapping } = require('../models');

            const goweb = await SurveyProvider.findOne({ where: { slug: 'goweb' } });
            const zamplia = await SurveyProvider.findOne({ where: { slug: 'zamplia' } });

            if (!goweb || !zamplia) {
                console.warn('Seeding Service: Skipping mappings, providers not found');
                return;
            }

            const mappings = [
                // GoWeb Mappings
                {
                    provider_id: goweb.id,
                    internal_key: 'gender',
                    provider_question_key: 'gender',
                    options: [
                        { internal_value: 'Male', provider_value: 'gender_001' },
                        { internal_value: 'Female', provider_value: 'gender_002' }
                    ]
                },
                {
                    provider_id: goweb.id,
                    internal_key: 'age',
                    provider_question_key: 'age',
                    options: [] // Managed by range logic
                },
                {
                    provider_id: goweb.id,
                    internal_key: 'zip_code',
                    provider_question_key: 'zip_code',
                    options: []
                },
                {
                    provider_id: goweb.id,
                    internal_key: 'marital_status',
                    provider_question_key: 'marital_status',
                    options: [
                        { internal_value: 'Single', provider_value: 'marital_status_001' },
                        { internal_value: 'Married', provider_value: 'marital_status_002' },
                        { internal_value: 'Divorced', provider_value: 'marital_status_003' },
                        { internal_value: 'Widowed', provider_value: 'marital_status_004' },
                        { internal_value: 'Separated', provider_value: 'marital_status_005' }
                    ]
                },
                {
                    provider_id: goweb.id,
                    internal_key: 'income',
                    provider_question_key: 'annual_hhi',
                    options: [
                        { internal_value: 'Under $25,000', provider_value: 'annual_hhi_002330' },
                        { internal_value: '$25,000 - $49,999', provider_value: 'annual_hhi_002334' },
                        { internal_value: '$50,000 - $74,999', provider_value: 'annual_hhi_002338' },
                        { internal_value: '$75,000 - $99,999', provider_value: 'annual_hhi_002343' },
                        { internal_value: '$100,000 - $149,999', provider_value: 'annual_hhi_002348' },
                        { internal_value: '$150,000+', provider_value: 'annual_hhi_002353' }
                    ]
                },
                {
                    provider_id: goweb.id,
                    internal_key: 'mobilephone_user',
                    provider_question_key: 'mobilephone_user',
                    options: [
                        { internal_value: 'Yes', provider_value: 'mobilephone_user_00833' },
                        { internal_value: 'No', provider_value: 'mobilephone_user_00834' }
                    ]
                },
                {
                    provider_id: goweb.id,
                    internal_key: 'cell_type',
                    provider_question_key: 'cell_type',
                    options: [
                        { internal_value: 'Smart Phone', provider_value: 'cell_type_003287' }
                    ]
                },
                // Zamplia Mappings
                {
                    provider_id: zamplia.id,
                    internal_key: 'gender',
                    provider_question_key: 'Gender',
                    provider_question_id: '1',
                    options: [
                        { internal_value: 'Male', provider_value: '1' },
                        { internal_value: 'Female', provider_value: '2' }
                    ]
                },
                {
                    provider_id: zamplia.id,
                    internal_key: 'age',
                    provider_question_key: 'Age',
                    provider_question_id: '29',
                    options: []
                },
                {
                    provider_id: zamplia.id,
                    internal_key: 'zip_code',
                    provider_question_key: 'Zip Code',
                    provider_question_id: '2',
                    options: []
                },
                {
                    provider_id: zamplia.id,
                    internal_key: 'ethnicity',
                    provider_question_key: 'STANDARD_HISPANIC',
                    provider_question_id: '3',
                    options: [
                        { internal_value: 'No', provider_value: '3' },
                        { internal_value: 'Yes', provider_value: '4' } // Fallback to Mexican/Chicano as default Yes for now
                    ]
                },
                {
                    provider_id: zamplia.id,
                    internal_key: 'race',
                    provider_question_key: 'Race',
                    provider_question_id: '4',
                    options: [
                        { internal_value: 'White', provider_value: '18' },
                        { internal_value: 'Black/African American', provider_value: '19' },
                        { internal_value: 'Asian', provider_value: '21' }
                    ]
                }
            ];

            for (const m of mappings) {
                // Try to find by internal key first
                let attrMap = await SurveyAttributeMapping.findOne({
                    where: {
                        provider_id: m.provider_id,
                        internal_key: m.internal_key
                    }
                });

                // If not found, try to find by provider question key 
                // (in case it was previously seeded with a different internal_key)
                if (!attrMap) {
                    attrMap = await SurveyAttributeMapping.findOne({
                        where: {
                            provider_id: m.provider_id,
                            provider_question_key: m.provider_question_key
                        }
                    });
                }

                if (!attrMap) {
                    attrMap = await SurveyAttributeMapping.create({
                        provider_id: m.provider_id,
                        internal_key: m.internal_key,
                        provider_question_key: m.provider_question_key,
                        provider_question_id: m.provider_question_id
                    });
                } else {
                    // Update existing record to match our new standard keys and IDs
                    await attrMap.update({
                        internal_key: m.internal_key, // Reconcile internal_key
                        provider_question_key: m.provider_question_key,
                        provider_question_id: m.provider_question_id
                    });
                }

                for (const opt of m.options) {
                    const existingOpt = await SurveyOptionMapping.findOne({
                        where: {
                            attribute_mapping_id: attrMap.id,
                            internal_value: opt.internal_value
                        }
                    });

                    if (!existingOpt) {
                        try {
                            await SurveyOptionMapping.create({
                                attribute_mapping_id: attrMap.id,
                                internal_value: opt.internal_value,
                                provider_value: opt.provider_value
                            });
                        } catch (optError) {
                            // Skip if mapping already exists
                        }
                    } else {
                        await existingOpt.update({
                            provider_value: opt.provider_value
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Seeding Service: Failed to seed survey mappings:', error);
        }
    },
    seedTestPanelist: async () => {
        try {
            const { User, Panelist, PersonaAttribute, AttributeDefinition } = require('../models');

            const [user] = await User.findOrCreate({
                where: { email: 'prod-test@eskosays.com' },
                defaults: {
                    password_hash: '$2b$10$n.86vY9x4qJ9P.mS9mI0u.G.mI0u.G.mI0u.G.mI0u.G.mI0u.G', // valid dummy hash
                    role: 'panelist',
                    email_verified: true
                }
            });

            const [panelist] = await Panelist.findOrCreate({
                where: { user_id: user.id },
                defaults: {
                    first_name: 'Prod',
                    last_name: 'Test'
                }
            });

            const defs = await AttributeDefinition.findAll();
            const defMap = defs.reduce((acc, d) => ({ ...acc, [d.key]: d.id }), {});

            const testAttributes = [
                { key: 'gender', value: 'Male' },
                { key: 'age', value: '25' },
                { key: 'zip_code', value: '10001' },
                { key: 'marital_status', value: 'Married' },
                { key: 'income', value: '$75,000 - $99,999' },
                { key: 'ethnicity', value: 'No' },
                { key: 'race', value: 'White' }
            ];

            for (const attr of testAttributes) {
                const defId = defMap[attr.key];
                if (defId) {
                    await PersonaAttribute.upsert({
                        panelist_id: panelist.id,
                        attribute_id: defId,
                        value: attr.value
                    });
                }
            }
        } catch (error) {
            console.error('Seeding Service: Failed to seed test panelist:', error);
        }
    }
};

module.exports = seedingService;
