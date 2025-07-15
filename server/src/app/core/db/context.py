# app/core/db/context.py
from contextvars import ContextVar
from sqlalchemy.ext.asyncio import AsyncSession

db_context: ContextVar[AsyncSession] = ContextVar("db_context")
