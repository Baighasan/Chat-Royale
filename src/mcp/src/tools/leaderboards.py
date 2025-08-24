import logging
from .utils import make_api_request, build_query_string

logger = logging.getLogger(__name__)

# not registered currently, some issues with api but plan to implement it in the future
def register_leaderboards_tools(mcp):
    """
    Register all leaderboard-related tools with the MCP server.
    
    Args:
        mcp: The FastMCP server instance
    """
    
    @mcp.tool()
    def get_specific_leaderboard(
        leaderboard_id: int,
        limit: int = None,
        ) -> dict:
        """

        Fetch information about a specific leaderboard from the Clash Royale API. These leaderboards are not the regular ladder or path of legends, these are for any temporary gamemodes such as 2v2 ladder.
        
        These are the current active leaderboards, with their name and id:
            - Merge Tactics: 170000008

        These are the inactive leaderboards, with their name and id. They are game modes that have finished and can no longer be played. Only use these if the player explicitly asks for one of these.
            - Goblin Queen's Journey: 170000001
            - 2v2 League (1st appearance): 170000003
            - 2v2 League (2nd appearance): 170000004
            - Retro Royale: 170000005
            - 2v2 League (3rd appearance): 170000007

        Args:
            leaderboard_id: The unique identifier for the leaderboard
            
            limit: Limit the number of items returned in the response. (optional)
            
        Returns:
            Specific leaderboard information.
        """
        logger.info(f"get_specific_leaderboard called with leaderboard_id={leaderboard_id} and limit={limit}")

        endpoint = f"leaderboards/{leaderboard_id}?limit={limit}" if limit else f"leaderboards/{leaderboard_id}"
        
        result = make_api_request(endpoint)
        logger.info(f"get_specific_leaderboard completed successfully. Found {len(result)} entries")
        return result
    
    # @mcp.tool()
    # def get_leaderboards() -> dict:
    #     """
    #     Fetch all available leaderboards from the Clash Royale API. These leaderboards are not the regular ladder or path of legends, these are for any temporary gamemodes such as 2v2 ladder.
        
    #     NOTE: The ONLY leaderboard still active in game is Merge Tactics. The other ones are NOT active, so do NOT use them for leaderboard ids for any other tools.
        
    #     Returns:
    #         A list of all available leaderboards.
    #     """
    #     logger.info("get_leaderboards called")
        
    #     endpoint = "leaderboards"
    #     result = make_api_request(endpoint)
    #     logger.info(f"get_leaderboards completed successfully. Retrieved {len(result)} leaderboards")
    #     return result