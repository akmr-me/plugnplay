from datetime import datetime, UTC
import asyncio
import traceback
import re

from sqlalchemy import select

from app.core.db.database import local_session
from app.models.workflow import Workflow
from app.services.workflow_builder import WorkflowGraphBuilder
from app.schemas.workflow import WorkflowBase


def schedule_runner(job_id: str):
    """Wrapper to schedule the async job"""
    asyncio.create_task(scheduled_job(job_id))


async def scheduled_job(job_id: str):
    print(f"✅ Job {job_id} ran at {datetime.now(UTC)}", flush=True)

    async with local_session() as db:
        result = await db.execute(select(Workflow).where(Workflow.id == job_id))
        workflow_db = result.scalar_one_or_none()
        print(workflow_db, flush=True)

        workflow = WorkflowBase.model_validate(workflow_db).model_dump()

        if not workflow:
            print(f"❌ Workflow not found for ID: {job_id}", flush=True)
            return

        print(f"✅ Workflow found: {workflow['name']}", flush=True)

        try:
            compiled_graph = WorkflowGraphBuilder(workflow).build_graph()
        except Exception as e:
            print(f"❌ Error compiling workflow: {str(e)}", flush=True)
            traceback.print_exc()
            return

        try:
            # Extract first trigger node
            trigger_node = next(
                node for node in workflow["nodes"] if "trigger" in node["type"]
            )
            trigger_type = trigger_node["type"]
            if isinstance(trigger_type, list):
                trigger_type = trigger_type[0]

            input_payload = {trigger_type: trigger_node["data"]["output"]}

            # Build input state
            state = {
                "input": input_payload,
                "state": {
                    "nodes": {node["id"]: node for node in workflow["nodes"]},
                    "edges": {edge["id"]: edge for edge in workflow["edges"]},
                },
                # "user_id": workflow.user_id,  # ⚠️ Make sure this exists
            }

            await compiled_graph.ainvoke(state)

            print("✅ Workflow executed successfully", flush=True)

        except Exception as e:
            print("❌ Scheduler: Error during workflow execution:", flush=True)
            traceback.print_exc()

            tb_str = traceback.format_exc()
            match = re.search(r"During task with name '(.+?)' and id '(.+?)'", tb_str)
            failed_node_name = match.group(1) if match else None
            failed_node_id = match.group(2) if match else None

            print(f"🔴 Node failed: {failed_node_name} ({failed_node_id})")
            print(f"📨 Error message: {str(e)}", flush=True)
