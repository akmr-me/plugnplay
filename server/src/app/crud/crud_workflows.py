from fastcrud import FastCRUD

from ..models.workflow import Workflow
from ..schemas.workflow import (
    WorkflowCreateInternal,
    WorkflowCreate,
    WorkflowDelete,
    WorkflowUpdate,
    WorkflowUpdateInternal,
    WorkflowRead,
    WorkflowMeta,
)


CRUDWorkflow = FastCRUD[
    Workflow,
    WorkflowCreateInternal,
    WorkflowCreate,
    WorkflowMeta,
    WorkflowUpdate,
    # WorkflowUpdateInternal,
    WorkflowRead,
]
crud_workflows = CRUDWorkflow(Workflow)
