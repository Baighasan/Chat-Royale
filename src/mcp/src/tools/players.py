import logging
from .utils import make_api_request, encode_tag

logger = logging.getLogger(__name__)

def register_players_tools(mcp):
    """
    Register all player-related tools with the MCP server.
    
    Args:
        mcp: The FastMCP server instance
    """
    
    @mcp.tool()
    def get_player_info(player_tag: str) -> dict:
        """
        Fetch player info from the Clash Royale API. A player tag must be provided to look up a player.

        Args:
            player_tag: The player tag to look up (e.g. #ABCDEF). This should either be provided by the user in the
            format of a string with a leading '#', or retrieved as a part of a reponse from a different tool.
            
        Returns:
            Player information including stats, deck, etc. The following is some mock data of the first part of a
            player info response:
            
            {
                "tag": "#ABCDEF",
                "name": "Player Name",
                "expLevel": 50,
                "trophies": 1234,
                "bestTrophies": 1234,
                "wins": 6000,
                "losses": 2000,
                "battleCount": 6000,
                "threeCrownWins": 1000,
                "challengeCardsWon": 1000,
                "challengeMaxWins": 12,
                "tournamentCardsWon": 0,
                "tournamentBattleCount": 543,
                "role": "member",
                "donations": 100,
                "donationsReceived": 0,
                "totalDonations": 50000,
                "warDayWins": 7,
                "clanCardsCollected": 13782,
                "clan": {
                    "tag": "#QWERTY",
                    "name": "Clan Name",
                    "badgeId": 33333
            },
        """
        logger.info(f"get_player_info called with player_tag: {player_tag}")
        
        player_tag = encode_tag(player_tag)
        endpoint = f"players/{player_tag}"
        
        result = make_api_request(endpoint)
        logger.info(f"get_player_info completed successfully for player: {result.get('name', 'Unknown')}")
        return result

    # @mcp.tool()
    # def get_player_upcoming_chests(player_tag: str) -> dict:
    #     """
    #     Fetch upcoming chests for a player from the Clash Royale API.
        
    #     Args:
    #         player_tag: The player tag to look up (e.g. #ABCDEF). This should either be provided by the user in the
    #         format of a string with a leading '#', or retrieved as a part of a reponse from a different tool.
            
    #     Returns:
    #         Upcoming chests information including the index and name. The following is some mock data of the
    #         response:
            
    #         {
    #             "items": [
    #                 {
    #                     "index": 0,
    #                     "name": "Golden Chest"
    #                 },
    #                 {
    #                     "index": 1,
    #                     "name": "Tower Troop Chest"
    #                 },
    #                 {
    #                     "index": 2,
    #                     "name": "Golden Chest"
    #                 },
    #                 {
    #                     "index": 3,
    #                     "name": "Plentiful Gold Crate"
    #                 }
    #             ]
    #         }
    #     """
    #     logger.info(f"get_player_upcoming_chests called with player_tag: {player_tag}")
        
    #     player_tag = encode_tag(player_tag)
    #     endpoint = f"players/{player_tag}/upcomingchests"
        
    #     result = make_api_request(endpoint)
    #     logger.info(f"get_player_upcoming_chests completed successfully. Found {len(result.get('items', []))} upcoming chests")
    #     return result

    @mcp.tool()
    def get_player_battle_log(player_tag: str) -> dict:
        """
        Fetch battle log for a player from the Clash Royale API. A player tag must be provided to look up a player.
        
        Args:
            player_tag: The player tag to look up (e.g. #ABCDEF). This should either be provided by the user in the
            format of a string with a leading '#', or retrieved as a part of a reponse from a different tool.
            
        Returns:
            Battle log information including the battle details. Details returned include the gamemode, details about the
            cards in each player's deck and the outcome.
        """
        logger.info(f"get_player_battle_log called with player_tag: {player_tag}")
        
        player_tag = encode_tag(player_tag)
        endpoint = f"players/{player_tag}/battlelog"
        
        result = make_api_request(endpoint)
        logger.info(f"get_player_battle_log completed successfully. Found {len(result)} battles")
        return result