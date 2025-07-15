from fastcrud import FastCRUD

from ..models.project import Project
from ..schemas.project import (
    ProjectCreateInternal,
    ProjectCreate,
    ProjectDelete,
    ProjectUpdate,
    ProjectUpdateInternal,
    ProjectRead,
)


CRUDProject = FastCRUD[
    Project,
    ProjectCreateInternal,
    # ProjectCreate,
    ProjectDelete,
    ProjectUpdate,
    ProjectUpdateInternal,
    ProjectRead,
]
crud_projects = CRUDProject(Project)
