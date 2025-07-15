from typing import Annotated, cast, Any

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

from app.crud.crud_projects import crud_projects
from app.crud.crud_users import crud_users
from app.crud.crud_workflows import crud_workflows
from app.schemas.project import (
    ProjectCreate,
    ProjectRead,
    ProjectUpdate,
    ProjectCreateInternal,
)
from app.schemas.workflow import WorkflowRead, WorkflowMeta
from app.schemas.user import UserRead

router = APIRouter(tags=["projects"])


@router.post("/{user_id}/project", response_model=ProjectRead, status_code=201)
async def create_project(
    request: Request,
    user_id: str,
    project: ProjectCreate,
    current_user: Annotated[UserRead, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> ProjectRead:
    """Create a new project"""
    db_user = await crud_users.get(
        db=db, user_id=user_id, is_deleted=False, schema_to_select=UserRead
    )
    if db_user is None:
        raise NotFoundException("User not found")

    db_user = cast(UserRead, db_user)

    if current_user.id != db_user["id"]:
        raise ForbiddenException()

    project_internal_dict = project.model_dump()

    project_internal_dict["user_id"] = db_user["user_id"]
    project_internal = ProjectCreateInternal(**project_internal_dict)
    created_project = await crud_projects.create(db=db, object=project_internal)

    project_read = await crud_projects.get(
        db=db, id=created_project.id, schema_to_select=ProjectRead
    )
    if project_read is None:
        raise NotFoundException("Created project not found")

    return cast(ProjectRead, project_read)


# This will return all projects of a user
@router.get("/{user_id}/project", response_model=PaginatedListResponse[ProjectRead])
async def read_projects(
    request: Request,
    user_id: str,
    db: Annotated[AsyncSession, Depends(async_get_db)],
    current_user: Annotated[UserRead, Depends(get_current_user)],
    page: int = 1,
    projects_per_page: int = 10,
) -> dict:
    db_user = await crud_users.get(
        db=db, user_id=user_id, is_deleted=False, schema_to_select=UserRead
    )
    if not db_user:
        raise NotFoundException("User not found")

    db_user = cast(UserRead, db_user)

    if current_user.user_id != db_user["user_id"]:
        raise ForbiddenException()

    projects_data = await crud_projects.get_multi(
        db=db,
        offset=compute_offset(page, projects_per_page),
        limit=projects_per_page,
        user_id=db_user["user_id"],
        is_deleted=False,
    )

    response: dict[str, Any] = paginated_response(
        crud_data=projects_data, page=page, items_per_page=projects_per_page
    )
    return response


#  Get all workflows from project
@router.get(
    "/{user_id}/project/{project_id}",
    response_model=PaginatedListResponse[WorkflowMeta],
)
async def read_workflows_from_project(
    request: Request,
    user_id: str,
    project_id: str,
    db: Annotated[AsyncSession, Depends(async_get_db)],
    current_user: Annotated[UserRead, Depends(get_current_user)],
    page: int = 1,
    workflows_per_page: int = 10,
) -> dict:
    db_user = await crud_users.get(
        db=db, user_id=user_id, is_deleted=False, schema_to_select=UserRead
    )
    if not db_user:
        raise NotFoundException("User not found")

    db_user = cast(UserRead, db_user)

    if current_user.user_id != db_user["user_id"]:
        raise ForbiddenException()

    workflows_data = await crud_workflows.get_multi(
        db=db,
        offset=compute_offset(page, workflows_per_page),
        limit=workflows_per_page,
        project_id=project_id,
        is_deleted=False,  # if your workflows support soft delete
        schema_to_select=WorkflowMeta,
    )

    response: dict[str, Any] = paginated_response(
        crud_data=workflows_data, page=page, items_per_page=workflows_per_page
    )
    return response


@router.delete("/{user_id}/project/{project_id}", status_code=200)
async def erase_db_post(
    request: Request,
    user_id: str,
    project_id: str,
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

    db_project = await crud_projects.get(
        db=db, id=project_id, is_deleted=False, schema_to_select=ProjectRead
    )
    if db_project is None:
        raise NotFoundException("Project not found")

    if db_project["user_id"] != user_id:
        print(
            f"Failed to delete Project project {db_project.id} user {db_user.user_id}"
        )
        raise UnauthorizedException()

    await crud_projects.db_delete(db=db, id=project_id)
    return {"message": "Project deleted sucessfully."}
