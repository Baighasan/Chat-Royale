import logging
from .utils import make_api_request, build_query_string

logger = logging.getLogger(__name__)

def register_globaltournaments_tools(mcp):
    """
    Register all global tournament-related tools with the MCP server.
    
    Args:
        mcp: The FastMCP server instance
    """
    
    @mcp.tool()
    def get_global_tournaments():
        """
        Get a list of global tournaments and their milestone rewards. This does not returns any deta regarding current standings,
        player info, or any other details about the global tournament. It only returns the milestone rewards for each
        global tournament.
        
        Returns:
            A list of global tournaments, each global tournament's data consists of the milestone rewards
        """
        logger.info("get_global_tournaments called")
        
        url = "globaltournaments"
        result = make_api_request(url)
        logger.info(f"get_global_tournaments completed successfully. Retrieved {len(result)} global tournaments")
        return result
        