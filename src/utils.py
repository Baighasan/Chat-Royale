# Constants
import os


CR_API_BASE = "https://api.clashroyale.com/v1"
CR_API_KEY = os.getenv("CR_API_KEY")

# Validate API key
if not CR_API_KEY:
    raise ValueError("CR_API_KEY environment variable is required")