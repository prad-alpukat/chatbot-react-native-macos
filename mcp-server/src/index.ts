import fs from "node:fs";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { recipes } from "./recipes.js";

const server = new McpServer({
  name: "Recipes Server",
  version: "1.0.0",
});

server.tool(
  "get_recipe",
  { name: z.string().describe("The name of the recipe to get") },
  async ({ name }) => {
    const recipe = recipes.find(
      (r) => r.name.toLowerCase() === name.toLowerCase()
    );
    if (!recipe) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: `No recipe found for ${name}`,
            }),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            recipe: recipe.recipe,
          }),
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();
server.connect(transport);

console.error("MCP Recipe Server running on stdio");
console.error("Waiting for MCP client connection...");
