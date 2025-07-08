import logging
from .utils import make_api_request, build_query_string, encode_tag

logger = logging.getLogger(__name__)

def register_tournaments_tools(mcp):
    """
    Register all tournament-related tools with the MCP server.
    
    Args:
        mcp: The FastMCP server instance
    """
    
    @mcp.tool()
    def search_tournaments(
        name: str = None,
        limit: int = None,
        after: str = None,
        before: str = None
        ) -> dict:
        """
        Search for tournaments based on name. Retrieves info about tournaments that match the search criteria.
        These are player made tournaments, not official tournaments. This should only be used if a player is specifically
        searching for a player-created tournament.
        
        Args:
            name: Search tournaments by name. If name is used as part of search query, it needs to be at least three characters long.
                Name search parameter is interpreted as wild card search, so it may appear anywhere in the tournament name. (optional)
            
            limit: Limit the number of items returned in the response. (optional)
            
            after: Return only items that occur after this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
            before: Return only items that occur before this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
        Returns:
            Returns the tournament search results as a JSON object.
        """
        logger.info(f"search_tournaments called with name={name}, limit={limit}, after={after}, before={before}")
        
        # Validate that only one of after or before is provided
        if after is not None and before is not None:
            logger.error("Both 'after' and 'before' parameters provided, which is not allowed")
            raise ValueError("Only one of 'after' or 'before' can be specified, not both.")
            
        endpoint = "tournaments"
        
        # Create a dictionary with only the non-None parameters
        queries = {k: v for k, v in {
            "name": name,
            "limit": limit,
            "after": after,
            "before": before
        }.items() if v is not None}
        
        if queries:
            endpoint += "?" + build_query_string(queries)
        else:
            logger.error("No search parameters provided")
            raise ValueError("At least one search parameter must be provided.")
        
        result = make_api_request(endpoint)
        logger.info(f"search_tournaments completed successfully. Found {len(result)} tournaments")
        return result
    
    @mcp.tool()
    def get_tournament_info(tournament_tag: str) -> dict:
        """
        Fetch detailed information about a specific tournament from the Clash Royale API. These are player made tournaments, 
        not official tournaments. This should only be used if a player is specifically searching for a player-created 
        tournament.
        
        Args:
            tournament_tag: The tournament tag to look up (e.g. #ABCDEF)
            
        Returns:
            Detailed information about the specified tournament.
        """
        logger.info(f"get_tournament_info called with tournament_tag={tournament_tag}")
        
        tournament_tag = encode_tag(tournament_tag)
        endpoint = f"tournaments/{tournament_tag}"
        
        result = make_api_request(endpoint)
        logger.info(f"get_tournament_info completed successfully for tournament: {result.get('name', 'Unknown')}")
        return result

