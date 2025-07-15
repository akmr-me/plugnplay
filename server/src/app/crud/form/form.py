from fastcrud import FastCRUD

from app.models.form.form import Form

from app.schemas.form.form import (
    FormCreate,
    FormCreateInternal,
    FormDelete,
    FormRead,
    FormUpdate,
    FormBase,
)

CRUDForm = FastCRUD[
    FormBase, FormCreate, FormCreateInternal, FormDelete, FormRead, FormUpdate
]

crud_forms = CRUDForm(Form)
