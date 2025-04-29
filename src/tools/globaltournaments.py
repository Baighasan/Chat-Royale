from .utils import make_api_request, build_query_string

def register_globaltournaments_tools(mcp):
    """
    Register all global tournament-related tools with the MCP server.
    
    Args:
        mcp: The FastMCP server instance
    """
    
    def get_global_tournaments():
        """
        Get a list of global tournaments.
        
        Returns:
            A list of global tournaments.
        """
        url = "globaltournaments"
        return make_api_request(url)
        