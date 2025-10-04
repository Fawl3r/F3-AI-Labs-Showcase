/**
 * MessageHandler - Advanced AI response system with context-aware intelligence
 * Demonstrates: AI integration, context detection, rate limiting, error handling
 * 
 * Key Features:
 * - OpenAI API integration with intelligent prompting
 * - Context-aware response generation
 * - Rate limiting and user management
 * - Comprehensive error handling and fallbacks
 */

class MessageHandler {
    constructor(config, rateLimitManager, embedManager) {
        this.config = config;
        this.rateLimitManager = rateLimitManager;
        this.embedManager = embedManager;
        this.openai = null;
    }

    /**
     * Initialize OpenAI client with error handling
     * @param {string} apiKey - OpenAI API key
     */
    initializeOpenAI(apiKey) {
        try {
            const { OpenAI } = require('openai');
            this.openai = new OpenAI({ apiKey });
            console.log('✅ OpenAI client initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize OpenAI client:', error);
        }
    }

    /**
     * Handle AI response with comprehensive error handling
     * @param {Object} message - Discord message object
     * @returns {Object} - Response result with success status
     */
    async handleAIResponse(message) {
        try {
            if (!this.openai) {
                return {
                    success: false,
                    reason: 'OpenAI API key not configured'
                };
            }

            if (!message.guild) {
                return {
                    success: false,
                    reason: 'AI responses only available in servers'
                };
            }

            // Check rate limiting
            const rateLimitResult = this.rateLimitManager.processMessage(
                message.author.id,
                message.content
            );

            if (rateLimitResult.shouldRateLimit) {
                const embed = this.embedManager.createErrorEmbed(
                    'Rate Limited',
                    `Please wait ${Math.ceil(rateLimitResult.remainingCooldown / 1000)} seconds before asking again.`
                );

                await message.reply({ embeds: [embed] });
                return {
                    success: false,
                    reason: rateLimitResult.reason
                };
            }

            // Generate AI response
            const response = await this.generateAIResponse(message);

            if (response.success) {
                // Split long responses for Discord limits
                const chunks = this.splitResponse(response.content);
                
                for (let i = 0; i < chunks.length; i++) {
                    if (i === 0) {
                        await message.reply(chunks[i]);
                    } else {
                        await message.channel.send(chunks[i]);
                    }
                }

                return { success: true };
            } else {
                await message.reply('❌ Sorry, I encountered an error processing your request.');
                return { success: false, reason: response.reason };
            }

        } catch (error) {
            console.error('AI response error:', error);
            return {
                success: false,
                reason: `AI response failed: ${error.message}`
            };
        }
    }

    /**
     * Generate AI response with context-aware intelligence
     * @param {Object} message - Discord message object
     * @returns {Object} - Response result with success status and content
     */
    async generateAIResponse(message) {
        try {
            const systemPrompt = this.getSystemPrompt();
            const userMessage = message.content.replace(/<@\d+>/g, '').trim();

            // Import knowledge base for context
            const kb = require('../bot-data/kb');
            
            // Intelligent context detection
            let contextInfo = '';
            const lowerMessage = userMessage.toLowerCase();
            
            if (lowerMessage.includes('zenthink') && (lowerMessage.includes('website') || lowerMessage.includes('site'))) {
                contextInfo = `\n\nRELEVANT CONTEXT: ${kb.R('zenthink_website')}`;
            } else if (lowerMessage.includes('pump') && (lowerMessage.includes('website') || lowerMessage.includes('site'))) {
                contextInfo = `\n\nRELEVANT CONTEXT: ${kb.R('pump_website')}`;
            } else if (lowerMessage.includes('zenthink') || lowerMessage.includes('zen think')) {
                contextInfo = `\n\nRELEVANT CONTEXT: ${kb.R('zenthink_overview')}`;
            } else if (lowerMessage.includes('parlay') || lowerMessage.includes('sports')) {
                contextInfo = `\n\nRELEVANT CONTEXT: ${kb.R('parlay_overview')}`;
            } else if (lowerMessage.includes('pump') || lowerMessage.includes('pill') || lowerMessage.includes('arena')) {
                contextInfo = `\n\nRELEVANT CONTEXT: ${kb.R('pump_overview')}`;
            } else if (lowerMessage.includes('trading') || lowerMessage.includes('bot')) {
                contextInfo = `\n\nRELEVANT CONTEXT: ${kb.R('trading_overview')}`;
            } else if (lowerMessage.includes('status') || lowerMessage.includes('update')) {
                contextInfo = `\n\nRELEVANT CONTEXT: ${kb.R('weekly_update_global')}`;
            }

            const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

            // Prepare request parameters
            const requestParams = {
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt + contextInfo
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                max_completion_tokens: 500,
                temperature: 0.7
            };

            const completion = await this.openai.chat.completions.create(requestParams);
            const content = completion.choices[0]?.message?.content;

            if (!content) {
                return {
                    success: false,
                    reason: 'No response generated from AI'
                };
            }

            return {
                success: true,
                content: content
            };

        } catch (error) {
            console.error('OpenAI API error:', error);
            return {
                success: false,
                reason: `OpenAI API error: ${error.message}`
            };
        }
    }

    /**
     * Get system prompt with knowledge base integration
     * @returns {string} - System prompt
     */
    getSystemPrompt() {
        const kb = require('../bot-data/kb');
        
        return kb.SYS() || process.env.AI_PERSONALITY || `You are F3 AI Labs Assistant, a helpful AI assistant specializing in our products and services.

HARD RULES:
- Only discuss F3 AI Labs, our products (ZenThink AI, F3 Parlay AI, F3 Trading Bot, Pump Pill Arena)
- Always use the correct URLs from the links section
- F3 Parlay AI and F3 Trading Bot are still in development and do not have websites yet
- When users ask for a specific website, ONLY provide that specific website
- Never invent facts: only use data in this bundle
- Always professional, helpful, and focused on promoting F3 AI Labs

Your personality: Professional, knowledgeable, and focused on helping users understand and use F3 AI Labs products effectively.`;
    }

    /**
     * Split long response into chunks for Discord message limits
     * @param {string} response - AI response text
     * @returns {Array} - Array of message chunks
     */
    splitResponse(response) {
        const maxLength = 2000; // Discord message limit
        const chunks = [];

        if (response.length <= maxLength) {
            chunks.push(response);
            return chunks;
        }

        // Split by sentences or at word boundaries
        const sentences = response.split(/[.!?]+/);
        let currentChunk = '';

        for (const sentence of sentences) {
            const trimmedSentence = sentence.trim();
            if (!trimmedSentence) continue;

            const potentialChunk = currentChunk + trimmedSentence + '. ';

            if (potentialChunk.length > maxLength && currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = trimmedSentence + '. ';
            } else {
                currentChunk = potentialChunk;
            }
        }

        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }

    /**
     * Check if message should trigger AI response
     * @param {Object} message - Discord message object
     * @param {Object} client - Discord client object
     * @returns {boolean} - True if AI should respond
     */
    shouldRespondToMessage(message, client) {
        if (!this.openai) return false;
        if (message.author.bot) return false;
        if (!message.guild) return false;

        // Respond to mentions or help requests
        return this.isBotMentioned(message, client) ||
               message.content.toLowerCase().includes('help') ||
               message.content.toLowerCase().includes('ai');
    }

    /**
     * Check if message mentions the bot
     * @param {Object} message - Discord message object
     * @param {Object} client - Discord client object
     * @returns {boolean} - True if message mentions the bot
     */
    isBotMentioned(message, client) {
        return message.mentions.users.has(client.user.id);
    }
}

module.exports = MessageHandler;
