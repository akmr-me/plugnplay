from fastcrud import FastCRUD

from app.models.form.form_fields import FormField

from app.schemas.form.form_field import (
    FormFieldBase,
    FormFieldCreate,
    FormFieldCreateInternal,
    FormFieldDelete,
    FormFieldRead,
    FormFieldUpdate,
)

CRUDFormField = FastCRUD[
    FormFieldBase,
    FormFieldCreate,
    FormFieldCreateInternal,
    FormFieldDelete,
    FormFieldRead,
    FormFieldUpdate,
]

crud_form_fields = CRUDFormField(FormField)
