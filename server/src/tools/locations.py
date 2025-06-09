from .utils import make_api_request, build_query_string, encode_tag

def register_locations_tools(mcp):
    """
    Register all location-related tools with the MCP server.
    
    Args:
        mcp: The FastMCP server instance
    """
    
    @mcp.tool()
    def get_locations() -> dict:
        """
        Fetch a list of all the available locations alongside their ids from the Clash Royale API.
        
        Returns:
            A list of all locations and their information including IDs, names, and region details.
        """
        endpoint = "locations"
        
        return make_api_request(endpoint)

    @mcp.tool()
    def get_seasons() -> dict:
        """
        Fetch a list of all the available seasons alongside their ids from the Clash Royale API.
        
        Returns:
            A list of all seasons and their identifiers.
        """
        endpoint = "locations/global/seasonsV2"
        
        return make_api_request(endpoint)
    
    @mcp.tool()
    def get_location_info(location_id: int) -> dict:
        """
        Fetch information about a specific location from the Clash Royale API.
        
        Args:
            location_id: The location identifier. To get a list of all locations and their ids, use the get_locations tool.

        Returns:
            Information about the specified location including name, region, and other details.
        """
        endpoint = f"locations/{location_id}"
        
        return make_api_request(endpoint)
    
    @mcp.tool()
    def get_location_clan_rankings(
        location_id: int,
        limit: int = None,
        after: str = None,
        before: str = None
        ) -> dict:
        """
        Fetch clan rankings for a specific location from the Clash Royale API.
        
        Args:
            location_id: The location identifier. To get a list of all locations and their ids, use the get_locations tool.
            
            limit: Limit the number of items returned in the response. (optional)
            
            after: Return only items that occur after this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
            before: Return only items that occur before this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
        Returns:
            Clan rankings for the specified location.
        """
        # Validate that only one of after or before is provided
        if after is not None and before is not None:
            raise ValueError("Only one of 'after' or 'before' can be specified, not both.")
            
        endpoint = f"locations/{location_id}/rankings/clans"
        
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
    def get_location_player_rankings(
        location_id: int,
        limit: int = None,
        after: str = None,
        before: str = None
        ) -> dict:
        """
        Fetch player rankings for a specific location from the Clash Royale API.
        
        Args:
            location_id: The location identifier. To get a list of all locations and their ids, use the get_locations tool.
            
            limit: Limit the number of items returned in the response. (optional)
            
            after: Return only items that occur after this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
            before: Return only items that occur before this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
        Returns:
            Player rankings for the specified location.
        """
        # Validate that only one of after or before is provided
        if after is not None and before is not None:
            raise ValueError("Only one of 'after' or 'before' can be specified, not both.")
            
        endpoint = f"locations/{location_id}/rankings/players"
        
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
    def get_location_clan_war_rankings(
        location_id: int,
        limit: int = None,
        after: str = None,
        before: str = None
        ) -> dict:
        """
        Fetch clan war rankings for a specific location from the Clash Royale API.
        
        Args:
            location_id: The location identifier. To get a list of all locations and their ids, use the get_locations tool.

            limit: Limit the number of items returned in the response. (optional)

            after: Return only items that occur after this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
            before: Return only items that occur before this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
        Returns:
            Clan war rankings for the specified location.
        """
        # Validate that only one of after or before is provided
        if after is not None and before is not None:
            raise ValueError("Only one of 'after' or 'before' can be specified, not both.")
            
        endpoint = f"locations/{location_id}/rankings/clanwars"
        
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
    def get_top_path_of_legends_players_rankings(
        season_id: str,
        limit: int = None,
        after: str = None,
        before: str = None
        ) -> dict:
        """
        Fetch global Path of Legends player rankings for a specific season from the Clash Royale API.
        
        Args:
            season_id: The season identifier. To get a list of all seasons and their ids, use the get_seasons tool.

            limit: Limit the number of items returned in the response. (optional)

            after: Return only items that occur after this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
            before: Return only items that occur before this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
        Returns:
            Path of Legends player rankings for the specified season.
        """
        # Validate that only one of after or before is provided
        if after is not None and before is not None:
            raise ValueError("Only one of 'after' or 'before' can be specified, not both.")
            
        # Encode the season_id
        encoded_season_id = encode_tag(season_id)
        endpoint = f"locations/global/pathoflegend/{encoded_season_id}/rankings/players"
        
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
    def get_top_player_league_season(
        season_id: str
        ) -> dict:
        """
        Fetch global data for a specific season from the Clash Royale API.
        
        Args:
            season_id: The season identifier. To get a list of all seasons and their ids, use the get_seasons tool.
            
        Returns:
            Season player rankings for the specified season.
        """
        # Encode the season_id
        encoded_season_id = encode_tag(season_id)
        endpoint = f"locations/global/seasons/{encoded_season_id}"
        
        return make_api_request(endpoint)
    
    @mcp.tool()
    def get_season_top_player_rankings(
        season_id: str,
        limit: int = None,
        after: str = None,
        before: str = None
        ) -> dict:
        """
        Fetch top player rankings for a specific season from the Clash Royale API.
        
        Args:
            season_id: The season identifier. To get a list of all seasons and their ids, use the get_seasons tool.
            
            limit: Limit the number of items returned in the response. (optional)
            
            after: Return only items that occur after this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
            before: Return only items that occur before this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
        Returns:
            Top player rankings for the specified season.
        """
        # Validate that only one of after or before is provided
        if after is not None and before is not None:
            raise ValueError("Only one of 'after' or 'before' can be specified, not both.")
            
        # Encode the season_id
        encoded_season_id = encode_tag(season_id)
        endpoint = f"locations/global/seasons/{encoded_season_id}/rankings/players"
        
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
    def get_location_path_of_legends_player_rankings(
        location_id: int,
        limit: int = None,
        after: str = None,
        before: str = None
        ) -> dict:
        """
        Fetch Path of Legends player rankings for a specific location from the Clash Royale API.
        
        Args:
            location_id: The location identifier. To get a list of all locations and their ids, use the get_locations tool.
            
            limit: Limit the number of items returned in the response. (optional)
            
            after: Return only items that occur after this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
            before: Return only items that occur before this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
        Returns:
            Path of Legends player rankings for the specified location.
        """
        # Validate that only one of after or before is provided
        if after is not None and before is not None:
            raise ValueError("Only one of 'after' or 'before' can be specified, not both.")
            
        endpoint = f"locations/{location_id}/pathoflegend/players"
        
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
    def get_global_tournament_rankings(
        tournament_tag: str,
        limit: int = None,
        after: str = None,
        before: str = None
        ) -> dict:
        """
        Fetch global tournament rankings for a specific tournament from the Clash Royale API.
        
        Args:
            tournament_tag: The tournament identifer. To get a list of all tournaments and their tags, use the get_global_tournaments tool.
            
            limit: Limit the number of items returned in the response. (optional)
            
            after: Return only items that occur after this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
            before: Return only items that occur before this marker. Before marker can be found from the response, inside the 'paging' property.
                Note that only after or before can be specified for a request, not both. (optional)
            
        Returns:
            Global tournament rankings for the specified tournament.
        """
        # Validate that only one of after or before is provided
        if after is not None and before is not None:
            raise ValueError("Only one of 'after' or 'before' can be specified, not both.")
            
        # Encode the tournament_tag
        encoded_tournament_tag = encode_tag(tournament_tag)
        endpoint = f"locations/global/rankings/tournaments/{encoded_tournament_tag}"
        
        # Create a dictionary with only the non-None parameters
        queries = {k: v for k, v in {
            "limit": limit,
            "after": after,
            "before": before
        }.items() if v is not None}
        
        if queries:
            endpoint += "?" + build_query_string(queries)
        
        return make_api_request(endpoint)