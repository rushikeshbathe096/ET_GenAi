import logging
import sys
import os

# Configure robust logging for the pipeline orchestrator
logging.basicConfig(level=logging.INFO, format='%(asctime)s | %(levelname)s | %(message)s')
logger = logging.getLogger(__name__)

# Ensure local directory is precisely in path to run via `python agents/planner_agent.py`
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from . import analysis_agent
    from . import decision_agent
    from . import explanation_agent
except ImportError as e:
    logger.warning(f"Note: Could not import some agents: {e}")
    analysis_agent = type('Mock', (object,), {})
    decision_agent = type('Mock', (object,), {})
    explanation_agent = type('Mock', (object,), {})

try:
    from . import data_flow
except ImportError:
    data_flow = type('Mock', (object,), {})

def run_pipeline():
    logger.info("Initializing Agentic Intelligence Pipeline Orchestrator...")
    
    # Define exact sequential order required by system design
    pipeline_sequence = [
        ("Data Agent", data_flow),
        ("Analysis Agent", analysis_agent),
        ("Decision Agent", decision_agent),
        ("Explanation Agent", explanation_agent)
    ]
    
    for agent_name, agent_module in pipeline_sequence:
        logger.info(f"==> Step START: {agent_name} <==")
        try:
            # Dynamically fetch the 'run' method if it exists
            run_method = getattr(agent_module, 'run', None)
            
            if callable(run_method):
                run_method()
                logger.info(f"<== Step COMPLETED: {agent_name} ==")
            else:
                # If teammates haven't implemented the logic yet, do not crash. Gracefully mock success.
                logger.info(f"<== Step COMPLETED: {agent_name} (Running in Stub/Mock Mode) ==")
                
        except Exception as e:
            # Failsafe error handling. Keeps the orchestrator alive if a child agent crashes!
            logger.error(f"!!! Step FAILED: {agent_name} encountered an error: {str(e)} !!!")
            logger.info("Gracefully recovering from error. Proceeding to next step in sequence.")
            
    logger.info("Pipeline Orchestrator execution completely finished.")

if __name__ == "__main__":
    # Test execution
    run_pipeline()
