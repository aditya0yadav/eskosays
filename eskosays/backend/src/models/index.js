const User = require('./auth/User.model');
const Blog = require('./blog/Blog.model');
const RefreshToken = require('./auth/RefreshToken.model');
const DeviceFingerprint = require('./auth/DeviceFingerprint.model');
const Panelist = require('./panel/Panelist.model');
const PanelistStatusHistory = require('./panel/PanelistStatus.model');
const AttributeDefinition = require('./persona/AttributeDefinition.model');
const AttributeCategory = require('./persona/AttributeCategory.model');
const PersonaAttribute = require('./persona/PersonaAttribute.model');
const Survey = require('./survey/Survey.model');
const SurveyProvider = require('./survey/SurveyProvider.model');
const SurveyAttributeMapping = require('./survey/SurveyAttributeMapping.model');
const SurveyOptionMapping = require('./survey/SurveyOptionMapping.model');
const SurveyClick = require('./survey/SurveyClick.model');
const SurveyCompletion = require('./survey/SurveyCompletion.model');

// User <-> Panelist
User.hasOne(Panelist, { foreignKey: 'user_id', as: 'panelist' });
Panelist.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User <-> RefreshToken
User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User <-> DeviceFingerprint
User.hasMany(DeviceFingerprint, { foreignKey: 'user_id', as: 'devices' });
DeviceFingerprint.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Panelist <-> PanelistStatusHistory
Panelist.hasMany(PanelistStatusHistory, { foreignKey: 'panelist_id', as: 'statusHistory' });
PanelistStatusHistory.belongsTo(Panelist, { foreignKey: 'panelist_id', as: 'panelist' });

// User (Admin) <-> PanelistStatusHistory (Change Log)
User.hasMany(PanelistStatusHistory, { foreignKey: 'changed_by', as: 'statusChanges' });
PanelistStatusHistory.belongsTo(User, { foreignKey: 'changed_by', as: 'admin' });

// Panelist <-> PersonaAttribute
Panelist.hasMany(PersonaAttribute, { foreignKey: 'panelist_id', as: 'attributes' });
PersonaAttribute.belongsTo(Panelist, { foreignKey: 'panelist_id', as: 'panelist' });

// AttributeDefinition <-> PersonaAttribute
AttributeDefinition.hasMany(PersonaAttribute, { foreignKey: 'attribute_id', as: 'userAnswers' });
PersonaAttribute.belongsTo(AttributeDefinition, { foreignKey: 'attribute_id', as: 'definition' });

// AttributeCategory <-> AttributeDefinition
AttributeCategory.hasMany(AttributeDefinition, { foreignKey: 'category_id', as: 'definitions' });
AttributeDefinition.belongsTo(AttributeCategory, { foreignKey: 'category_id', as: 'category' });

// Survey <-> SurveyProvider
SurveyProvider.hasMany(Survey, { foreignKey: 'provider_id', as: 'surveys' });
Survey.belongsTo(SurveyProvider, { foreignKey: 'provider_id', as: 'provider' });

// SurveyProvider <-> SurveyAttributeMapping
SurveyProvider.hasMany(SurveyAttributeMapping, { foreignKey: 'provider_id', as: 'attributeMappings' });
SurveyAttributeMapping.belongsTo(SurveyProvider, { foreignKey: 'provider_id', as: 'provider' });

SurveyAttributeMapping.hasMany(SurveyOptionMapping, { foreignKey: 'attribute_mapping_id', as: 'optionMappings' });
SurveyOptionMapping.belongsTo(SurveyAttributeMapping, { foreignKey: 'attribute_mapping_id', as: 'attributeMapping' });

// Survey Clicks & Completions
Panelist.hasMany(SurveyClick, { foreignKey: 'panelist_id', as: 'clicks' });
SurveyClick.belongsTo(Panelist, { foreignKey: 'panelist_id', as: 'panelist' });

SurveyProvider.hasMany(SurveyClick, { foreignKey: 'provider_id', as: 'clicks' });
SurveyClick.belongsTo(SurveyProvider, { foreignKey: 'provider_id', as: 'provider' });

Survey.hasMany(SurveyClick, { foreignKey: 'survey_id', as: 'clicks' });
SurveyClick.belongsTo(Survey, { foreignKey: 'survey_id', as: 'survey' });

SurveyClick.hasOne(SurveyCompletion, { foreignKey: 'click_id', as: 'completion' });
SurveyCompletion.belongsTo(SurveyClick, { foreignKey: 'click_id', as: 'click' });

Panelist.hasMany(SurveyCompletion, { foreignKey: 'panelist_id', as: 'completions' });
SurveyCompletion.belongsTo(Panelist, { foreignKey: 'panelist_id', as: 'panelist' });

Survey.hasMany(SurveyCompletion, { foreignKey: 'survey_id', as: 'completions' });
SurveyCompletion.belongsTo(Survey, { foreignKey: 'survey_id', as: 'survey' });

// Export all models
module.exports = {
    User,
    Panelist,
    RefreshToken,
    DeviceFingerprint,
    PanelistStatusHistory,
    AttributeDefinition,
    AttributeCategory,
    PersonaAttribute,
    Survey,
    SurveyProvider,
    SurveyAttributeMapping,
    SurveyOptionMapping,
    SurveyClick,
    SurveyCompletion,
    Blog
};
