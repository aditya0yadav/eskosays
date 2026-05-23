const { AttributeDefinition, PersonaAttribute } = require('../../../models');

/**
 * Get all available profile questions
 */
const getProfileQuestions = async () => {
    return await AttributeDefinition.findAll({
        order: [['created_at', 'ASC']]
    });
};

/**
 * Get profile responses for a specific panelist
 * @param {string} panelistId 
 */
const getPanelistProfile = async (panelistId) => {
    return await PersonaAttribute.findAll({
        where: { panelist_id: panelistId },
        include: [
            {
                model: AttributeDefinition,
                as: 'definition',
                attributes: ['key', 'title', 'type', 'options']
            }
        ]
    });
};

/**
 * Update or create profile responses for a panelist
 * @param {string} panelistId 
 * @param {Object} responses - Object mapping attribute keys to values
 */
const updatePanelistProfile = async (panelistId, responses) => {
    const results = [];

    for (const [key, value] of Object.entries(responses)) {
        // Find the attribute definition by key
        const definition = await AttributeDefinition.findOne({ where: { key } });

        if (definition) {
            const [attribute, created] = await PersonaAttribute.upsert({
                panelist_id: panelistId,
                attribute_id: definition.id,
                value: value,
                confidence_score: 1.0 // Default confidence for user-provided data
            });
            results.push(attribute);
        }
    }

    return results;
};

module.exports = {
    getProfileQuestions,
    getPanelistProfile,
    updatePanelistProfile
};
