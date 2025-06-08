from mcp.server import FastMCP
from tools import (
    register_players_tools,
    register_clans_tools, 
    register_cards_tools,
    register_tournaments_tools,
    register_locations_tools,
    register_challenges_tools,
    register_leaderboards_tools, 
    register_globaltournaments_tools
    )

# Instantiate FastMCP server with explicit host and port
mcp = FastMCP("Clash Royale", dependencies=["requests"],)

# Register all tools
register_players_tools(mcp)
register_clans_tools(mcp)
register_cards_tools(mcp)
register_tournaments_tools(mcp)
register_locations_tools(mcp)
register_challenges_tools(mcp)
register_leaderboards_tools(mcp)
register_globaltournaments_tools(mcp)


if __name__ == "__main__":
    # Start the server explicitly with host and port
    mcp.run()