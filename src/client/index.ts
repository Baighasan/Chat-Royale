import { Anthropic } from "@anthropic-ai/sdk";
import {
    MessageParam,
    Tool,
} from "@anthropic-ai/sdk/resources/messages/messages.mjs";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import readline from "readline/promises";

import dotenv from "dotenv";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";



dotenv.config(); // load environment variables from .env

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
}

class MCPClient {
    private mcp: Client;
    private anthropic: Anthropic;
    private transport: StreamableHTTPClientTransport | null = null;
    private serverUrl: URL;
    private tools: Tool[] = [];

    constructor(serverUrl: string = "http://127.0.0.1:8000/mcp") {
        // Initialize Anthropic client and MCP client
        this.anthropic = new Anthropic({
            apiKey: ANTHROPIC_API_KEY,
        });

        this.mcp = new Client({
            name: "chat-royale-mcp-client-cli",
            version: "1.0.0",
        });

        this.serverUrl = new URL(serverUrl);
    }

    async connectToServer() {
        /**
         * Connect to an MCP server
         *
         * @param serverScriptPath - Path to the server script (.py or .js)
         */

        try {
            this.transport = new StreamableHTTPClientTransport(
                this.serverUrl,
            );
    
            await this.mcp.connect(this.transport);
    
            const toolsResult = await this.mcp.listTools();
            this.tools = toolsResult.tools.map((tool) => {
                return {
                    name: tool.name,
                    description: tool.description,
                    input_schema: tool.inputSchema,
                };
            });
            console.log(
                "Connected to server with tools:",
                this.tools.map(({ name }) => name)
            );
        } catch (e) {
            console.log("Failed to connect to MCP server: ", e);
            throw e;
        }
    }

    async processQuery(query: string) {
        /**
         * Process a query using Claude and available tools
         *
         * @param query - The user's input query
         * @returns Processed response as a string
         */
        const messages: MessageParam[] = [
        {
            role: "user",
            content: query,
        },
        ];

        // Initial Claude API call
        const response = await this.anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            messages,
            tools: this.tools,
        });

        // Process response and handle tool calls
        const finalText = [];
        const toolResults = [];

        for (const content of response.content) {
        if (content.type === "text") {
            finalText.push(content.text);
        } else if (content.type === "tool_use") {
            // Execute tool call
            const toolName = content.name;
            const toolArgs = content.input as { [x: string]: unknown } | undefined;

            const result = await this.mcp.callTool({
            name: toolName,
            arguments: toolArgs,
            });
            toolResults.push(result);
            finalText.push(
            `[Calling tool ${toolName} with args ${JSON.stringify(toolArgs)}]`,
            );

            // Continue conversation with tool results
            messages.push({
            role: "user",
            content: result.content as string,
            });

            // Get next response from Claude
            const response = await this.anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            messages,
            });

            finalText.push(
                response.content[0].type === "text" ? response.content[0].text : "",
            );
            }
        }

        return finalText.join("\n");
    }

    async chatLoop() {
        /**
         * Run an interactive chat loop
         */
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        try {
            console.log("\nMCP Client Started!");
            console.log("Type your queries or 'quit' to exit.");

            while (true) {
                const message = await rl.question("\nQuery: ");
                if (message.toLowerCase() === "quit") {
                    break;
                }
                const response = await this.processQuery(message);
                console.log("\n" + response);
            }
        } finally {
            rl.close();
        }
    }

    async cleanup() {
        /**
         * Clean up resources
         */
        await this.mcp.close();
    }
}

async function main() {
    const mcpClient = new MCPClient();
    try {
        await mcpClient.connectToServer();
        await mcpClient.chatLoop();
    } finally {
        await mcpClient.cleanup();
        process.exit(0);
    }
}

main();