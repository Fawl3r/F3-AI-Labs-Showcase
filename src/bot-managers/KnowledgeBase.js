/**
 * KnowledgeBase - Advanced knowledge management system with hot-reload capabilities
 * Demonstrates: Singleton pattern, file watching, JSON processing, error handling
 * 
 * Key Features:
 * - Hot-reload functionality for real-time updates
 * - Link interpolation for dynamic content
 * - Comprehensive error handling
 * - Performance optimization with caching
 */

const fs = require('fs');
const path = require('path');

class KnowledgeBase {
    constructor() {
        this.bundle = null;
        this.bundlePath = path.join(__dirname, '../bot-data/knowledge_bundle.json');
        this.lastModified = null;
        this.loadBundle();
        this.startHotReload();
    }

    /**
     * Load knowledge bundle with comprehensive error handling
     * @returns {void}
     */
    loadBundle() {
        try {
            const bundleData = fs.readFileSync(this.bundlePath, 'utf-8');
            this.bundle = JSON.parse(bundleData);
            
            // Process dynamic link interpolation
            this.interpolateLinks();
            
            console.log('✅ Knowledge bundle loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load knowledge bundle:', error);
            throw new Error(`Knowledge base initialization failed: ${error.message}`);
        }
    }

    /**
     * Replace link placeholders with actual URLs
     * Demonstrates: String manipulation, regex, dynamic content processing
     */
    interpolateLinks() {
        if (!this.bundle?.responses) return;

        const linkify = (text) => {
            return text.replace(/\{links\.([a-z_]+)\}/g, (match, key) => {
                return this.bundle.links?.[key] || match;
            });
        };

        // Process all response strings efficiently
        Object.keys(this.bundle.responses).forEach(key => {
            const value = this.bundle.responses[key];
            if (typeof value === 'string') {
                this.bundle.responses[key] = linkify(value);
            }
        });
    }

    /**
     * Hot-reload system for real-time updates
     * Demonstrates: File system monitoring, performance optimization
     */
    startHotReload() {
        setInterval(() => {
            try {
                const stats = fs.statSync(this.bundlePath);
                const lastModified = stats.mtime.getTime();

                if (!this.lastModified || lastModified > this.lastModified) {
                    console.log('🔄 Hot-reloading knowledge bundle...');
                    this.loadBundle();
                    this.lastModified = lastModified;
                }
            } catch (error) {
                console.error('Error during hot-reload check:', error);
            }
        }, 15 * 60 * 1000); // 15 minutes

        // Initialize modification time
        try {
            const stats = fs.statSync(this.bundlePath);
            this.lastModified = stats.mtime.getTime();
        } catch (error) {
            console.error('Error getting initial file stats:', error);
        }
    }

    /**
     * Get response by key with validation
     * @param {string} key - Response key
     * @returns {string} - Response text or empty string
     */
    getResponse(key) {
        if (!key || typeof key !== 'string') {
            console.warn('Invalid response key provided:', key);
            return '';
        }

        const response = this.bundle?.responses?.[key] || '';
        console.log(`Getting response for key: ${key}, length: ${response.length}`);
        return response;
    }

    /**
     * Get system prompt for AI responses
     * @returns {string} - System prompt text
     */
    getSystemPrompt() {
        return this.bundle?.system_prompt || '';
    }

    /**
     * Get command response with concatenation
     * @param {string} command - Command name
     * @returns {string} - Concatenated response
     */
    getCommandResponse(command) {
        console.log(`Getting command response for: ${command}`);
        const commandsMap = this.getCommandsMap();
        const responseKeys = commandsMap[command];

        if (!responseKeys || !Array.isArray(responseKeys)) {
            console.log(`No response keys found for command: ${command}`);
            return '';
        }

        const responses = responseKeys
            .map(key => this.getResponse(key))
            .filter(Boolean);
        
        const result = responses.join('\n\n');
        console.log(`Final response length: ${result.length}`);
        return result;
    }

    /**
     * Get commands mapping
     * @returns {Object} - Commands mapping
     */
    getCommandsMap() {
        return this.bundle?.commands_map || {};
    }

    /**
     * Get priority products
     * @returns {Array} - Array of priority product names
     */
    getPriorityProducts() {
        return this.bundle?.meta?.priority_products || [];
    }

    /**
     * Get all available links
     * @returns {Object} - Links object
     */
    getLinks() {
        return this.bundle?.links || {};
    }

    /**
     * Check if bundle is loaded
     * @returns {boolean} - True if bundle is loaded
     */
    isLoaded() {
        return this.bundle !== null;
    }

    /**
     * Get all available response keys
     * @returns {Array} - Array of response keys
     */
    getAvailableResponses() {
        return Object.keys(this.bundle?.responses || {});
    }
}

// Singleton pattern implementation
const knowledgeBase = new KnowledgeBase();

module.exports = {
    kb: knowledgeBase,
    R: (key) => knowledgeBase.getResponse(key),
    SYS: () => knowledgeBase.getSystemPrompt(),
    loadBundle: () => knowledgeBase.loadBundle(),
    getPriorityProducts: () => knowledgeBase.getPriorityProducts(),
    getLinks: () => knowledgeBase.getLinks(),
    getCommandResponse: (command) => knowledgeBase.getCommandResponse(command),
    getAvailableResponses: () => knowledgeBase.getAvailableResponses(),
    isLoaded: () => knowledgeBase.isLoaded()
};
