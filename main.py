import os
from mcp.server import FastMCP
from tools import register_player_tools
from tools.utils import CR_API_KEY

# Instantiate FastMCP server with explicit host and port
mcp = FastMCP("Clash Royale", dependencies=["requests"],)

# Validate API key
if not CR_API_KEY:
    raise ValueError("CR_API_KEY environment variable is required")

# Register all tools
register_player_tools(mcp)
    
if __name__ == "__main__":
    # Start the server explicitly with host and port
    mcp.run()