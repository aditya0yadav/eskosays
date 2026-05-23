const {
    SurveyProvider,
    AttributeDefinition,
    SurveyAttributeMapping,
    SurveyOptionMapping
} = require('../../../models');

const mappingController = {
    // Get all initial data for the mapping UI
    async getInitialData(req, res) {
        try {
            const [providers, attributes] = await Promise.all([
                SurveyProvider.findAll({
                    attributes: ['id', 'name', 'slug']
                }),
                AttributeDefinition.findAll({
                    attributes: ['id', 'key', 'title', 'type', 'options']
                })
            ]);

            return res.json({
                success: true,
                data: {
                    providers,
                    attributes
                }
            });
        } catch (error) {
            console.error('Error fetching initial mapping data:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch initial data'
            });
        }
    },

    // Get mappings for a specific provider
    async getProviderMappings(req, res) {
        try {
            const { providerId } = req.params;

            const mappings = await SurveyAttributeMapping.findAll({
                where: { provider_id: providerId },
                include: [{
                    model: SurveyOptionMapping,
                    as: 'optionMappings'
                }]
            });

            return res.json({
                success: true,
                data: mappings
            });
        } catch (error) {
            console.error('Error fetching provider mappings:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch mappings'
            });
        }
    },

    // Create or update an attribute mapping
    async saveAttributeMapping(req, res) {
        try {
            const { provider_id, internal_key, provider_question_key, provider_question_id, provider_question_title } = req.body;

            if (!provider_id || !internal_key || !provider_question_key) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }

            // Check if mapping exists
            let mapping = await SurveyAttributeMapping.findOne({
                where: {
                    provider_id,
                    internal_key
                }
            });

            if (mapping) {
                // Update existing
                mapping = await mapping.update({
                    provider_question_key,
                    provider_question_id,
                    provider_question_title
                });
            } else {
                // Create new
                mapping = await SurveyAttributeMapping.create({
                    provider_id,
                    internal_key,
                    provider_question_key,
                    provider_question_id,
                    provider_question_title
                });
            }

            return res.json({
                success: true,
                message: 'Attribute mapping saved successfully',
                data: mapping
            });
        } catch (error) {
            console.error('Error saving attribute mapping:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to save attribute mapping'
            });
        }
    },

    // Create or update an option mapping
    async saveOptionMapping(req, res) {
        try {
            const { attribute_mapping_id, internal_value, provider_value, provider_option_text } = req.body;

            if (!attribute_mapping_id || internal_value === undefined || provider_value === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }

            // Check if mapping exists
            let mapping = await SurveyOptionMapping.findOne({
                where: {
                    attribute_mapping_id,
                    internal_value: String(internal_value) // Ensure string comparison
                }
            });

            if (mapping) {
                // Update existing
                mapping = await mapping.update({
                    provider_value: String(provider_value),
                    provider_option_text
                });
            } else {
                // Create new
                mapping = await SurveyOptionMapping.create({
                    attribute_mapping_id,
                    internal_value: String(internal_value),
                    provider_value: String(provider_value),
                    provider_option_text
                });
            }

            return res.json({
                success: true,
                message: 'Option mapping saved successfully',
                data: mapping
            });
        } catch (error) {
            console.error('Error saving option mapping:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to save option mapping'
            });
        }
    }
};

module.exports = mappingController;
