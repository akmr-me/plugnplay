from datetime import datetime, UTC
import uuid
from typing import Annotated, List, Optional, Any, Dict
from typing_extensions import TypedDict

from pydantic import BaseModel, ConfigDict, Field

from app.core.schemas import PersistentDeletion, TimestampSchema, UUIDSchema

# --- Define TypedDicts for structured JSON columns ---


class Node(TypedDict, total=False):
    """Represents a node in the template graph."""

    id: str
    type: str
    position: Dict[str, float]
    templateId: str
    measured: Dict[str, float]
    data: Dict[str, Any]
    selected: Optional[bool]
    dragging: Optional[bool]


class Edge(TypedDict, total=False):
    """Represents an edge (connection) between two nodes in the template graph."""

    id: str
    source: str
    target: str
    sourceHandle: Optional[str]
    targetHandle: Optional[str]
    type: Optional[str]
    data: Optional[Dict[str, Any]]
    style: Optional[Dict[str, str]]
    markerEnd: Optional[Dict[str, Any]]
    selected: Optional[bool]


class Viewport(TypedDict):
    """Represents the viewport state of the template canvas."""

    x: float
    y: float
    zoom: float


# --- Template Schemas ---


class TemplateBase(BaseModel):
    """Base schema for Template, containing fields common to creation and updates."""

    name: Annotated[
        str,
        Field(min_length=1, max_length=50, examples=["Automated Onboarding Template"]),
    ]
    description: Annotated[
        str,
        Field(
            max_length=500,
            default="",
            examples=["Template to onboard new employees automatically."],
        ),
    ]


class TemplateBaseRead(TemplateBase):
    """Base schema for reading Template, excluding nodes, edges, and viewport."""

    id: uuid.UUID
    created_at: datetime
    # updated_at: Optional[datetime] = None

    # model_config = ConfigDict(from_attributes=True, extra="forbid")


class TemplateCreate(TemplateBase):
    """Schema for creating a new Template."""

    nodes: Annotated[
        List[Node],
        Field(
            default_factory=list,
            examples=[
                [
                    {
                        "id": "1",
                        "type": "start",
                        "position": {"x": 100, "y": 50},
                        "data": {"label": "Start"},
                    },
                    {
                        "id": "2",
                        "type": "process",
                        "position": {"x": 100, "y": 150},
                        "data": {"label": "Approve Request"},
                    },
                ]
            ],
            description="A list of nodes defining the template graph structure.",
        ),
    ]
    edges: Annotated[
        List[Edge],
        Field(
            default_factory=list,
            examples=[
                [{"id": "e1-2", "source": "1", "target": "2", "type": "smoothstep"}]
            ],
            description="A list of edges defining connections between nodes in the template graph.",
        ),
    ]
    # New viewport field
    viewport: Annotated[
        Viewport,
        Field(
            default_factory=lambda: {
                "x": 0.0,
                "y": 0.0,
                "zoom": 1.0,
            },  # Ensure float literals for consistency
            examples=[{"x": 100.5, "y": 200.0, "zoom": 1.2}],
            description="The current viewport position and zoom level of the template canvas.",
        ),
    ]

    model_config = ConfigDict(extra="forbid")


class TemplateCreateInternal(TemplateCreate):
    """Internal schema for creating a Template, including fields set by the backend."""

    created_by: str
    is_activated: bool = False
    workflow_id: uuid.UUID


class TemplateUpdate(BaseModel):
    """Schema for updating an existing Template."""

    model_config = ConfigDict(extra="forbid")

    is_activated: bool = False


class TemplateUpdateInternal(TemplateUpdate):
    """Internal schema for updating a Template, including fields managed by the backend."""

    updated_at: datetime


class TemplateMeta(BaseModel):
    """Do not get nodes edges and viewport"""

    id: uuid.UUID
    name: Annotated[
        str,
        Field(examples=["Automated Onboarding Template"]),
    ]
    description: Annotated[
        str,
        Field(examples=["Template to onboard new employees automatically."]),
    ]
    created_at: datetime
    created_by: str
    workflow_id: uuid.UUID

    # class Config:
    #     from_attributes = True


class TemplateReadList(TemplateBaseRead):
    created_by: str


class TemplateReadListReponse(TemplateBaseRead):
    is_user_creator: bool


class TemplateRead(BaseModel):
    """Schema for reading a Template, including all fields from the database."""

    id: uuid.UUID
    name: Annotated[
        str,
        Field(examples=["Automated Onboarding Template"]),
    ]
    description: Annotated[
        str,
        Field(examples=["Template to onboard new employees automatically."]),
    ]
    # created_by: str
    nodes: Annotated[
        List[Node],
        Field(
            examples=[
                [
                    {
                        "id": "1",
                        "type": "start",
                        "position": {"x": 100, "y": 50},
                        "data": {"label": "Start"},
                    },
                    {
                        "id": "2",
                        "type": "process",
                        "position": {"x": 100, "y": 150},
                        "data": {"label": "Approve Request"},
                    },
                ]
            ],
            description="The list of nodes defining the template graph structure.",
        ),
    ]
    edges: Annotated[
        List[Edge],
        Field(
            examples=[
                [{"id": "e1-2", "source": "1", "target": "2", "type": "smoothstep"}]
            ],
            description="The list of edges defining connections between nodes in the template graph.",
        ),
    ]
    # New viewport field for reads
    viewport: Annotated[
        Viewport,
        Field(
            examples=[{"x": 100.5, "y": 200.0, "zoom": 1.2}],
            description="The current viewport position and zoom level of the template canvas.",
        ),
    ]
    created_at: datetime


class TemplateDelete(BaseModel):
    """Schema for handling deletion status (logical delete)."""

    model_config = ConfigDict(extra="forbid")

    is_deleted: bool
    deleted_at: datetime


class CreateWorkflowFromTemplate(TemplateCreate):
    workflow_id: uuid.UUID
