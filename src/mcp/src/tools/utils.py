import os
import requests
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Try to load environment variables from .env file
dotenvPath = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(dotenvPath)

CR_API_BASE = "https://api.clashroyale.com/v1"
CR_API_KEY = os.getenv("CR_API_KEY")

# Validate API key
if not CR_API_KEY:
    raise ValueError("CR_API_KEY environment variable is required")

def make_api_request(endpoint: str) -> dict:
    """
    Make an API request to the Clash Royale API.
    
    Args:
        endpoint: The API endpoint to call
        player_tag: Optional player tag that needs URL encoding
        
    Returns:
        JSON response from the API
    """
    url = f"{CR_API_BASE}/{endpoint}"
    
    logger.info(f"Making API request to: {url}")
        
    headers = {
        "Authorization": f"Bearer {CR_API_KEY}"
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        logger.info(f"API request successful. Response status: {response.status_code}")
        return response.json()
    else:
        logger.error(f"API request failed. Status: {response.status_code}, Response: {response.text}")
        raise Exception(f"Error fetching data: {response.status_code} - {response.text}")


def encode_tag(player_tag: str) -> str:
    """
    Encode player tag for URL.
    
    Args:
        player_tag: The player tag to encode
        
    Returns:
        Encoded player tag
    """
    return player_tag.replace('#', '%23')

def build_query_string(params: dict) -> str:
    """
    Build a URL query string from a dictionary of parameters.
    
    Args:
        params: Dictionary where keys are parameter names and values are parameter values
        
    Returns:
        A formatted query string (without the leading '?') with parameters 
        joined by '&' symbols (e.g., "limit=10&before=abc123")
    """
    query_parts = []
    for key, value in params.items():
        query_parts.append(f"{key}={value}")
    
    return "&".join(query_parts)