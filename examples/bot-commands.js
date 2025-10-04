/**
 * Bot Commands Examples
 * Demonstrates: Command handling, error management, response formatting
 * 
 * This file showcases various command implementations and patterns
 * used in the F3 AI Labs Discord Bot system.
 */

const { EmbedBuilder } = require('discord.js');

/**
 * Example: About Command Handler
 * Demonstrates: Knowledge base integration, response formatting
 */
async function handleAboutCommand(message) {
    try {
        console.log('Handling about command, getting response from KB...');
        
        // Get response from knowledge base
        const kb = require('../src/bot-data/kb');
        const response = kb.getCommandResponse('about');
        
        console.log('About response length:', response.length);
        
        if (!response) {
            await message.reply('❌ Unable to load company information at this time.');
            return { success: false, reason: 'No response available' };
        }

        // Send response
        await message.reply(response);
        return { success: true };
        
    } catch (error) {
        console.error('Error in about command:', error);
        await message.reply('❌ An error occurred while processing your request.');
        return { success: false, reason: error.message };
    }
}

/**
 * Example: ZenThink Command Handler
 * Demonstrates: Product-specific responses, error handling
 */
async function handleZenThinkCommand(message) {
    try {
        console.log('Handling ZenThink command, getting response from KB...');
        
        const kb = require('../src/bot-data/kb');
        const response = kb.getCommandResponse('zenthink');
        
        console.log('ZenThink response length:', response.length);
        
        if (!response) {
            await message.reply('❌ Unable to load ZenThink AI information at this time.');
            return { success: false, reason: 'No response available' };
        }

        await message.reply(response);
        return { success: true };
        
    } catch (error) {
        console.error('Error in ZenThink command:', error);
        await message.reply('❌ An error occurred while processing your request.');
        return { success: false, reason: error.message };
    }
}

/**
 * Example: Website Command Handler
 * Demonstrates: Specific website responses, clean formatting
 */
async function handleWebsiteCommand(message) {
    try {
        const kb = require('../src/bot-data/kb');
        const response = kb.getCommandResponse('website');
        
        if (!response) {
            await message.reply('❌ Unable to load website information at this time.');
            return { success: false, reason: 'No response available' };
        }

        await message.reply(response);
        return { success: true };
        
    } catch (error) {
        console.error('Error in website command:', error);
        await message.reply('❌ An error occurred while processing your request.');
        return { success: false, reason: error.message };
    }
}

/**
 * Example: Help Command with Rich Embed
 * Demonstrates: Embed creation, command listing, formatting
 */
async function handleHelpCommand(message) {
    try {
        const kb = require('../src/bot-data/kb');
        const priorityProducts = kb.getPriorityProducts();
        
        const embed = new EmbedBuilder()
            .setTitle('🤖 F3 AI Labs Bot Commands')
            .setDescription('Here are the available commands:')
            .setColor(0x00AE86)
            .addFields(
                {
                    name: '📋 General Commands',
                    value: '`/about` - Company information\n`/help` - Show this help\n`/website` - Website links',
                    inline: false
                },
                {
                    name: '🚀 Product Commands',
                    value: priorityProducts.map(product => 
                        `\`/${product.toLowerCase().replace(/\s+/g, '')}\` - ${product} information`
                    ).join('\n'),
                    inline: false
                },
                {
                    name: '📊 Update Commands',
                    value: '`/updates` - Latest updates\n`/status` - System status',
                    inline: false
                }
            )
            .setFooter({ text: 'F3 AI Labs - Building the future of AI' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
        return { success: true };
        
    } catch (error) {
        console.error('Error in help command:', error);
        await message.reply('❌ An error occurred while processing your request.');
        return { success: false, reason: error.message };
    }
}

/**
 * Example: Status Command with System Information
 * Demonstrates: System monitoring, performance metrics
 */
async function handleStatusCommand(message) {
    try {
        const kb = require('../src/bot-data/kb');
        const memUsage = process.memoryUsage();
        const uptime = process.uptime();
        
        const embed = new EmbedBuilder()
            .setTitle('📊 System Status')
            .setColor(0x00FF00)
            .addFields(
                {
                    name: '🤖 Bot Status',
                    value: '✅ Online and operational',
                    inline: true
                },
                {
                    name: '📚 Knowledge Base',
                    value: kb.isLoaded() ? '✅ Loaded' : '❌ Not loaded',
                    inline: true
                },
                {
                    name: '⏱️ Uptime',
                    value: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
                    inline: true
                },
                {
                    name: '💾 Memory Usage',
                    value: `RSS: ${Math.round(memUsage.rss / 1024 / 1024)} MB\nHeap: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
                    inline: false
                }
            )
            .setTimestamp();

        await message.reply({ embeds: [embed] });
        return { success: true };
        
    } catch (error) {
        console.error('Error in status command:', error);
        await message.reply('❌ An error occurred while processing your request.');
        return { success: false, reason: error.message };
    }
}

/**
 * Example: Command Registration
 * Demonstrates: Command mapping, handler binding
 */
function registerCommands() {
    const commands = new Map();
    
    // Register commands with their handlers
    commands.set('about', handleAboutCommand);
    commands.set('zenthink', handleZenThinkCommand);
    commands.set('website', handleWebsiteCommand);
    commands.set('help', handleHelpCommand);
    commands.set('status', handleStatusCommand);
    
    return commands;
}

/**
 * Example: Command Processing
 * Demonstrates: Command routing, error handling, cooldown management
 */
async function processCommand(message, commandName, commands) {
    try {
        // Check if command exists
        if (!commands.has(commandName)) {
            await message.reply(`❌ Unknown command: \`${commandName}\``);
            return { success: false, reason: 'Unknown command' };
        }
        
        // Get command handler
        const handler = commands.get(commandName);
        
        // Execute command
        const result = await handler(message);
        
        // Log result
        console.log(`Command ${commandName} executed:`, result.success ? 'Success' : 'Failed');
        
        return result;
        
    } catch (error) {
        console.error(`Error processing command ${commandName}:`, error);
        await message.reply('❌ An error occurred while processing your command.');
        return { success: false, reason: error.message };
    }
}

/**
 * Example: Message Processing with Command Detection
 * Demonstrates: Message parsing, command extraction, routing
 */
async function handleMessage(message) {
    try {
        // Ignore bot messages
        if (message.author.bot) return;
        
        // Check for command prefix
        const prefix = '!';
        if (!message.content.startsWith(prefix)) return;
        
        // Extract command and arguments
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        // Register and process command
        const commands = registerCommands();
        const result = await processCommand(message, commandName, commands);
        
        // Log processing result
        console.log(`Message processed: ${result.success ? 'Success' : 'Failed'}`);
        
    } catch (error) {
        console.error('Error handling message:', error);
    }
}

// Export functions for use in other modules
module.exports = {
    handleAboutCommand,
    handleZenThinkCommand,
    handleWebsiteCommand,
    handleHelpCommand,
    handleStatusCommand,
    registerCommands,
    processCommand,
    handleMessage
};

/**
 * Usage Examples:
 * 
 * // Register commands
 * const commands = registerCommands();
 * 
 * // Process a command
 * const result = await processCommand(message, 'about', commands);
 * 
 * // Handle a message
 * await handleMessage(message);
 */
