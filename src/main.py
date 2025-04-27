import os
import requests
from mcp.server import FastMCP
from utils import CR_API_BASE, CR_API_KEY

# Instantiate FastMCP server with explicit host and port
mcp = FastMCP("Clash Royale", dependencies=["requests"],)

# Resource path with standard MCP format
@mcp.tool()
def get_player_info(player_tag: str) -> dict:
    """
    Fetch player info from the Clash Royale API.
    
    Args:
        player_tag: The player tag to look up (e.g. #ABCDEF)
        
    Returns:
        Player information including stats, cards, etc.
    """
    player_tag = player_tag.replace('#', '%23')

    url = f"{CR_API_BASE}/players/{player_tag}"
    headers = {
        "Authorization": f"Bearer {CR_API_KEY}"
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Error fetching player info: {response.status_code} - {response.text}")

@mcp.tool()
def get_player_upcoming_chests(player_tag: str) -> dict:
    """
    Fetch upcoming chests for a player from the Clash Royale API.
    
    Args:
        player_tag: The player tag to look up (e.g. #ABCDEF)
        
    Returns:
        Upcoming chests information including the index and name.
    """
    player_tag = player_tag.replace('#', '%23')

    url = f"{CR_API_BASE}/players/{player_tag}/upcomingchests"
    headers = {
        "Authorization": f"Bearer {CR_API_KEY}"
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Error fetching upcoming chests: {response.status_code} - {response.text}")

@mcp.tool()
def get_player_battle_log(player_tag: str) -> dict:
    """
    Fetch battle log for a player from the Clash Royale API.
    
    Args:
        player_tag: The player tag to look up (e.g. #ABCDEF)
        
    Returns:
        Battle log information including the battle details.
    """
    player_tag = player_tag.replace('#', '%23')

    url = f"{CR_API_BASE}/players/{player_tag}/battlelog"
    headers = {
        "Authorization": f"Bearer {CR_API_KEY}"
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Error fetching battle log: {response.status_code} - {response.text}")

    
if __name__ == "__main__":
    # Start the server explicitly with host and port
    mcp.run()