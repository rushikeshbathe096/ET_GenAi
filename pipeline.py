import logging
import time

from apscheduler.schedulers.blocking import BlockingScheduler

from agents.planner_agent import run_pipeline


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)


def execute_pipeline():

    start_time = time.time()

    logging.info("Pipeline execution started")

    try:

        run_pipeline()

        duration = time.time() - start_time

        logging.info("Pipeline execution completed successfully")

        logging.info(
            f"Execution duration: {duration:.4f} seconds"
        )

    except Exception as e:

        logging.error("Pipeline execution failed")

        logging.error(str(e))


def start_scheduler():

    scheduler = BlockingScheduler()

    scheduler.add_job(
        execute_pipeline,
        trigger="cron",
        hour=8,
        minute=0
    )

    logging.info(
        "Scheduler started — pipeline will run daily at 08:00 AM"
    )

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logging.info("Scheduler manually stopped.")


if __name__ == "__main__":

    start_scheduler()
