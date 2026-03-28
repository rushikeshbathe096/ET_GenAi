from dotenv import load_dotenv
import os

load_dotenv()

GROQ_API_KEY      = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY    = os.getenv("GEMINI_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() in ("true", "1", "yes")
DEBUG     = os.getenv("DEBUG", "false").lower() in ("true", "1")

TOP_N_SIGNALS = int(os.getenv("TOP_N_SIGNALS", "10"))

LLM_PROVIDER = os.getenv("LLM_PROVIDER")

if not LLM_PROVIDER:
    if GROQ_API_KEY:
        LLM_PROVIDER = "groq"
    elif GEMINI_API_KEY:
        LLM_PROVIDER = "gemini"
    elif ANTHROPIC_API_KEY:
        LLM_PROVIDER = "anthropic"
    else:
        LLM_PROVIDER = "none"

if not DEMO_MODE:
    if not (GROQ_API_KEY or GEMINI_API_KEY or ANTHROPIC_API_KEY):
        raise ValueError("No LLM API key provided")