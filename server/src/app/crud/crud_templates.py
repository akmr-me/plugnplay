from fastcrud import FastCRUD

from ..models.template import Template
from ..schemas.template import (
    TemplateCreateInternal,
    TemplateCreate,
    TemplateDelete,
    TemplateUpdate,
    TemplateUpdateInternal,
    TemplateRead,
    TemplateMeta,
)


CRUDTemplate = FastCRUD[
    Template,
    TemplateCreateInternal,
    TemplateCreate,
    TemplateMeta,
    TemplateUpdate,
    # TemplateUpdateInternal,
    TemplateRead,
]
crud_templates = CRUDTemplate(Template)
