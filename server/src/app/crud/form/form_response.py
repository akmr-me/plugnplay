from fastcrud import FastCRUD

from app.models.form.form_response import FormResponse

from app.schemas.form.form_response import (
    FormResponseBase,
    FormResponseCreate,
    FormResponseCreateInternal,
    FormResponseRead,
    FormResponseUpdate,
)

CRUDFormResponse = FastCRUD[
    FormResponse,
    FormResponseBase,
    FormResponseCreate,
    FormResponseCreateInternal,
    FormResponseRead,
    FormResponseUpdate,
]

crud_form_responses = CRUDFormResponse(FormResponse)
