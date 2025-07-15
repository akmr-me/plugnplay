from fastapi import APIRouter, Depends, Request, Response
from typing import Annotated, Any, cast
from datetime import datetime

# from pytz import timezone
from zoneinfo import ZoneInfo

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from ...schemas.user import UserRead
from ...schemas.schedule import ScheduleRead, ScheduleCreate, ScheduleCreateInternal
from ...crud.crud_schedule import crud_schedules

from ...api.dependencies import get_current_user
from ...core.db.database import async_get_db
from ...core.exceptions.http_exceptions import (
    ForbiddenException,
    NotFoundException,
    BadRequestException,
)
from app.scheduler import scheduler, start_scheduler
from app.services.scheduled_job import scheduled_job, schedule_runner
from apscheduler.triggers.date import DateTrigger


router = APIRouter(tags=["schedules"])


@router.get("/schedule/{workflow_id}", response_model=ScheduleRead)
async def get_schedule(
    workflow_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> ScheduleRead:
    # Check if schedule/form exists for the workflow
    db_schedule = await crud_schedules.get(
        db=db, id=workflow_id, is_deleted=False, schema_to_select=ScheduleRead
    )

    if db_schedule is None:
        raise NotFoundException("Workflow not found")

    return cast(ScheduleRead, db_schedule)


@router.post("/schedule/{workflow_id}", response_model=ScheduleRead, status_code=201)
async def upsert_schedule(
    request: Request,
    workflow_id: str,
    schedule: ScheduleCreate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> ScheduleRead:
    # Check if schedule already exists
    db_schedule = await crud_schedules.get(
        db=db, id=workflow_id, is_deleted=False, schema_to_select=ScheduleRead
    )

    # Add sheduler job here
    run_at = schedule.run_at

    if run_at.tzinfo is None:
        run_at = run_at.replace(tzinfo=ZoneInfo("Asia/Kolkata"))

    # local_run_at = run_at.astimezone(ZoneInfo("Asia/Kolkata"))
    if run_at:
        val = scheduler.add_job(
            scheduled_job,
            trigger=DateTrigger(run_date=run_at),
            kwargs={
                "job_id": workflow_id,
            },
            id=workflow_id,
            replace_existing=True,
        )

    if db_schedule:
        update_data = schedule.model_dump(exclude_unset=True)
        await crud_schedules.update(
            db=db,
            object=update_data,
            id=workflow_id,
        )
        db_schedule = await crud_schedules.get(
            db=db, id=workflow_id, is_deleted=False, schema_to_select=ScheduleRead
        )

        return cast(ScheduleRead, db_schedule)

    else:
        schedule_internal_dict = schedule.model_dump()
        schedule_internal_dict["workflow_id"] = workflow_id
        schedule_internal_dict["id"] = uuid.UUID(workflow_id)

        schedule_internal = ScheduleCreateInternal(**schedule_internal_dict)
        created_schedule = await crud_schedules.create(db=db, object=schedule_internal)

        db_schedule = crud_schedules.get(
            db=db, id=created_schedule.id, schema_to_select=ScheduleRead
        )

        if created_schedule is None:
            raise NotFoundException("Created schedule not found")

        return await cast(ScheduleRead, db_schedule)


@router.delete(
    "/schedule/{workflow_id}",
    status_code=204,
)
async def delete_form_field(
    request: Request,
    workflow_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
):
    # ✅ Optionally: Check if form and field belong to the current user's workflow
    schedule_read = await crud_schedules.get(
        db=db, id=workflow_id, schema_to_select=ScheduleRead
    )

    if schedule_read is None:
        raise NotFoundException("Form field not found")

    # Optionally validate that this field's form belongs to `workflow_id` and current_user

    await crud_schedules.db_delete(db=db, id=workflow_id)

    # HTTP 204 = No Content (typical for DELETE success)
    return Response(status_code=204)
