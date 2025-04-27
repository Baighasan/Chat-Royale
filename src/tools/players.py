from utils import make_api_request, encode_player_tag

def register_player_tools(mcp):
    """
    Register all player-related tools with the MCP server.
    
    Args:
        mcp: The FastMCP server instance
    """
    
    @mcp.tool()
    def get_player_info(player_tag: str) -> dict:
        """
        Fetch player info from the Clash Royale API.
        
        Args:
            player_tag: The player tag to look up (e.g. #ABCDEF)
            
        Returns:
            Player information including stats, cards, etc.
        """
        player_tag = encode_player_tag(player_tag)
        return make_api_request(f"players/{player_tag}")

    @mcp.tool()
    def get_player_upcoming_chests(player_tag: str) -> dict:
        """
        Fetch upcoming chests for a player from the Clash Royale API.
        
        Args:
            player_tag: The player tag to look up (e.g. #ABCDEF)
            
        Returns:
            Upcoming chests information including the index and name.
        """
        player_tag = encode_player_tag(player_tag)
        return make_api_request(f"players/{player_tag}/upcomingchests")

    @mcp.tool()
    def get_player_battle_log(player_tag: str) -> dict:
        """
        Fetch battle log for a player from the Clash Royale API.
        
        Args:
            player_tag: The player tag to look up (e.g. #ABCDEF)
            
        Returns:
            Battle log information including the battle details.
        """
        player_tag = encode_player_tag(player_tag)
        return make_api_request(f"players/{player_tag}/battlelog")