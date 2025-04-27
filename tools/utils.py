import os
import requests

CR_API_BASE = "https://api.clashroyale.com/v1"
CR_API_KEY = os.getenv("CR_API_KEY")

def make_api_request(endpoint: str, player_tag: str = None) -> dict:
    """
    Make an API request to the Clash Royale API.
    
    Args:
        endpoint: The API endpoint to call
        player_tag: Optional player tag that needs URL encoding
        
    Returns:
        JSON response from the API
    """
    if player_tag:
        player_tag = player_tag.replace('#', '%23')
        url = f"{CR_API_BASE}/{endpoint}/{player_tag}"
    else:
        url = f"{CR_API_BASE}/{endpoint}"
        
    headers = {
        "Authorization": f"Bearer {CR_API_KEY}"
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Error fetching data: {response.status_code} - {response.text}")