from datetime import datetime, UTC
import uuid
from typing import Annotated, List, Optional, Any, Dict
from typing_extensions import TypedDict

from pydantic import BaseModel, ConfigDict, Field

from app.core.schemas import PersistentDeletion, TimestampSchema, UUIDSchema

# --- Define TypedDicts for structured JSON columns ---


class Node(TypedDict, total=False):
    """Represents a node in the workflow graph."""

    id: str
    type: str
    position: Dict[str, float]
    workflowId: str
    measured: Dict[str, float]
    data: Dict[str, Any]
    selected: Optional[bool]
    dragging: Optional[bool]


class Edge(TypedDict, total=False):
    """Represents an edge (connection) between two nodes in the workflow graph."""

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
    """Represents the viewport state of the workflow canvas."""

    x: float
    y: float
    zoom: float


# --- Workflow Schemas ---


class WorkflowBase(BaseModel):
    """Base schema for Workflow, containing fields common to creation and updates."""

    name: Annotated[
        str,
        Field(min_length=1, max_length=50, examples=["Automated Onboarding Workflow"]),
    ]
    description: Annotated[
        str,
        Field(
            max_length=500,
            default="",
            examples=["Workflow to onboard new employees automatically."],
        ),
    ]
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
            description="A list of nodes defining the workflow graph structure.",
        ),
    ]
    edges: Annotated[
        List[Edge],
        Field(
            default_factory=list,
            examples=[
                [{"id": "e1-2", "source": "1", "target": "2", "type": "smoothstep"}]
            ],
            description="A list of edges defining connections between nodes in the workflow graph.",
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
            description="The current viewport position and zoom level of the workflow canvas.",
        ),
    ]


class WorkflowCreate(WorkflowBase):
    """Schema for creating a new Workflow."""

    model_config = ConfigDict(extra="forbid")


class WorkflowCreateInternal(WorkflowCreate):
    """Internal schema for creating a Workflow, including fields set by the backend."""

    project_id: Annotated[
        uuid.UUID,
        Field(
            examples=["a1b2c3d4-e5f6-7890-1234-567890abcdef"],
            description="The ID of the project this workflow belongs to.",
        ),
    ]


class WorkflowUpdate(BaseModel):
    """Schema for updating an existing Workflow."""

    model_config = ConfigDict(extra="forbid")

    nodes: Annotated[
        List[Node] | None,
        Field(
            default=None,
            examples=[
                [
                    {
                        "id": "1",
                        "type": "start",
                        "position": {"x": 100, "y": 50},
                        "data": {"label": "New Start"},
                    }
                ]
            ],
            description="Optional list of nodes to update the workflow graph structure.",
        ),
    ]
    edges: Annotated[
        List[Edge] | None,
        Field(
            default=None,
            examples=[
                [{"id": "e1-2", "source": "1", "target": "2", "type": "default"}]
            ],
            description="Optional list of edges to update connections.",
        ),
    ]
    # New viewport field for updates
    viewport: Annotated[
        Viewport | None,
        Field(
            default=None,  # Allow null to indicate no change to viewport
            examples=[{"x": 50.0, "y": 100.0, "zoom": 1.5}],
            description="Optional viewport position and zoom level to update.",
        ),
    ]


class WorkflowUpdateInternal(WorkflowUpdate):
    """Internal schema for updating a Workflow, including fields managed by the backend."""

    updated_at: datetime


class WorkflowMeta(BaseModel):
    """Do not get nodes edges and viewport"""

    id: uuid.UUID
    name: Annotated[
        str,
        Field(examples=["Automated Onboarding Workflow"]),
    ]
    description: Annotated[
        str,
        Field(examples=["Workflow to onboard new employees automatically."]),
    ]
    project_id: Annotated[
        uuid.UUID,
        Field(examples=["a1b2c3d4-e5f6-7890-1234-567890abcdef"]),
    ]

    # class Config:
    #     from_attributes = True


class WorkflowRead(BaseModel):
    """Schema for reading a Workflow, including all fields from the database."""

    id: uuid.UUID
    name: Annotated[
        str,
        Field(examples=["Automated Onboarding Workflow"]),
    ]
    description: Annotated[
        str,
        Field(examples=["Workflow to onboard new employees automatically."]),
    ]
    project_id: Annotated[
        uuid.UUID,
        Field(examples=["a1b2c3d4-e5f6-7890-1234-567890abcdef"]),
    ]
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
            description="The list of nodes defining the workflow graph structure.",
        ),
    ]
    edges: Annotated[
        List[Edge],
        Field(
            examples=[
                [{"id": "e1-2", "source": "1", "target": "2", "type": "smoothstep"}]
            ],
            description="The list of edges defining connections between nodes in the workflow graph.",
        ),
    ]
    # New viewport field for reads
    viewport: Annotated[
        Viewport,
        Field(
            examples=[{"x": 100.5, "y": 200.0, "zoom": 1.2}],
            description="The current viewport position and zoom level of the workflow canvas.",
        ),
    ]
    created_at: datetime


class WorkflowDelete(BaseModel):
    """Schema for handling deletion status (logical delete)."""

    model_config = ConfigDict(extra="forbid")

    is_deleted: bool
    deleted_at: datetime
