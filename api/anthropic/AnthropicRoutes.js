const anthropicController = require('./AnthropicController.js');
const { requireAuth } = require('../../services/utilitis.js');

module.exports.connectAnthropicRoutes = (app) => {
    const endPoint = 'api/anthropic';
    app.post(`/${endPoint}/ai-search`, anthropicController.aiSearch)
    app.post(`/${endPoint}/chat`, requireAuth, anthropicController.chatMusic)
}