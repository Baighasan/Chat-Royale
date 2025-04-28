from .utils import make_api_request

def register_card_tools(mcp):
    """
    Register all card-related tools with the MCP server.
    
    Args:
        mcp: The FastMCP server instance
    """
    
    @mcp.tool()
    def get_cards() -> dict:
        """
        Get a list of available cards from the Clash Royale API.
        
        Returns:
            Card information including stats, types, etc.
        """
        endpoint = "cards"
        
        return make_api_request(endpoint)