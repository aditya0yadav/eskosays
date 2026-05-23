const personaService = require('../services/persona.service');
const { Panelist } = require('../../../models');

/**
 * Controller to get all profile questions
 */
const getQuestions = async (req, res) => {
    try {
        const questions = await personaService.getProfileQuestions();

        res.status(200).json({
            success: true,
            data: questions
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile questions'
        });
    }
};

/**
 * Controller to get authenticated user's profile responses
 */
const getProfile = async (req, res) => {
    try {
        // Find panelist associated with the user
        const panelist = await Panelist.findOne({ where: { user_id: req.user.id } });

        if (!panelist) {
            return res.status(404).json({
                success: false,
                message: 'Panelist profile not found'
            });
        }

        const profile = await personaService.getPanelistProfile(panelist.id);
        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile data'
        });
    }
};

/**
 * Controller to update authenticated user's profile responses
 */
const updateProfile = async (req, res) => {
    try {
        const { responses } = req.body;

        if (!responses || typeof responses !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Invalid responses provided'
            });
        }

        const panelist = await Panelist.findOne({ where: { user_id: req.user.id } });

        if (!panelist) {
            return res.status(404).json({
                success: false,
                message: 'Panelist profile not found'
            });
        }

        const updatedProfile = await personaService.updatePanelistProfile(panelist.id, responses);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedProfile
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile data'
        });
    }
};

module.exports = {
    getQuestions,
    getProfile,
    updateProfile
};
