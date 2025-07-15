from datetime import datetime, UTC
import asyncio
from app.core.db.database import async_get_db, local_session
from app.models.workflow import Workflow
from sqlalchemy import select


# job runner wrapper
def schedule_runner(job_id: str):
    asyncio.create_task(scheduled_job(job_id))


# original async job
async def scheduled_job(job_id: str):
    print(f"✅ Job {job_id} ran at {datetime.now(UTC)}", flush=True)
    # await asyncio.sleep(10)
    async with local_session() as db:
        result = await db.execute(select(Workflow).where(Workflow.id == job_id))
        workflow = result.scalar_one_or_none()

        if workflow:
            print(f"✅ Workflow found: {workflow.name}", flush=True)
