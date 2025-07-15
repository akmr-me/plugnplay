from typing import Annotated, Any, cast
from uuid import UUID

from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession  # type: ignore
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ...api.dependencies import get_optional_user, get_current_user
from ...core.db.database import async_get_db
from ...core.exceptions.http_exceptions import (
    ForbiddenException,
    NotFoundException,
    BadRequestException,
)
from ...core.utils.cache import cache
from ...crud.form.form import crud_forms
from ...crud.crud_users import crud_users
from ...crud.form.form_field import crud_form_fields
from ...crud.crud_workflows import crud_workflows
from ...crud.form.form_response import crud_form_responses
from ...crud.form.form_response_value import crud_form_response_values
from ...schemas.form.form import FormCreate, FormCreateInternal, FormRead, FormUpdate
from ...schemas.form.form_field import (
    FormFieldCreate,
    FormFieldCreateInternal,
    FormFieldRead,
    FormFieldBase,
    FormFieldUpdate,
)
from ...schemas.form.form_response import FormResponseCreateInternal, FormResponseRead
from ...schemas.form.form_response_value import (
    FormResponseValueCreateInternal,
    FormResponseValueRead,
)
from ...schemas.workflow import WorkflowRead
from ...schemas.user import UserRead
from ...models.form.form import Form
from ...models.form.form_response import FormResponse
from ...models.form.form_response_value import FormResponseValue
from app.services.workflow_builder import WorkflowGraphBuilder

from app.services.generate_form_html import generate_form_html
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# security = HTTPBearer()


router = APIRouter(tags=["forms"])


# -------------------------------------------Form----------------------------------------------------
@router.post("/form/{workflow_id}", response_model=FormRead, status_code=201)
async def create_form(
    request: Request,
    workflow_id: str,
    form: FormCreate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> FormRead:
    # Check if workflow belongs to user or not

    # If form already exits return all data
    # form_read = await crud_forms.get(db=db, id=workflow_id, schema_to_select=FormRead)

    stmt = select(Form).where(Form.id == workflow_id).options(selectinload(Form.fields))
    result = await db.execute(stmt)
    form_with_fields = result.scalar_one_or_none()

    if form_with_fields:
        return cast(FormRead, form_with_fields)
    # Step 1: Create Form DB object
    form_internal_dict = form.model_dump(exclude={"fields"})
    form_internal_dict["workflow_id"] = workflow_id
    form_internal_dict["id"] = UUID(workflow_id)

    form_internal = FormCreateInternal(**form_internal_dict)
    created_form = await crud_forms.create(db=db, object=form_internal)

    form_read = await crud_forms.get(
        db=db, id=created_form.id, schema_to_select=FormRead
    )
    if form_read is None:
        raise NotFoundException("Created form not found")

    return cast(FormRead, form_read)


@router.patch("/form/{form_id}")
async def update_form_title_or_description(
    form_id: str,
    update: FormUpdate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> dict:
    form_uuid = UUID(form_id)

    # Get the form
    form = await crud_forms.get(db=db, id=form_uuid, schema_to_select=FormRead)
    if form is None:
        raise NotFoundException("Form not found")

    # Ensure user owns the form (via workflow)
    workflow = await crud_workflows.get(
        db=db, id=form["workflow_id"], schema_to_select=WorkflowRead
    )
    # if workflow is None or workflow.user_id != current_user["id"]:
    #     raise ForbiddenException("You do not have permission to update this form")

    # Prepare update
    update_data = update.model_dump(exclude_unset=True)
    if not update_data:
        raise BadRequestException(status_code=400, detail="No valid fields to update.")

    updated_form = await crud_forms.update(db=db, object=update_data, id=form_uuid)

    return {"message": "Post updated"}


@router.delete(
    "/form/{workflow_id}",
    status_code=204,
)
async def delete_form(
    request: Request,
    workflow_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
):
    # ✅ Optionally: Check if form and field belong to the current user's workflow
    form_read = await crud_forms.get(db=db, id=workflow_id, schema_to_select=FormRead)

    if form_read is None:
        raise NotFoundException("Form not found")

    # Optionally validate that this field's form belongs to `workflow_id` and current_user

    await crud_forms.db_delete(db=db, id=workflow_id)

    # HTTP 204 = No Content (typical for DELETE success)
    return Response(status_code=204)


# ---------------------------------------------Form Field--------------------------------------------
@router.post(
    "/form/{workflow_id}/form_field", response_model=FormFieldRead, status_code=201
)
async def create_form_field(
    request: Request,
    workflow_id: str,
    form_field: FormFieldCreate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> dict:
    # TODO: Check if form exists for current user

    form_field_internal_dict = form_field.model_dump()
    form_field_internal_dict["form_id"] = UUID(workflow_id)
    form_field_internal_dict["label"] = ""
    form_field_internal_dict["placeholder"] = ""

    form_field_internal = FormFieldCreateInternal(**form_field_internal_dict)
    created_form_field = await crud_form_fields.create(
        db=db, object=form_field_internal
    )

    form_field_read = await crud_form_fields.get(
        db=db, id=created_form_field.id, schema_to_select=FormFieldRead
    )
    if form_field_read is None:
        raise NotFoundException("Created form field not found")

    return cast(FormFieldRead, form_field_read)


@router.patch(
    "/form/{workflow_id}/form_field/{form_field_id}",
    status_code=201,
)
async def update_form_field(
    request: Request,
    workflow_id: str,
    form_field: FormFieldUpdate,
    form_field_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> dict:
    # TODO: Check if form exists for current user

    form_field_read = await crud_form_fields.get(
        db=db, id=form_field_id, schema_to_select=FormFieldRead
    )

    if form_field_read is None:
        raise NotFoundException("Form field not found")

    form_field_internal_dict = form_field.model_dump(exclude_unset=True)

    form_field_internal = FormFieldUpdate(**form_field_internal_dict)

    updated_form_field = await crud_form_fields.update(
        db=db, object=form_field_internal, id=form_field_id
    )

    form_field_read = await crud_form_fields.get(
        db=db, id=form_field_id, schema_to_select=FormFieldRead
    )
    if form_field_read is None:
        raise NotFoundException("Updated form field not found")

    return {"message": "Form field updated"}


@router.delete(
    "/form/{workflow_id}/form_field/{form_field_id}",
    status_code=204,
)
async def delete_form_field(
    request: Request,
    workflow_id: str,
    form_field_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
):
    # ✅ Optionally: Check if form and field belong to the current user's workflow
    form_field = await crud_form_fields.get(
        db=db, id=form_field_id, schema_to_select=FormFieldRead
    )

    if form_field is None:
        raise NotFoundException("Form field not found")

    # Optionally validate that this field's form belongs to `workflow_id` and current_user

    await crud_form_fields.db_delete(db=db, id=form_field_id)

    # HTTP 204 = No Content (typical for DELETE success)
    return Response(status_code=204)


@router.get("/form/{form_id}", response_class=HTMLResponse)
async def get_form(
    form_id: str,
    db: Annotated[AsyncSession, Depends(async_get_db)],
):
    """Get HTML form by form ID"""

    try:
        form_uuid = UUID(form_id)
    except ValueError:
        return JSONResponse(
            status_code=400,
            content={"error": "❌❌❌❌❌"},
        )
    stmt = select(Form).where(Form.id == form_id).options(selectinload(Form.fields))

    result = await db.execute(stmt)
    form_with_fields = result.scalar_one_or_none()

    if form_with_fields is None:
        return JSONResponse(
            status_code=404,
            content={"error": "💀💀💀💀💀"},
        )

    form_read = FormRead.model_validate(form_with_fields, from_attributes=True)

    form_read = cast(FormRead, form_read)

    return generate_form_html(form_read)
    # In a real application, you would fetch this from your database


@router.post("/submit/form/{form_id}")
async def submit_form(
    form_id: str,
    request: Request,
    db: Annotated[AsyncSession, Depends(async_get_db)],
    current_user: Annotated[dict, Depends(get_optional_user)],
):
    """Handle form submission"""

    form = await crud_forms.get(db=db, id=form_id, schema_to_select=FormRead)

    if form is None:
        raise NotFoundException("Form not found")

    # Get the JSON data from the request
    form_data = await request.json()
    # Create a response
    form_response_internal = FormResponseCreateInternal(form_id=form_id)
    form_response = await crud_form_responses.create(
        db=db, object=form_response_internal
    )

    # Create from_response_value
    for key, value in form_data.items():
        form_response_value = FormResponseValueCreateInternal(
            response_id=str(form_response.id), field_id=key, value=value
        )
        await crud_form_response_values.create(db=db, object=form_response_value)
    # form_response_values =

    stmt = (
        select(FormResponse)
        .where(FormResponse.id == form_response.id)
        .options(
            selectinload(FormResponse.values),
            selectinload(FormResponse.form).selectinload(Form.fields),
        )
    )
    result = await db.execute(stmt)
    response = result.scalar_one_or_none()

    if response is None:
        raise NotFoundException("Response not found")

    fields = {v.id: v.label for v in response.form.fields}
    final_response = {fields[v.field_id]: v.value for v in response.values}
    # print(final_response)

    # find workflow
    workflow_read = await crud_workflows.get(
        db=db, id=form_id, schema_to_select=WorkflowRead
    )

    compiled_graph = WorkflowGraphBuilder(workflow_read).build_graph()
    # print("----------------------fnal response passed")
    result = await compiled_graph.ainvoke(
        {
            "input": {"form-trigger": final_response},
            "state": {
                "nodes": {node["id"]: node for node in workflow_read["nodes"]},
                "edges": {edge["id"]: edge for edge in workflow_read["edges"]},
            },
        }
    )
    # print("restul", result)

    # Check if user from app then send response else trigger graph
    if current_user:
        return final_response

    # Invoke graph with state

    return {"message": "Form submitted"}


# Code will get all form responses
#  stmt = (
#         select(FormResponse)
#         .where(FormResponse.form_id == form_id)
#         .options(
#             selectinload(FormResponse.values),
#             selectinload(FormResponse.form).selectinload(
#                 Form.fields
#             ),  # 👈 nested preload
#         )
#     )
#     result = await db.execute(stmt)
#     responses = result.scalars().all()
#     return [
#         {
#             "id": str(response.id),
#             "submitted_at": response.submitted_at,
#             "form": {
#                 "id": str(response.form.id),
#                 "title": response.form.title,
#                 "description": response.form.description,
#                 "fields": [
#                     {
#                         "id": str(f.id),
#                         "label": f.label,
#                         "placeholder": f.placeholder,
#                         "type": f.type,
#                         "required": f.required,
#                         "position": f.position,
#                     }
#                     for f in response.form.fields
#                 ],
#             },
#             "values": [
#                 {"field_id": str(v.field_id), "value": v.value} for v in response.values
#             ],
#         }
#         for response in responses
#     ]
# {
#     "id": "0197fb4c-d5cb-7b40-90c4-c4e8fbe7fe57",
#     "submitted_at": "2025-07-11T21:03:26.155414",
#     "form": {
#         "id": "0197f50c-e722-7a32-90b3-2022aaf071e3",
#         "title": "Blog writer 25",
#         "description": "Your can fill the for and write topic give word count.\nthis is text to update. Amresh",
#         "fields": [
#             {
#                 "id": "0197fa22-998d-7f71-8c34-4e9f87225740",
#                 "label": "First Name",
#                 "placeholder": "Placeholder7",
#                 "type": "text",
#                 "required": true,
#                 "position": 1,
#             },
#             {
#                 "id": "0197fa22-e6ec-75c1-86df-2853a5085138",
#                 "label": "Email",
#                 "placeholder": "Please Enter a valid",
#                 "type": "email",
#                 "required": true,
#                 "position": 2,
#             },
#             {
#                 "id": "0197faf9-20c7-77a2-a16c-ea5efe63dbd7",
#                 "label": "Age",
#                 "placeholder": "Enter your age",
#                 "type": "number",
#                 "required": false,
#                 "position": 3,
#             },
#         ],
#     },
#     "values": [
#         {"field_id": "0197fa22-998d-7f71-8c34-4e9f87225740", "value": "amresh"},
#         {
#             "field_id": "0197fa22-e6ec-75c1-86df-2853a5085138",
#             "value": "kumar.akumar.amresh@gmail.com",
#         },
#         {"field_id": "0197faf9-20c7-77a2-a16c-ea5efe63dbd7", "value": "65"},
#     ],
# }
#    formated_response = {
#         "id": str(response.id),
#         "submitted_at": response.submitted_at,
#         "form": {
#             "id": str(response.form.id),
#             "title": response.form.title,
#             "description": response.form.description,
#             "fields": [
#                 {
#                     "id": str(f.id),
#                     "label": f.label,
#                     "placeholder": f.placeholder,
#                     "type": f.type,
#                     "required": f.required,
#                     "position": f.position,
#                 }
#                 for f in response.form.fields
#             ],
#         },
#         "values": [
#             {"field_id": str(v.field_id), "value": v.value} for v in response.values
#         ],
#     }
