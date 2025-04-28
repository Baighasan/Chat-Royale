from mcp.server import FastMCP
from tools import register_player_tools, register_clan_tools

# Instantiate FastMCP server with explicit host and port
mcp = FastMCP("Clash Royale", dependencies=["requests"],)

# Register all tools
register_player_tools(mcp)
register_clan_tools(mcp)
    
if __name__ == "__main__":
    # Start the server explicitly with host and port
    mcp.run()