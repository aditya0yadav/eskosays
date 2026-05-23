const { SurveyAttributeMapping, SurveyOptionMapping, SurveyProvider } = require('../../../models');

/**
 * Service to handle mapping between internal attributes and provider-specific keys/values
 */
const MappingService = {
    /**
     * Translates an internal attribute key and value to provider-specific ones
     * @param {string} providerSlug - Slug of the provider (e.g., 'goweb')
     * @param {string} internalKey - Internal attribute key (e.g., 'gender')
     * @param {any} internalValue - Internal value (e.g., 'Male')
     * @returns {Object|null} { providerKey, providerValue } or null if no mapping exists
     */
    async mapInternalToProvider(providerSlug, internalKey, internalValue) {
        try {
            const provider = await SurveyProvider.findOne({ where: { slug: providerSlug } });
            if (!provider) return null;

            const attrMapping = await SurveyAttributeMapping.findOne({
                where: {
                    provider_id: provider.id,
                    internal_key: internalKey
                }
            });

            if (!attrMapping) return null;

            // If it's a simple value (like age or zip) and no option mappings exist, return the raw value
            const optionMapping = await SurveyOptionMapping.findOne({
                where: {
                    attribute_mapping_id: attrMapping.id,
                    internal_value: String(internalValue)
                }
            });

            return {
                providerKey: attrMapping.provider_question_key,
                providerValue: optionMapping ? optionMapping.provider_value : internalValue
            };
        } catch (error) {
            console.error(`Mapping Service: Failed to map ${internalKey} for ${providerSlug}:`, error.message);
            return null;
        }
    },

    /**
     * Reverse lookup: Finds which internal key maps to a provider's question key
     */
    async mapProviderToInternalKey(providerSlug, providerQuestionKey) {
        const provider = await SurveyProvider.findOne({ where: { slug: providerSlug } });
        if (!provider) return null;

        const attrMapping = await SurveyAttributeMapping.findOne({
            where: {
                provider_id: provider.id,
                provider_question_key: providerQuestionKey
            }
        });

        return attrMapping ? attrMapping.internal_key : null;
    }
};

module.exports = MappingService;
