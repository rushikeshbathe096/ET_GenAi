from dotenv import load_dotenv
import os

load_dotenv()

LLM_PROVIDER      = os.getenv("LLM_PROVIDER", "groq")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
GROQ_API_KEY      = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY    = os.getenv("GEMINI_API_KEY", "")
DEMO_MODE         = os.getenv("DEMO_MODE", "false") == "true"
TOP_N_SIGNALS     = int(os.getenv("TOP_N_SIGNALS", "10"))
