const { connectDB, sequelize } = require('./src/config/database');
const { AttributeDefinition, SurveyProvider, SurveyAttributeMapping } = require('./src/models');

async function addMappings() {
    await connectDB();

    // 1. Ensure Attribute Definitions Exist
    console.log('--- Checking Attribute Definitions ---');

    const newAttributes = [
        {
            key: 'job_title',
            title: 'What is your job title, level or responsibility?',
            type: 'text',
            options: null // Free text or mapped later
        },
        {
            key: 'children',
            title: 'Please indicate the age and gender of your child or children:',
            type: 'multiselect',
            options: null // Complex options, handled by provider code usually
        }
    ];

    for (const attr of newAttributes) {
        const [def, created] = await AttributeDefinition.findOrCreate({
            where: { key: attr.key },
            defaults: attr
        });
        console.log(`${attr.key}: ${created ? 'Created' : 'Already Exists'}`);
    }

    // 2. Add Provider Mappings for Zamplia
    console.log('\n--- Adding Zamplia Mappings ---');
    const zamplia = await SurveyProvider.findOne({ where: { slug: 'zamplia' } });

    if (!zamplia) {
        console.error('Zamplia provider not found!');
        process.exit(1);
    }

    const mappingsToAdd = [
        {
            internal_key: 'income',
            provider_question_key: 'STANDARD_HHI_US',
            provider_question_id: '5',
            provider_question_title: 'How much total combined income do all members of your household earn before taxes?'
        },
        {
            internal_key: 'job_title',
            provider_question_key: 'STANDARD_JOB_TITLE',
            provider_question_id: '8',
            provider_question_title: 'What is your job title, level or responsibility?'
        },
        {
            internal_key: 'children',
            provider_question_key: 'STANDARD_AGE_AND_GENDER_OF_CHILD',
            provider_question_id: '9',
            provider_question_title: 'Please indicate the age and gender of your child or children:'
        }
    ];

    for (const m of mappingsToAdd) {
        const [mapping, created] = await SurveyAttributeMapping.findOrCreate({
            where: {
                provider_id: zamplia.id,
                internal_key: m.internal_key
            },
            defaults: {
                provider_id: zamplia.id,
                internal_key: m.internal_key,
                provider_question_key: m.provider_question_key,
                provider_question_id: m.provider_question_id,
                provider_question_title: m.provider_question_title
            }
        });

        if (!created) {
            // Update if exists to ensure latest question ID/Text
            await mapping.update({
                provider_question_key: m.provider_question_key,
                provider_question_id: m.provider_question_id,
                provider_question_title: m.provider_question_title
            });
            console.log(`Updated mapping for ${m.internal_key}`);
        } else {
            console.log(`Created mapping for ${m.internal_key}`);
        }
    }

    console.log('\n--- Done ---');
    process.exit(0);
}

addMappings();
