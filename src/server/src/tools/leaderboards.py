from .utils import make_api_request, build_query_string

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
        after: str = None,
        before: str = None
        ) -> dict:
        """
        Fetch information about a specific leaderboard from the Clash Royale API. These leaderboards are not the regular ladder or path of legends, these are for any temporary gamemodes such as 2v2 ladder.
        To get a list of all available leaderboards and their ids, use the `get_leaderboards` tool.
        
        Args:
            leaderboard_id: The unique identifier for the leaderboard
            
            limit: Limit the number of items returned in the response. (optional)
            
            after: Return only items that occur after this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
            before: Return only items that occur before this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
        Returns:
            Specific leaderboard information.
        """
        # Validate that only one of after or before is provided
        if after is not None and before is not None:
            raise ValueError("Only one of 'after' or 'before' can be specified, not both.")
            
        endpoint = f"leaderboards/{leaderboard_id}"
        
        # Create a dictionary with only the non-None parameters
        queries = {k: v for k, v in {
            "limit": limit,
            "after": after,
            "before": before
        }.items() if v is not None}
        
        if queries:
            endpoint += "?" + build_query_string(queries)
        
        return make_api_request(endpoint)
    
    @mcp.tool()
    def get_leaderboards() -> dict:
        """
        Fetch all available leaderboards from the Clash Royale API. These leaderboards are not the regular ladder or path of legends, these are for any temporary gamemodes such as 2v2 ladder.
        
        Returns:
            A list of all available leaderboards.
        """
        endpoint = "leaderboards"
        return make_api_request(endpoint)