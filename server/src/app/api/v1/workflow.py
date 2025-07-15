from typing import Annotated, cast, Any
import uuid

from fastapi import APIRouter, Depends, Request
from fastcrud.paginated import PaginatedListResponse, compute_offset, paginated_response
from sqlalchemy.ext.asyncio import AsyncSession


from app.api.dependencies import get_current_user
from app.core.db.database import async_get_db
from ...core.exceptions.http_exceptions import (
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
)

from app.crud.crud_workflows import crud_workflows
from app.crud.crud_users import crud_users
from app.crud.crud_projects import crud_projects
from app.schemas.workflow import (
    WorkflowCreate,
    WorkflowRead,
    WorkflowUpdate,
    WorkflowCreateInternal,
)
from app.schemas.user import UserRead
from app.schemas.project import ProjectRead

router = APIRouter(tags=["workflows"])


@router.post(
    "/{user_id}/project/{project_id}/workflow",
    response_model=WorkflowRead,
    status_code=201,
)
async def create_workflow(
    request: Request,
    user_id: str,
    workflow: WorkflowCreate,
    project_id: uuid.UUID,
    current_user: Annotated[UserRead, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> WorkflowRead:
    """Create a new workflow"""
    db_user = await crud_users.get(
        db=db, user_id=user_id, is_deleted=False, schema_to_select=UserRead
    )
    if db_user is None:
        raise NotFoundException("User not found")

    db_user = cast(UserRead, db_user)

    db_project = await crud_projects.get(
        db=db, id=project_id, is_deleted=False, schema_to_select=ProjectRead
    )

    if not db_project:
        print(f"Project not found for ID: {project_id}")
        raise NotFoundException("Project not found")

    if current_user.user_id != db_project["user_id"]:
        raise ForbiddenException()

    workflow_internal_dict = workflow.model_dump()
    # uuid.UUID(str(uuid_utils.uuid7())
    workflow_internal_dict["project_id"] = uuid.UUID(str(db_project["id"]))
    workflow_internal = WorkflowCreateInternal(**workflow_internal_dict)

    created_workflow = await crud_workflows.create(db=db, object=workflow_internal)

    workflow_read = await crud_workflows.get(
        db=db, id=created_workflow.id, schema_to_select=WorkflowRead
    )

    if workflow_read is None:
        raise NotFoundException("Created workflow not found")
    c = cast(WorkflowRead, workflow_read)

    return c


# This will return all projects of a user
# @router.get("/{user_id}/project", response_model=PaginatedListResponse[ProjectRead])
# async def read_projects(
#     request: Request,
#     user_id: str,
#     db: Annotated[AsyncSession, Depends(async_get_db)],
#     page: int = 1,
#     projects_per_page: int = 10,
# ) -> dict:
#     db_user = await crud_users.get(
#         db=db, user_id=user_id, is_deleted=False, schema_to_select=UserRead
#     )
#     if not db_user:
#         raise NotFoundException("User not found")

#     db_user = cast(UserRead, db_user)
#     projects_data = await crud_projects.get_multi(
#         db=db,
#         offset=compute_offset(page, projects_per_page),
#         limit=projects_per_page,
#         user_id=db_user.id,
#         is_deleted=False,
#     )

#     response: dict[str, Any] = paginated_response(
#         crud_data=projects_data, page=page, items_per_page=projects_per_page
#     )
#     return response


# ✅
@router.get(
    "/{user_id}/project/{project_id}/workflow/{workflow_id}",
    response_model=WorkflowRead,
    status_code=200,
)
async def read_workflow(
    request: Request,
    user_id: str,
    project_id: str,
    workflow_id: str,
    db: Annotated[AsyncSession, Depends(async_get_db)],
    current_user: Annotated[UserRead, Depends(get_current_user)],
) -> dict[str, str]:
    db_user = await crud_users.get(
        db=db, user_id=user_id, is_deleted=False, schema_to_select=UserRead
    )
    if db_user is None:
        raise NotFoundException("User not found")

    db_user = cast(UserRead, db_user)

    if current_user.user_id != db_user["user_id"]:
        raise ForbiddenException()

    db_workflow = await crud_workflows.get(
        db=db, id=workflow_id, is_deleted=False, schema_to_select=WorkflowRead
    )
    if db_workflow is None:
        raise NotFoundException("Workflow not found")

    if db_workflow["project_id"] != uuid.UUID(project_id):
        print(f"Workflow in not that project {workflow_id} project_id {project_id}")
        raise UnauthorizedException()

    db_project = await crud_projects.get(
        db=db, id=project_id, is_deleted=False, schema_to_select=ProjectRead
    )

    if db_project is None:
        raise NotFoundException("Project not found")

    if db_project["user_id"] != user_id:
        print(
            f"Project doesn't belong to current user. {db_project.id} user {db_user.user_id} workflow {db_workflow.id}"
        )
        raise UnauthorizedException()

    return cast(WorkflowRead, db_workflow)


@router.patch(
    "/{user_id}/project/{project_id}/workflow/{workflow_id}",
)
async def patch_workflow(
    request: Request,
    user_id: str,
    project_id: str,
    values: WorkflowUpdate,
    workflow_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> dict[str, str]:
    db_user = await crud_users.get(
        db=db, user_id=user_id, is_deleted=False, schema_to_select=UserRead
    )
    if db_user is None:
        raise NotFoundException("User not found")

    db_user = cast(UserRead, db_user)
    if current_user.user_id != db_user["user_id"]:
        raise ForbiddenException()

    db_workflow = await crud_workflows.get(
        db=db, id=workflow_id, is_deleted=False, schema_to_select=WorkflowRead
    )
    if db_workflow is None:
        print("workflow not found", workflow_id)
        raise NotFoundException("Workflow not found")
    if db_workflow["project_id"] != uuid.UUID(project_id):
        print(f"Failed to update workflow_id {workflow_id} project_id {project_id}")
        raise UnauthorizedException()

    db_project = await crud_projects.get(
        db=db, id=project_id, is_deleted=False, schema_to_select=ProjectRead
    )

    if db_project is None:
        raise NotFoundException("Project not found")

    if db_project["user_id"] != user_id:
        print(
            f"Failed to update workflow project {db_project.id} user {db_user.user_id} workflow {db_workflow.id}"
        )
        raise UnauthorizedException()

    await crud_workflows.update(db=db, object=values, id=workflow_id)
    return {"message": "Workflow updated!"}


# Tested ✅
@router.delete(
    "/{user_id}/project/{project_id}/workflow/{workflow_id}", status_code=200
)
async def erase_db_post(
    request: Request,
    user_id: str,
    project_id: str,
    workflow_id: str,
    db: Annotated[AsyncSession, Depends(async_get_db)],
    current_user: Annotated[UserRead, Depends(get_current_user)],
) -> dict[str, str]:
    db_user = await crud_users.get(
        db=db, user_id=user_id, is_deleted=False, schema_to_select=UserRead
    )
    if db_user is None:
        raise NotFoundException("User not found")

    db_user = cast(UserRead, db_user)

    if current_user.user_id != db_user["user_id"]:
        raise ForbiddenException()

    db_workflow = await crud_workflows.get(
        db=db, id=workflow_id, is_deleted=False, schema_to_select=WorkflowRead
    )
    if db_workflow is None:
        raise NotFoundException("Workflow not found")

    if db_workflow["project_id"] != uuid.UUID(project_id):
        print(f"Failed to delete workflow_id {workflow_id} project_id {project_id}")
        raise UnauthorizedException()

    db_project = await crud_projects.get(
        db=db, id=project_id, is_deleted=False, schema_to_select=ProjectRead
    )

    if db_project is None:
        raise NotFoundException("Project not found")

    if db_project["user_id"] != user_id:
        print(
            f"Failed to delete workflow project {db_project.id} user {db_user.user_id} workflow {db_workflow.id}"
        )
        raise UnauthorizedException()

    await crud_workflows.db_delete(db=db, id=workflow_id)
    return {"message": "Workflow deleted sucessfully."}
