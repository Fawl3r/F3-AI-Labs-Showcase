# API Documentation

## 📚 Knowledge Base API

### Core Methods

#### `getResponse(key)`
Retrieves a specific response from the knowledge base.

**Parameters:**
- `key` (string): The response key to retrieve

**Returns:**
- `string`: The response text or empty string if not found

**Example:**
```javascript
const response = kb.getResponse('zenthink_overview');
console.log(response); // "ZenThink AI is a comprehensive mental health..."
```

#### `getCommandResponse(command)`
Retrieves concatenated responses for a specific command.

**Parameters:**
- `command` (string): The command name

**Returns:**
- `string`: Concatenated response text

**Example:**
```javascript
const response = kb.getCommandResponse('zenthink');
console.log(response); // Multiple responses joined together
```

#### `getSystemPrompt()`
Retrieves the system prompt for AI responses.

**Returns:**
- `string`: The system prompt text

**Example:**
```javascript
const prompt = kb.getSystemPrompt();
console.log(prompt); // "You are F3 Bot — the AI engine of F3 AI Labs..."
```

### Utility Methods

#### `getPriorityProducts()`
Retrieves the list of priority products.

**Returns:**
- `Array<string>`: Array of product names

**Example:**
```javascript
const products = kb.getPriorityProducts();
console.log(products); // ["ZenThink AI", "F3 Parlay AI", "Pump Pill Arena", "F3 Trading Bot"]
```

#### `getLinks()`
Retrieves all available links.

**Returns:**
- `Object`: Links object with URL mappings

**Example:**
```javascript
const links = kb.getLinks();
console.log(links); // { "zenthink_main": "https://zenthink.app", ... }
```

#### `isLoaded()`
Checks if the knowledge base is loaded.

**Returns:**
- `boolean`: True if bundle is loaded

**Example:**
```javascript
if (kb.isLoaded()) {
    console.log('Knowledge base is ready');
}
```

## 🤖 Message Handler API

### Core Methods

#### `handleAIResponse(message)`
Processes a message and generates an AI response.

**Parameters:**
- `message` (Discord.Message): The Discord message object

**Returns:**
- `Promise<Object>`: Response result with success status

**Example:**
```javascript
const result = await messageHandler.handleAIResponse(message);
if (result.success) {
    console.log('Response sent successfully');
} else {
    console.error('Error:', result.reason);
}
```

#### `generateAIResponse(message)`
Generates an AI response using OpenAI API.

**Parameters:**
- `message` (Discord.Message): The Discord message object

**Returns:**
- `Promise<Object>`: AI response with content

**Example:**
```javascript
const response = await messageHandler.generateAIResponse(message);
if (response.success) {
    console.log('AI Response:', response.content);
}
```

#### `shouldRespondToMessage(message, client)`
Determines if the bot should respond to a message.

**Parameters:**
- `message` (Discord.Message): The Discord message object
- `client` (Discord.Client): The Discord client object

**Returns:**
- `boolean`: True if bot should respond

**Example:**
```javascript
if (messageHandler.shouldRespondToMessage(message, client)) {
    await messageHandler.handleAIResponse(message);
}
```

### Utility Methods

#### `splitResponse(response)`
Splits long responses into Discord-compatible chunks.

**Parameters:**
- `response` (string): The response text to split

**Returns:**
- `Array<string>`: Array of message chunks

**Example:**
```javascript
const chunks = messageHandler.splitResponse(longResponse);
for (const chunk of chunks) {
    await message.channel.send(chunk);
}
```

#### `isBotMentioned(message, client)`
Checks if the bot is mentioned in a message.

**Parameters:**
- `message` (Discord.Message): The Discord message object
- `client` (Discord.Client): The Discord client object

**Returns:**
- `boolean`: True if bot is mentioned

**Example:**
```javascript
if (messageHandler.isBotMentioned(message, client)) {
    // Handle mention
}
```

## 🎯 Command Manager API

### Core Methods

#### `registerCommand(name, handler)`
Registers a new command with the system.

**Parameters:**
- `name` (string): The command name
- `handler` (Function): The command handler function

**Example:**
```javascript
commandManager.registerCommand('help', async (message) => {
    await message.reply('Here is the help information...');
});
```

#### `handleCommand(message)`
Processes a command message.

**Parameters:**
- `message` (Discord.Message): The Discord message object

**Returns:**
- `Promise<Object>`: Command result with success status

**Example:**
```javascript
const result = await commandManager.handleCommand(message);
if (result.success) {
    console.log('Command executed successfully');
}
```

### Command Handlers

#### `handleAboutCommand(message)`
Handles the about command.

**Parameters:**
- `message` (Discord.Message): The Discord message object

**Returns:**
- `Promise<Object>`: Command result

**Example:**
```javascript
const result = await commandManager.handleAboutCommand(message);
```

#### `handleZenThinkCommand(message)`
Handles the ZenThink AI command.

**Parameters:**
- `message` (Discord.Message): The Discord message object

**Returns:**
- `Promise<Object>`: Command result

**Example:**
```javascript
const result = await commandManager.handleZenThinkCommand(message);
```

## 🔧 Configuration API

### Environment Variables

#### Required Variables
```bash
DISCORD_BOT_TOKEN=your_discord_bot_token
OPENAI_API_KEY=your_openai_api_key
DISCORD_GUILD_ID=your_guild_id
```

#### Optional Variables
```bash
OPENAI_MODEL=gpt-4o-mini
AI_PERSONALITY=custom_system_prompt
BOT_PREFIX=!
COOLDOWN_TIME=5000
```

### Configuration Methods

#### `validateEnvironment()`
Validates that all required environment variables are set.

**Returns:**
- `void`: Throws error if validation fails

**Example:**
```javascript
try {
    config.validateEnvironment();
    console.log('Environment validation passed');
} catch (error) {
    console.error('Environment validation failed:', error.message);
}
```

## 📊 Rate Limiting API

### Core Methods

#### `processMessage(userId, content)`
Processes a message for rate limiting.

**Parameters:**
- `userId` (string): The user ID
- `content` (string): The message content

**Returns:**
- `Object`: Rate limit result

**Example:**
```javascript
const result = rateLimitManager.processMessage(userId, content);
if (result.shouldRateLimit) {
    console.log('User is rate limited');
} else {
    console.log('User can send message');
}
```

#### `getRateLimitStatus(userId)`
Gets the current rate limit status for a user.

**Parameters:**
- `userId` (string): The user ID

**Returns:**
- `Object`: Rate limit status

**Example:**
```javascript
const status = rateLimitManager.getRateLimitStatus(userId);
console.log('Rate limit status:', status);
```

## 🎨 Embed Manager API

### Core Methods

#### `createInfoEmbed(title, description, options)`
Creates an informational embed.

**Parameters:**
- `title` (string): The embed title
- `description` (string): The embed description
- `options` (Object): Additional embed options

**Returns:**
- `Discord.EmbedBuilder`: The embed object

**Example:**
```javascript
const embed = embedManager.createInfoEmbed(
    'F3 AI Labs',
    'Welcome to F3 AI Labs!',
    { fields: [{ name: 'Website', value: 'https://f3ai.dev' }] }
);
```

#### `createErrorEmbed(title, description)`
Creates an error embed.

**Parameters:**
- `title` (string): The embed title
- `description` (string): The embed description

**Returns:**
- `Discord.EmbedBuilder`: The embed object

**Example:**
```javascript
const embed = embedManager.createErrorEmbed(
    'Error',
    'Something went wrong!'
);
```

## 🔍 Error Handling

### Error Types

#### `KnowledgeBaseError`
Thrown when knowledge base operations fail.

**Properties:**
- `message`: Error description
- `code`: Error code
- `context`: Additional context

#### `AIResponseError`
Thrown when AI response generation fails.

**Properties:**
- `message`: Error description
- `code`: Error code
- `openaiError`: Original OpenAI error

#### `CommandError`
Thrown when command execution fails.

**Properties:**
- `message`: Error description
- `command`: Command name
- `context`: Additional context

### Error Handling Examples

```javascript
try {
    const response = await messageHandler.handleAIResponse(message);
} catch (error) {
    if (error instanceof AIResponseError) {
        console.error('AI Response Error:', error.message);
        await message.reply('Sorry, I encountered an error processing your request.');
    } else {
        console.error('Unexpected Error:', error);
        await message.reply('An unexpected error occurred.');
    }
}
```

## 📈 Performance Monitoring

### Metrics Collection

#### Response Time Tracking
```javascript
const startTime = Date.now();
const response = await messageHandler.handleAIResponse(message);
const responseTime = Date.now() - startTime;
console.log(`Response time: ${responseTime}ms`);
```

#### Memory Usage Monitoring
```javascript
const memUsage = process.memoryUsage();
console.log('Memory usage:', {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`
});
```

---

*This API documentation provides comprehensive coverage of all public methods and interfaces, demonstrating professional-grade API design and documentation practices.*
