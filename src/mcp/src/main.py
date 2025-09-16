from mcp.server import FastMCP

from tools import (
    register_players_tools,
    register_clans_tools, 
    register_cards_tools,
    register_ranking_tools
    )

mcp = FastMCP(
    name="Clash Royale MCP Server",
    host="0.0.0.0",
    port=8000,
)

# Register all tools
register_players_tools(mcp)
register_clans_tools(mcp)
register_cards_tools(mcp)
register_ranking_tools(mcp)


if __name__ == "__main__":
    mcp.run(transport="streamable-http")