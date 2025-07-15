from fastcrud import FastCRUD

from app.models.form.form_response_value import FormResponseValue

from app.schemas.form.form_response_value import (
    FormResponseValueCreate,
    FormResponseValueCreateInternal,
    FormResponseValueRead,
    FormResponseValueBase,
    FormResponseValueUpdate,
)

CRUDFormResponseValue = FastCRUD[
    FormResponseValue,
    FormResponseValueCreate,
    FormResponseValueCreateInternal,
    FormResponseValueRead,
    FormResponseValueBase,
    FormResponseValueUpdate,
]

crud_form_response_values = CRUDFormResponseValue(FormResponseValue)
