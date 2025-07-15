from fastcrud import FastCRUD

from app.models.schedule import Schedule
from app.schemas.schedule import (
    ScheduleCreateInternal,
    ScheduleDelete,
    ScheduleRead,
    ScheduleUpdate,
    ScheduleCreate,
)

CRUDSchedule = FastCRUD[
    Schedule,
    ScheduleCreateInternal,
    ScheduleUpdate,
    ScheduleCreate,
    ScheduleDelete,
    ScheduleRead,
]
crud_schedules = CRUDSchedule(Schedule)
