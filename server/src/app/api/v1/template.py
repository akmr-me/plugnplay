from typing import Annotated, cast, Any
import uuid
import time

from fastapi import APIRouter, Depends, Request, Response
from fastcrud.paginated import PaginatedListResponse, compute_offset, paginated_response
from sqlalchemy.ext.asyncio import AsyncSession


from app.api.dependencies import get_current_user
from app.core.db.database import async_get_db
from ...core.exceptions.http_exceptions import (
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
)

from app.crud.crud_templates import crud_templates
from app.crud.crud_workflows import crud_workflows
from app.crud.crud_users import crud_users
from app.crud.crud_projects import crud_projects
from app.crud.form.form import crud_forms
from app.crud.form.form_field import crud_form_fields

from app.schemas.template import (
    TemplateCreate,
    TemplateRead,
    TemplateUpdate,
    TemplateBase,
    TemplateReadList,
    TemplateCreateInternal,
    TemplateReadListReponse,
    TemplateBaseRead,
)
from app.schemas.workflow import WorkflowRead, WorkflowCreate, WorkflowCreateInternal
from app.schemas.user import UserRead
from app.schemas.project import ProjectRead
from ...schemas.form.form import (
    FormCreate,
    FormCreateInternal,
    FormRead,
    FormUpdate,
    FormReadPatch,
)
from ...schemas.form.form_field import (
    FormFieldCreate,
    FormFieldCreateInternal,
    FormFieldRead,
    FormFieldBase,
    FormFieldUpdate,
)
from app.core.config import settings

from app.services.workflow_builder import WorkflowGraphBuilder

ADMIN_EMAIL_ID = settings.ADMIN_EMAIL_ID

DUMMY_ID = "dummy-credential-0000"


router = APIRouter(tags=["templates"])


@router.post(
    "/{user_id}/project/{project_id}/template/{workflow_id}",
    response_model=TemplateRead,
    status_code=201,
)
async def create_template(
    request: Request,
    user_id: str,
    template: TemplateCreate,
    project_id: uuid.UUID,
    workflow_id: uuid.UUID,
    # TODO: Uncomment when user authentication is implemented
    current_user: Annotated[UserRead, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> TemplateRead:
    """Create a new template"""

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

    if current_user.email != ADMIN_EMAIL_ID:
        raise UnauthorizedException("You are not authorized to create templates.")

    # Check if workflow is valid
    db_workflow = await crud_workflows.get(
        db=db, id=workflow_id, is_deleted=False, schema_to_select=WorkflowRead
    )
    if db_workflow is None:
        raise NotFoundException("Workflow not found")

    # compile workflow to check for errors
    try:
        graph_builder = WorkflowGraphBuilder(db_workflow).build_graph()

    except Exception as e:
        import traceback

        traceback.print_exc()
        print(f"Error compiling workflow: {str(e)}")
        raise NotFoundException(f"Workflow compilation failed: {str(e)}")

    template_internal_dict = template.model_dump()
    # uuid.UUID(str(uuid_utils.uuid7())
    # Sanatize nodes and edges

    node_id_dict = {
        node["id"]: f"node_{int(time.time() * 1000)}_{i}"
        for i, node in enumerate(db_workflow["nodes"])
    }

    # trigger_node = next(
    #     (node for node in db_workflow["nodes"] if "trigger" in node["type"].lower()),
    #     None,
    # )

    # if trigger_node is None:
    #     raise NotFoundException("Trigger node not found")

    # trigger_node_type = trigger_node["type"]

    # Then: Build sanitized_nodes with the new IDs
    sanitized_nodes = []

    for node in db_workflow["nodes"]:
        new_node = {
            "id": node_id_dict[node["id"]],
            "type": node["type"],
            "position": node["position"],
            "measured": node["measured"],
        }

        original_state = node["data"]["state"]

        has_credential = (
            "credential_id" in original_state or "credentialId" in original_state
        )

        filtered_state = {
            k: (DUMMY_ID if k in ("credential_id", "credentialId") else v)
            for k, v in original_state.items()
        }

        data = {
            "input": {},
            "output": {},
            "state": filtered_state,
        }

        if has_credential:
            data["error"] = "Please do not forget to add credential"

        new_node["data"] = data
        sanitized_nodes.append(new_node)

    # Lastly: Build sanitized_edges with unique indexed edge IDs
    sanitized_edges = [
        {
            **edge,
            "id": f"edge_{int(time.time() * 1000)}_{i}",
            "source": node_id_dict[edge["source"]],
            "target": node_id_dict[edge["target"]],
        }
        for i, edge in enumerate(db_workflow["edges"])
    ]

    template_internal_dict["created_by"] = current_user.user_id
    template_internal_dict["is_activated"] = ADMIN_EMAIL_ID == current_user.email
    template_internal_dict["workflow_id"] = uuid.UUID(str(db_workflow["id"]))
    template_internal_dict["nodes"] = sanitized_nodes
    template_internal_dict["edges"] = sanitized_edges
    template_internal_dict["viewport"] = db_workflow["viewport"]
    template_internal = TemplateCreateInternal(**template_internal_dict)

    created_template = await crud_templates.create(db=db, object=template_internal)

    template_read = await crud_templates.get(
        db=db, id=created_template.id, schema_to_select=TemplateRead
    )

    if template_read is None:
        raise NotFoundException("Created template not found")
    c = cast(TemplateRead, template_read)

    return c


@router.get(
    "/{user_id}/template",
    response_model=PaginatedListResponse[TemplateReadListReponse],
    status_code=200,
)
async def get_templates(
    current_user: Annotated[UserRead, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
    page: int = 1,
    items_per_page: int = 6,
):
    """Get all templates for the current user"""
    db_user = await crud_users.get(
        db=db, user_id=current_user.user_id, is_deleted=False, schema_to_select=UserRead
    )
    if db_user is None:
        raise NotFoundException("User not found")

    db_templates = await crud_templates.get_multi(
        is_deleted=False,
        order_by="created_at",
        order_direction="desc",
        db=db,
        offset=compute_offset(page, items_per_page),
        limit=items_per_page,
        schema_to_select=TemplateReadList,
    )
    response_data = {
        "data": [
            {
                "id": template["id"],
                "name": template["name"],
                "description": template["description"],
                "created_at": template["created_at"],
                "is_user_creator": db_user["user_id"] == template["created_by"],
            }
            for template in db_templates["data"]
        ]
    }
    print(response_data)
    response: dict[str, Any] = paginated_response(
        crud_data=response_data, page=page, items_per_page=items_per_page
    )
    return response


@router.get(
    "/{user_id}/template/{template_id}",
    response_model=TemplateRead,
    status_code=200,
)
async def get_template_by_id(
    current_user: Annotated[UserRead, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
    template_id: uuid.UUID,
):
    """Get a template by id"""
    db_template = await crud_templates.get(
        db=db, id=template_id, is_deleted=False, schema_to_select=TemplateRead
    )
    if db_template is None:
        raise NotFoundException("Template not found")

    return db_template


@router.delete(
    "/{user_id}/template/{template_id}",
    status_code=204,
)
async def delete_template(
    request: Request,
    user_id: str,
    template_id: uuid.UUID,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
):
    db_user = await crud_users.get(
        db=db, user_id=user_id, is_deleted=False, schema_to_select=UserRead
    )
    if not db_user:
        raise NotFoundException("User not found")

    db_user = cast(UserRead, db_user)

    if current_user.user_id != db_user["user_id"]:
        raise ForbiddenException()

    db_template = await crud_templates.get(
        db=db, id=template_id, is_deleted=False, schema_to_select=TemplateReadList
    )
    if db_template is None:
        raise NotFoundException("Template not found")

    if db_template["created_by"] != current_user.user_id:
        raise ForbiddenException()

    await crud_templates.delete(db=db, id=template_id, created_by=current_user.user_id)

    return Response(status_code=204)


# Fork template
@router.post(
    "/{user_id}/template/{template_id}/project/{project_id}/fork",
    # response_model=TemplateRead,
    status_code=201,
)
async def fork_template(
    request: Request,
    user_id: str,
    template_id: str,
    workflow: WorkflowCreate,
    project_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(async_get_db)],
    current_user: Annotated[UserRead, Depends(get_current_user)],
):
    db_user = await crud_users.get(
        db=db, user_id=user_id, is_deleted=False, schema_to_select=UserRead
    )
    print(template_id, project_id, workflow)
    if db_user is None:
        raise NotFoundException("User not found")

    db_user = cast(UserRead, db_user)

    if current_user.user_id != db_user["user_id"]:
        raise ForbiddenException()

    db_template = await crud_templates.get(db=db, id=template_id, is_deleted=False)
    print(db_template)
    if db_template is None:
        raise NotFoundException("Template not found")

    db_project = await crud_projects.get(
        db=db, id=project_id, is_deleted=False, schema_to_select=ProjectRead
    )

    if not db_project:
        print(f"Project not found for ID: {project_id}")
        raise NotFoundException("Project not found")
    print("============================================================")
    print("db_template", db_template)
    print("============================================================")
    # create workflow inside project
    workflow_internal_dict = workflow.model_dump()
    workflow_internal_dict["project_id"] = project_id
    workflow_internal = WorkflowCreateInternal(**workflow_internal_dict)

    created_workflow = await crud_workflows.create(db=db, object=workflow_internal)

    created_workflow_id = created_workflow.id

    # create trigger node
    trigger_node = next(
        (node for node in db_template["nodes"] if "trigger" in node.get("type", "")),
        None,
    )
    print("trigger")
    print(trigger_node)
    type = trigger_node["type"]
    if type == "form-trigger":
        # 1. Create form
        state = trigger_node["data"]["state"]
        form_create_data = {
            "title": state["formTitle"],
            "description": state["formDescription"],
        }
        print("state", state)
        form_create = FormCreate(**form_create_data)
        form_create_internal = form_create.model_dump()
        print("9999")
        print("form_create_internal", form_create_internal)

        form_create_internal["workflow_id"] = uuid.UUID(str(created_workflow_id))
        form_create_internal["id"] = uuid.UUID(str(created_workflow_id))
        form_internal = FormCreateInternal(**form_create_internal)
        created_form = await crud_forms.create(db=db, object=form_internal)
        print("created_form")

        # 2. Create form fields
        fields = trigger_node["data"]["state"]["fields"]
        for field in fields:
            print("\n")
            print("field", field)
            form_field_internal_dict = field
            print("model dumped", form_field_internal_dict)
            form_field_internal_dict["form_id"] = uuid.UUID(str(created_workflow_id))
            form_field_internal_dict["label"] = field["label"]
            form_field_internal_dict["placeholder"] = field["placeholder"]
            form_field_internal_dict["required"] = field["required"]
            form_field_internal_dict["position"] = field["position"]

            form_field_internal = FormFieldCreateInternal(**form_field_internal_dict)
            created_form_field = await crud_form_fields.create(
                db=db, object=form_field_internal
            )
        # pass

    # Update workflow

    node_id_dict = {
        node["id"]: f"node_{int(time.time() * 1000)}_{i}"
        for i, node in enumerate(db_template["nodes"])
    }

    sanitized_nodes = []

    for node in db_template["nodes"]:
        new_node = {
            "id": node_id_dict[node["id"]],
            "type": node["type"],
            "position": node["position"],
            "measured": node["measured"],
            "workflowId": str(created_workflow_id),
            "dragging": False,
            "selected": True,
        }

        original_state = node["data"]["state"]
        has_credential = (
            "credentialId" in original_state or "credential_id" in original_state
        )

        filtered_state = {
            k: (
                DUMMY_ID
                if k in ("credentialId", "credential_id")
                else (
                    [{**field, "form_id": str(created_workflow_id)} for field in v]
                    if (k == "fields" and "trigger" in new_node["type"])
                    else v
                )
            )
            for k, v in original_state.items()
        }

        data = {
            "input": {},
            "output": {},
            "state": filtered_state,
        }

        if has_credential:
            data["error"] = "Please do not forget to add credential"

        new_node["data"] = data
        sanitized_nodes.append(new_node)

    # Lastly: Build sanitized_edges with unique indexed edge IDs
    sanitized_edges = [
        {
            **edge,
            "id": f"edge_{int(time.time() * 1000)}_{i}",
            "source": node_id_dict[edge["source"]],
            "target": node_id_dict[edge["target"]],
        }
        for i, edge in enumerate(db_template["edges"])
    ]
    import json

    update_workflow_values = {
        "nodes": sanitized_nodes,
        "edges": sanitized_edges,
        "viewport": db_template["viewport"],
    }
    # print(json.dumps(update_workflow_values, indent=2))
    print("\n\n")
    print("update_workflow_values", update_workflow_values)
    await crud_workflows.update(
        db=db, id=uuid.UUID(str(created_workflow_id)), object=update_workflow_values
    )

    # swit
    # add all nodes and edges to workflow

    return Response(status_code=204)
