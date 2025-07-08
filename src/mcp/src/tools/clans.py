import logging
from .utils import make_api_request, encode_tag, build_query_string

logger = logging.getLogger(__name__)

def register_clans_tools(mcp):
    """
    Register all clan-related tools with the MCP server.
    
    Args:
        mcp: The FastMCP server instance
    """
    
    # NOTE: Currently, this API endpoint has been temporarily disabled. Possibilities to bring it back are being investigated.
    '''
    @mcp.tool()
    def get_clan_war_log(
        clan_tag: str,
        limit: int = None,
        after: str = None,
        before: str = None
        ) -> dict:
        """
        Fetch clan war log info from the Clash Royale API.
        
        Args:
            clan_tag: The clan tag to look up (e.g. #ABCDEF)
            
            limit: Limit the number of items returned in the response. (optional)
            
            after: Return only items that occur after this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
            before: Return only items that occur before this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
        Returns:
            Clan war log.
        """
        # Validate that only one of after or before is provided
        if after is not None and before is not None:
            raise ValueError("Only one of 'after' or 'before' can be specified, not both.")
            
        clan_tag = encode_tag(clan_tag)
        endpoint = f"clans/{clan_tag}/warlog"
        
        # Create a dictionary with only the non-None parameters
        queries = {k: v for k, v in {
            "limit": limit,
            "after": after,
            "before": before
        }.items() if v is not None}
        
        if queries:
            endpoint += "?" + build_query_string(queries)
        
        return make_api_request(endpoint)
    '''

    @mcp.tool()
    def search_clans(
        name: str = None,
        location_id: int = None,
        min_members: int = None,
        max_members:int = None,
        min_score: int = None,
        limit: int = None,
        after: str = None,
        before: str = None
        ) -> dict:
        """
        Searches for clans based on various parameters. Retrieves info about the clans that match the search criteria. This tool is
        useful if a user asked about a clan by name, as this tool can be used to search for that clan, retrieve the id and 
        subsequently retrieve the specific clan information using the `get_clan_info` tool.
        
        Args:
            name: Search clans by name. If name is used as part of search query, it needs to be at least three characters long.
                Name search parameter is interpreted as wild card search, so it may appear anywhere in the clan name. (optional)
            
            location_id: Filter by clan location identifier. To get the list of available locations and their ids, use the 
            `get_locations` tool. (optional)
            
            min_members: Filter by minimum number of clan members. (optional)
            
            max_members: Filter by maximum number of clan members. (optional)
            
            min_score: Filter by minimum amount of clan score. (optional)
            
            limit: Limit the number of items returned in the response. (optional)
            
            after: Return only items that occur after this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
            before: Return only items that occur before this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
        Returns:
            Returns the search results as a JSON object.
        """
        logger.info(f"search_clans called with name={name}, location_id={location_id}, min_members={min_members}, max_members={max_members}, min_score={min_score}, limit={limit}, after={after}, before={before}")
        
        # Validate that only one of after or before is provided
        if after is not None and before is not None:
            logger.error("Both 'after' and 'before' parameters provided, which is not allowed")
            raise ValueError("Only one of 'after' or 'before' can be specified, not both.")
            
        endpoint = "clans"
        
        # Create a dictionary with only the non-None parameters
        queries = {k: v for k, v in {
            "name": name,
            "location_id": location_id,
            "min_members": min_members,
            "max_members": max_members,
            "min_score": min_score,
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
        logger.info(f"search_clans completed successfully. Found {len(result)} clans")
        return result

    @mcp.tool()
    def get_clan_river_race_log(
        clan_tag: str,
        limit: int = None,
        after: str = None,
        before: str = None
        ) -> dict:
        """
        Fetch clan river race log from the Clash Royale API.
        
        Args:
            clan_tag: The clan tag to look up (e.g. #ABCDEF). This should either be provided by the user in the
            format of a string with a leading '#', or retrieved as a part of a reponse from a different tool.
            
            limit: Limit the number of items returned in the response. (optional)
            
            after: Return only items that occur after this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
            before: Return only items that occur before this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
        Returns:
            Clan river race log containing past river race data.
        """
        logger.info(f"get_clan_river_race_log called with clan_tag={clan_tag}, limit={limit}, after={after}, before={before}")
        
        # Validate that only one of after or before is provided
        if after is not None and before is not None:
            logger.error("Both 'after' and 'before' parameters provided, which is not allowed")
            raise ValueError("Only one of 'after' or 'before' can be specified, not both.")
            
        clan_tag = encode_tag(clan_tag)
        endpoint = f"clans/{clan_tag}/riverracelog"
        
        # Create a dictionary with only the non-None parameters
        queries = {k: v for k, v in {
            "limit": limit,
            "after": after,
            "before": before
        }.items() if v is not None}
        
        if queries:
            endpoint += "?" + build_query_string(queries)
        
        result = make_api_request(endpoint)
        logger.info(f"get_clan_river_race_log completed successfully. Found {len(result)} river race entries")
        return result

    # NOTE: This API endpoint has been permanently removed.
    '''
    @mcp.tool()
    def get_clan_current_war(clan_tag: str) -> dict:
        """
        Fetch information about the clan's current war from the Clash Royale API.
        
        Args:
            clan_tag: The clan tag to look up (e.g. #ABCDEF)
            
        Returns:
            Current war information for the specified clan.
        """
        clan_tag = encode_tag(clan_tag)
        endpoint = f"clans/{clan_tag}/currentwar"
        
        return make_api_request(endpoint)
    '''

    @mcp.tool()
    def get_clan_info(clan_tag: str) -> dict:
        """
        Fetch detailed information about a specific clan from the Clash Royale API. This should either be provided by the user in the
            format of a string with a leading '#', or retrieved as a part of a reponse from a different tool.
        
        Args:
            clan_tag: The clan tag to look up (e.g. #ABCDEF)
            
        Returns:
            Detailed information about the specified clan including members, war stats, etc.
        """
        logger.info(f"get_clan_info called with clan_tag={clan_tag}")
        
        clan_tag = encode_tag(clan_tag)
        endpoint = f"clans/{clan_tag}"
        
        result = make_api_request(endpoint)
        logger.info(f"get_clan_info completed successfully for clan: {result.get('name', 'Unknown')}")
        return result

    @mcp.tool()
    def get_clan_members(
        clan_tag: str,
        limit: int = None,
        after: str = None,
        before: str = None
        ) -> dict:
        """
        Fetch the list of members in a clan from the Clash Royale API.
        
        Args:
            clan_tag: The clan tag to look up (e.g. #ABCDEF). This should either be provided by the user in the
            format of a string with a leading '#', or retrieved as a part of a reponse from a different tool.
            
            limit: Limit the number of items returned in the response. (optional)
            
            after: Return only items that occur after this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
            before: Return only items that occur before this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
        Returns:
            List of clan members with their details including name, role, trophies, donations, etc.
        """
        logger.info(f"get_clan_members called with clan_tag={clan_tag}, limit={limit}, after={after}, before={before}")
        
        # Validate that only one of after or before is provided
        if after is not None and before is not None:
            logger.error("Both 'after' and 'before' parameters provided, which is not allowed")
            raise ValueError("Only one of 'after' or 'before' can be specified, not both.")
            
        clan_tag = encode_tag(clan_tag)
        endpoint = f"clans/{clan_tag}/members"
        
        # Create a dictionary with only the non-None parameters
        queries = {k: v for k, v in {
            "limit": limit,
            "after": after,
            "before": before
        }.items() if v is not None}
        
        if queries:
            endpoint += "?" + build_query_string(queries)
        
        result = make_api_request(endpoint)
        logger.info(f"get_clan_members completed successfully. Found {len(result)} members")
        return result

    @mcp.tool()
    def get_clan_current_river_race(clan_tag: str) -> dict:
        """
        Fetch information about the clan's current river race from the Clash Royale API. This should either be provided by the user in the
            format of a string with a leading '#', or retrieved as a part of a reponse from a different tool.
        
        Args:
            clan_tag: The clan tag to look up (e.g. #ABCDEF)
            
        Returns:
            Current river race information for the specified clan including participating clans,
            battle days, clan participants, and other river race details.
        """
        logger.info(f"get_clan_current_river_race called with clan_tag={clan_tag}")
        
        clan_tag = encode_tag(clan_tag)
        endpoint = f"clans/{clan_tag}/currentriverrace"
        
        result = make_api_request(endpoint)
        logger.info(f"get_clan_current_river_race completed successfully")
        return result