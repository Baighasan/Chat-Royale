import os
from dotenv import load_dotenv
import requests
from mcp.server import FastMCP

# Instantiate FastMCP server
mcp = FastMCP("Clash Royale", dependancies=["requests"])

# Load variables from .env file
load_dotenv()

# Constants
CR_API_BASE = "https://api.clashroyale.com/v1"
CR_API_KEY = os.getenv("CR_API_KEY")

@mcp.resource("player_info/{player_tag}")
def get_player_info(player_tag: str) -> dict:
    """
    Fetch player info from Clash Royale API.
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
    
if __name__ == "__main__":
    # Start the server
    mcp.run()