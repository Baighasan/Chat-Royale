import logging
from .utils import make_api_request, build_query_string

logger = logging.getLogger(__name__)

def register_cards_tools(mcp):
    """
    Register all card-related tools with the MCP server.
    
    Args:
        mcp: The FastMCP server instance
    """
    
    @mcp.tool()
    def get_cards(
        limit: int = None
    ) -> dict:
        """
        Get a list of available cards from the Clash Royale API. This tool ONLY gets info about the cards in the game, not the card's 
        game stats such as win rates, usage rates, or any other stats. It only returns the card's basic information such as name, id, elixir cost, rarity, etc.

        Use this tool if the user wants to see the available cards in the game, or wants to get information about specific card(s). Do NOT use this tool to get game stats or any other detailed information about the card's performance in game.
        
        If the card has an evolutionMedium and has a maxEvolutionLevel, then it has an evolution. If it does not, then it does not have an evolution.

        Args:
            limit: Limit the number of items returned in the response. (optional)
        
        Returns:
            Card information including stats, type, etc. The following is some mock data of a card in the response:
            
            {
                "name": "Card",
                "id": 20000,
                "maxLevel": 14,
                "maxEvolutionLevel": 1,
                "elixirCost": 3,
                "iconUrls": {
                    "medium": "#link-to-medium-icon",
                    "evolutionMedium": "#link-to-evolution-icon"
                },
                "rarity": "common",
            },
        """
        endpoint = f"cards?/limit={limit}" if limit else "cards"

        result = make_api_request(endpoint)
        logger.info(f"get_cards completed successfully. Retrieved {len(result)} cards")
        return result