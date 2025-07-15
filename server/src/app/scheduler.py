# app/scheduler.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore

# from app.jobs import my_scheduled_job
from app.core.config import settings

DATABASE_URL = "postgresql://" + settings.POSTGRES_URI

jobstores = {
    "default": SQLAlchemyJobStore(url=DATABASE_URL),
}

scheduler = AsyncIOScheduler(jobstores=jobstores, timezone="Asia/Kolkata")


def start_scheduler():
    scheduler.start()


def remove_scheduler(job_id: str):
    print(f"❌ Removing job {job_id}")
    scheduler.remove_job(job_id)
