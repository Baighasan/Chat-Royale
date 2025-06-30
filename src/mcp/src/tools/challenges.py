from .utils import make_api_request, build_query_string

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
        endpoint = "challenges"
        return make_api_request(endpoint)