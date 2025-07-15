from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from .admin.initialize import create_admin_interface
from .api import router
from .core.config import settings
from .core.setup import create_application, lifespan_factory
from fastapi.middleware.cors import CORSMiddleware

admin = create_admin_interface()


@asynccontextmanager
async def lifespan_with_admin(app: FastAPI) -> AsyncGenerator[None, None]:
    """Custom lifespan that includes admin initialization."""
    # Get the default lifespan
    default_lifespan = lifespan_factory(settings)

    # Run the default lifespan initialization and our admin initialization
    async with default_lifespan(app):
        # Initialize admin interface if it exists
        if admin:
            # Initialize admin database and setup
            await admin.initialize()

        yield


app = create_application(router=router, settings=settings, lifespan=lifespan_with_admin)


#
@app.on_event("startup")
async def startup_event():
    from app.scheduler import start_scheduler

    start_scheduler()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://plugnplay.cc",
        "https://www.plugnplay.cc",
    ],  # Specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # Specify allowed methods
    allow_headers=["*"],
)

# Mount admin interface if enabled
if admin:
    app.mount(settings.CRUD_ADMIN_MOUNT_PATH, admin.app)
