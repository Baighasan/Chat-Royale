import logging
from .utils import make_api_request, build_query_string

logger = logging.getLogger(__name__)

def register_challenges_tools(mcp):
    """
    Register all challenge-related tools with the MCP server.
    
    Args:
        mcp: The FastMCP server instance
    """
    
    @mcp.tool()
    def get_challenge_info() -> dict:
        """
        Fetch detailed information about current and upcoming challenges from the Clash Royale API.
        
        Returns:
            Returns the challenge information as a JSON object.
        """
        logger.info("get_challenge_info called")
        
        endpoint = "challenges"
        result = make_api_request(endpoint)
        logger.info(f"get_challenge_info completed successfully. Retrieved challenge information")
        return result